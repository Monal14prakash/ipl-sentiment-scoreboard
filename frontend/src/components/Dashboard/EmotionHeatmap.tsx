import { motion } from 'framer-motion';
import { useState } from 'react';
import type { HeatmapCell } from '../../types';
import GlassCard from '../UI/GlassCard';

interface Props {
  data: HeatmapCell[];
}

const EMOTION_EMOJIS: Record<string, string> = {
  joy: '😊',
  anger: '😡',
  excitement: '🔥',
  sadness: '😢',
  surprise: '😲',
  fear: '😰',
  anticipation: '🤔',
};

const EMOTION_COLORS: Record<string, string> = {
  joy: '#39FF14',
  anger: '#FF4444',
  excitement: '#FFD700',
  sadness: '#4488FF',
  surprise: '#BF40BF',
  fear: '#FF6B6B',
  anticipation: '#00D4FF',
};

export default function EmotionHeatmap({ data }: Props) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  // Get unique emotions and time windows
  const emotions = [...new Set(data.map(d => d.emotion))];
  const timeWindows = [...new Set(data.map(d => d.timeWindow))];

  const getCell = (emotion: string, tw: string) =>
    data.find(d => d.emotion === emotion && d.timeWindow === tw);

  return (
    <GlassCard className="col-span-6" delay={0.4}>
      <h2 className="section-header" style={{ color: '#E6F1FF', marginBottom: 20 }}>
        🌡️ Emotion Intensity Heatmap
      </h2>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 500 }}>
          {/* Header row - time windows */}
          <div style={{ display: 'flex', marginBottom: 4, paddingLeft: 100 }}>
            {timeWindows.map((tw) => (
              <div
                key={tw}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: '#8892B0',
                  letterSpacing: '0.05em',
                }}
              >
                {tw}
              </div>
            ))}
          </div>

          {/* Heatmap rows */}
          {emotions.map((emotion, rowIdx) => (
            <motion.div
              key={emotion}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + rowIdx * 0.08 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 3,
              }}
            >
              {/* Emotion label */}
              <div style={{
                width: 100,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                paddingRight: 8,
              }}>
                <span style={{ fontSize: '1rem' }}>
                  {EMOTION_EMOJIS[emotion] || '❓'}
                </span>
                <span style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#E6F1FF',
                  textTransform: 'capitalize',
                }}>
                  {emotion}
                </span>
              </div>

              {/* Cells */}
              {timeWindows.map((tw) => {
                const cell = getCell(emotion, tw);
                const intensity = cell?.intensity || 0;
                const baseColor = EMOTION_COLORS[emotion] || '#00D4FF';
                const isHovered = hoveredCell === cell;

                return (
                  <motion.div
                    key={tw}
                    whileHover={{ scale: 1.15, zIndex: 10 }}
                    onMouseEnter={() => cell && setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      flex: 1,
                      height: 36,
                      margin: '0 1.5px',
                      borderRadius: 6,
                      background: `${baseColor}${Math.floor(intensity * 200 + 20).toString(16).padStart(2, '0')}`,
                      border: isHovered ? `1px solid ${baseColor}` : '1px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    {intensity > 0.6 && (
                      <span style={{
                        fontFamily: "'Orbitron', monospace",
                        fontSize: '0.55rem',
                        color: '#fff',
                        fontWeight: 700,
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      }}>
                        {cell?.tweetCount}
                      </span>
                    )}

                    {/* Hover tooltip */}
                    {isHovered && cell && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          position: 'absolute',
                          bottom: '110%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(10, 25, 47, 0.95)',
                          border: `1px solid ${baseColor}40`,
                          borderRadius: 10,
                          padding: '10px 14px',
                          width: 220,
                          zIndex: 20,
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <p style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: baseColor,
                          marginBottom: 6,
                        }}>
                          {EMOTION_EMOJIS[emotion]} {emotion} • {tw}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: '#8892B0', marginBottom: 4 }}>
                          {cell.tweetCount} tweets • Intensity: {(cell.intensity * 100).toFixed(0)}%
                        </p>
                        {cell.sampleTweets.slice(0, 1).map((t, i) => (
                          <p key={i} style={{
                            fontSize: '0.65rem',
                            color: '#CCD6F6',
                            fontStyle: 'italic',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            "{t}"
                          </p>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Intensity Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
      }}>
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.65rem', color: '#8892B0' }}>Low</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
          <div
            key={v}
            style={{
              width: 20,
              height: 10,
              borderRadius: 3,
              background: `rgba(0, 212, 255, ${v})`,
            }}
          />
        ))}
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.65rem', color: '#8892B0' }}>High</span>
      </div>
    </GlassCard>
  );
}
