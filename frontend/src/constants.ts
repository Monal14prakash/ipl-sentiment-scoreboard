import type { TeamCode } from './types';

// ─── Team Configuration ──────────────────────────────────────────────────────

export const TEAM_COLORS: Record<TeamCode, { primary: string; secondary: string; glow: string }> = {
  CSK: { primary: '#FFC107', secondary: '#1A237E', glow: 'rgba(255, 193, 7, 0.4)' },
  MI:  { primary: '#004BA0', secondary: '#D4AF37', glow: 'rgba(0, 75, 160, 0.4)' },
  RCB: { primary: '#EC1C24', secondary: '#2B2B2B', glow: 'rgba(236, 28, 36, 0.4)' },
  KKR: { primary: '#3A225D', secondary: '#F2C800', glow: 'rgba(58, 34, 93, 0.4)' },
  DC:  { primary: '#17479E', secondary: '#EF1C25', glow: 'rgba(23, 71, 158, 0.4)' },
  SRH: { primary: '#FF822A', secondary: '#000000', glow: 'rgba(255, 130, 42, 0.4)' },
  PBKS:{ primary: '#ED1B24', secondary: '#A7A9AC', glow: 'rgba(237, 27, 36, 0.4)' },
  RR:  { primary: '#EA1A85', secondary: '#254AA5', glow: 'rgba(234, 26, 133, 0.4)' },
  GT:  { primary: '#1C1C2B', secondary: '#D4C27A', glow: 'rgba(212, 194, 122, 0.4)' },
  LSG: { primary: '#A72056', secondary: '#FFCC00', glow: 'rgba(167, 32, 86, 0.4)' },
};

export const TEAM_NAMES: Record<TeamCode, string> = {
  CSK: 'Chennai Super Kings',
  MI: 'Mumbai Indians',
  RCB: 'Royal Challengers Bengaluru',
  KKR: 'Kolkata Knight Riders',
  DC: 'Delhi Capitals',
  SRH: 'Sunrisers Hyderabad',
  PBKS: 'Punjab Kings',
  RR: 'Rajasthan Royals',
  GT: 'Gujarat Titans',
  LSG: 'Lucknow Super Giants',
};

export const TEAM_SHORT: Record<TeamCode, string> = {
  CSK: 'CSK', MI: 'MI', RCB: 'RCB', KKR: 'KKR', DC: 'DC',
  SRH: 'SRH', PBKS: 'PBKS', RR: 'RR', GT: 'GT', LSG: 'LSG',
};

// ─── Theme Colors ────────────────────────────────────────────────────────────

export const THEME = {
  navy: '#0A192F',
  navyLight: '#112240',
  navyDark: '#060F1F',
  electricBlue: '#00D4FF',
  iplGold: '#FFD700',
  neonGreen: '#39FF14',
  neonPink: '#FF006E',
  white: '#E6F1FF',
  gray: '#8892B0',
  positive: '#39FF14',
  negative: '#FF4444',
  neutral: '#8892B0',
};

// ─── Sentiment Emojis ────────────────────────────────────────────────────────

export const SENTIMENT_EMOJI: Record<string, string> = {
  positive: '🔥',
  negative: '😡',
  neutral: '😐',
};

// ─── API Configuration ──────────────────────────────────────────────────────

export const API_BASE = 'http://localhost:5000';
export const WS_URL = 'http://localhost:5000';

// ─── Trending Hashtags ──────────────────────────────────────────────────────

export const IPL_HASHTAGS = [
  '#IPL2025', '#CSKvsMI', '#RCBvsKKR', '#IPLFinal',
  '#WhistlePodu', '#PlayBold', '#AmiKKR', '#OrangeArmy',
  '#MumbaiIndians', '#ChennaiSuperKings', '#RoyalChallengers',
  '#IPLAuction', '#Dhoni', '#Virat', '#Rohit', '#IPLPlayoffs',
];

// ─── Cricket Events for Momentum ────────────────────────────────────────────

export const CRICKET_EVENTS = {
  six: { emoji: '💥', label: 'SIX!', color: '#39FF14' },
  four: { emoji: '🏏', label: 'FOUR!', color: '#00D4FF' },
  wicket: { emoji: '🎯', label: 'WICKET!', color: '#FF4444' },
  boundary: { emoji: '🔥', label: 'Boundary', color: '#FFD700' },
  dot: { emoji: '⚫', label: 'Dot Ball', color: '#8892B0' },
};
