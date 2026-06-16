import { motion } from 'framer-motion';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { MomentumOver } from '../../types';
import { CRICKET_EVENTS } from '../../constants';
import GlassCard from '../UI/GlassCard';

interface Props {
  data: MomentumOver[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload as MomentumOver;
  const event = d.event ? CRICKET_EVENTS[d.event] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(10, 25, 47, 0.95)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: 12,
        padding: '14px 18px',
        backdropFilter: 'blur(10px)',
        minWidth: 200,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#FFD700',
        }}>
          Over {d.over}
        </span>
        {event && (
          <span style={{
            padding: '2px 8px',
            borderRadius: 20,
            background: `${event.color}20`,
            color: event.color,
            fontSize: '0.65rem',
            fontFamily: "'Orbitron', monospace",
            fontWeight: 700,
            border: `1px solid ${event.color}40`,
          }}>
            {event.emoji} {event.label}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.7rem', color: '#8892B0' }}>Sentiment</span>
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.7rem',
            fontWeight: 700,
            color: d.sentimentScore > 0 ? '#39FF14' : d.sentimentScore < 0 ? '#FF4444' : '#8892B0',
          }}>
            {d.sentimentScore > 0 ? '+' : ''}{(d.sentimentScore * 100).toFixed(0)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.7rem', color: '#8892B0' }}>Tweets</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#E6F1FF' }}>
            {d.tweetCount}
          </span>
        </div>
      </div>

      {d.keyTweet && (
        <p style={{
          fontSize: '0.65rem',
          color: '#CCD6F6',
          marginTop: 8,
          fontStyle: 'italic',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 8,
        }}>
          "{d.keyTweet}"
        </p>
      )}
    </motion.div>
  );
}

export default function SentimentMomentum({ data }: Props) {
  const [hoveredOver, setHoveredOver] = useState<number | null>(null);

  return (
    <GlassCard className="col-span-full" delay={0.5}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h2 className="section-header" style={{ color: '#E6F1FF' }}>
            🏏 Sentiment Momentum Over
          </h2>
          <p style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.75rem',
            color: '#8892B0',
            marginTop: 4,
          }}>
            Fan emotion intensity across 20 overs — Sixes spark joy, Wickets bring despair
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'SIX', color: '#39FF14', emoji: '💥' },
            { label: 'WICKET', color: '#FF4444', emoji: '🎯' },
            { label: 'FOUR', color: '#00D4FF', emoji: '🏏' },
          ].map((legend) => (
            <div key={legend.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.8rem' }}>{legend.emoji}</span>
              <span style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 600,
                color: legend.color,
              }}>
                {legend.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 280, marginTop: 10 }}>
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
            onMouseMove={(e: any) => {
              if (e?.activePayload?.[0]) {
                setHoveredOver(e.activePayload[0].payload.over);
              }
            }}
            onMouseLeave={() => setHoveredOver(null)}
          >
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#39FF14" stopOpacity={0.4} />
                <stop offset="45%" stopColor="#00D4FF" stopOpacity={0.15} />
                <stop offset="55%" stopColor="#FFD700" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#FF4444" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00D4FF" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#39FF14" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <XAxis
              dataKey="over"
              stroke="#8892B0"
              tick={{ fill: '#8892B0', fontSize: 11, fontFamily: 'Rajdhani' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              label={{
                value: 'Overs',
                position: 'insideBottom',
                offset: -10,
                style: { fill: '#8892B0', fontSize: 12, fontFamily: 'Orbitron' },
              }}
            />
            <YAxis
              domain={[-1, 1]}
              stroke="#8892B0"
              tick={{ fill: '#8892B0', fontSize: 10, fontFamily: 'Orbitron' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              width={40}
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}`}
            />

            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />

            <Tooltip content={<CustomTooltip />} cursor={false} />

            <Area
              type="monotone"
              dataKey="sentimentScore"
              stroke="url(#strokeGradient)"
              strokeWidth={2.5}
              fill="url(#sentimentGradient)"
              filter="url(#glow)"
              animationDuration={2000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Over-by-over event markers */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 30px 0 40px',
        marginTop: -8,
      }}>
        {data.map((d) => {
          const event = d.event ? CRICKET_EVENTS[d.event] : null;
          const isHovered = hoveredOver === d.over;

          return (
            <motion.div
              key={d.over}
              animate={isHovered ? { scale: 1.3, y: -3 } : { scale: 1, y: 0 }}
              style={{
                width: `${100 / data.length}%`,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {event && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + d.over * 0.05, type: 'spring' }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: `${event.color}20`,
                    border: `1px solid ${event.color}40`,
                    fontSize: '0.65rem',
                  }}
                >
                  {event.emoji}
                </motion.div>
              )}
              {!event && (
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: d.sentimentScore > 0 ? 'rgba(57, 255, 20, 0.3)' :
                              d.sentimentScore < 0 ? 'rgba(255, 68, 68, 0.3)' :
                              'rgba(136, 146, 176, 0.2)',
                  margin: '8px auto',
                }} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 32,
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {[
          { label: 'Peak Joy', value: `Over ${data.reduce((max, d) => d.sentimentScore > max.sentimentScore ? d : max, data[0]).over}`, color: '#39FF14' },
          { label: 'Peak Despair', value: `Over ${data.reduce((min, d) => d.sentimentScore < min.sentimentScore ? d : min, data[0]).over}`, color: '#FF4444' },
          { label: 'Sixes', value: data.filter(d => d.event === 'six').length, color: '#FFD700' },
          { label: 'Wickets', value: data.filter(d => d.event === 'wicket').length, color: '#FF006E' },
          { label: 'Total Tweets', value: data.reduce((sum, d) => sum + d.tweetCount, 0).toLocaleString(), color: '#00D4FF' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.9rem',
              fontWeight: 700,
              color: stat.color,
            }}>
              {stat.value}
            </p>
            <p style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.65rem',
              color: '#8892B0',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
