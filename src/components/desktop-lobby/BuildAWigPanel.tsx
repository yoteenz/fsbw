import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OPTIONS = [
  { label: 'TEXTURE', value: 'Straight 뿯½ Wavy 뿯½ Curly', path: '/build-a-wig' },
  { label: 'LENGTH', value: '12" – 30"', path: '/build-a-wig' },
  { label: 'DENSITY', value: '130% – 250%', path: '/build-a-wig' },
  { label: 'LACE', value: 'HD 뿯½ Transparent 뿯½ 13뿯½6', path: '/build-a-wig' },
  { label: 'COLOR', value: '15+ Options', path: '/build-a-wig' },
  { label: 'HAIRLINE', value: 'Natural 뿯½ Baby Hair', path: '/build-a-wig' },
  { label: 'ADD-ONS', value: 'Tint 뿯½ Bleach 뿯½ Style', path: '/build-a-wig' },
];

// Thick acrylic edge component
function AcrylicEdge({ side }: { side: 'right' | 'bottom' }) {
  if (side === 'right') {
    return (
      <div style={{
        position: 'absolute',
        top: '8px', right: '-10px', bottom: '-8px',
        width: '10px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.55) 0%, rgba(242,237,228,0.35) 50%, rgba(235,228,218,0.2) 100%)',
        borderRadius: '0 3px 3px 0',
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
      }} />
    );
  }
  return (
    <div style={{
      position: 'absolute',
      left: '8px', right: '-10px', bottom: '-8px',
      height: '8px',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(232,226,215,0.22) 100%)',
      borderRadius: '0 0 3px 3px',
    }} />
  );
}

export function BuildAWigPanel() {
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    // Outer wrapper handles the 3D perspective tilt + edge depth
    <div className="relative" style={{ transform: 'perspective(700px) rotateY(-1.8deg)' }}>
      {/* Acrylic thickness edges — give the panel physical depth */}
      <AcrylicEdge side="right" />
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
            // Top edge — crystal light catch
            'inset 0 2px 0 rgba(255,255,255,0.95)',
            // Left edge — warm refraction
            'inset 3px 0 12px rgba(255,248,215,0.18)',
            // Deep float shadow
            '0 60px 100px rgba(0,0,0,0.18)',
            '0 20px 40px rgba(0,0,0,0.1)',
            // Edge glow — the panel glows from within
            '0 0 0 1px rgba(255,255,255,0.35)',
          ].join(', '),
        }}
      >
        {/* Crystal top-edge shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,1) 25%, rgba(255,255,255,1) 75%, transparent)',
          zIndex: 20,
        }} />

        {/* Internal acrylic face refraction — diagonal light catch */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(152deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 28%, transparent 52%, rgba(255,248,215,0.04) 100%)',
          zIndex: 1,
        }} />

        {/* Left vertical accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px',
          background: 'linear-gradient(180deg, rgba(200,28,36,0.0) 0%, rgba(200,28,36,0.7) 15%, rgba(200,28,36,0.7) 85%, rgba(200,28,36,0.0) 100%)',
          zIndex: 15,
        }} />

        {/* Console header */}
        <div style={{
          padding: '18px 22px 14px 24px',
          borderBottom: '1px solid rgba(0,0,0,0.065)',
          position: 'relative', zIndex: 10,
        }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#9A8868' }}>
              DESIGN STUDIO
            </span>
            <div className="flex items-center gap-1.5">
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%', background: '#C81C24',
                boxShadow: '0 0 8px rgba(200,28,36,0.75)',
                animation: 'pedestalPulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', letterSpacing: '0.18em', color: '#C81C24' }}>LIVE</span>
            </div>
          </div>
          <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '16px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A1A1A', lineHeight: 1.2 }}>
            BUILD-A-WIG<br />
            <span style={{ fontSize: '9px', color: '#9A8868', fontFamily: '"Futura PT Book"', letterSpacing: '0.07em' }}>CONFIGURATION CONSOLE</span>
          </div>
        </div>

        {/* Parameter controls */}
        <div className="flex-1 flex flex-col" style={{ padding: '6px 0', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
          {OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => navigate(opt.path)}
              style={{
                padding: '11px 22px 11px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textAlign: 'left', cursor: 'pointer',
                background: hoveredRow === i ? 'rgba(200,28,36,0.045)' : 'transparent',
                borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                borderLeft: hoveredRow === i ? '2px solid #C81C24' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{
                fontFamily: '"Futura PT Medium"', fontSize: '11px', letterSpacing: '0.12em',
                textTransform: 'uppercase', color: hoveredRow === i ? '#C81C24' : '#1A1A1A',
                transition: 'color 0.15s ease',
              }}>
                {opt.label}
              </span>
              <span style={{
                fontFamily: '"Futura PT Book"', fontSize: '9px', letterSpacing: '0.04em',
                color: '#9A8868', marginLeft: '8px', flexShrink: 0,
              }}>
                {opt.value}
              </span>
            </button>
          ))}
        </div>

        {/* Console CTA */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid rgba(0,0,0,0.065)', position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => navigate('/build-a-wig')}
            style={{
              width: '100%', padding: '13px 0',
              background: '#C81C24', color: '#FFFFFF',
              fontFamily: '"Futura PT Medium"', fontSize: '10px', letterSpacing: '0.18em',
              textTransform: 'uppercase', border: 'none', borderRadius: '2px',
              cursor: 'pointer', transition: 'opacity 0.2s ease',
              boxShadow: '0 6px 20px rgba(200,28,36,0.38)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            OPEN STUDIO 뿯↽
          </button>
        </div>
      </div>
    </div>
  );
}
