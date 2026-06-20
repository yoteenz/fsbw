import React, { useState, useEffect, useRef } from 'react';
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
  {
    id: 'noir',
    name: 'NOIR',
    type: 'STRAIGHT UNIT',
    length: '24"',
    lace: '100% HUMAN LACE',
    color: 'JET BLACK',
    price: '$740.00',
    image: '/assets/NOIR/noir front.png',
    textureLabel: 'STRAIGHT',
  },
  {
    id: 'blanco',
    name: 'BLANCO',
    type: 'STRAIGHT UNIT',
    length: '22"',
    lace: '100% HUMAN LACE',
    color: 'OFF-WHITE',
    price: '$720.00',
    image: '/assets/BLANCO-FRONT.png',
    textureLabel: 'STRAIGHT',
  },
  {
    id: 'soft-wave',
    name: 'SOFT WAVE',
    type: 'WAVY UNIT',
    length: '22"',
    lace: '100% HUMAN LACE',
    color: 'NATURAL BLACK',
    price: '$695.00',
    image: '/assets/SOFT-WAVE FRONT.png',
    textureLabel: 'WAVY',
  },
  {
    id: 'beach-wave',
    name: 'BEACH WAVE',
    type: 'WAVY UNIT',
    length: '24"',
    lace: '100% HUMAN LACE',
    color: 'NATURAL BLACK',
    price: '$760.00',
    image: '/assets/BEACH WAVE FRONT.JPG',
    textureLabel: 'WAVY',
  },
  {
    id: 'soft-curl',
    name: 'SOFT CURL',
    type: 'CURLY UNIT',
    length: '20"',
    lace: '100% HUMAN LACE',
    color: 'NATURAL BLACK',
    price: '$680.00',
    image: '/assets/SOFT CURL FRONT.JPG',
    textureLabel: 'CURLY',
  },
  {
    id: 'ocean-curl',
    name: 'OCEAN CURL',
    type: 'CURLY UNIT',
    length: '22"',
    lace: '100% HUMAN LACE',
    color: 'NATURAL BLACK',
    price: '$710.00',
    image: '/assets/OCEAN CURL FRONT.JPG',
    textureLabel: 'CURLY',
  },
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
      setTimeout(() => {
        setIsTransitioning(false);
        setPrevIndex(null);
      }, 80);
    }, 280);
  };

  // Auto-advance
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goToUnit((activeIndex + 1) % UNITS.length);
    }, AUTO_ADVANCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex]);

  // Mouse parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const wigTransform = `perspective(800px) rotateY(${mousePos.x * 5}deg) rotateX(${-mousePos.y * 3}deg) translateY(${mousePos.y * -4}px)`;

  const unitImageStyle = {
    transition: isTransitioning
      ? 'opacity 0.28s ease, transform 0.28s ease'
      : 'opacity 0.45s ease, transform 0.45s ease',
    opacity: isTransitioning ? 0 : 1,
    transform: isTransitioning
      ? 'scale(0.97) translateY(6px)'
      : `scale(1) translateY(0) ${wigTransform}`,
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Wig image */}
      <div className="relative flex-1 flex items-end justify-center w-full" style={{ paddingBottom: '10px' }}>
        <div
          className="relative"
          style={{
            width: '100%',
            maxWidth: '320px',
            height: '420px',
            ...unitImageStyle,
          }}
        >
          <img
            key={activeUnit.id}
            src={activeUnit.image}
            alt={activeUnit.name}
            className="w-full h-full object-contain drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.18))',
            }}
          />
        </div>
      </div>

      {/* Crystal pedestal */}
      <div className="relative flex flex-col items-center" style={{ marginTop: '-8px' }}>
        {/* Pedestal glow ring */}
        <div
          className="absolute"
          style={{
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '180px',
            height: '24px',
            background: 'radial-gradient(ellipse at center, rgba(200,28,36,0.18) 0%, rgba(255,255,255,0.4) 50%, transparent 75%)',
            filter: 'blur(6px)',
            animation: 'pedestalPulse 3s ease-in-out infinite',
          }}
        />

        {/* Pedestal platform */}
        <div
          className="relative"
          style={{
            width: '200px',
            height: '14px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(230,230,240,0.8) 100%)',
            border: '1px solid rgba(255,255,255,0.9)',
            borderRadius: '4px',
            boxShadow: '0 2px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          {/* Crystal facets */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.3) 60%, transparent 100%)',
              borderRadius: 'inherit',
            }}
          />
        </div>

        {/* Pedestal base */}
        <div
          style={{
            width: '240px',
            height: '8px',
            background: 'linear-gradient(180deg, rgba(210,210,220,0.9) 0%, rgba(190,190,200,0.7) 100%)',
            border: '1px solid rgba(255,255,255,0.8)',
            borderRadius: '0 0 4px 4px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
        />

        {/* Floor reflection */}
        <div
          style={{
            width: '220px',
            height: '6px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.08) 0%, transparent 70%)',
            marginTop: '4px',
          }}
        />
      </div>

      {/* Unit info */}
      <div className="mt-6 text-center" style={{ minHeight: '80px' }}>
        <div
          className="text-xs tracking-[0.18em] uppercase mb-1"
          style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
        >
          {activeUnit.textureLabel} UNIT — {activeUnit.length} {activeUnit.lace}
        </div>
        <div
          className="text-2xl tracking-[0.12em] uppercase mb-0.5"
          style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
        >
          {activeUnit.name}
        </div>
        <div
          className="text-lg tracking-[0.06em]"
          style={{ fontFamily: '"Futura PT Medium"', color: '#C81C24' }}
        >
          {activeUnit.price}
        </div>
        <button
          onClick={() => navigate(`/straight/${activeUnit.id === 'blanco' ? 'blanco' : activeUnit.id}`)}
          className="mt-3 px-6 py-2 text-[10px] tracking-[0.14em] uppercase border rounded transition-all duration-200 hover:bg-brand-charcoal hover:text-white"
          style={{
            fontFamily: '"Futura PT Medium"',
            borderColor: 'rgba(26,26,26,0.25)',
            color: '#1A1A1A',
          }}
        >
          VIEW UNIT
        </button>
      </div>

      {/* Unit selector dots */}
      <div className="flex items-center gap-2.5 mt-5">
        {UNITS.map((unit, i) => (
          <button
            key={unit.id}
            onClick={() => goToUnit(i)}
            aria-label={`View ${unit.name}`}
            className="transition-all duration-300"
            style={{
              width: i === activeIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: i === activeIndex ? '4px' : '50%',
              background: i === activeIndex ? '#C81C24' : 'rgba(26,26,26,0.2)',
            }}
          />
        ))}
      </div>

      {/* Unit name chips */}
      <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
        {UNITS.map((unit, i) => (
          <button
            key={unit.id}
            onClick={() => goToUnit(i)}
            className="text-[9px] tracking-[0.12em] uppercase px-3 py-1 rounded-full transition-all duration-200"
            style={{
              fontFamily: '"Futura PT Book"',
              background: i === activeIndex ? '#C81C24' : 'rgba(26,26,26,0.06)',
              color: i === activeIndex ? '#FFFFFF' : '#959B9B',
              border: i === activeIndex ? '1px solid transparent' : '1px solid rgba(26,26,26,0.1)',
            }}
          >
            {unit.name}
          </button>
        ))}
      </div>
    </div>
  );
}
