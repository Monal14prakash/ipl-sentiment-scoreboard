"""
IPL Pulse – Mock Data Generator
Generates realistic IPL sentiment data for frontend demo mode.
Uses stateful simulation so the match progresses logically over time.
"""
import random
import time
import json
import math
from datetime import datetime, timedelta

# ─── TEAM DATA ────────────────────────────────────────────────────────────────
TEAMS = ['CSK', 'MI', 'RCB', 'KKR', 'DC', 'SRH', 'PBKS', 'RR', 'GT', 'LSG']

TEAM_PLAYERS = {
    'CSK': ['Dhoni', 'Jadeja', 'Ruturaj', 'Conway', 'Moeen'],
    'MI':  ['Rohit', 'Bumrah', 'Hardik', 'SKY', 'Ishan'],
    'RCB': ['Virat', 'Faf', 'Maxwell', 'Siraj', 'DK'],
    'KKR': ['Shreyas', 'Russell', 'Narine', 'Starc', 'Rinku'],
    'DC':  ['Pant', 'Warner', 'Axar', 'Marsh', 'Kuldeep'],
    'SRH': ['Cummins', 'Head', 'Abhishek', 'Heinrich', 'Bhuvneshwar'],
    'PBKS':['Shikhar', 'Livingstone', 'Curran', 'Arshdeep', 'Bairstow'],
    'RR':  ['Sanju', 'Buttler', 'Chahal', 'Ashwin', 'Yashasvi'],
    'GT':  ['Shubman', 'Rashid', 'Sai', 'Tewatia', 'Miller'],
    'LSG': ['KL Rahul', 'Quinton', 'Stoinis', 'Bishnoi', 'Holder'],
}

POSITIVE_TEMPLATES = [
    "What a shot by {player}! 🔥 #{team} is on fire! #IPL2025",
    "{player} smashing it out of the park! 💥 #{team} #{team}fans",
    "Incredible innings from {player}! #{team} dominating! 🏏",
    "This is why we love #{team}! {player} is a genius! 🙌",
    "{player} just hit a massive six! Stadium erupting! 🎆 #{team}",
    "Best match of IPL 2025! #{team} playing fearless cricket 🔥",
    "Captain {player} leading from the front! #{team} 💛",
    "{player} with back to back boundaries! #{team} fans going crazy 🎉",
    "What a catch by {player}! Absolute stunner! #{team} 🤯",
    "#{team} is the best team in IPL! No debate! 🏆",
]

NEGATIVE_TEMPLATES = [
    "Another collapse by #{team}. {player} needs to step up 😤",
    "Terrible bowling by {player}. #{team} leaking runs everywhere 💀",
    "{player} out for a duck again! #{team} fans in tears 😭",
    "#{team} is done this season. No hope left. Worst performance 👎",
    "Drop {player} from the playing XI! #{team} needs changes ASAP 😡",
    "What is {player} doing? #{team} throwing away the match! 🤦",
    "#{team} batting like they don't care about playoffs 😤",
    "Pathetic fielding by #{team}. {player} dropped a sitter! 💩",
    "#{team} management is clueless. Why is {player} still playing? 😒",
    "Another disappointing season for #{team} fans. We deserve better 😞",
]

NEUTRAL_TEMPLATES = [
    "Watching #{team} vs {opp_team} match tonight. Let's see 👀",
    "{player} coming out to bat. Big moment for #{team}",
    "Strategic timeout in the #{team} innings. Interesting tactics 🤔",
    "#{team} need {runs} runs from {balls} balls. Can they do it?",
    "Weather looks clear for the #{team} match tonight 🏟️",
    "Toss update: #{team} won the toss and chose to bat",
    "#{team} playing at their home ground today",
    "Pre-match analysis: #{team} vs {opp_team} should be interesting",
]

HASHTAGS = [
    '#IPL2025', '#IPLFinal', '#IPLPlayoffs', '#CricketFever',
    '#WhistlePodu', '#PlayBold', '#AmiKKR', '#OrangeArmy',
    '#MumbaiPaltan', '#SaddaPunjab', '#HallaBol', '#RoyalsFamily',
    '#AavaDe', '#IPLAuction', '#T20Cricket', '#CricketTwitter',
]

EMOTIONS = ['joy', 'anger', 'excitement', 'sadness', 'surprise', 'fear', 'anticipation']

USERNAMES = [
    'CricketFan_99', 'IPL_Addict', 'DhoniLover07', 'ViratArmy18',
    'MumbaiFanatic', 'ChennaiGirl', 'KKR_Warriors', 'SRH_Army',
    'PunjabPride', 'RajasthanRoyal', 'IPLBuzzDaily', 'CricketPulse',
    'MatchDay_Live', 'T20Fanatic', 'SixerKing', 'BowlingBeast',
    'CaptainCool', 'RunMachine', 'BoundaryMaster', 'WicketHunter',
]

VENUES = [
    'Wankhede Stadium, Mumbai',
    'MA Chidambaram Stadium, Chennai',
    'M. Chinnaswamy Stadium, Bengaluru',
    'Eden Gardens, Kolkata',
    'Narendra Modi Stadium, Ahmedabad',
]


# ─── STATEFUL MATCH SIMULATION ───────────────────────────────────────────────
class MatchSimulation:
    """
    Maintains a persistent, logically progressing match state.
    Each call to tick() advances the game by a few balls, so the
    scoreboard never jumps backwards or shows contradictory info.
    """

    def __init__(self, team1: str, team2: str):
        self.team1 = team1
        self.team2 = team2
        self.venue = random.choice(VENUES)

        # 1st innings: completed
        self.runs1 = random.randint(155, 195)
        self.wickets1 = random.randint(4, 8)
        self.overs1 = 20.0

        # 2nd innings: in progress — start at a realistic mid-point
        start_over = random.uniform(8.0, 12.0)
        self.balls2 = int(start_over) * 6 + int((start_over % 1) * 10)  # total balls bowled
        expected_rr = self.runs1 / 20.0
        # The chasing team should be roughly tracking the required rate
        self.runs2 = int(self.balls2 / 6 * expected_rr * random.uniform(0.8, 1.05))
        self.wickets2 = random.randint(1, 4)

        # Sentiment state
        self.sentiment_positive = random.randint(38, 50)
        self.sentiment_negative = random.randint(18, 30)
        self.total_tweets = random.randint(8000, 15000)
        self.base_sentiment = 0.0

        # Momentum (filled overs for innings so far)
        self.momentum = []
        completed_overs = self.balls2 // 6
        for over_num in range(1, completed_overs + 1):
            self._generate_momentum_over(over_num)

        # Trending tags (generated once, counts tick up)
        self._init_trending()

        # Team sentiments (slowly evolving)
        self.team_sentiments = self._init_team_sentiments()

        # Match-over flag
        self._match_over = False
        self._match_result = ''

    def _init_trending(self):
        tags = random.sample(HASHTAGS, min(12, len(HASHTAGS)))
        self.trending = []
        for tag in tags:
            sentiment = random.choice(['positive', 'negative', 'neutral'])
            self.trending.append({
                'tag': tag,
                'count': random.randint(500, 10000),
                'sentiment': sentiment,
                'velocity': round(random.uniform(0.5, 3.0), 2),
            })
        self.trending.sort(key=lambda x: x['count'], reverse=True)

    def _init_team_sentiments(self):
        teams_data = []
        for team in [self.team1, self.team2]:
            pos = random.randint(35, 55)
            neg = random.randint(15, 35)
            neu = 100 - pos - neg
            total = random.randint(2000, 6000)
            teams_data.append({
                'team': team,
                'positive': pos,
                'negative': neg,
                'neutral': neu,
                'totalTweets': total,
                'sentimentScore': round((pos - neg) / 100.0, 3),
                'momentum': 'stable',
            })
        return teams_data

    def _generate_momentum_over(self, over_num):
        """Add a momentum entry for a completed over."""
        event = None
        event_rand = random.random()
        if event_rand > 0.85:
            event = 'six'
            self.base_sentiment += 0.2
        elif event_rand > 0.7:
            event = 'four'
            self.base_sentiment += 0.1
        elif event_rand > 0.6:
            event = 'wicket'
            self.base_sentiment -= 0.25
        elif event_rand < 0.1:
            event = 'dot'
            self.base_sentiment -= 0.05

        score = self.base_sentiment + random.uniform(-0.15, 0.15)
        score = max(-1.0, min(1.0, score))

        self.momentum.append({
            'over': over_num,
            'sentimentScore': round(score, 3),
            'tweetCount': random.randint(100, 600),
            'event': event,
            'keyTweet': f"Over {over_num}: {'Big six!' if event == 'six' else 'Wicket falls!' if event == 'wicket' else 'Good cricket'}",
            'team1Runs': random.randint(4, 16),
            'team2Runs': random.randint(3, 14),
        })

        self.base_sentiment *= 0.9

    def tick(self):
        """
        Advance the match by 1-3 balls. Called on every dashboard refresh (~5s).
        This ensures the scoreboard progresses forward naturally.
        """
        if self._match_over:
            return

        # Advance 1-3 balls
        balls_to_add = random.randint(1, 3)
        total_balls = 120  # 20 overs

        for _ in range(balls_to_add):
            if self.balls2 >= total_balls or self.wickets2 >= 10:
                self._finish_match()
                return
            if self.runs2 >= self.runs1:
                self._finish_match_win()
                return

            self.balls2 += 1

            # Simulate what happens on this ball
            ball_outcome = random.random()
            if ball_outcome > 0.92:
                self.runs2 += 6  # six
            elif ball_outcome > 0.78:
                self.runs2 += 4  # four
            elif ball_outcome > 0.60:
                self.runs2 += random.choice([1, 2, 3])  # singles/doubles/triples
            elif ball_outcome > 0.50:
                self.runs2 += 1  # single
            elif ball_outcome < 0.06 and self.wickets2 < 9:
                self.wickets2 += 1  # wicket
            # else: dot ball

            # Check for over completion → add momentum
            if self.balls2 % 6 == 0:
                over_num = self.balls2 // 6
                if over_num <= 20 and len(self.momentum) < over_num:
                    self._generate_momentum_over(over_num)

            # Check win
            if self.runs2 >= self.runs1:
                self._finish_match_win()
                return

        # Slightly evolve sentiment
        self._nudge_sentiment()
        self._nudge_trending()
        self._nudge_team_sentiments()

    def _finish_match_win(self):
        """Team 2 successfully chased the target."""
        self._match_over = True
        wickets_left = 10 - self.wickets2
        balls_left = 120 - self.balls2
        self._match_result = f'{self.team2} won by {wickets_left} wickets with {balls_left} balls remaining! 🎉'

    def _finish_match(self):
        """Innings over (all out or 20 overs done)."""
        self._match_over = True
        diff = self.runs1 - self.runs2
        if diff > 0:
            self._match_result = f'{self.team1} won by {diff} runs! 🏆'
        elif diff == 0:
            self._match_result = 'Match tied! Super Over coming up! 🤯'
        else:
            self._finish_match_win()

    def _nudge_sentiment(self):
        """Slightly adjust sentiment percentages each tick (±1-2%)."""
        delta = random.randint(-2, 2)
        self.sentiment_positive = max(20, min(65, self.sentiment_positive + delta))
        delta = random.randint(-2, 2)
        self.sentiment_negative = max(10, min(45, self.sentiment_negative + delta))
        # Ensure they sum to ≤100
        if self.sentiment_positive + self.sentiment_negative > 90:
            self.sentiment_negative = 90 - self.sentiment_positive
        self.total_tweets += random.randint(50, 300)

    def _nudge_trending(self):
        """Slightly bump trending counts."""
        for tag in self.trending:
            tag['count'] += random.randint(10, 200)
            tag['velocity'] = round(max(0.1, tag['velocity'] + random.uniform(-0.3, 0.3)), 2)
        self.trending.sort(key=lambda x: x['count'], reverse=True)

    def _nudge_team_sentiments(self):
        """Slightly adjust team sentiments."""
        for ts in self.team_sentiments:
            d = random.randint(-2, 2)
            ts['positive'] = max(20, min(65, ts['positive'] + d))
            d = random.randint(-2, 2)
            ts['negative'] = max(10, min(45, ts['negative'] + d))
            ts['neutral'] = 100 - ts['positive'] - ts['negative']
            ts['totalTweets'] += random.randint(20, 150)
            ts['sentimentScore'] = round((ts['positive'] - ts['negative']) / 100.0, 3)
            # Update momentum direction
            if ts['sentimentScore'] > 0.15:
                ts['momentum'] = 'rising'
            elif ts['sentimentScore'] < -0.05:
                ts['momentum'] = 'falling'
            else:
                ts['momentum'] = 'stable'

    # ─── Data Accessors ───────────────────────────────────────────────────────

    def get_match_score(self):
        overs2 = self.balls2 // 6
        partial_balls = self.balls2 % 6
        overs2_display = f'{overs2}.{partial_balls}' if partial_balls > 0 else f'{overs2}.0'

        if self._match_over:
            status = self._match_result
        else:
            need = self.runs1 - self.runs2 + 1
            balls_left = max(1, 120 - self.balls2)
            status = f'{self.team2} need {need} runs from {balls_left} balls'

        return {
            'team1': self.team1,
            'team2': self.team2,
            'team1Score': f'{self.runs1}/{self.wickets1}',
            'team2Score': f'{self.runs2}/{self.wickets2}',
            'team1Overs': '20.0',
            'team2Overs': overs2_display,
            'currentInnings': 2,
            'status': status,
            'venue': self.venue,
            'isLive': not self._match_over,
        }

    def get_sentiment_data(self):
        neu = 100 - self.sentiment_positive - self.sentiment_negative
        overall = (self.sentiment_positive - self.sentiment_negative) / 100.0
        return {
            'positive': self.sentiment_positive,
            'negative': self.sentiment_negative,
            'neutral': neu,
            'overallScore': round(overall, 3),
            'totalTweets': self.total_tweets,
        }

    def get_team_sentiments(self):
        return self.team_sentiments

    def get_momentum_data(self):
        return self.momentum

    def get_trending_tags(self):
        return self.trending


# ─── GLOBAL SIMULATION INSTANCE ──────────────────────────────────────────────
_sim = None

def _get_sim(team1, team2):
    """Get or create the singleton match simulation."""
    global _sim
    if _sim is None or _sim.team1 != team1 or _sim.team2 != team2:
        _sim = MatchSimulation(team1, team2)
    return _sim

def reset_simulation():
    """Reset the simulation (e.g., when match finishes and you want a new one)."""
    global _sim
    _sim = None


# ─── PUBLIC API (backwards-compatible function names) ─────────────────────────

def generate_tweet(team1, team2, sentiment_bias=0.0):
    """Generate a single fake tweet."""
    team = random.choice([team1, team2])
    opp = team2 if team == team1 else team1
    player = random.choice(TEAM_PLAYERS[team])

    r = random.random() + sentiment_bias * 0.3
    if r > 0.6:
        sentiment = 'positive'
        template = random.choice(POSITIVE_TEMPLATES)
    elif r < 0.3:
        sentiment = 'negative'
        template = random.choice(NEGATIVE_TEMPLATES)
    else:
        sentiment = 'neutral'
        template = random.choice(NEUTRAL_TEMPLATES)

    # Use match state for neutral templates that reference runs/balls
    sim = _get_sim(team1, team2)
    match_data = sim.get_match_score()
    need = max(1, sim.runs1 - sim.runs2 + 1)
    balls_left = max(1, 120 - sim.balls2)

    text = template.format(
        player=player, team=team, opp_team=opp,
        runs=need, balls=balls_left,
    )

    hashtags = [f'#{team}']
    hashtags.extend(random.sample(HASHTAGS, random.randint(1, 3)))

    score = random.uniform(0.6, 1.0) if sentiment == 'positive' else \
            random.uniform(-1.0, -0.5) if sentiment == 'negative' else \
            random.uniform(-0.2, 0.2)

    return {
        'id': f'tw_{int(time.time()*1000)}_{random.randint(1000, 9999)}',
        'text': text,
        'hashtags': hashtags,
        'team': team,
        'sentiment': sentiment,
        'score': round(score, 3),
        'timestamp': datetime.now().isoformat(),
        'username': random.choice(USERNAMES),
    }

def generate_match_score(team1='CSK', team2='MI'):
    """Get current match score from simulation."""
    sim = _get_sim(team1, team2)
    return sim.get_match_score()

def generate_sentiment_data():
    """Get current sentiment distribution from simulation."""
    if _sim is not None:
        return _sim.get_sentiment_data()
    # Fallback if no simulation yet
    pos = random.randint(38, 50)
    neg = random.randint(18, 30)
    neu = 100 - pos - neg
    return {
        'positive': pos,
        'negative': neg,
        'neutral': neu,
        'overallScore': round((pos - neg) / 100.0, 3),
        'totalTweets': random.randint(8000, 15000),
    }

def generate_team_sentiments(team1, team2):
    """Get per-team sentiment data from simulation."""
    sim = _get_sim(team1, team2)
    return sim.get_team_sentiments()

def generate_momentum_data(team1='CSK', team2='MI'):
    """Get sentiment momentum from simulation."""
    sim = _get_sim(team1, team2)
    return sim.get_momentum_data()

def generate_trending_tags():
    """Get trending hashtags from simulation."""
    if _sim is not None:
        return _sim.get_trending_tags()
    # Fallback
    tags = random.sample(HASHTAGS, min(12, len(HASHTAGS)))
    trending = []
    for tag in tags:
        sentiment = random.choice(['positive', 'negative', 'neutral'])
        trending.append({
            'tag': tag,
            'count': random.randint(500, 10000),
            'sentiment': sentiment,
            'velocity': round(random.uniform(0.5, 3.0), 2),
        })
    trending.sort(key=lambda x: x['count'], reverse=True)
    return trending

def generate_heatmap(team1, team2):
    """Generate emotion intensity heatmap."""
    time_windows = [f'Over {i}-{i+4}' for i in range(1, 20, 4)]
    cells = []
    for emotion in EMOTIONS:
        for tw in time_windows:
            intensity = random.uniform(0.1, 1.0)
            count = int(intensity * random.randint(50, 300))
            cells.append({
                'emotion': emotion,
                'timeWindow': tw,
                'intensity': round(intensity, 3),
                'tweetCount': count,
                'sampleTweets': [
                    generate_tweet(team1, team2)['text'] for _ in range(2)
                ],
            })
    return cells

def generate_shap_explanations(team1, team2):
    """Generate SHAP-like explanations."""
    explanations = []
    for _ in range(5):
        tweet = generate_tweet(team1, team2)
        words = tweet['text'].split()[:8]
        features = []
        for word in words:
            clean = word.strip('#@!.,')
            if len(clean) > 2:
                impact = round(random.uniform(-0.5, 0.5), 3)
                features.append({
                    'word': clean,
                    'impact': impact,
                    'direction': 'positive' if impact > 0 else 'negative',
                })
        features.sort(key=lambda x: abs(x['impact']), reverse=True)
        explanations.append({
            'tweetId': tweet['id'],
            'tweetText': tweet['text'],
            'prediction': tweet['sentiment'],
            'confidence': round(random.uniform(0.65, 0.98), 2),
            'features': features[:6],
        })
    return explanations

def generate_full_dashboard(team1='CSK', team2='MI'):
    """Generate complete dashboard data, advancing the match simulation."""
    sim = _get_sim(team1, team2)

    # Advance the match state
    sim.tick()

    # If the match ended, auto-restart after a brief "result" period
    if sim._match_over:
        # Keep showing result for ~30 seconds (6 ticks × 5s), then reset
        if not hasattr(sim, '_end_counter'):
            sim._end_counter = 0
        sim._end_counter += 1
        if sim._end_counter > 6:
            reset_simulation()
            sim = _get_sim(team1, team2)

    return {
        'sentiment': sim.get_sentiment_data(),
        'teams': sim.get_team_sentiments(),
        'tweets': [generate_tweet(team1, team2) for _ in range(20)],
        'match': sim.get_match_score(),
        'momentum': sim.get_momentum_data(),
        'trending': sim.get_trending_tags(),
        'heatmap': generate_heatmap(team1, team2),
        'explanations': generate_shap_explanations(team1, team2),
    }

if __name__ == '__main__':
    data = generate_full_dashboard()
    print(json.dumps(data, indent=2))


# ─── MOCK ANALYTICS DATA (for Historical Analytics in mock mode) ─────────────

def generate_mock_team_counts():
    """Generate mock team-wise tweet counts for all 10 teams."""
    return [
        {'team': team, 'count': random.randint(800, 5000)}
        for team in TEAMS
    ]


def generate_mock_sentiment_distribution():
    """Generate mock overall sentiment distribution."""
    positive = random.randint(35, 50)
    negative = random.randint(20, 35)
    neutral = 100 - positive - negative
    return [
        {'sentiment': 'positive', 'count': random.randint(3000, 8000), 'percentage': positive},
        {'sentiment': 'negative', 'count': random.randint(1500, 4000), 'percentage': negative},
        {'sentiment': 'neutral',  'count': random.randint(1000, 3000), 'percentage': neutral},
    ]


def generate_mock_analytics_summary():
    """Generate mock analytics summary stats."""
    total = random.randint(15000, 50000)
    return {
        'totalTweets': total,
        'totalTeams': len(TEAMS),
        'avgSentiment': round(random.uniform(0.05, 0.35), 3),
        'lastUpdated': datetime.now().isoformat(),
    }


def generate_mock_top_positive_team():
    """Generate mock most-positive team."""
    team = random.choice(TEAMS)
    total = random.randint(1500, 5000)
    positive_ratio = round(random.uniform(55.0, 75.0), 2)
    return [{
        'team': team,
        'positive_count': int(total * positive_ratio / 100),
        'total_tweets': total,
        'positive_ratio': positive_ratio,
    }]


def generate_mock_top_negative_team():
    """Generate mock most-negative team."""
    team = random.choice(TEAMS)
    total = random.randint(1500, 5000)
    negative_ratio = round(random.uniform(40.0, 60.0), 2)
    return [{
        'team': team,
        'negative_count': int(total * negative_ratio / 100),
        'total_tweets': total,
        'negative_ratio': negative_ratio,
    }]

