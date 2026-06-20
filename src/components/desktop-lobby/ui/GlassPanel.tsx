import { ReactNode, CSSProperties } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
}

export function GlassPanel({ children, className = '', style, hover = false }: GlassPanelProps) {
  return (
    <div
      className={`relative overflow-hidden ${hover ? 'cursor-pointer' : ''} ${className}`}
      style={{
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.34)',
        backdropFilter: 'blur(40px) saturate(1.8) brightness(1.06)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.8) brightness(1.06)',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: [
          'inset 0 1.5px 0 rgba(255,255,255,0.92)',
          'inset 0 -1px 0 rgba(255,255,255,0.2)',
          '0 52px 100px rgba(0,0,0,0.15)',
          '0 16px 40px rgba(0,0,0,0.08)',
          '0 4px 12px rgba(0,0,0,0.05)',
        ].join(', '),
        transition: 'box-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = [
          'inset 0 1.5px 0 rgba(255,255,255,0.96)',
          'inset 0 -1px 0 rgba(255,255,255,0.25)',
          '0 72px 128px rgba(0,0,0,0.2)',
          '0 24px 56px rgba(0,0,0,0.1)',
          '0 4px 12px rgba(0,0,0,0.06)',
        ].join(', ');
        el.style.transform = 'translateY(-4px)';
      } : undefined}
      onMouseLeave={hover ? (e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = [
          'inset 0 1.5px 0 rgba(255,255,255,0.92)',
          'inset 0 -1px 0 rgba(255,255,255,0.2)',
          '0 52px 100px rgba(0,0,0,0.15)',
          '0 16px 40px rgba(0,0,0,0.08)',
          '0 4px 12px rgba(0,0,0,0.05)',
        ].join(', ');
        el.style.transform = 'translateY(0)';
      } : undefined}
    >
      {/* Crystal top-edge light catch — the defining material signature */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 20%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.85) 80%, transparent 100%)',
          zIndex: 20,
        }}
      />

      {/* Acrylic face shimmer — diagonal light refraction */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(148deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 30%, transparent 55%, rgba(200,28,36,0.018) 100%)',
          borderRadius: 'inherit',
          zIndex: 1,
        }}
      />

      {/* Rose-tinted bottom edge — luxury beauty signature */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '60px',
          background: 'linear-gradient(0deg, rgba(200,28,36,0.028) 0%, transparent 100%)',
          borderRadius: 'inherit',
          zIndex: 1,
        }}
      />

      <div className="relative" style={{ zIndex: 10 }}>{children}</div>
    </div>
  );
}
