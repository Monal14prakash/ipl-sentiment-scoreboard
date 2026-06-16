import { motion } from 'framer-motion';
import LivePulse from '../UI/LivePulse';
import type { MatchScore as MatchScoreType } from '../../types';
import { TEAM_COLORS, TEAM_NAMES } from '../../constants';

interface Props {
  data: MatchScoreType;
}

function TeamLogo({ team, side }: { team: string; side: 'left' | 'right' }) {
  const colors = TEAM_COLORS[team as keyof typeof TEAM_COLORS] || { primary: '#00D4FF', secondary: '#fff' };
  return (
    <motion.div
      initial={{ x: side === 'left' ? -60 : 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: 'spring' }}
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Orbitron', monospace",
        fontSize: '1rem',
        fontWeight: 900,
        color: '#fff',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        boxShadow: `0 0 20px ${colors.glow}, 0 4px 12px rgba(0,0,0,0.3)`,
        border: '2px solid rgba(255,255,255,0.2)',
      }}
    >
      {team}
    </motion.div>
  );
}

export default function LiveMatchHeader({ data }: Props) {
  const colors1 = TEAM_COLORS[data.team1 as keyof typeof TEAM_COLORS];
  const colors2 = TEAM_COLORS[data.team2 as keyof typeof TEAM_COLORS];

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="glass-card col-span-full"
      style={{
        padding: '20px 32px',
        background: `linear-gradient(90deg, ${colors1?.glow || 'transparent'} 0%, rgba(10, 25, 47, 0.8) 30%, rgba(10, 25, 47, 0.8) 70%, ${colors2?.glow || 'transparent'} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Stadium light sweep */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '20%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
          pointerEvents: 'none',
        }}
      />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {/* Team 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 200 }}>
          <TeamLogo team={data.team1} side="left" />
          <div>
            <p style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.8rem',
              color: '#8892B0',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {TEAM_NAMES[data.team1] || data.team1}
            </p>
            <motion.p
              key={data.team1Score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '1.8rem',
                fontWeight: 900,
                color: '#E6F1FF',
                lineHeight: 1,
              }}
            >
              {data.team1Score}
            </motion.p>
            <p style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.8rem',
              color: '#8892B0',
            }}>
              ({data.team1Overs} ov)
            </p>
          </div>
        </div>

        {/* Center - VS + Status */}
        <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
          <div style={{ marginBottom: 8 }}>
            <LivePulse />
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '1.5rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #FFD700, #FF006E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}
          >
            VS
          </motion.div>
          <p style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.75rem',
            color: '#00D4FF',
            maxWidth: 220,
            lineHeight: 1.3,
          }}>
            {data.status}
          </p>
        </div>

        {/* Team 2 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flex: 1,
          minWidth: 200,
          justifyContent: 'flex-end',
          textAlign: 'right',
        }}>
          <div>
            <p style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.8rem',
              color: '#8892B0',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {TEAM_NAMES[data.team2] || data.team2}
            </p>
            <motion.p
              key={data.team2Score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '1.8rem',
                fontWeight: 900,
                color: '#E6F1FF',
                lineHeight: 1,
              }}
            >
              {data.team2Score}
            </motion.p>
            <p style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '0.8rem',
              color: '#8892B0',
            }}>
              ({data.team2Overs} ov)
            </p>
          </div>
          <TeamLogo team={data.team2} side="right" />
        </div>
      </div>

      {/* Match progress bar */}
      <div style={{ marginTop: 16 }}>
        <div style={{
          height: 4,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(parseFloat(data.team2Overs) / 20) * 100}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(90deg, #00D4FF, #FFD700)',
            }}
          />
        </div>
        <p style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '0.65rem',
          color: '#8892B0',
          textAlign: 'center',
          marginTop: 4,
        }}>
          📍 {data.venue}
        </p>
      </div>
    </motion.div>
  );
}
