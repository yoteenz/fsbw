import { useState, useEffect, useRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface WigUnit {
  id: string;
  name: string;
  type: string;
  length: string;
  lace: string;
  color: string;
  price: string;
  image: string;
  textureLabel: string;
}

const UNITS: WigUnit[] = [
  { id: 'noir', name: 'NOIR', type: 'STRAIGHT UNIT', length: '24"', lace: '100% HUMAN LACE', color: 'JET BLACK', price: '$740.00', image: '/assets/NOIR/noir front.png', textureLabel: 'STRAIGHT' },
  { id: 'blanco', name: 'BLANCO', type: 'STRAIGHT UNIT', length: '22"', lace: '100% HUMAN LACE', color: 'OFF-WHITE', price: '$720.00', image: '/assets/BLANCO-FRONT.png', textureLabel: 'STRAIGHT' },
  { id: 'soft-wave', name: 'SOFT WAVE', type: 'WAVY UNIT', length: '22"', lace: '100% HUMAN LACE', color: 'NATURAL BLACK', price: '$695.00', image: '/assets/SOFT-WAVE FRONT.png', textureLabel: 'WAVY' },
  { id: 'beach-wave', name: 'BEACH WAVE', type: 'WAVY UNIT', length: '24"', lace: '100% HUMAN LACE', color: 'NATURAL BLACK', price: '$760.00', image: '/assets/BEACH WAVE FRONT.JPG', textureLabel: 'WAVY' },
  { id: 'soft-curl', name: 'SOFT CURL', type: 'CURLY UNIT', length: '20"', lace: '100% HUMAN LACE', color: 'NATURAL BLACK', price: '$680.00', image: '/assets/SOFT CURL FRONT.JPG', textureLabel: 'CURLY' },
  { id: 'ocean-curl', name: 'OCEAN CURL', type: 'CURLY UNIT', length: '22"', lace: '100% HUMAN LACE', color: 'NATURAL BLACK', price: '$710.00', image: '/assets/OCEAN CURL FRONT.JPG', textureLabel: 'CURLY' },
];

const AUTO_ADVANCE_MS = 5000;

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
    }, 300);
  };

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goToUnit((activeIndex + 1) % UNITS.length);
    }, AUTO_ADVANCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const wigTransform = `perspective(1100px) rotateY(${mousePos.x * 4}deg) rotateX(${-mousePos.y * 2.5}deg) translateY(${mousePos.y * -6}px)`;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      style={{ width: '100%', maxWidth: '440px' }}
    >
      {/* Overhead spotlight beam — descends from the chandelier above */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '580px',
          background: 'radial-gradient(ellipse 55% 50% at 50% 5%, rgba(255,248,215,0.65) 0%, rgba(255,248,220,0.22) 35%, transparent 65%)',
          zIndex: 0,
        }}
      />

      {/* Wig image — the hero of the stage */}
      <div
        className="relative"
        style={{
          width: '100%',
          height: '530px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 10,
          transition: isTransitioning ? 'opacity 0.3s ease, transform 0.3s ease' : 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)',
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning
            ? 'scale(0.96) translateY(10px)'
            : `scale(1) translateY(0) ${wigTransform}`,
        }}
      >
        <img
          key={activeUnit.id}
          src={activeUnit.image}
          alt={activeUnit.name}
          style={{
            maxWidth: '380px',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            filter: 'drop-shadow(0 40px 72px rgba(0,0,0,0.22)) drop-shadow(0 10px 28px rgba(0,0,0,0.12))',
          }}
        />
      </div>

      {/* Crystal plinth — 3-tier architectural pedestal */}
      <div
        className="relative flex flex-col items-center"
        style={{ marginTop: '-10px', zIndex: 11 }}
      >
        {/* Stage spotlight floor pool */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300px',
            height: '40px',
            background: 'radial-gradient(ellipse at center, rgba(200,28,36,0.16) 0%, rgba(255,244,210,0.35) 30%, transparent 68%)',
            filter: 'blur(7px)',
            animation: 'pedestalPulse 3s ease-in-out infinite',
          }}
        />

        {/* Tier 1 — Capital (widest top, light-catching) */}
        <div
          style={{
            width: '172px',
            height: '11px',
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(240,236,230,0.88) 100%)',
            border: '1px solid rgba(255,255,255,0.92)',
            borderBottom: 'none',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,1), 0 -6px 16px rgba(255,248,215,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 35%, rgba(255,255,255,0.45) 65%, transparent 100%)',
            }}
          />
        </div>

        {/* Tier 2 — Shaft (crystal-faceted column) */}
        <div
          style={{
            width: '148px',
            height: '36px',
            background: 'linear-gradient(180deg, rgba(252,249,245,0.92) 0%, rgba(238,233,226,0.82) 50%, rgba(228,222,215,0.9) 100%)',
            border: '1px solid rgba(255,255,255,0.78)',
            borderTop: 'none',
            borderBottom: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Vertical crystal facet lines */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 17px, rgba(255,255,255,0.38) 17px, rgba(255,255,255,0.38) 18px)',
            }}
          />
          {/* Side edge highlights */}
          <div
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.45) 0%, transparent 22%, transparent 78%, rgba(255,255,255,0.45) 100%)',
            }}
          />
        </div>

        {/* Tier 3 — Base (ground contact) */}
        <div
          style={{
            width: '214px',
            height: '13px',
            borderRadius: '0 0 4px 4px',
            background: 'linear-gradient(180deg, rgba(226,220,212,0.92) 0%, rgba(210,203,195,0.82) 100%)',
            border: '1px solid rgba(255,255,255,0.72)',
            borderTop: 'none',
            boxShadow: '0 6px 24px rgba(0,0,0,0.1), inset 0 -1px 0 rgba(255,255,255,0.5)',
          }}
        />

        {/* Floor shadow */}
        <div
          style={{
            width: '240px',
            height: '10px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, transparent 70%)',
            marginTop: '2px',
          }}
        />
      </div>

      {/* Unit info — editorial, not a product card */}
      <div className="mt-8 text-center" style={{ zIndex: 10, position: 'relative' }}>
        <div
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '9px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#A89070',
            marginBottom: '6px',
          }}
        >
          {activeUnit.textureLabel} &nbsp;·&nbsp; {activeUnit.length} &nbsp;·&nbsp; {activeUnit.lace}
        </div>

        <div
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '30px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#1A1A1A',
            lineHeight: 1,
          }}
        >
          {activeUnit.name}
        </div>

        <div className="flex items-center justify-center gap-5 mt-4">
          <span
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '17px',
              letterSpacing: '0.04em',
              color: '#C81C24',
            }}
          >
            {activeUnit.price}
          </span>
          <span style={{ width: '1px', height: '14px', background: 'rgba(26,26,26,0.18)', display: 'block' }} />
          <button
            onClick={() => navigate(`/straight/${activeUnit.id === 'blanco' ? 'blanco' : activeUnit.id}`)}
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '9px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid rgba(26,26,26,0.32)',
              paddingBottom: '2px',
              cursor: 'pointer',
              transition: 'color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = '#C81C24';
              el.style.borderBottomColor = '#C81C24';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.color = '#1A1A1A';
              el.style.borderBottomColor = 'rgba(26,26,26,0.32)';
            }}
          >
            VIEW UNIT
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-3 mt-6" style={{ zIndex: 10, position: 'relative' }}>
        {UNITS.map((unit, i) => (
          <button
            key={unit.id}
            onClick={() => goToUnit(i)}
            aria-label={`View ${unit.name}`}
            style={{
              width: i === activeIndex ? '26px' : '6px',
              height: '6px',
              borderRadius: i === activeIndex ? '3px' : '50%',
              background: i === activeIndex ? '#C81C24' : 'rgba(26,26,26,0.2)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        ))}
      </div>

      {/* Unit name chips */}
      <div className="flex items-center gap-2 mt-3 flex-wrap justify-center" style={{ zIndex: 10, position: 'relative' }}>
        {UNITS.map((unit, i) => (
          <button
            key={unit.id}
            onClick={() => goToUnit(i)}
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '8px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '4px 12px',
              borderRadius: '20px',
              background: i === activeIndex ? '#C81C24' : 'rgba(255,255,255,0.5)',
              color: i === activeIndex ? '#FFFFFF' : '#A89070',
              border: i === activeIndex ? '1px solid transparent' : '1px solid rgba(255,255,255,0.65)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {unit.name}
          </button>
        ))}
      </div>
    </div>
  );
}
