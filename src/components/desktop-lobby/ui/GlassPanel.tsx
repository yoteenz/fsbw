import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
}

export function GlassPanel({ children, className = '', style, hover = false }: GlassPanelProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${hover ? 'group cursor-pointer' : ''} ${className}`}
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        transition: 'background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.88)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 48px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.95)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.72)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
      } : undefined}
    >
      {/* Acrylic shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
          borderRadius: 'inherit',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
