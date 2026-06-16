import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FireworksProps {
  active: boolean;
  duration?: number;
}

interface Spark {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  delay: number;
}

const FIREWORK_COLORS = [
  '#FFD700', '#00D4FF', '#39FF14', '#FF006E', '#BF40BF',
  '#FF4444', '#FFA500', '#00FF88', '#FF69B4', '#7B68EE',
];

export default function Fireworks({ active, duration = 3000 }: FireworksProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    if (!active) {
      setSparks([]);
      return;
    }

    const newSparks: Spark[] = [];
    const burstCount = 3;

    for (let b = 0; b < burstCount; b++) {
      const cx = 20 + Math.random() * 60; // % position
      const cy = 10 + Math.random() * 40;
      const sparkCount = 20 + Math.floor(Math.random() * 15);
      const burstDelay = b * 0.4;

      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
        const distance = 60 + Math.random() * 120;
        newSparks.push({
          id: b * 100 + i,
          x: cx,
          y: cy,
          tx: Math.cos(angle) * distance,
          ty: Math.sin(angle) * distance,
          color: FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)],
          delay: burstDelay + Math.random() * 0.15,
        });
      }
    }

    setSparks(newSparks);

    const timer = setTimeout(() => setSparks([]), duration);
    return () => clearTimeout(timer);
  }, [active, duration]);

  return (
    <AnimatePresence>
      {sparks.length > 0 && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          {sparks.map((spark) => (
            <motion.div
              key={spark.id}
              initial={{
                left: `${spark.x}%`,
                top: `${spark.y}%`,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: spark.tx,
                y: spark.ty,
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1 + Math.random() * 0.5,
                delay: spark.delay,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: spark.color,
                boxShadow: `0 0 6px ${spark.color}, 0 0 12px ${spark.color}`,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
