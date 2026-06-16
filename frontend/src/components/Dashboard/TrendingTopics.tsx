import { motion } from 'framer-motion';
import type { TrendingTag } from '../../types';
import GlassCard from '../UI/GlassCard';

interface Props {
  tags: TrendingTag[];
}

const TAG_COLORS = ['#00D4FF', '#FFD700', '#39FF14', '#FF006E', '#BF40BF', '#FFA500', '#FF69B4', '#7B68EE'];

export default function TrendingTopics({ tags }: Props) {
  const maxCount = Math.max(...tags.map(t => t.count), 1);

  return (
    <GlassCard className="col-span-6" delay={0.3}>
      <h2 className="section-header" style={{ color: '#E6F1FF', marginBottom: 20 }}>
        🔥 Trending Topics
      </h2>

      {/* Bubble Cloud */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        padding: '16px 0',
      }}>
        {tags.map((tag, i) => {
          const sizeRatio = tag.count / maxCount;
          const fontSize = 0.7 + sizeRatio * 0.9;
          const padding = 8 + sizeRatio * 12;
          const color = TAG_COLORS[i % TAG_COLORS.length];

          return (
            <motion.div
              key={tag.tag}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.5 + i * 0.08,
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              whileHover={{
                scale: 1.15,
                boxShadow: `0 0 20px ${color}60`,
                zIndex: 10,
              }}
              style={{
                padding: `${padding * 0.6}px ${padding}px`,
                borderRadius: 30,
                background: `${color}15`,
                border: `1px solid ${color}30`,
                cursor: 'pointer',
                position: 'relative',
                transition: 'box-shadow 0.3s',
              }}
            >
              <span style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: `${fontSize}rem`,
                fontWeight: 700,
                color,
                whiteSpace: 'nowrap',
              }}>
                {tag.tag}
              </span>
              
              {/* Count badge */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + i * 0.08, type: 'spring' }}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: color,
                  color: '#0A192F',
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  fontFamily: "'Orbitron', monospace",
                  padding: '2px 6px',
                  borderRadius: 10,
                  minWidth: 20,
                  textAlign: 'center',
                }}
              >
                {tag.count > 1000 ? `${(tag.count / 1000).toFixed(1)}k` : tag.count}
              </motion.span>

              {/* Velocity indicator */}
              {tag.velocity > 3 && (
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: -8,
                    left: -4,
                    fontSize: '0.7rem',
                  }}
                >
                  🚀
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Top 5 list */}
      <div style={{ marginTop: 16 }}>
        {tags.slice(0, 5).map((tag, i) => (
          <motion.div
            key={tag.tag}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 12px',
              borderRadius: 8,
              marginBottom: 4,
              background: i === 0 ? 'rgba(255, 215, 0, 0.05)' : 'transparent',
            }}
          >
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.7rem',
              fontWeight: 700,
              color: i === 0 ? '#FFD700' : '#8892B0',
              width: 20,
            }}>
              #{i + 1}
            </span>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#E6F1FF',
              flex: 1,
            }}>
              {tag.tag}
            </span>
            <div style={{ flex: 1, maxWidth: 100 }}>
              <div className="sentiment-bar" style={{ height: 4 }}>
                <motion.div
                  className="sentiment-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(tag.count / maxCount) * 100}%` }}
                  transition={{ duration: 1, delay: 1.2 + i * 0.1 }}
                  style={{
                    background: TAG_COLORS[i % TAG_COLORS.length],
                  }}
                />
              </div>
            </div>
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.65rem',
              color: '#8892B0',
              width: 45,
              textAlign: 'right',
            }}>
              {tag.count.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
