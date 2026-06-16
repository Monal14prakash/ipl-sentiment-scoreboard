import { motion } from 'framer-motion';
import type { SentimentData } from '../../types';
import GlassCard from '../UI/GlassCard';
import CountUp from '../UI/CountUp';

interface Props {
  data: SentimentData;
}

function CircularProgress({ value, color, label, size = 90 }: { value: number; color: string; label: string; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <CountUp
            end={value}
            suffix="%"
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '1.1rem',
              fontWeight: 700,
              color,
            }}
          />
        </div>
      </div>
      <p style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#8892B0',
        marginTop: 8,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {label}
      </p>
    </div>
  );
}

export default function SentimentGauge({ data }: Props) {
  // Map overallScore (-1 to 1) to angle (-90 to 90 degrees)
  const needleAngle = data.overallScore * 90;

  // Gauge dimensions
  const gaugeWidth = 280;
  const gaugeHeight = 160;
  const cx = gaugeWidth / 2;
  const cy = gaugeHeight - 20;
  const outerR = 110;

  // Create arc path
  const arcPath = (startAngle: number, endAngle: number, r: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <GlassCard className="col-span-4" delay={0.1}>
      <h2 className="section-header" style={{ color: '#E6F1FF', marginBottom: 20 }}>
        📊 Sentiment Gauge
      </h2>

      {/* Semicircular Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <svg width={gaugeWidth} height={gaugeHeight} viewBox={`0 0 ${gaugeWidth} ${gaugeHeight}`}>
          {/* Background arcs */}
          <path d={arcPath(-180, -120, outerR)} fill="none" stroke="#FF4444" strokeWidth={8} strokeLinecap="round" opacity={0.3} />
          <path d={arcPath(-120, -60, outerR)} fill="none" stroke="#FFA500" strokeWidth={8} strokeLinecap="round" opacity={0.3} />
          <path d={arcPath(-60, 0, outerR)} fill="none" stroke="#8892B0" strokeWidth={8} strokeLinecap="round" opacity={0.3} />
          <path d={arcPath(-180, -120, outerR)} fill="none" stroke="#FF4444" strokeWidth={4} strokeLinecap="round" opacity={0.7} />

          {/* Active colored arcs */}
          <path d={arcPath(-120, -60, outerR)} fill="none" stroke="#FFD700" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
          <path d={arcPath(-60, 0, outerR)} fill="none" stroke="#39FF14" strokeWidth={4} strokeLinecap="round" opacity={0.7} />

          {/* Tick marks */}
          {[-180, -150, -120, -90, -60, -30, 0].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = cx + (outerR + 5) * Math.cos(rad);
            const y1 = cy + (outerR + 5) * Math.sin(rad);
            const x2 = cx + (outerR + 12) * Math.cos(rad);
            const y2 = cy + (outerR + 12) * Math.sin(rad);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8892B0" strokeWidth={1.5} opacity={0.5} />
            );
          })}

          {/* Needle */}
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: needleAngle }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - outerR + 10}
              stroke="#00D4FF"
              strokeWidth={2.5}
              strokeLinecap="round"
              filter="url(#needle-glow)"
            />
          </motion.g>

          {/* Center dot */}
          <circle cx={cx} cy={cy} r={6} fill="#00D4FF" />
          <circle cx={cx} cy={cy} r={3} fill="#0A192F" />

          {/* Glow filter */}
          <defs>
            <filter id="needle-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Labels */}
          <text x={20} y={cy + 15} fill="#FF4444" fontSize="10" fontFamily="Rajdhani" fontWeight="600">NEG</text>
          <text x={cx - 12} y={cy - outerR - 8} fill="#8892B0" fontSize="10" fontFamily="Rajdhani" fontWeight="600" textAnchor="middle">NEUTRAL</text>
          <text x={gaugeWidth - 36} y={cy + 15} fill="#39FF14" fontSize="10" fontFamily="Rajdhani" fontWeight="600">POS</text>
        </svg>
      </div>

      {/* Overall Score */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.75rem', color: '#8892B0', letterSpacing: '0.1em' }}>
          OVERALL SCORE
        </p>
        <CountUp
          end={data.overallScore * 100}
          decimals={1}
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '2rem',
            fontWeight: 900,
            color: data.overallScore > 0.1 ? '#39FF14' : data.overallScore < -0.1 ? '#FF4444' : '#FFD700',
          }}
        />
        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '0.75rem', color: '#8892B0', marginTop: 4 }}>
          from <CountUp end={data.totalTweets} style={{ color: '#00D4FF', fontWeight: 600 }} /> tweets
        </p>
      </div>

      {/* Circular Progress Rings */}
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <CircularProgress value={data.positive} color="#39FF14" label="Positive" />
        <CircularProgress value={data.neutral} color="#8892B0" label="Neutral" />
        <CircularProgress value={data.negative} color="#FF4444" label="Negative" />
      </div>
    </GlassCard>
  );
}
