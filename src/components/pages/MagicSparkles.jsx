import React from 'react';
import './MagicPage.css';

export default function MagicSparkles({
  count = 24,
  className = '',
  variant = 'twinkle', // 'twinkle' | 'stars'
  color,
  accent,
}) {
  const items = Array.from({ length: count });
  return (
    <div
      className={`magic-sparkles magic-sparkles--${variant} ${className}`}
      style={{
        '--spark-color': color || 'var(--magic-accent, #ffe7b2)',
        '--spark-accent': accent || 'var(--magic-primary, #f59e0b)',
      }}
    >
      {items.map((_, idx) => (
        <span
          key={idx}
          className="magic-sparkles__dot"
          style={{
            '--sx': `${Math.random() * 100}%`,
            '--sy': `${Math.random() * 100}%`,
            '--sd': `${variant === 'stars' ? 4 + Math.random() * 3 : 3 + Math.random() * 4}s`,
            '--sd2': `${variant === 'stars' ? 0 : 1.5 + Math.random() * 2}s`,
            '--sdelay': `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
