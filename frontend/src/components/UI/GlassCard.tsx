import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  style,
  glowColor = 'rgba(0, 212, 255, 0.15)',
  delay = 0,
  hover = true,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? {
        borderColor: glowColor.replace(/[\d.]+\)$/, '0.4)'),
        boxShadow: `0 8px 32px ${glowColor}, 0 0 60px ${glowColor.replace(/[\d.]+\)$/, '0.1)')}`,
        y: -2,
      } : undefined}
      onClick={onClick}
      className={`glass-card p-6 ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
