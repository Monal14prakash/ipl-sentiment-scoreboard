import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import GlassCard from '../UI/GlassCard';
import CountUp from '../UI/CountUp';
import { useAnalyticsTeamCounts, useAnalyticsSentimentDist, useAnalyticsSummary, useTopPositiveTeam, useTopNegativeTeam } from '../../hooks/useApi';
import { TEAM_COLORS } from '../../constants';
import type { TeamCode } from '../../types';

// ─── Custom Tooltip for Bar Chart ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10, 25, 47, 0.95)',
      border: '1px solid rgba(0, 212, 255, 0.3)',
      borderRadius: 8,
      padding: '8px 14px',
      backdropFilter: 'blur(8px)',
    }}>
      <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#E6F1FF', margin: 0 }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Orbitron', monospace", fontSize: '0.75rem', color: '#00D4FF', margin: '4px 0 0' }}>
        {payload[0].value.toLocaleString()} tweets
      </p>
    </div>
  );
}

// ─── Donut Chart (SVG) ──────────────────────────────────────────────────────
function SentimentDonut({ data }: { data: Array<{ sentiment: string; percentage: number }> }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 60;
  const innerR = 40;

  const colors: Record<string, string> = {
    positive: '#39FF14',
    negative: '#FF4444',
    neutral: '#8892B0',
  };

  const total = data.reduce((sum, d) => sum + d.percentage, 0) || 100;
  let cumulative = 0;

  const arcs = data.map((d) => {
    const startAngle = (cumulative / total) * 360 - 90;
    cumulative += d.percentage;
    const endAngle = (cumulative / total) * 360 - 90;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + outerR * Math.cos(startRad);
    const y1 = cy + outerR * Math.sin(startRad);
    const x2 = cx + outerR * Math.cos(endRad);
    const y2 = cy + outerR * Math.sin(endRad);
    const x3 = cx + innerR * Math.cos(endRad);
    const y3 = cy + innerR * Math.sin(endRad);
    const x4 = cx + innerR * Math.cos(startRad);
    const y4 = cy + innerR * Math.sin(startRad);

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
      `Z`,
    ].join(' ');

    return { path, color: colors[d.sentiment] || '#8892B0', sentiment: d.sentiment, percentage: d.percentage };
  });

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <motion.path
            key={arc.sentiment}
            d={arc.path}
            fill={arc.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${arc.color}40)` }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#E6F1FF" fontSize="11" fontFamily="Orbitron" fontWeight="700">
          {total}%
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#8892B0" fontSize="8" fontFamily="Rajdhani" fontWeight="600">
          ANALYZED
        </text>
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
        {data.map((d) => (
          <div key={d.sentiment} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: colors[d.sentiment] || '#8892B0',
              boxShadow: `0 0 6px ${colors[d.sentiment] || '#8892B0'}`,
            }} />
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#8892B0',
              textTransform: 'capitalize',
              letterSpacing: '0.05em',
            }}>
              {d.sentiment} {d.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mini Stat Card ─────────────────────────────────────────────────────────
function StatCard({ label, value, suffix, color, icon, delay }: {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  icon: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: 'rgba(10, 25, 47, 0.5)',
        border: `1px solid ${color}20`,
        borderRadius: 12,
        padding: '16px 14px',
        textAlign: 'center',
        flex: 1,
        minWidth: 140,
      }}
    >
      <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: 6 }}>{icon}</span>
      <CountUp
        end={value}
        suffix={suffix}
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '1.3rem',
          fontWeight: 800,
          color,
          display: 'block',
        }}
      />
      <p style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: '0.7rem',
        fontWeight: 600,
        color: '#8892B0',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginTop: 4,
      }}>
        {label}
      </p>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function HistoricalAnalytics() {
  const { data: teamCounts } = useAnalyticsTeamCounts();
  const { data: sentimentDist } = useAnalyticsSentimentDist();
  const { data: summary } = useAnalyticsSummary();
  const { data: topPositive } = useTopPositiveTeam();
  const { data: topNegative } = useTopNegativeTeam();

  // Compute total tweets for stat card
  const totalTweets = summary?.totalTweets ?? 0;
  const totalTeams = summary?.totalTeams ?? 10;
  const positiveTeam = topPositive?.[0];
  const negativeTeam = topNegative?.[0];

  // Sort team counts for bar chart
  const sortedTeamCounts = [...(teamCounts ?? [])].sort((a, b) => b.count - a.count);

  return (
    <GlassCard className="col-span-full" delay={0.5} glowColor="rgba(255, 215, 0, 0.15)">
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 className="section-header" style={{ color: '#E6F1FF', marginBottom: 0 }}>
          📈 Historical Analytics
        </h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 16,
            background: 'rgba(255, 215, 0, 0.08)',
            border: '1px solid rgba(255, 215, 0, 0.15)',
          }}
        >
          <span style={{ fontSize: '0.65rem' }}>🗄️</span>
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.55rem',
            fontWeight: 600,
            color: '#FFD700',
            letterSpacing: '0.1em',
          }}>
            SPARK SQL
          </span>
        </motion.div>
      </div>

      {/* Summary Stats Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard
          label="Total Tweets Stored"
          value={totalTweets}
          color="#00D4FF"
          icon="📊"
          delay={0.6}
        />
        <StatCard
          label="Teams Tracked"
          value={totalTeams}
          color="#FFD700"
          icon="🏏"
          delay={0.7}
        />
        <StatCard
          label="Most Positive"
          value={positiveTeam?.positive_ratio ?? 0}
          suffix="%"
          color="#39FF14"
          icon="🔥"
          delay={0.8}
        />
        <StatCard
          label="Most Negative"
          value={negativeTeam?.negative_ratio ?? 0}
          suffix="%"
          color="#FF4444"
          icon="😡"
          delay={0.9}
        />
      </div>

      {/* Team Labels for Positive/Negative */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {positiveTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            style={{
              flex: 1,
              minWidth: 200,
              background: 'rgba(57, 255, 20, 0.06)',
              border: '1px solid rgba(57, 255, 20, 0.15)',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${TEAM_COLORS[positiveTeam.team as TeamCode]?.primary ?? '#39FF14'}, ${TEAM_COLORS[positiveTeam.team as TeamCode]?.primary ?? '#39FF14'}80)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.6rem',
              fontWeight: 900,
              color: '#fff',
              boxShadow: `0 0 12px ${TEAM_COLORS[positiveTeam.team as TeamCode]?.glow ?? 'rgba(57,255,20,0.4)'}`,
            }}>
              {positiveTeam.team}
            </div>
            <div>
              <p style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '0.7rem',
                color: '#39FF14',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Most Positive Team
              </p>
              <p style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#E6F1FF',
              }}>
                {positiveTeam.team} — {positiveTeam.positive_ratio}% positive
              </p>
            </div>
          </motion.div>
        )}
        {negativeTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            style={{
              flex: 1,
              minWidth: 200,
              background: 'rgba(255, 68, 68, 0.06)',
              border: '1px solid rgba(255, 68, 68, 0.15)',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${TEAM_COLORS[negativeTeam.team as TeamCode]?.primary ?? '#FF4444'}, ${TEAM_COLORS[negativeTeam.team as TeamCode]?.primary ?? '#FF4444'}80)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.6rem',
              fontWeight: 900,
              color: '#fff',
              boxShadow: `0 0 12px ${TEAM_COLORS[negativeTeam.team as TeamCode]?.glow ?? 'rgba(255,68,68,0.4)'}`,
            }}>
              {negativeTeam.team}
            </div>
            <div>
              <p style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '0.7rem',
                color: '#FF4444',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                Most Negative Team
              </p>
              <p style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#E6F1FF',
              }}>
                {negativeTeam.team} — {negativeTeam.negative_ratio}% negative
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Team-wise Tweet Counts Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{ flex: 2, minWidth: 320 }}
        >
          <h3 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#E6F1FF',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Team-wise Tweet Volume
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={sortedTeamCounts} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <XAxis
                  type="number"
                  tick={{ fill: '#8892B0', fontSize: 10, fontFamily: 'Rajdhani' }}
                  axisLine={{ stroke: 'rgba(0,212,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="team"
                  type="category"
                  tick={{ fill: '#E6F1FF', fontSize: 11, fontFamily: 'Orbitron', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 212, 255, 0.05)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={16}>
                  {sortedTeamCounts.map((entry) => (
                    <Cell
                      key={entry.team}
                      fill={TEAM_COLORS[entry.team as TeamCode]?.primary ?? '#00D4FF'}
                      style={{
                        filter: `drop-shadow(0 0 4px ${TEAM_COLORS[entry.team as TeamCode]?.glow ?? 'rgba(0,212,255,0.3)'})`,
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sentiment Distribution Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <h3 style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#E6F1FF',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: 16,
            width: '100%',
          }}>
            Sentiment Distribution
          </h3>
          {sentimentDist && sentimentDist.length > 0 ? (
            <SentimentDonut data={sentimentDist} />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 160,
              color: '#8892B0',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.8rem',
            }}>
              Loading...
            </div>
          )}
        </motion.div>
      </div>

      {/* HDFS Storage Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        style={{
          marginTop: 24,
          padding: '10px 16px',
          borderRadius: 8,
          background: 'rgba(0, 212, 255, 0.04)',
          border: '1px solid rgba(0, 212, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.75rem' }}>🗂️</span>
          <span style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.7rem',
            color: '#8892B0',
            letterSpacing: '0.05em',
          }}>
            Storage: HDFS-Compatible Parquet • Format: Columnar • Engine: Spark SQL
          </span>
        </div>
        {summary?.lastUpdated && (
          <span style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.55rem',
            color: '#00D4FF',
            letterSpacing: '0.05em',
          }}>
            Last Updated: {new Date(summary.lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </motion.div>
    </GlassCard>
  );
}
