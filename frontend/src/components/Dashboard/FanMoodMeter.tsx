import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { SentimentData } from '../../types';
import GlassCard from '../UI/GlassCard';
import Fireworks from '../UI/Fireworks';

interface Props {
  data: SentimentData;
}

export default function FanMoodMeter({ data }: Props) {
  const excitement = Math.max(0, Math.min(100, data.positive + data.overallScore * 20));
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (excitement > 80) {
      setShowFireworks(true);
      const timer = setTimeout(() => setShowFireworks(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [excitement]);

  const getColor = (level: number) => {
    if (level > 70) return '#39FF14';
    if (level > 50) return '#FFD700';
    if (level > 30) return '#FFA500';
    return '#FF4444';
  };

  const meterColor = getColor(excitement);
  const crowdRows = 5;

  return (
    <>
      <Fireworks active={showFireworks} />
      <GlassCard className="col-span-4" delay={0.2}>
        <h2 className="section-header" style={{ color: '#E6F1FF', marginBottom: 20 }}>
          🏟️ Fan Mood Meter
        </h2>

        {/* Stadium Crowd Visualization */}
        <div style={{
          position: 'relative',
          height: 200,
          overflow: 'hidden',
          borderRadius: 12,
          background: 'rgba(0,0,0,0.2)',
          marginBottom: 20,
        }}>
          {/* Crowd rows */}
          {Array.from({ length: crowdRows }).map((_, rowIndex) => {
            const rowExcitement = excitement - rowIndex * 5;
            const opacity = Math.max(0.15, Math.min(1, rowExcitement / 100));
            const persons = 12 + rowIndex * 2;

            return (
              <div
                key={rowIndex}
                style={{
                  position: 'absolute',
                  bottom: rowIndex * 38,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  paddingLeft: rowIndex % 2 === 0 ? 0 : 10,
                }}
              >
                {Array.from({ length: persons }).map((_, personIndex) => (
                  <motion.div
                    key={personIndex}
                    animate={{
                      y: excitement > 60 ? [0, -(3 + Math.random() * 8), 0] : 0,
                      scale: excitement > 70 ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.5,
                      repeat: excitement > 60 ? Infinity : 0,
                      delay: personIndex * 0.08,
                      repeatType: 'reverse',
                    }}
                    style={{
                      width: 14,
                      height: 24,
                      borderRadius: '50% 50% 20% 20%',
                      background: `linear-gradient(180deg, ${meterColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}, rgba(0,0,0,0.3))`,
                      opacity,
                    }}
                  />
                ))}
              </div>
            );
          })}

          {/* Floodlights */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            width: '60%',
            height: '40%',
            background: `radial-gradient(ellipse at 50% 0%, ${meterColor}15 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
        </div>

        {/* Excitement Bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#8892B0',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Crowd Excitement
            </span>
            <motion.span
              key={Math.round(excitement)}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '0.9rem',
                fontWeight: 700,
                color: meterColor,
              }}
            >
              {Math.round(excitement)}%
            </motion.span>
          </div>
          <div className="sentiment-bar" style={{ height: 10 }}>
            <motion.div
              className="sentiment-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${excitement}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                background: `linear-gradient(90deg, ${meterColor}80, ${meterColor})`,
                boxShadow: `0 0 10px ${meterColor}60`,
              }}
            />
          </div>
        </div>

        {/* Mood Label */}
        <motion.div
          animate={excitement > 80 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: excitement > 80 ? Infinity : 0 }}
          style={{
            textAlign: 'center',
            padding: '10px 0',
          }}
        >
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '1rem',
            fontWeight: 700,
            color: meterColor,
            textShadow: `0 0 10px ${meterColor}60`,
            letterSpacing: '0.1em',
          }}>
            {excitement > 80 ? '🔥 ELECTRIC ATMOSPHERE!' :
             excitement > 60 ? '🎉 Fans are Pumped!' :
             excitement > 40 ? '👏 Building Excitement' :
             excitement > 20 ? '😐 Quiet Stands' :
             '😴 Crowd is Silent'}
          </span>
        </motion.div>
      </GlassCard>
    </>
  );
}
