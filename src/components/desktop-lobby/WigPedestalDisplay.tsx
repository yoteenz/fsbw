import { useState, useEffect, useRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface WigUnit {
  id: string;
  name: string;
  type: string;
  length: string;
  lace: string;
  price: string;
  image: string;
  textureLabel: string;
  color: string;
}

const UNITS: WigUnit[] = [
  { id: 'noir', name: 'NOIR', type: 'STRAIGHT UNIT', length: '24"', lace: '100% HUMAN LACE', price: '$740', image: '/assets/NOIR/noir front.png', textureLabel: 'STRAIGHT', color: 'JET BLACK' },
  { id: 'blanco', name: 'BLANCO', type: 'STRAIGHT UNIT', length: '22"', lace: '100% HUMAN LACE', price: '$720', image: '/assets/BLANCO-FRONT.png', textureLabel: 'STRAIGHT', color: 'OFF-WHITE' },
  { id: 'soft-wave', name: 'SOFT WAVE', type: 'WAVY UNIT', length: '22"', lace: '100% HUMAN LACE', price: '$695', image: '/assets/SOFT-WAVE FRONT.png', textureLabel: 'WAVY', color: 'NATURAL BLACK' },
  { id: 'beach-wave', name: 'BEACH WAVE', type: 'WAVY UNIT', length: '24"', lace: '100% HUMAN LACE', price: '$760', image: '/assets/BEACH WAVE FRONT.JPG', textureLabel: 'WAVY', color: 'NATURAL BLACK' },
  { id: 'soft-curl', name: 'SOFT CURL', type: 'CURLY UNIT', length: '20"', lace: '100% HUMAN LACE', price: '$680', image: '/assets/SOFT CURL FRONT.JPG', textureLabel: 'CURLY', color: 'NATURAL BLACK' },
  { id: 'ocean-curl', name: 'OCEAN CURL', type: 'CURLY UNIT', length: '22"', lace: '100% HUMAN LACE', price: '$710', image: '/assets/OCEAN CURL FRONT.JPG', textureLabel: 'CURLY', color: 'NATURAL BLACK' },
];

const AUTO_ADVANCE_MS = 6000;

// Small crystal diamond accent
function Diamond({ size = 8, opacity = 0.6, glow = false }: { size?: number; opacity?: number; glow?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, rgba(255,255,255,${opacity + 0.2}) 0%, rgba(230,220,210,${opacity}) 50%, rgba(255,255,255,${opacity + 0.1}) 100%)`,
        border: `1px solid rgba(255,255,255,${opacity + 0.2})`,
        transform: 'rotate(45deg)',
        flexShrink: 0,
        boxShadow: glow
          ? `0 0 ${size * 2}px rgba(200,28,36,0.3), 0 0 ${size * 4}px rgba(255,240,220,0.4)`
          : `0 0 ${size}px rgba(255,240,220,0.3)`,
      }}
    />
  );
}

export function WigPedestalDisplay() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeUnit = UNITS[activeIndex];

  const goToUnit = (index: number) => {
    if (index === activeIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setTimeout(() => setIsTransitioning(false), 80);
    }, 320);
  };

  useEffect(() => {
    timerRef.current = setTimeout(() => goToUnit((activeIndex + 1) % UNITS.length), AUTO_ADVANCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  };

  const wigTransform = `perspective(1200px) rotateY(${mousePos.x * 3.5}deg) rotateX(${-mousePos.y * 2}deg)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      className="relative flex flex-col items-center"
      style={{ width: '100%' }}
    >
      {/* ── OVERHEAD THEATRICAL SPOTLIGHT ── */}
      {/* Primary cone — from chandelier directly above the mannequin */}
      <div className="absolute pointer-events-none" style={{
        top: '-80px', left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '700px',
        background: 'radial-gradient(ellipse 45% 55% at 50% 0%, rgba(255,248,210,0.75) 0%, rgba(255,244,200,0.4) 18%, rgba(255,246,215,0.18) 40%, transparent 65%)',
        zIndex: 0,
      }} />
      {/* Secondary ambient fill */}
      <div className="absolute pointer-events-none" style={{
        top: '-40px', left: '50%', transform: 'translateX(-50%)',
        width: '900px', height: '480px',
        background: 'radial-gradient(ellipse 70% 70% at 50% 0%, rgba(255,250,230,0.32) 0%, transparent 65%)',
        zIndex: 0,
      }} />

      {/* ── ROSE FLANKING DISPLAY ── */}
      <div className="absolute pointer-events-none" style={{
        left: '0px', bottom: '140px', width: '120px', zIndex: 2, opacity: 0.7,
        transform: 'scaleX(-1) rotate(-5deg)',
      }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))' }} />
      </div>
      <div className="absolute pointer-events-none" style={{
        right: '0px', bottom: '140px', width: '120px', zIndex: 2, opacity: 0.65,
        transform: 'rotate(5deg)',
      }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))' }} />
      </div>

      {/* ── MANNEQUIN + WIG — the featured exhibit ── */}
      <div
        className="relative"
        style={{
          zIndex: 10,
          width: '100%',
          height: '520px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          transition: isTransitioning ? 'opacity 0.32s ease, transform 0.32s ease' : 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning
            ? 'scale(0.95) translateY(12px)'
            : `scale(1) translateY(0) ${wigTransform}`,
        }}
      >
        <img
          key={activeUnit.id}
          src={activeUnit.image}
          alt={activeUnit.name}
          style={{
            maxWidth: '400px',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            filter: [
              'drop-shadow(0 48px 80px rgba(0,0,0,0.25))',
              'drop-shadow(0 12px 32px rgba(0,0,0,0.14))',
              'drop-shadow(0 0 60px rgba(255,248,215,0.22))',
            ].join(' '),
          }}
        />
      </div>

      {/* ── ILLUMINATED MARBLE PEDESTAL ── */}
      <div className="relative flex flex-col items-center" style={{ zIndex: 11, marginTop: '-8px', width: '100%' }}>

        {/* Floor glow pool — light spreading outward from base */}
        <div className="absolute pointer-events-none" style={{
          bottom: '-12px', left: '50%', transform: 'translateX(-50%)',
          width: '420px', height: '50px',
          background: 'radial-gradient(ellipse at center, rgba(255,242,200,0.45) 0%, rgba(200,28,36,0.12) 30%, transparent 68%)',
          filter: 'blur(10px)',
          animation: 'pedestalPulse 4s ease-in-out infinite',
        }} />

        {/* Diamond crystal accents — four corners of the pedestal */}
        <div className="absolute flex items-center" style={{ bottom: '68px', left: '50%', transform: 'translateX(-50%)', width: '340px', justifyContent: 'space-between', zIndex: 15 }}>
          <Diamond size={10} opacity={0.5} glow />
          <Diamond size={7} opacity={0.35} />
          <Diamond size={7} opacity={0.35} />
          <Diamond size={10} opacity={0.5} glow />
        </div>

        {/* Tier 1 — Display capital (top, narrowest, brightest) */}
        <div style={{
          width: '200px', height: '14px',
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,238,225,0.9) 100%)',
          border: '1px solid rgba(255,255,255,0.92)',
          borderBottom: 'none',
          boxShadow: [
            'inset 0 2px 0 rgba(255,255,255,1)',
            'inset 0 0 20px rgba(255,248,215,0.6)',
            '0 -8px 24px rgba(255,244,200,0.55)',
          ].join(', '),
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top edge light catch */}
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'rgba(255,255,255,1)' }} />
          {/* Internal crystal shimmer */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 40%, rgba(255,255,255,0.4) 60%, transparent 100%)' }} />
        </div>

        {/* Tier 2 — Column shaft (faceted crystal, internally lit) */}
        <div style={{
          width: '168px', height: '48px',
          background: 'linear-gradient(180deg, rgba(255,252,240,0.94) 0%, rgba(245,238,224,0.86) 45%, rgba(232,225,212,0.92) 100%)',
          border: '1px solid rgba(255,255,255,0.75)',
          borderTop: 'none', borderBottom: 'none',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Vertical crystal facet lines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 14px, rgba(255,255,255,0.42) 14px, rgba(255,255,255,0.42) 15px)',
          }} />
          {/* Internal warm light — emanates from within the marble */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,248,210,0.55) 0%, transparent 70%)',
          }} />
          {/* Edge highlights */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.48) 0%, transparent 18%, transparent 82%, rgba(255,255,255,0.48) 100%)',
          }} />
        </div>

        {/* Tier 3 — Step (middle, wider) */}
        <div style={{
          width: '240px', height: '16px',
          background: 'linear-gradient(180deg, rgba(242,235,220,0.92) 0%, rgba(225,218,205,0.85) 100%)',
          border: '1px solid rgba(255,255,255,0.68)',
          borderTop: 'none', borderBottom: 'none',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.38) 0%, transparent 20%, transparent 80%, rgba(255,255,255,0.38) 100%)' }} />
        </div>

        {/* Tier 4 — Base (widest, heaviest material) */}
        <div style={{
          width: '300px', height: '18px',
          borderRadius: '0 0 5px 5px',
          background: 'linear-gradient(180deg, rgba(220,213,200,0.9) 0%, rgba(205,197,184,0.82) 100%)',
          border: '1px solid rgba(255,255,255,0.65)',
          borderTop: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 -1px 0 rgba(255,255,255,0.45)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.28) 0%, transparent 25%, transparent 75%, rgba(255,255,255,0.28) 100%)' }} />
        </div>

        {/* Pedestal floor shadow */}
        <div style={{
          width: '340px', height: '12px', marginTop: '3px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, transparent 68%)',
        }} />
      </div>

      {/* ── EXHIBITION LABEL ── */}
      <div className="text-center" style={{ zIndex: 10, marginTop: '24px' }}>
        {/* Museum-style specimen tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px',
          padding: '6px 20px',
          background: 'rgba(255,255,255,0.42)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.55)',
          borderRadius: '1px',
          marginBottom: '8px',
        }}>
          <Diamond size={5} opacity={0.6} />
          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#A89070' }}>
            {activeUnit.textureLabel} &nbsp;·&nbsp; {activeUnit.length} &nbsp;·&nbsp; {activeUnit.lace}
          </span>
          <Diamond size={5} opacity={0.6} />
        </div>

        <div style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '28px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#1A1A1A',
          lineHeight: 1,
        }}>
          {activeUnit.name}
        </div>

        <div className="flex items-center justify-center gap-6 mt-3">
          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '16px', letterSpacing: '0.06em', color: '#C81C24' }}>
            {activeUnit.price}
          </span>
          <span style={{ width: '1px', height: '12px', background: 'rgba(26,26,26,0.2)', display: 'block' }} />
          <button
            onClick={() => navigate(`/straight/${activeUnit.id === 'blanco' ? 'blanco' : activeUnit.id}`)}
            style={{
              fontFamily: '"Futura PT Medium"', fontSize: '8px', letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#1A1A1A', background: 'none', border: 'none',
              borderBottom: '1px solid rgba(26,26,26,0.3)', paddingBottom: '2px', cursor: 'pointer',
              transition: 'color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.color = '#C81C24'; el.style.borderBottomColor = '#C81C24'; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.color = '#1A1A1A'; el.style.borderBottomColor = 'rgba(26,26,26,0.3)'; }}
          >
            ENTER EXHIBIT →
          </button>
        </div>
      </div>

      {/* ── UNIT SELECTORS ── */}
      <div className="flex items-center gap-3 mt-5" style={{ zIndex: 10 }}>
        {UNITS.map((unit, i) => (
          <button
            key={unit.id}
            onClick={() => goToUnit(i)}
            aria-label={`View ${unit.name}`}
            style={{
              width: i === activeIndex ? '24px' : '6px', height: '6px',
              borderRadius: i === activeIndex ? '3px' : '50%',
              background: i === activeIndex ? '#C81C24' : 'rgba(26,26,26,0.22)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap justify-center" style={{ zIndex: 10 }}>
        {UNITS.map((unit, i) => (
          <button
            key={unit.id}
            onClick={() => goToUnit(i)}
            style={{
              fontFamily: '"Futura PT Book"', fontSize: '7px', letterSpacing: '0.16em',
              textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px',
              background: i === activeIndex ? '#C81C24' : 'rgba(255,255,255,0.48)',
              color: i === activeIndex ? '#FFF' : '#A89070',
              border: i === activeIndex ? '1px solid transparent' : '1px solid rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)', cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            {unit.name}
          </button>
        ))}
      </div>
    </div>
  );
}
