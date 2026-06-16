import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Zap, TrendingUp, BarChart3, Activity } from 'lucide-react';

interface LandingHeroProps {
  onEnter: () => void;
}

const HASHTAGS = [
  '#CSK', '#MI', '#RCB', '#KKR', '#DC', '#SRH',
  '#IPL2025', '#IPLFinal', '#WhistlePodu', '#PlayBold',
  '#AmiKKR', '#OrangeArmy', '#MumbaiPaltan', '#Dhoni',
  '#Virat', '#Rohit', '#IPLPlayoffs', '#CricketFever',
];

const FEATURES = [
  { icon: Activity, label: 'Real-Time Sentiment', desc: 'Live fan emotion tracking' },
  { icon: TrendingUp, label: 'Momentum Analysis', desc: 'Over-by-over sentiment shifts' },
  { icon: BarChart3, label: 'Team Battle', desc: 'Head-to-head fan sentiment' },
  { icon: Zap, label: 'Explainable AI', desc: 'SHAP-powered predictions' },
];

export default function LandingHero({ onEnter }: LandingHeroProps) {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Feel the Pulse of IPL Fans in Real Time';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="stadium-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Ticker */}
      <motion.div
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          background: 'rgba(0, 212, 255, 0.08)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
          padding: '10px 0',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div className="ticker-wrap">
          <div className="ticker">
            {[...HASHTAGS, ...HASHTAGS].map((tag, i) => (
              <span
                key={i}
                style={{
                  padding: '4px 20px',
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#00D4FF' : '#39FF14',
                  letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 5,
      }}>
        {/* Trophy Hologram */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, type: 'spring' }}
          style={{ marginBottom: 40, position: 'relative' }}
        >
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 120,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '800px',
            }}
          >
            <div style={{
              fontSize: 72,
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.3))',
            }}>
              🏆
            </div>
          </motion.div>
          {/* Hologram rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
              }}
              style={{
                position: 'absolute',
                inset: -20 - i * 15,
                borderRadius: '50%',
                border: '1px solid rgba(255, 215, 0, 0.2)',
              }}
            />
          ))}
        </motion.div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 16 }}
        >
          <h1 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 900,
            letterSpacing: '0.08em',
            lineHeight: 1.1,
            marginBottom: 8,
          }}>
            <span className="gradient-text-gold">IPL</span>
            {' '}
            <span className="gradient-text-blue">PULSE</span>
          </h1>
          <p style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '1rem',
            fontWeight: 500,
            color: '#8892B0',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}>
            Real-Time Tweet Sentiment Analysis
          </p>
        </motion.div>

        {/* Typewriter Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            textAlign: 'center',
            marginBottom: 48,
            minHeight: 40,
          }}
        >
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
            fontWeight: 300,
            color: '#E6F1FF',
            letterSpacing: '0.02em',
          }}>
            {typedText}
            <span style={{
              borderRight: '2px solid #00D4FF',
              animation: 'blink-caret 0.8s step-end infinite',
              marginLeft: 2,
            }} />
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            maxWidth: 900,
            width: '100%',
            marginBottom: 48,
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 212, 255, 0.4)' }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="glass-card"
              style={{
                padding: '20px 16px',
                textAlign: 'center',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.8 + i * 0.15, type: 'spring' }}
              >
                <f.icon
                  size={28}
                  style={{
                    color: '#00D4FF',
                    marginBottom: 8,
                    filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.4))',
                  }}
                />
              </motion.div>
              <h3 style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#E6F1FF',
                marginBottom: 4,
                letterSpacing: '0.05em',
              }}>
                {f.label}
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: '#8892B0',
              }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.2, type: 'spring' }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2)',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnter}
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '16px 48px',
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(255, 215, 0, 0.2))',
            border: '1px solid rgba(0, 212, 255, 0.4)',
            borderRadius: 12,
            color: '#00D4FF',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>
            Enter the Arena →
          </span>
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '40%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              zIndex: 1,
            }}
          />
        </motion.button>
      </div>

      {/* Bottom gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
        background: 'linear-gradient(transparent, #060F1F)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
