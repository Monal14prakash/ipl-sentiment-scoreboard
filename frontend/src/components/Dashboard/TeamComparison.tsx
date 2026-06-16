import { motion } from 'framer-motion';
import type { TeamSentiment } from '../../types';
import { TEAM_COLORS, TEAM_NAMES } from '../../constants';
import GlassCard from '../UI/GlassCard';
import CountUp from '../UI/CountUp';

interface Props {
  teams: TeamSentiment[];
}

export default function TeamComparison({ teams }: Props) {
  if (teams.length < 2) return null;
  const [team1, team2] = teams;
  const t1Colors = TEAM_COLORS[team1.team] || { primary: '#00D4FF', glow: 'rgba(0,212,255,0.4)' };
  const t2Colors = TEAM_COLORS[team2.team] || { primary: '#FFD700', glow: 'rgba(255,215,0,0.4)' };

  const totalSentiment = Math.abs(team1.sentimentScore) + Math.abs(team2.sentimentScore);
  const winProb1 = totalSentiment > 0
    ? Math.round((Math.max(0, team1.sentimentScore + 1) / (team1.sentimentScore + team2.sentimentScore + 2)) * 100)
    : 50;

  const battleBars = [
    { label: 'Positive %', v1: team1.positive, v2: team2.positive },
    { label: 'Tweet Volume', v1: team1.totalTweets, v2: team2.totalTweets },
    { label: 'Sentiment Score', v1: (team1.sentimentScore + 1) * 50, v2: (team2.sentimentScore + 1) * 50 },
  ];

  return (
    <GlassCard className="col-span-6" delay={0.35}>
      <h2 className="section-header" style={{ color: '#E6F1FF', marginBottom: 24 }}>
        ⚔️ Team Battle Arena
      </h2>

      {/* VS Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
      }}>
        {/* Team 1 */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', flex: 1 }}
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${t1Colors.primary}, ${t1Colors.primary}80)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 8px',
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.85rem',
            fontWeight: 900,
            color: '#fff',
            boxShadow: `0 0 20px ${t1Colors.glow}`,
          }}>
            {team1.team}
          </div>
          <p style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.75rem',
            color: '#8892B0',
            letterSpacing: '0.05em',
          }}>
            {TEAM_NAMES[team1.team]}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.65rem',
              color: team1.momentum === 'rising' ? '#39FF14' : team1.momentum === 'falling' ? '#FF4444' : '#8892B0',
            }}>
              {team1.momentum === 'rising' ? '▲' : team1.momentum === 'falling' ? '▼' : '■'}
            </span>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.7rem',
              color: '#8892B0',
              textTransform: 'uppercase',
            }}>
              {team1.momentum}
            </span>
          </div>
        </motion.div>

        {/* VS + Win Probability */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          style={{ textAlign: 'center', flex: '0 0 100px' }}
        >
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '1.2rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #FFD700, #FF006E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            VS
          </div>
          {/* Win probability donut */}
          <svg width={80} height={80} viewBox="0 0 80 80">
            <circle cx={40} cy={40} r={30} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
            <motion.circle
              cx={40} cy={40} r={30}
              fill="none"
              stroke={t1Colors.primary}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${winProb1 * 1.885} ${188.5}`}
              initial={{ strokeDashoffset: 188.5 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
            <text x={40} y={36} textAnchor="middle" fill="#E6F1FF" fontSize="10" fontFamily="Orbitron" fontWeight="700">
              {winProb1}%
            </text>
            <text x={40} y={50} textAnchor="middle" fill="#8892B0" fontSize="7" fontFamily="Rajdhani">
              WIN PROB
            </text>
          </svg>
        </motion.div>

        {/* Team 2 */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', flex: 1 }}
        >
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${t2Colors.primary}, ${t2Colors.primary}80)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 8px',
            fontFamily: "'Orbitron', monospace",
            fontSize: '0.85rem',
            fontWeight: 900,
            color: '#fff',
            boxShadow: `0 0 20px ${t2Colors.glow}`,
          }}>
            {team2.team}
          </div>
          <p style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.75rem',
            color: '#8892B0',
            letterSpacing: '0.05em',
          }}>
            {TEAM_NAMES[team2.team]}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '0.65rem',
              color: team2.momentum === 'rising' ? '#39FF14' : team2.momentum === 'falling' ? '#FF4444' : '#8892B0',
            }}>
              {team2.momentum === 'rising' ? '▲' : team2.momentum === 'falling' ? '▼' : '■'}
            </span>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.7rem',
              color: '#8892B0',
              textTransform: 'uppercase',
            }}>
              {team2.momentum}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Battle Bars */}
      {battleBars.map((bar, i) => {
        const total = bar.v1 + bar.v2 || 1;
        const pct1 = (bar.v1 / total) * 100;
        const pct2 = (bar.v2 / total) * 100;

        return (
          <motion.div
            key={bar.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.15 }}
            style={{ marginBottom: 16 }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}>
              <span style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '0.65rem',
                fontWeight: 700,
                color: t1Colors.primary,
              }}>
                <CountUp end={Math.round(bar.v1)} />
              </span>
              <span style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#8892B0',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {bar.label}
              </span>
              <span style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '0.65rem',
                fontWeight: 700,
                color: t2Colors.primary,
              }}>
                <CountUp end={Math.round(bar.v2)} />
              </span>
            </div>
            <div style={{
              display: 'flex',
              height: 8,
              borderRadius: 4,
              overflow: 'hidden',
              gap: 2,
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct1}%` }}
                transition={{ duration: 1, delay: 0.8 + i * 0.15, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(90deg, ${t1Colors.primary}60, ${t1Colors.primary})`,
                  borderRadius: '4px 0 0 4px',
                  boxShadow: `0 0 8px ${t1Colors.glow}`,
                }}
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct2}%` }}
                transition={{ duration: 1, delay: 0.8 + i * 0.15, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(90deg, ${t2Colors.primary}, ${t2Colors.primary}60)`,
                  borderRadius: '0 4px 4px 0',
                  boxShadow: `0 0 8px ${t2Colors.glow}`,
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </GlassCard>
  );
}
