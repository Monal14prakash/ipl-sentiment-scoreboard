# -*- coding: utf-8 -*-
"""
IPL Pulse -- HDFS + Spark SQL Demo Script
==========================================
Run this to demonstrate HDFS storage and Spark SQL to your evaluator.

After running, open these URLs in your browser:
  - http://localhost:4040        -> Spark Web UI (SQL tab, Jobs, Stages)
  - http://localhost:4040/SQL    -> Shows all SQL queries executed

Usage:
  python demo_spark_sql.py
"""
import os
import sys
import io
import shutil
import json
import random
from datetime import datetime, timedelta

# Fix Windows terminal encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

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


def main():
    print("\n" + "=" * 65)
    print("  IPL PULSE -- HDFS + SPARK SQL DEMO")
    print("=" * 65)
    print()
    print("  This script demonstrates:")
    print("  * Apache Spark (Distributed Processing Engine)")
    print("  * HDFS-Compatible Storage (Parquet Columnar Format)")
    print("  * Spark SQL (Analytical Queries on Stored Data)")
    print()

    # =================================================================
    # STEP 1: Initialize Spark
    # =================================================================
    print("-" * 55)
    print("  STEP 1: Initializing Apache Spark Session")
    print("-" * 55)
    print()
    print("  Creating SparkSession with local[2] master...")
    print("  (In production: master would be 'yarn' for Hadoop cluster)")
    print()

    from pyspark.sql import SparkSession
    from pyspark.sql.types import StructType, StructField, StringType, TimestampType

    spark = SparkSession.builder \
        .appName("IPL_Pulse_HDFS_SparkSQL_Demo") \
        .master("local[2]") \
        .config("spark.sql.shuffle.partitions", "2") \
        .config("spark.driver.memory", "1g") \
        .config("spark.ui.port", "4040") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    print("  [OK] SparkSession created!")
    print(f"    App Name:    {spark.sparkContext.appName}")
    print(f"    Master:      {spark.sparkContext.master}")
    print(f"    Spark Ver:   {spark.version}")
    print()
    print("  *** SPARK WEB UI IS NOW LIVE AT: http://localhost:4040 ***")
    print("  *** Open it in your browser to show to evaluator!     ***")
    print()

    # =================================================================
    # STEP 2: Generate Sample Sentiment Data
    # =================================================================
    print("-" * 55)
    print("  STEP 2: Generating Sample IPL Sentiment Records")
    print("-" * 55)
    print()

    teams = ["CSK", "MI", "RCB", "KKR", "DC", "SRH", "PBKS", "RR", "GT", "LSG"]
    sentiments = ["positive", "negative"]

    sample_texts = {
        "positive": [
            "What a shot! This team is on fire! #IPL2025",
            "Incredible innings! Dominating the match!",
            "Best match of IPL 2025! Fearless cricket!",
            "Captain leading from the front! Amazing!",
            "Back to back boundaries! Fans going crazy!",
        ],
        "negative": [
            "Another collapse. Needs to step up.",
            "Terrible bowling. Leaking runs everywhere.",
            "Out for a duck again! Fans in tears.",
            "Done this season. No hope left.",
            "Pathetic fielding. Dropped a sitter!",
        ],
    }

    records = []
    base_time = datetime.now() - timedelta(hours=2)
    for i in range(500):
        team = random.choice(teams)
        sentiment = random.choice(sentiments)
        text = f"#{team} " + random.choice(sample_texts[sentiment])
        hashtags = f"#{team} #IPL2025"
        ts = base_time + timedelta(seconds=i * 15)
        records.append((text, hashtags, team, sentiment, ts))

    schema = StructType([
        StructField("text", StringType(), True),
        StructField("hashtags", StringType(), True),
        StructField("team", StringType(), True),
        StructField("sentiment", StringType(), True),
        StructField("timestamp", TimestampType(), True),
    ])

    df = spark.createDataFrame(records, schema)

    print(f"  [OK] Generated {df.count()} sentiment records")
    print(f"  [OK] Teams: {', '.join(teams)}")
    print()
    print("  Schema:")
    df.printSchema()
    print("  Sample records:")
    df.show(5, truncate=50)

    # =================================================================
    # STEP 3: Write to HDFS-Compatible Storage (Parquet)
    # =================================================================
    print("-" * 55)
    print("  STEP 3: Writing to HDFS Storage (Parquet Format)")
    print("-" * 55)
    print()

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    HDFS_DIR = os.path.join(BASE_DIR, "data", "hdfs", "sentiment_records")
    ANALYTICS_DIR = os.path.join(BASE_DIR, "data", "analytics")

    if os.path.exists(HDFS_DIR):
        shutil.rmtree(HDFS_DIR)

    os.makedirs(HDFS_DIR, exist_ok=True)
    os.makedirs(ANALYTICS_DIR, exist_ok=True)

    print(f"  HDFS Path (local):      {HDFS_DIR}")
    print(f"  HDFS Path (production): hdfs://namenode:9000/ipl/sentiment_records/")
    print()
    print("  Writing Parquet files...")

    df.write.mode("overwrite").parquet(HDFS_DIR)

    parquet_files = [f for f in os.listdir(HDFS_DIR) if f.endswith('.parquet')]
    total_size = sum(
        os.path.getsize(os.path.join(HDFS_DIR, f))
        for f in os.listdir(HDFS_DIR)
        if os.path.isfile(os.path.join(HDFS_DIR, f))
    )

    print()
    print(f"  [OK] Parquet files written!")
    print(f"  [OK] Files created: {len(parquet_files)}")
    print(f"  [OK] Total size: {total_size / 1024:.1f} KB (Snappy compressed)")
    print()
    print("  HDFS Directory Listing:")
    for f in sorted(os.listdir(HDFS_DIR)):
        fpath = os.path.join(HDFS_DIR, f)
        if os.path.isfile(fpath):
            print(f"    [FILE] {f}  ({os.path.getsize(fpath):,} bytes)")
        else:
            print(f"    [DIR]  {f}/")
    print()
    print("  WHY PARQUET?")
    print("    - Columnar format: skips unused columns -> 5-10x faster")
    print("    - Snappy compression: 60-80% smaller than CSV")
    print("    - Schema-aware: Spark auto-detects data types")
    print("    - Native HDFS format: used by Hive, Presto, Impala")

    # =================================================================
    # STEP 4: Read back from HDFS
    # =================================================================
    print()
    print("-" * 55)
    print("  STEP 4: Reading Data Back from HDFS (Parquet)")
    print("-" * 55)
    print()

    hdfs_df = spark.read.parquet(HDFS_DIR)
    print(f"  [OK] Loaded {hdfs_df.count()} records from Parquet")
    print(f"  [OK] Columns: {hdfs_df.columns}")

    # =================================================================
    # STEP 5: Create Spark SQL Temporary View
    # =================================================================
    print()
    print("-" * 55)
    print("  STEP 5: Creating Spark SQL Temporary View")
    print("-" * 55)
    print()

    hdfs_df.createOrReplaceTempView("sentiment_records")

    print("  [OK] Registered temp view: 'sentiment_records'")
    print()
    print("  Equivalent Hive DDL on HDFS:")
    print("    CREATE EXTERNAL TABLE sentiment_records")
    print("    STORED AS PARQUET")
    print("    LOCATION 'hdfs://namenode:9000/ipl/sentiment_records/'")

    # =================================================================
    # STEP 6: Run Spark SQL Queries
    # =================================================================
    print()
    print("=" * 65)
    print("  STEP 6: SPARK SQL ANALYTICAL QUERIES")
    print("=" * 65)
    print()
    print("  >> Check http://localhost:4040/SQL to see these queries! <<")
    print()

    # --- Query 1 ---
    print("  +----------------------------------------------------+")
    print("  |  QUERY 1: Team-wise Tweet Counts                   |")
    print("  +----------------------------------------------------+")
    sql1 = """
        SELECT team, COUNT(*) as tweet_count
        FROM sentiment_records
        GROUP BY team
        ORDER BY tweet_count DESC
    """
    print(f"\n  SQL:{sql1}")
    r1 = spark.sql(sql1)
    r1.show(10, truncate=False)
    rows1 = [row.asDict() for row in r1.collect()]
    with open(os.path.join(ANALYTICS_DIR, "team_counts.json"), 'w') as f:
        json.dump(rows1, f, indent=2, default=str)

    # --- Query 2 ---
    print("  +----------------------------------------------------+")
    print("  |  QUERY 2: Team-wise Sentiment Breakdown            |")
    print("  +----------------------------------------------------+")
    sql2 = """
        SELECT team, sentiment, COUNT(*) as count
        FROM sentiment_records
        GROUP BY team, sentiment
        ORDER BY team, sentiment
    """
    print(f"\n  SQL:{sql2}")
    r2 = spark.sql(sql2)
    r2.show(20, truncate=False)
    rows2 = [row.asDict() for row in r2.collect()]
    with open(os.path.join(ANALYTICS_DIR, "sentiment_counts.json"), 'w') as f:
        json.dump(rows2, f, indent=2, default=str)

    # --- Query 3 ---
    print("  +----------------------------------------------------+")
    print("  |  QUERY 3: Overall Sentiment Distribution           |")
    print("  +----------------------------------------------------+")
    sql3 = """
        SELECT sentiment,
               COUNT(*) as count,
               ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM sentiment_records), 2) as percentage
        FROM sentiment_records
        GROUP BY sentiment
        ORDER BY count DESC
    """
    print(f"\n  SQL:{sql3}")
    r3 = spark.sql(sql3)
    r3.show(truncate=False)
    rows3 = [row.asDict() for row in r3.collect()]
    with open(os.path.join(ANALYTICS_DIR, "sentiment_distribution.json"), 'w') as f:
        json.dump(rows3, f, indent=2, default=str)

    # --- Query 4 ---
    print("  +----------------------------------------------------+")
    print("  |  QUERY 4: Most Positive Team                       |")
    print("  +----------------------------------------------------+")
    sql4 = """
        SELECT team,
               SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
               COUNT(*) as total_tweets,
               ROUND(SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as positive_ratio
        FROM sentiment_records
        GROUP BY team
        ORDER BY positive_ratio DESC
        LIMIT 1
    """
    print(f"\n  SQL:{sql4}")
    r4 = spark.sql(sql4)
    r4.show(truncate=False)
    rows4 = [row.asDict() for row in r4.collect()]
    with open(os.path.join(ANALYTICS_DIR, "top_positive_team.json"), 'w') as f:
        json.dump(rows4, f, indent=2, default=str)
    if rows4:
        print(f"  >> RESULT: {rows4[0]['team']} is most positive ({rows4[0]['positive_ratio']}%)")
        print()

    # --- Query 5 ---
    print("  +----------------------------------------------------+")
    print("  |  QUERY 5: Most Negative Team                       |")
    print("  +----------------------------------------------------+")
    sql5 = """
        SELECT team,
               SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
               COUNT(*) as total_tweets,
               ROUND(SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as negative_ratio
        FROM sentiment_records
        GROUP BY team
        ORDER BY negative_ratio DESC
        LIMIT 1
    """
    print(f"\n  SQL:{sql5}")
    r5 = spark.sql(sql5)
    r5.show(truncate=False)
    rows5 = [row.asDict() for row in r5.collect()]
    with open(os.path.join(ANALYTICS_DIR, "top_negative_team.json"), 'w') as f:
        json.dump(rows5, f, indent=2, default=str)
    if rows5:
        print(f"  >> RESULT: {rows5[0]['team']} is most negative ({rows5[0]['negative_ratio']}%)")
        print()

    # --- Query 6 ---
    print("  +----------------------------------------------------+")
    print("  |  QUERY 6: Historical Sentiment Trends (Hourly)     |")
    print("  +----------------------------------------------------+")
    sql6 = """
        SELECT DATE_FORMAT(timestamp, 'yyyy-MM-dd HH:00:00') as time_bucket,
               sentiment,
               COUNT(*) as count
        FROM sentiment_records
        GROUP BY time_bucket, sentiment
        ORDER BY time_bucket
    """
    print(f"\n  SQL:{sql6}")
    r6 = spark.sql(sql6)
    r6.show(20, truncate=False)
    rows6 = [row.asDict() for row in r6.collect()]
    with open(os.path.join(ANALYTICS_DIR, "historical_trends.json"), 'w') as f:
        json.dump(rows6, f, indent=2, default=str)

    # =================================================================
    # SUMMARY
    # =================================================================
    print()
    print("#" * 65)
    print("  ALL QUERIES COMPLETE!")
    print("#" * 65)
    print()
    print("  HDFS Storage (Parquet files):")
    print(f"    {HDFS_DIR}")
    for f in sorted(os.listdir(HDFS_DIR)):
        fpath = os.path.join(HDFS_DIR, f)
        if os.path.isfile(fpath):
            print(f"      {f}  ({os.path.getsize(fpath):,} bytes)")
    print()
    print("  Spark SQL Analytics Output (JSON):")
    print(f"    {ANALYTICS_DIR}")
    for f in sorted(os.listdir(ANALYTICS_DIR)):
        fpath = os.path.join(ANALYTICS_DIR, f)
        if os.path.isfile(fpath):
            print(f"      {f}  ({os.path.getsize(fpath):,} bytes)")
    print()
    print("  " + "=" * 55)
    print("  OPEN THESE URLs IN YOUR BROWSER NOW:")
    print()
    print("    1. http://localhost:4040")
    print("       -> Spark Web UI (Jobs, Stages, Storage)")
    print()
    print("    2. http://localhost:4040/SQL/")
    print("       -> Shows ALL 6 SQL queries with execution plans")
    print()
    print("    3. http://localhost:4040/jobs/")
    print("       -> Shows Spark jobs and DAG visualizations")
    print("  " + "=" * 55)
    print()
    print("  To connect this to the dashboard:")
    print("    1. Set MOCK_MODE = False in api_server.py")
    print("    2. Restart: python api_server.py")
    print("    3. Open http://localhost:5173")
    print()

    # Keep Spark alive so the evaluator can browse the UI
    print("  Spark is RUNNING. Browse http://localhost:4040 now.")
    print("  Press ENTER to stop Spark and exit...")
    print()

    try:
        input("  >>> Press ENTER to exit <<<")
    except (EOFError, KeyboardInterrupt):
        pass

    spark.stop()
    print("\n  [OK] Spark stopped. Demo complete.\n")


if __name__ == "__main__":
    main()
