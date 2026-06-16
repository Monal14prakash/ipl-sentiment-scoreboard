import { useState, useEffect, useCallback, useRef } from 'react';
import type { DashboardData, Tweet, SentimentData, MatchScore, MomentumOver, TrendingTag, HeatmapCell, ShapExplanation, TeamSentiment, TeamCount, SentimentDistribution, AnalyticsSummary, TopTeam } from '../types';

const API_BASE = 'http://localhost:5000';

function useFetch<T>(url: string, interval: number = 5000): { data: T | null; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    intervalRef.current = window.setInterval(fetchData, interval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, interval]);

  return { data, loading, error, refetch: fetchData };
}

export function useDashboard() {
  return useFetch<DashboardData>(`${API_BASE}/api/dashboard`, 5000);
}

export function useLiveSentiment() {
  return useFetch<SentimentData>(`${API_BASE}/api/sentiment/live`, 3000);
}

export function useTeamSentiments() {
  return useFetch<TeamSentiment[]>(`${API_BASE}/api/sentiment/teams`, 5000);
}

export function useTweets() {
  return useFetch<Tweet[]>(`${API_BASE}/api/tweets/stream`, 3000);
}

export function useMatchScore() {
  return useFetch<MatchScore>(`${API_BASE}/api/match/score`, 10000);
}

export function useMomentum() {
  return useFetch<MomentumOver[]>(`${API_BASE}/api/momentum`, 8000);
}

export function useTrending() {
  return useFetch<TrendingTag[]>(`${API_BASE}/api/sentiment/trending`, 6000);
}

export function useHeatmap() {
  return useFetch<HeatmapCell[]>(`${API_BASE}/api/heatmap`, 10000);
}

export function useExplanations() {
  return useFetch<ShapExplanation[]>(`${API_BASE}/api/explanations`, 10000);
}

// ─── Analytics Hooks (Historical Data from Spark SQL) ────────────────────────

export function useAnalyticsTeamCounts() {
  return useFetch<TeamCount[]>(`${API_BASE}/api/analytics/team-counts`, 30000);
}

export function useAnalyticsSentimentDist() {
  return useFetch<SentimentDistribution[]>(`${API_BASE}/api/analytics/sentiment-distribution`, 30000);
}

export function useAnalyticsSummary() {
  return useFetch<AnalyticsSummary>(`${API_BASE}/api/analytics/summary`, 30000);
}

export function useTopPositiveTeam() {
  return useFetch<TopTeam[]>(`${API_BASE}/api/analytics/top-positive-team`, 30000);
}

export function useTopNegativeTeam() {
  return useFetch<TopTeam[]>(`${API_BASE}/api/analytics/top-negative-team`, 30000);
}
