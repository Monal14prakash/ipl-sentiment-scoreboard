"""
IPL Pulse – Flask API Server
Serves processed sentiment data to the React frontend.
Supports both mock data mode and real Spark pipeline output.
"""
import os
import json
import time
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
from mock_data import (
    generate_full_dashboard,
    generate_tweet,
    generate_sentiment_data,
    generate_team_sentiments,
    generate_momentum_data,
    generate_trending_tags,
    generate_match_score,
    generate_heatmap,
    generate_shap_explanations,
    generate_mock_team_counts,
    generate_mock_sentiment_distribution,
    generate_mock_analytics_summary,
    generate_mock_top_positive_team,
    generate_mock_top_negative_team,
)

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# ─── Configuration ────────────────────────────────────────────────────────────
MOCK_MODE = True
TEAM1 = os.environ.get('TEAM1', 'CSK')
TEAM2 = os.environ.get('TEAM2', 'MI')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'output')
ANALYTICS_DIR = os.path.join(os.path.dirname(__file__), 'data', 'analytics')

# ─── Cache for mock data (refreshes periodically) ────────────────────────────
_cache = {
    'dashboard': None,
    'last_update': 0,
    'tweets_buffer': [],
}
_cache_lock = threading.Lock()

def get_cached_dashboard():
    """Return cached dashboard data, refreshing every 5 seconds."""
    with _cache_lock:
        now = time.time()
        if _cache['dashboard'] is None or (now - _cache['last_update']) > 5:
            _cache['dashboard'] = generate_full_dashboard(TEAM1, TEAM2)
            _cache['last_update'] = now
            # Add new tweets to buffer
            new_tweets = [generate_tweet(TEAM1, TEAM2) for _ in range(3)]
            _cache['tweets_buffer'] = (new_tweets + _cache['tweets_buffer'])[:50]
        return _cache['dashboard']


def read_spark_output():
    """Read latest Spark JSON output from file sink."""
    if not os.path.exists(DATA_DIR):
        return None
    files = sorted(
        [f for f in os.listdir(DATA_DIR) if f.endswith('.json')],
        reverse=True
    )
    if not files:
        return None
    with open(os.path.join(DATA_DIR, files[0]), 'r') as f:
        return json.load(f)


def read_analytics_file(filename):
    """Read a JSON file from the Spark SQL analytics output directory."""
    filepath = os.path.join(ANALYTICS_DIR, filename)
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return None


# ─── API Routes ──────────────────────────────────────────────────────────────

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get complete dashboard data."""
    if MOCK_MODE:
        return jsonify(get_cached_dashboard())
    data = read_spark_output()
    if data:
        return jsonify(data)
    return jsonify(get_cached_dashboard())  # Fallback to mock


@app.route('/api/sentiment/live', methods=['GET'])
def get_live_sentiment():
    """Get current sentiment distribution."""
    if MOCK_MODE:
        return jsonify(generate_sentiment_data())
    data = read_spark_output()
    return jsonify(data.get('sentiment', generate_sentiment_data()) if data else generate_sentiment_data())


@app.route('/api/sentiment/teams', methods=['GET'])
def get_team_sentiments():
    """Get per-team sentiment breakdown."""
    if MOCK_MODE:
        return jsonify(generate_team_sentiments(TEAM1, TEAM2))
    data = read_spark_output()
    return jsonify(data.get('teams', generate_team_sentiments(TEAM1, TEAM2)) if data else generate_team_sentiments(TEAM1, TEAM2))


@app.route('/api/sentiment/timeline', methods=['GET'])
def get_timeline():
    """Get sentiment timeline data."""
    dashboard = get_cached_dashboard()
    return jsonify(dashboard.get('momentum', []))


@app.route('/api/sentiment/trending', methods=['GET'])
def get_trending():
    """Get trending hashtags."""
    if MOCK_MODE:
        return jsonify(generate_trending_tags())
    data = read_spark_output()
    return jsonify(data.get('trending', generate_trending_tags()) if data else generate_trending_tags())


@app.route('/api/tweets/stream', methods=['GET'])
def get_tweets():
    """Get recent tweets with sentiment."""
    with _cache_lock:
        if _cache['tweets_buffer']:
            return jsonify(_cache['tweets_buffer'][:20])
    dashboard = get_cached_dashboard()
    return jsonify(dashboard.get('tweets', []))


@app.route('/api/match/score', methods=['GET'])
def get_match_score():
    """Get current match score."""
    dashboard = get_cached_dashboard()
    return jsonify(dashboard.get('match', generate_match_score(TEAM1, TEAM2)))


@app.route('/api/momentum', methods=['GET'])
def get_momentum():
    """Get sentiment momentum per over."""
    if MOCK_MODE:
        return jsonify(generate_momentum_data(TEAM1, TEAM2))
    data = read_spark_output()
    return jsonify(data.get('momentum', generate_momentum_data(TEAM1, TEAM2)) if data else generate_momentum_data(TEAM1, TEAM2))


@app.route('/api/heatmap', methods=['GET'])
def get_heatmap():
    """Get emotion intensity heatmap."""
    if MOCK_MODE:
        return jsonify(generate_heatmap(TEAM1, TEAM2))
    data = read_spark_output()
    return jsonify(data.get('heatmap', generate_heatmap(TEAM1, TEAM2)) if data else generate_heatmap(TEAM1, TEAM2))


@app.route('/api/explanations', methods=['GET'])
def get_explanations():
    """Get SHAP explanations."""
    if MOCK_MODE:
        return jsonify(generate_shap_explanations(TEAM1, TEAM2))
    data = read_spark_output()
    return jsonify(data.get('explanations', generate_shap_explanations(TEAM1, TEAM2)) if data else generate_shap_explanations(TEAM1, TEAM2))


# ─── ANALYTICS API ROUTES ────────────────────────────────────────────────────
# These endpoints serve historical data from Spark SQL analytics (or mock data).

@app.route('/api/analytics/team-counts', methods=['GET'])
def get_analytics_team_counts():
    """Get team-wise tweet counts from historical data."""
    if not MOCK_MODE:
        data = read_analytics_file('team_counts.json')
        if data:
            return jsonify(data)
    return jsonify(generate_mock_team_counts())


@app.route('/api/analytics/sentiment-distribution', methods=['GET'])
def get_analytics_sentiment_distribution():
    """Get overall sentiment distribution from historical data."""
    if not MOCK_MODE:
        data = read_analytics_file('sentiment_distribution.json')
        if data:
            return jsonify(data)
    return jsonify(generate_mock_sentiment_distribution())


@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Get analytics summary stats."""
    if not MOCK_MODE:
        data = read_analytics_file('team_counts.json')
        if data:
            total = sum(item.get('count', 0) for item in data)
            return jsonify({
                'totalTweets': total,
                'totalTeams': len(data),
                'avgSentiment': 0.0,
                'lastUpdated': time.strftime('%Y-%m-%dT%H:%M:%S'),
            })
    return jsonify(generate_mock_analytics_summary())


@app.route('/api/analytics/top-positive-team', methods=['GET'])
def get_analytics_top_positive():
    """Get the team with highest positive sentiment ratio."""
    if not MOCK_MODE:
        data = read_analytics_file('top_positive_team.json')
        if data:
            return jsonify(data)
    return jsonify(generate_mock_top_positive_team())


@app.route('/api/analytics/top-negative-team', methods=['GET'])
def get_analytics_top_negative():
    """Get the team with highest negative sentiment ratio."""
    if not MOCK_MODE:
        data = read_analytics_file('top_negative_team.json')
        if data:
            return jsonify(data)
    return jsonify(generate_mock_top_negative_team())


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'mode': 'mock' if MOCK_MODE else 'live', 'teams': [TEAM1, TEAM2]})


if __name__ == '__main__':
    os.makedirs(DATA_DIR, exist_ok=True)
    print("\n" + "=" * 55)
    print("   IPL PULSE — API SERVER")
    print(f"   Mode: {'MOCK DATA' if MOCK_MODE else 'LIVE (Spark)'}")
    print(f"   Teams: {TEAM1} vs {TEAM2}")
    print(f"   URL: http://localhost:5000")
    print("=" * 55 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
