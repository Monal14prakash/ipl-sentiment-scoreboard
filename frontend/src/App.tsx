import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleBackground from './components/UI/ParticleBackground';
import LoadingScreen from './components/UI/LoadingScreen';
import LandingHero from './components/Landing/LandingHero';
import LiveMatchHeader from './components/Dashboard/LiveMatchHeader';
import TweetStream from './components/Dashboard/TweetStream';
import SentimentGauge from './components/Dashboard/SentimentGauge';
import FanMoodMeter from './components/Dashboard/FanMoodMeter';
import TrendingTopics from './components/Dashboard/TrendingTopics';
import TeamComparison from './components/Dashboard/TeamComparison';
import EmotionHeatmap from './components/Dashboard/EmotionHeatmap';
import ExplainableAI from './components/Dashboard/ExplainableAI';
import SentimentMomentum from './components/Dashboard/SentimentMomentum';
import HistoricalAnalytics from './components/Dashboard/HistoricalAnalytics';
import { useDashboard } from './hooks/useApi';

type AppView = 'loading' | 'landing' | 'dashboard';

export default function App() {
  const [view, setView] = useState<AppView>('loading');
  const { data, loading } = useDashboard();

  // Simulate loading screen (2s min)
  useEffect(() => {
    const timer = setTimeout(() => {
      setView('landing');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const enterDashboard = () => {
    setView('dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <ParticleBackground />

      <AnimatePresence mode="wait">
        {/* Loading Screen */}
        {view === 'loading' && (
          <LoadingScreen key="loading" />
        )}

        {/* Landing Page */}
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
          >
            <LandingHero onEnter={enterDashboard} />
          </motion.div>
        )}

        {/* Dashboard */}
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="stadium-bg"
            style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}
          >
            {/* Dashboard Header */}
            <motion.header
              initial={{ y: -40 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 32px',
                borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
                background: 'rgba(6, 15, 31, 0.8)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 40,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🏏</span>
                <div>
                  <h1 style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                  }}>
                    <span className="gradient-text-gold">IPL</span>
                    {' '}
                    <span className="gradient-text-blue">PULSE</span>
                  </h1>
                  <p style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: '0.65rem',
                    color: '#8892B0',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}>
                    Sentiment Analytics Dashboard
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    borderRadius: 20,
                    background: 'rgba(57, 255, 20, 0.08)',
                    border: '1px solid rgba(57, 255, 20, 0.2)',
                  }}
                >
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#39FF14',
                    boxShadow: '0 0 8px #39FF14',
                  }} />
                  <span style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: '#39FF14',
                    letterSpacing: '0.1em',
                  }}>
                    DATA LIVE
                  </span>
                </motion.div>

                <button
                  onClick={() => setView('landing')}
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#8892B0',
                    background: 'transparent',
                    border: '1px solid rgba(136, 146, 176, 0.2)',
                    borderRadius: 8,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                    e.currentTarget.style.color = '#00D4FF';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(136, 146, 176, 0.2)';
                    e.currentTarget.style.color = '#8892B0';
                  }}
                >
                  ← Back
                </button>
              </div>
            </motion.header>

            {/* Dashboard Content */}
            {data ? (
              <div className="dashboard-grid" style={{ paddingTop: 16, paddingBottom: 48 }}>
                {/* Row 1: Live Match */}
                <LiveMatchHeader data={data.match} />

                {/* Row 2: Tweets + Gauge + Mood */}
                <TweetStream tweets={data.tweets} />
                <SentimentGauge data={data.sentiment} />
                <FanMoodMeter data={data.sentiment} />

                {/* Row 3: Sentiment Momentum (full width) */}
                <SentimentMomentum data={data.momentum} />

                {/* Row 4: Trending + Team Comparison */}
                <TrendingTopics tags={data.trending} />
                <TeamComparison teams={data.teams} />

                {/* Row 5: Heatmap + Explainable AI */}
                <EmotionHeatmap data={data.heatmap} />
                <ExplainableAI explanations={data.explanations} />

                {/* Row 6: Historical Analytics (full width) */}
                <HistoricalAnalytics />
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                gap: 16,
              }}>
                <div className="cricket-ball-spin" />
                <p style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '0.85rem',
                  color: '#00D4FF',
                  letterSpacing: '0.1em',
                }}>
                  {loading ? 'Connecting to the Stadium...' : 'Start the API server to see live data'}
                </p>
                <p style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '0.75rem',
                  color: '#8892B0',
                }}>
                  Run: <code style={{ color: '#FFD700' }}>python api_server.py</code>
                </p>
              </div>
            )}

            {/* Footer */}
            <footer style={{
              textAlign: 'center',
              padding: '24px',
              borderTop: '1px solid rgba(0, 212, 255, 0.05)',
            }}>
              <p style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '0.7rem',
                color: '#8892B0',
                letterSpacing: '0.1em',
              }}>
                IPL PULSE © 2025 — Real-Time Sentiment Analytics Platform
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
