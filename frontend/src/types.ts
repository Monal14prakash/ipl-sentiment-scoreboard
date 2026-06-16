// ─── Core Data Types ─────────────────────────────────────────────────────────

export interface Tweet {
  id: string;
  text: string;
  hashtags: string[];
  team: TeamCode;
  sentiment: SentimentType;
  score: number;
  timestamp: string;
  username: string;
  avatar?: string;
}

export type SentimentType = 'positive' | 'negative' | 'neutral';
export type TeamCode = 'CSK' | 'MI' | 'RCB' | 'KKR' | 'DC' | 'SRH' | 'PBKS' | 'RR' | 'GT' | 'LSG';

export interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  overallScore: number; // -1 to 1
  totalTweets: number;
}

export interface TeamSentiment {
  team: TeamCode;
  positive: number;
  negative: number;
  neutral: number;
  totalTweets: number;
  sentimentScore: number;
  momentum: 'rising' | 'falling' | 'stable';
}

export interface MatchScore {
  team1: TeamCode;
  team2: TeamCode;
  team1Score: string;     // e.g. "185/4"
  team2Score: string;     // e.g. "120/3"
  team1Overs: string;     // e.g. "18.2"
  team2Overs: string;
  currentInnings: 1 | 2;
  status: string;         // e.g. "CSK need 66 runs from 10 balls"
  venue: string;
  isLive: boolean;
}

export interface MomentumOver {
  over: number;
  sentimentScore: number; // -1 to 1
  tweetCount: number;
  event?: 'six' | 'four' | 'wicket' | 'boundary' | 'dot';
  keyTweet?: string;
  team1Runs: number;
  team2Runs: number;
}

export interface TrendingTag {
  tag: string;
  count: number;
  sentiment: SentimentType;
  velocity: number; // trending speed
}

export interface HeatmapCell {
  emotion: string;
  timeWindow: string;
  intensity: number; // 0-1
  tweetCount: number;
  sampleTweets: string[];
}

export interface ShapExplanation {
  tweetId: string;
  tweetText: string;
  prediction: SentimentType;
  confidence: number;
  features: ShapFeature[];
}

export interface ShapFeature {
  word: string;
  impact: number; // positive = pushes toward positive sentiment
  direction: 'positive' | 'negative';
}

export interface DashboardData {
  sentiment: SentimentData;
  teams: TeamSentiment[];
  tweets: Tweet[];
  match: MatchScore;
  momentum: MomentumOver[];
  trending: TrendingTag[];
  heatmap: HeatmapCell[];
  explanations: ShapExplanation[];
}

// ─── Analytics Data Types (Historical / Spark SQL) ───────────────────────────

export interface TeamCount {
  team: string;
  count: number;
}

export interface SentimentDistribution {
  sentiment: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalTweets: number;
  totalTeams: number;
  avgSentiment: number;
  lastUpdated: string;
}

export interface TopTeam {
  team: string;
  positive_count?: number;
  negative_count?: number;
  total_tweets: number;
  positive_ratio?: number;
  negative_ratio?: number;
}

