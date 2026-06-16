export default function LivePulse({ size = 10, color = '#FF0000' }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          position: 'relative',
          display: 'inline-block',
          animation: 'live-pulse 1.5s ease-in-out infinite',
          boxShadow: `0 0 ${size}px ${color}`,
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: -Math.round(size * 0.4),
            borderRadius: '50%',
            background: `${color}44`,
            animation: 'live-ring 1.5s ease-in-out infinite',
          }}
        />
      </span>
      <span
        style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color,
          textShadow: `0 0 8px ${color}`,
        }}
      >
        LIVE
      </span>
    </span>
  );
}
