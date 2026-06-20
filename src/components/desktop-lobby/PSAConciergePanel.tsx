import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SERVICES = [
  { label: 'START CONSULTATION', sub: 'Expert styling guidance', path: '/psa' },
  { label: 'RECOMMEND UNITS', sub: 'AI-matched for you', path: '/psa' },
  { label: 'HAIRSTYLE ANALYSIS', sub: 'Professional assessment', path: '/beauty-lab' },
  { label: 'BUILD MY WIG', sub: 'Custom order designer', path: '/build-a-wig' },
  { label: 'MEMBERSHIP SUPPORT', sub: 'Club member services', path: '/membership' },
  { label: 'ORDER ASSISTANCE', sub: 'Track, modify, return', path: '/home/shop' },
];

function AcrylicEdge({ side }: { side: 'left' | 'bottom' }) {
  if (side === 'left') {
    return (
      <div style={{
        position: 'absolute',
        top: '8px', left: '-10px', bottom: '-8px',
        width: '10px',
        background: 'linear-gradient(90deg, rgba(235,228,218,0.2) 0%, rgba(242,237,228,0.35) 50%, rgba(255,255,255,0.55) 100%)',
        borderRadius: '3px 0 0 3px',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.06)',
      }} />
    );
  }
  return (
    <div style={{
      position: 'absolute',
      left: '-10px', right: '8px', bottom: '-8px',
      height: '8px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(232,226,215,0.22) 100%)',
      borderRadius: '0 0 3px 3px',
    }} />
  );
}

export function PSAConciergePanel() {
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="relative" style={{ transform: 'perspective(700px) rotateY(1.8deg)' }}>
      {/* Thickness edges */}
      <AcrylicEdge side="left" />
      <AcrylicEdge side="bottom" />

      {/* Main panel face */}
      <div
        className="relative h-full flex flex-col overflow-hidden"
        style={{
          borderRadius: '3px',
          background: 'rgba(255,255,255,0.28)',
          backdropFilter: 'blur(48px) saturate(2) brightness(1.08)',
          WebkitBackdropFilter: 'blur(48px) saturate(2) brightness(1.08)',
          border: '1px solid rgba(255,255,255,0.58)',
          boxShadow: [
            'inset 0 2px 0 rgba(255,255,255,0.95)',
            'inset -3px 0 12px rgba(255,248,215,0.18)',
            '0 60px 100px rgba(0,0,0,0.18)',
            '0 20px 40px rgba(0,0,0,0.1)',
            '0 0 0 1px rgba(255,255,255,0.35)',
          ].join(', '),
        }}
      >
        {/* Top edge shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1) 25%, rgba(255,255,255,1) 75%, transparent)',
          zIndex: 20,
        }} />

        {/* Internal refraction */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(208deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 28%, transparent 52%, rgba(255,248,215,0.04) 100%)',
          zIndex: 1,
        }} />

        {/* Right vertical accent bar */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '3px',
          background: 'linear-gradient(180deg, rgba(200,28,36,0.0) 0%, rgba(200,28,36,0.7) 15%, rgba(200,28,36,0.7) 85%, rgba(200,28,36,0.0) 100%)',
          zIndex: 15,
        }} />

        {/* Kiosk header */}
        <div style={{
          padding: '18px 24px 14px 22px',
          borderBottom: '1px solid rgba(0,0,0,0.065)',
          position: 'relative', zIndex: 10,
        }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#9A8868' }}>
              CONCIERGE SUITE
            </span>
            <div className="flex items-center gap-1.5">
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E',
                boxShadow: '0 0 8px rgba(34,197,94,0.75)',
                animation: 'pedestalPulse 3.5s ease-in-out infinite',
              }} />
              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', letterSpacing: '0.18em', color: '#22C55E' }}>AVAILABLE</span>
            </div>
          </div>
          <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '16px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A1A1A', lineHeight: 1.2 }}>
            PSA<br />
            <span style={{ fontSize: '9px', color: '#9A8868', fontFamily: '"Futura PT Book"', letterSpacing: '0.07em' }}>PERSONAL STYLE ADVISOR</span>
          </div>
        </div>

        {/* Concierge destination brief */}
        <div style={{ padding: '12px 22px 10px', position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.045)' }}>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9.5px', letterSpacing: '0.04em', color: '#786852', lineHeight: 1.65, margin: 0 }}>
            Your personal styling advisor is ready to guide you through the Frontal Slayer flagship experience.
          </p>
        </div>

        {/* Service menu */}
        <div className="flex-1 flex flex-col" style={{ padding: '6px 0', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
          {SERVICES.map((item, i) => (
            <button
              key={item.label}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => navigate(item.path)}
              style={{
                padding: '10px 24px 10px 22px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textAlign: 'left', cursor: 'pointer',
                background: hoveredRow === i ? 'rgba(200,28,36,0.045)' : 'transparent',
                borderTop: 'none', borderLeft: 'none', borderBottom: 'none',
                borderRight: hoveredRow === i ? '2px solid #C81C24' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                <div style={{
                  fontFamily: '"Futura PT Medium"', fontSize: '10px', letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: hoveredRow === i ? '#C81C24' : '#1A1A1A',
                  transition: 'color 0.15s ease', lineHeight: 1,
                }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#9A8868', letterSpacing: '0.04em', marginTop: '2px' }}>
                  {item.sub}
                </div>
              </div>
              <span style={{ fontSize: '10px', color: hoveredRow === i ? '#C81C24' : 'rgba(26,26,26,0.3)', marginLeft: '8px', transition: 'color 0.15s ease' }}>›</span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid rgba(0,0,0,0.065)', position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => navigate('/psa')}
            style={{
              width: '100%', padding: '13px 0',
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)',
              color: '#1A1A1A',
              fontFamily: '"Futura PT Medium"', fontSize: '10px', letterSpacing: '0.18em',
              textTransform: 'uppercase',
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: '2px',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#C81C24'; el.style.color = '#FFF'; el.style.borderColor = 'transparent'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'rgba(255,255,255,0.55)'; el.style.color = '#1A1A1A'; el.style.borderColor = 'rgba(0,0,0,0.12)'; }}
          >
            ENTER SUITE 뿯↽
          </button>
        </div>
      </div>
    </div>
  );
}
