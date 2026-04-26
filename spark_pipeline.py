import os
os.environ["PYSPARK_PYTHON"] = r"D:\Python311\python.exe"
os.environ["PYSPARK_DRIVER_PYTHON"] = r"D:\Python311\python.exe"
import json
from pyspark.sql import SparkSession
from pyspark.sql.functions import udf, window, col, current_timestamp
from pyspark.sql.types import StringType, StructType, StructField
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ─── CONFIG ───────────────────────────────────────────────────────────────────
HOST        = "localhost"
PORT        = 9999
WINDOW_SIZE = "30 seconds"
SLIDE       = "30 seconds"   # tumbling window (slide = window size)
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

def main():
    spark = SparkSession.builder \
        .appName("IPL_Sentiment_Scoreboard") \
        .master("local[2]") \
        .config("spark.sql.shuffle.partitions", "2") \
        .config("spark.streaming.stopGracefullyOnShutdown", "true") \
        .config("spark.sql.streaming.forceDeleteTempCheckpointLocation", "true") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

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

    # ─── OUTPUT TO CONSOLE ────────────────────────────────────────────────────
    query = aggregated.writeStream \
        .outputMode("complete") \
        .format("console") \
        .option("truncate", False) \
        .option("numRows", 50) \
        .trigger(processingTime="30 seconds") \
        .start()

    print("\n" + "="*55)
    print("   IPL LIVE SENTIMENT SCOREBOARD — RUNNING")
    print("   Waiting for tweets from producer...")
    print("="*55 + "\n")

    query.awaitTermination()

if __name__ == "__main__":
    main()