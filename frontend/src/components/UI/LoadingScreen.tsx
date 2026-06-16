import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060F1F',
      }}
    >
      {/* Stadium light sweep */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
      }}>
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '30%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.05), transparent)',
            transform: 'skewX(-20deg)',
          }}
        />
      </div>

      {/* Cricket ball */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #e74c3c 0%, #c0392b 50%, #a93226 100%)',
          boxShadow: '0 0 30px rgba(231, 76, 60, 0.5), inset -3px -3px 6px rgba(0,0,0,0.3)',
          position: 'relative',
          marginBottom: 32,
        }}
      >
        {/* Seam */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '8%',
          right: '8%',
          height: 2,
          background: 'rgba(255,255,255,0.8)',
          transform: 'translateY(-50%)',
          borderRadius: 1,
        }} />
        <div style={{
          position: 'absolute',
          top: '35%',
          left: '15%',
          right: '15%',
          height: 1,
          background: 'rgba(255,255,255,0.4)',
          borderRadius: 1,
          transform: 'rotate(10deg)',
        }} />
        <div style={{
          position: 'absolute',
          top: '65%',
          left: '15%',
          right: '15%',
          height: 1,
          background: 'rgba(255,255,255,0.4)',
          borderRadius: 1,
          transform: 'rotate(-10deg)',
        }} />
      </motion.div>

      {/* Text */}
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '1.1rem',
          color: '#00D4FF',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
        }}
      >
        Loading the Arena...
      </motion.p>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#FFD700',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
