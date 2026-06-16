import os
import sys
os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

# Set JAVA_HOME to portable JDK 17 path to avoid JDK 24 incompatibilities
base_dir = os.path.dirname(os.path.abspath(__file__))
jdk17_dir = os.path.join(base_dir, "jdk17")
if os.path.exists(jdk17_dir):
    for item in os.listdir(jdk17_dir):
        if "jdk" in item.lower():
            os.environ["JAVA_HOME"] = os.path.join(jdk17_dir, item)
            break
import json
import time
import threading
from pyspark.sql import SparkSession
from pyspark.sql.functions import udf, window, col, current_timestamp
from pyspark.sql.types import StringType, StructType, StructField
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ─── CONFIG ───────────────────────────────────────────────────────────────────
HOST        = "localhost"
PORT        = 9999
WINDOW_SIZE = "30 seconds"
SLIDE       = "30 seconds"   # tumbling window (slide = window size)

# ─── HDFS-COMPATIBLE STORAGE PATHS ───────────────────────────────────────────
# Simulates HDFS on local FS. To use real HDFS, change prefix to hdfs://
BASE_DIR            = os.path.dirname(os.path.abspath(__file__))
HDFS_OUTPUT_DIR     = os.path.join(BASE_DIR, "data", "hdfs", "sentiment_records")
HDFS_CHECKPOINT_DIR = os.path.join(BASE_DIR, "data", "hdfs", "sentiment_records", "_checkpoint")
ANALYTICS_DIR       = os.path.join(BASE_DIR, "data", "analytics")
ANALYTICS_INTERVAL  = 60  # seconds between analytics refreshes
# ──────────────────────────────────────────────────────────────────────────────

# ─── TEAM KEYWORDS ────────────────────────────────────────────────────────────
TEAM_KEYWORDS = {
    "CSK":  ["csk", "chennai", "superking", "superkings", "whistlepodu"],
    "MI":   ["mi", "mumbai", "mumbaiindians", "paltan"],
    "RCB":  ["rcb", "bangalore", "royalchallengers", "playbold"],
    "KKR":  ["kkr", "kolkata", "knightriders", "korbo"],
    "DC":   ["dc", "delhi", "delhicapitals", "capitals"],
    "SRH":  ["srh", "hyderabad", "sunrisers"],
    "PBKS": ["pbks", "punjab", "punjabkings", "kings11", "kxip"],
    "RR":   ["rr", "rajasthan", "royals", "rajasthanroyals"],
    "GT":   ["gt", "gujarat", "titans", "gujarattitans"],
    "LSG":  ["lsg", "lucknow", "supergiants", "lucknowsupergiants"],
}
# ──────────────────────────────────────────────────────────────────────────────

def tag_team(text, hashtags):
    combined = ((text or "") + " " + (hashtags or "")).lower()
    for team, keywords in TEAM_KEYWORDS.items():
        for kw in keywords:
            if kw in combined:
                return team
    return None

def get_sentiment(text):
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    analyzer = SentimentIntensityAnalyzer()
    score = analyzer.polarity_scores(text or "")["compound"]
    if score >= 0.05:
        return "positive"
    elif score <= -0.05:
        return "negative"
    else:
        return "neutral"

tag_team_udf    = udf(tag_team,    StringType())
sentiment_udf   = udf(get_sentiment, StringType())

# ─── SCHEMA ───────────────────────────────────────────────────────────────────
schema = StructType([
    StructField("text",     StringType(), True),
    StructField("hashtags", StringType(), True),
])
# ──────────────────────────────────────────────────────────────────────────────

# ─── SPARK SQL ANALYTICS ENGINE ──────────────────────────────────────────────
def run_analytics(spark):
    """
    Read persisted Parquet sentiment records from HDFS storage,
    create temporary views, and run analytical SQL queries.
    Results are written as JSON files to the analytics directory.
    """
    try:
        if not os.path.exists(HDFS_OUTPUT_DIR):
            return

        # Check if there are any Parquet files (skip _checkpoint dir)
        parquet_files = [f for f in os.listdir(HDFS_OUTPUT_DIR)
                         if not f.startswith('_') and not f.startswith('.')]
        if not parquet_files:
            return

        # Read all accumulated Parquet records
        df = spark.read.parquet(HDFS_OUTPUT_DIR)
        if df.rdd.isEmpty():
            return

        # Register as temporary view for Spark SQL
        df.createOrReplaceTempView("sentiment_records")

        os.makedirs(ANALYTICS_DIR, exist_ok=True)
        from datetime import datetime

        # ── Query 1: Team-wise tweet counts ──────────────────────────────
        team_counts = spark.sql("""
            SELECT team, COUNT(*) as count
            FROM sentiment_records
            GROUP BY team
            ORDER BY count DESC
        """)
        _write_analytics_json(team_counts, "team_counts.json")

        # ── Query 2: Team-wise sentiment counts ─────────────────────────
        sentiment_counts = spark.sql("""
            SELECT team, sentiment, COUNT(*) as count
            FROM sentiment_records
            GROUP BY team, sentiment
            ORDER BY team, sentiment
        """)
        _write_analytics_json(sentiment_counts, "sentiment_counts.json")

        # ── Query 3: Overall sentiment distribution ─────────────────────
        sentiment_dist = spark.sql("""
            SELECT sentiment, COUNT(*) as count,
                   ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sentiment_records), 2) as percentage
            FROM sentiment_records
            GROUP BY sentiment
            ORDER BY count DESC
        """)
        _write_analytics_json(sentiment_dist, "sentiment_distribution.json")

        # ── Query 4: Most positive team ─────────────────────────────────
        top_positive = spark.sql("""
            SELECT team,
                   SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
                   COUNT(*) as total_tweets,
                   ROUND(SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as positive_ratio
            FROM sentiment_records
            GROUP BY team
            ORDER BY positive_ratio DESC
            LIMIT 1
        """)
        _write_analytics_json(top_positive, "top_positive_team.json")

        # ── Query 5: Most negative team ─────────────────────────────────
        top_negative = spark.sql("""
            SELECT team,
                   SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
                   COUNT(*) as total_tweets,
                   ROUND(SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as negative_ratio
            FROM sentiment_records
            GROUP BY team
            ORDER BY negative_ratio DESC
            LIMIT 1
        """)
        _write_analytics_json(top_negative, "top_negative_team.json")

        # ── Query 6: Historical sentiment trends (by hour) ──────────────
        trends = spark.sql("""
            SELECT DATE_FORMAT(timestamp, 'yyyy-MM-dd HH:00:00') as time_bucket,
                   sentiment,
                   COUNT(*) as count
            FROM sentiment_records
            GROUP BY time_bucket, sentiment
            ORDER BY time_bucket
        """)
        _write_analytics_json(trends, "historical_trends.json")

        print(f"[Analytics] Updated {ANALYTICS_DIR} at {datetime.now().strftime('%H:%M:%S')}")

    except Exception as e:
        print(f"[Analytics] Error running analytics: {e}")


def _write_analytics_json(df, filename):
    """Convert a Spark DataFrame to JSON and write to analytics dir."""
    rows = [row.asDict() for row in df.collect()]
    filepath = os.path.join(ANALYTICS_DIR, filename)
    with open(filepath, 'w') as f:
        json.dump(rows, f, indent=2, default=str)


def analytics_scheduler(spark, stop_event):
    """Background thread that runs analytics queries periodically."""
    while not stop_event.is_set():
        time.sleep(ANALYTICS_INTERVAL)
        if stop_event.is_set():
            break
        run_analytics(spark)
# ──────────────────────────────────────────────────────────────────────────────


def main():
    spark = SparkSession.builder \
        .appName("IPL_Sentiment_Scoreboard") \
        .master("local[2]") \
        .config("spark.sql.shuffle.partitions", "2") \
        .config("spark.streaming.stopGracefullyOnShutdown", "true") \
        .config("spark.sql.streaming.forceDeleteTempCheckpointLocation", "true") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    # ─── CREATE HDFS-COMPATIBLE DIRECTORIES ──────────────────────────────
    os.makedirs(HDFS_OUTPUT_DIR, exist_ok=True)
    os.makedirs(ANALYTICS_DIR, exist_ok=True)

    # ─── READ STREAM ──────────────────────────────────────────────────────────
    raw_stream = spark.readStream \
        .format("socket") \
        .option("host", HOST) \
        .option("port", PORT) \
        .load()

    # ─── PARSE JSON ───────────────────────────────────────────────────────────
    from pyspark.sql.functions import from_json
    parsed = raw_stream.select(
        from_json(col("value"), schema).alias("data")
    ).select("data.text", "data.hashtags")

    # ─── TAG TEAM + SENTIMENT ─────────────────────────────────────────────────
    tagged = parsed \
        .withColumn("team",      tag_team_udf(col("text"), col("hashtags"))) \
        .withColumn("sentiment", sentiment_udf(col("text"))) \
        .withColumn("timestamp", current_timestamp()) \
        .filter(col("team").isNotNull()) \
        .filter(col("sentiment") != "neutral")

    # ─── WINDOWED AGGREGATION ─────────────────────────────────────────────────
    aggregated = tagged \
        .groupBy(
            window(col("timestamp"), WINDOW_SIZE, SLIDE),
            col("team"),
            col("sentiment")
        ).count()

    # ─── OUTPUT 1: CONSOLE (existing — unchanged) ────────────────────────────
    query_console = aggregated.writeStream \
        .outputMode("complete") \
        .format("console") \
        .option("truncate", False) \
        .option("numRows", 50) \
        .trigger(processingTime="30 seconds") \
        .start()

    # ─── OUTPUT 2: HDFS STORAGE (Parquet persistence) ────────────────────────
    # Persists raw per-tweet sentiment records for historical analytics.
    # Uses append mode with checkpoint for exactly-once guarantees.
    query_hdfs = tagged.writeStream \
        .outputMode("append") \
        .format("parquet") \
        .option("path", HDFS_OUTPUT_DIR) \
        .option("checkpointLocation", HDFS_CHECKPOINT_DIR) \
        .trigger(processingTime="30 seconds") \
        .start()

    # ─── START ANALYTICS SCHEDULER ───────────────────────────────────────────
    stop_event = threading.Event()
    analytics_thread = threading.Thread(
        target=analytics_scheduler,
        args=(spark, stop_event),
        daemon=True,
        name="AnalyticsScheduler"
    )
    analytics_thread.start()

    print("\n" + "="*55)
    print("   IPL LIVE SENTIMENT SCOREBOARD — RUNNING")
    print("   Waiting for tweets from producer...")
    print(f"   HDFS Storage:  {HDFS_OUTPUT_DIR}")
    print(f"   Analytics Dir: {ANALYTICS_DIR}")
    print("="*55 + "\n")

    try:
        spark.streams.awaitAnyTermination()
    finally:
        stop_event.set()
        analytics_thread.join(timeout=5)

if __name__ == "__main__":
    main()