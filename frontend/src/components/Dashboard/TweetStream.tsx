import { motion, AnimatePresence } from 'framer-motion';
import type { Tweet } from '../../types';
import { TEAM_COLORS, SENTIMENT_EMOJI } from '../../constants';
import GlassCard from '../UI/GlassCard';

interface Props {
  tweets: Tweet[];
}

export default function TweetStream({ tweets }: Props) {
  return (
    <GlassCard className="col-span-4" style={{ maxHeight: 600, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 className="section-header" style={{ color: '#E6F1FF' }}>
          🐦 Live Tweet Stream
        </h2>
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.65rem',
            color: '#39FF14',
            letterSpacing: '0.1em',
          }}
        >
          ● STREAMING
        </motion.span>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        paddingRight: 4,
      }}>
        <AnimatePresence mode="popLayout">
          {tweets.slice(0, 15).map((tweet, i) => {
            const teamColor = TEAM_COLORS[tweet.team]?.primary || '#00D4FF';
            const emoji = SENTIMENT_EMOJI[tweet.sentiment] || '😐';

            return (
              <motion.div
                key={tweet.id}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                layout
                whileHover={{ scale: 1.02, borderColor: teamColor }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(17, 34, 64, 0.6)',
                  borderLeft: `3px solid ${teamColor}`,
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${teamColor}, rgba(0,0,0,0.5))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {tweet.team}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#E6F1FF',
                    }}>
                      @{tweet.username}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      color: '#8892B0',
                      marginLeft: 8,
                    }}>
                      {new Date(tweet.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                </div>

                <p style={{
                  fontSize: '0.8rem',
                  color: '#CCD6F6',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {tweet.text}
                </p>

                {/* Hashtags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                  {tweet.hashtags.slice(0, 3).map((tag, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: '0.65rem',
                        padding: '2px 8px',
                        borderRadius: 20,
                        background: 'rgba(0, 212, 255, 0.1)',
                        color: '#00D4FF',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
