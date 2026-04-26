import socket
import time
import pandas as pd
import json
import os

# ─── CONFIG ───────────────────────────────────────────────────────────────────
DATA_DIR = r"D:\sem6\bdt\ipl_proj"
FILES    = [
    "IPL_2020_tweets.csv",
    "IPL_2021_tweets.csv",
    "IPL_2022_tweets.csv",
]
HOST     = "localhost"
PORT     = 9999
DELAY    = 0.5   # seconds between tweets (lower = faster stream)
# ──────────────────────────────────────────────────────────────────────────────

def load_tweets():
    dfs = []
    for f in FILES:
        path = os.path.join(DATA_DIR, f)
        df = pd.read_csv(path, usecols=["text", "hashtags"], on_bad_lines='skip', engine='python')
        dfs.append(df)
        print(f"Loaded {f} — {len(df)} rows")
    combined = pd.concat(dfs, ignore_index=True)
    combined = combined.dropna(subset=["text"])
    combined["text"]     = combined["text"].astype(str).str.strip()
    combined["hashtags"] = combined["hashtags"].fillna("").astype(str).str.strip()
    print(f"\nTotal tweets loaded: {len(combined)}\n")
    return combined

def stream_tweets(conn, tweets):
    print("Streaming tweets...\n")
    for _, row in tweets.iterrows():
        payload = json.dumps({
            "text":     row["text"],
            "hashtags": row["hashtags"]
        }) + "\n"
        try:
            conn.sendall(payload.encode("utf-8"))
            time.sleep(DELAY)
        except BrokenPipeError:
            print("Client disconnected.")
            break

def main():
    tweets = load_tweets()

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, PORT))
    server.listen(1)
    print(f"Producer listening on {HOST}:{PORT} ...")
    print("Waiting for Spark to connect...\n")

    conn, addr = server.accept()
    print(f"Spark connected from {addr}\n")
    stream_tweets(conn, tweets)

    conn.close()
    server.close()

if __name__ == "__main__":
    main()