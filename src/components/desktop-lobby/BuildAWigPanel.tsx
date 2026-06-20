import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OPTIONS = [
  { label: 'TEXTURE', value: 'Straight · Wavy · Curly', icon: '◈' },
  { label: 'LENGTH', value: '12" – 30"', icon: '◈' },
  { label: 'DENSITY', value: '130% – 250%', icon: '◈' },
  { label: 'LACE TYPE', value: 'HD · Transparent · 13×6', icon: '◈' },
  { label: 'COLOR', value: '15+ Options', icon: '◈' },
  { label: 'HAIRLINE', value: 'Natural · Baby Hair', icon: '◈' },
  { label: 'ADD-ONS', value: 'Tint · Bleach · Style', icon: '◈' },
];

export function BuildAWigPanel() {
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div
      className="relative h-full flex flex-col overflow-hidden"
      style={{
        // Floating acrylic design console
        borderRadius: '2px 2px 12px 12px',
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(44px) saturate(1.9) brightness(1.06)',
        WebkitBackdropFilter: 'blur(44px) saturate(1.9) brightness(1.06)',
        border: '1px solid rgba(255,255,255,0.52)',
        boxShadow: [
          'inset 0 1.5px 0 rgba(255,255,255,0.9)',
          '0 56px 100px rgba(0,0,0,0.18)',
          '0 16px 40px rgba(0,0,0,0.1)',
        ].join(', '),
        // Left red accent bar — the console power indicator
        borderLeft: '3px solid rgba(200,28,36,0.55)',
      }}
    >
      {/* Crystal top-edge light catch */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 30%, rgba(255,255,255,1) 60%, transparent)',
        zIndex: 20,
      }} />

      {/* Console header bar */}
      <div style={{
        padding: '14px 20px 12px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        background: 'rgba(255,255,255,0.18)',
      }}>
        <div className="flex items-center justify-between mb-1">
          <div style={{
            fontFamily: '"Futura PT Book"', fontSize: '8px',
            letterSpacing: '0.35em', textTransform: 'uppercase', color: '#A89070',
          }}>
            DESIGN STUDIO
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%', background: '#C81C24',
              boxShadow: '0 0 6px rgba(200,28,36,0.7)',
              animation: 'pedestalPulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', letterSpacing: '0.15em', color: '#C81C24' }}>
              LIVE
            </span>
          </div>
        </div>
        <div style={{
          fontFamily: '"Futura PT Medium"', fontSize: '15px',
          letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1A1A1A',
          lineHeight: 1.2,
        }}>
          BUILD-A-WIG<br />
          <span style={{ fontSize: '10px', color: '#A89070', fontFamily: '"Futura PT Book"', letterSpacing: '0.06em' }}>
            CONSOLE
          </span>
        </div>
      </div>

      {/* Configuration parameters */}
      <div className="flex-1 flex flex-col" style={{ padding: '8px 0', overflowY: 'auto' }}>
        {OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            onClick={() => navigate('/build-a-wig')}
            className="flex items-center text-left"
            style={{
              padding: '10px 20px 10px 17px',
              background: hoveredRow === i ? 'rgba(200,28,36,0.05)' : 'transparent',
              borderLeft: hoveredRow === i ? '2px solid #C81C24' : '2px solid transparent',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
              border: 'none',
              borderLeft: hoveredRow === i ? '2px solid #C81C24' : '2px solid transparent',
            }}
          >
            {/* Parameter row */}
            <div className="flex-1 flex items-center justify-between">
              <span style={{
                fontFamily: '"Futura PT Medium"', fontSize: '10px',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: hoveredRow === i ? '#C81C24' : '#1A1A1A',
                transition: 'color 0.15s ease',
              }}>
                {opt.label}
              </span>
              <span style={{
                fontFamily: '"Futura PT Book"', fontSize: '9px',
                letterSpacing: '0.04em', color: '#A89070',
                transition: 'color 0.15s ease',
                marginLeft: '8px',
              }}>
                {opt.value}
              </span>
            </div>
            {/* Chevron */}
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={hoveredRow === i ? '#C81C24' : 'rgba(26,26,26,0.25)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{
                marginLeft: '8px', flexShrink: 0,
                transform: hoveredRow === i ? 'translateX(3px)' : 'translateX(0)',
                transition: 'transform 0.15s ease',
              }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>

      {/* Console CTA */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
        <button
          onClick={() => navigate('/build-a-wig')}
          className="w-full flex items-center justify-center gap-2"
          style={{
            padding: '12px 0',
            background: '#C81C24',
            color: '#FFFFFF',
            fontFamily: '"Futura PT Medium"',
            fontSize: '10px',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            boxShadow: '0 4px 16px rgba(200,28,36,0.35)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        >
          OPEN STUDIO →
        </button>
      </div>
    </div>
  );
}
