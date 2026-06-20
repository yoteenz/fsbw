import { useState, useEffect, useRef, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

interface WigUnit {
  id: string;
  name: string;
  length: string;
  lace: string;
  price: string;
  image: string;
  textureLabel: string;
}

const UNITS: WigUnit[] = [
  { id: 'noir', name: 'NOIR', length: '24"', lace: '100% HUMAN LACE', price: '$740', image: '/assets/NOIR/noir front.png', textureLabel: 'STRAIGHT' },
  { id: 'blanco', name: 'BLANCO', length: '22"', lace: '100% HUMAN LACE', price: '$720', image: '/assets/BLANCO-FRONT.png', textureLabel: 'STRAIGHT' },
  { id: 'soft-wave', name: 'SOFT WAVE', length: '22"', lace: '100% HUMAN LACE', price: '$695', image: '/assets/SOFT-WAVE FRONT.png', textureLabel: 'WAVY' },
  { id: 'beach-wave', name: 'BEACH WAVE', length: '24"', lace: '100% HUMAN LACE', price: '$760', image: '/assets/BEACH WAVE FRONT.JPG', textureLabel: 'WAVY' },
  { id: 'soft-curl', name: 'SOFT CURL', length: '20"', lace: '100% HUMAN LACE', price: '$680', image: '/assets/SOFT CURL FRONT.JPG', textureLabel: 'CURLY' },
  { id: 'ocean-curl', name: 'OCEAN CURL', length: '22"', lace: '100% HUMAN LACE', price: '$710', image: '/assets/OCEAN CURL FRONT.JPG', textureLabel: 'CURLY' },
];

const AUTO_ADVANCE_MS = 7000;

// ── Luxury Mannequin Bust ─────────────────────────────────────────────────────
// Heather gray upholstered fabric, faceless, couture atelier quality
function LuxuryMannequin() {
  const fabricTexture = 'repeating-linear-gradient(135deg, transparent 0px, transparent 2px, rgba(255,255,255,0.028) 2px, rgba(255,255,255,0.028) 3px)';

  return (
    <div className="relative flex flex-col items-center" style={{ width: '220px', flexShrink: 0 }}>
      {/* Head — upholstered oval, faceless */}
      <div style={{
        width: '108px', height: '128px',
        borderRadius: '54% 54% 46% 46% / 56% 56% 44% 44%',
        background: `${fabricTexture}, linear-gradient(148deg, #D0C9C0 0%, #C2BBB2 28%, #B6AFA7 58%, #AAA39C 100%)`,
        boxShadow: [
          'inset -16px 0 32px rgba(0,0,0,0.14)',
          'inset 6px 0 18px rgba(255,255,255,0.16)',
          'inset 0 -10px 20px rgba(0,0,0,0.1)',
          '0 6px 18px rgba(0,0,0,0.1)',
        ].join(', '),
      }} />

      {/* Neck — elegant proportion */}
      <div style={{
        width: '48px', height: '68px',
        marginTop: '-6px',
        background: `${fabricTexture}, linear-gradient(180deg, #CAC3BA 0%, #BDB6AE 50%, #B1AAA3 100%)`,
        boxShadow: 'inset -5px 0 12px rgba(0,0,0,0.12), inset 3px 0 8px rgba(255,255,255,0.1)',
        borderRadius: '2px',
      }} />

      {/* Chest plate — top visible */}
      <div style={{
        width: '152px', height: '20px',
        marginTop: '-3px',
        background: `${fabricTexture}, linear-gradient(180deg, #C4BDB5 0%, #B8B1A9 100%)`,
        borderRadius: '40% 40% 0 0 / 80% 80% 0 0',
        boxShadow: 'inset 0 6px 14px rgba(255,255,255,0.12), inset -10px 0 20px rgba(0,0,0,0.08)',
      }} />

      {/* Shoulders — widened luxury silhouette */}
      <div style={{
        width: '210px', height: '32px',
        marginTop: '-2px',
        background: `${fabricTexture}, linear-gradient(180deg, #BEB7AF 0%, #B2ABA3 40%, #A9A29B 100%)`,
        borderRadius: '48% 48% 0 0 / 88% 88% 0 0',
        boxShadow: [
          'inset 0 8px 20px rgba(255,255,255,0.1)',
          'inset -14px 0 24px rgba(0,0,0,0.1)',
          'inset 6px 0 16px rgba(255,255,255,0.08)',
          '0 4px 14px rgba(0,0,0,0.08)',
        ].join(', '),
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Shoulder highlight — light catch from the chandelier above */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: '6px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)',
          borderRadius: '50%',
        }} />
      </div>
    </div>
  );
}

// ── Crystal Diamond Sculpture ─────────────────────────────────────────────────
function CrystalDiamond({ size = 14, intensity = 1 }: { size?: number; intensity?: number }) {
  return (
    <div style={{
      width: size, height: size,
      background: `linear-gradient(135deg, rgba(255,255,255,${0.85 * intensity}) 0%, rgba(245,240,232,${0.6 * intensity}) 40%, rgba(255,255,255,${0.7 * intensity}) 100%)`,
      border: `1px solid rgba(255,255,255,${0.75 * intensity})`,
      transform: 'rotate(45deg)',
      boxShadow: [
        `0 0 ${size * 1.5}px rgba(255,248,220,${0.5 * intensity})`,
        `0 0 ${size * 3}px rgba(200,28,36,${0.18 * intensity})`,
        `inset 0 1px 0 rgba(255,255,255,${0.9 * intensity})`,
      ].join(', '),
      flexShrink: 0,
    }} />
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
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

  const exhibitTransform = `perspective(1200px) rotateY(${mousePos.x * 2.5}deg) rotateX(${-mousePos.y * 1.5}deg)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      className="relative flex flex-col items-center"
      style={{ width: '100%' }}
    >
      {/* ── OVERHEAD CHANDELIER SPOTLIGHT ── */}
      <div className="absolute pointer-events-none" style={{
        top: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '750px',
        background: [
          'radial-gradient(ellipse 38% 45% at 50% 0%, rgba(255,248,205,0.88) 0%, rgba(255,244,195,0.55) 12%, rgba(255,246,210,0.22) 35%, transparent 60%)',
        ].join(', '),
        zIndex: 0,
      }} />
      {/* Ambient fill — warm vault glow */}
      <div className="absolute pointer-events-none" style={{
        top: '-60px', left: '50%', transform: 'translateX(-50%)',
        width: '1000px', height: '500px',
        background: 'radial-gradient(ellipse 75% 75% at 50% 0%, rgba(255,250,225,0.3) 0%, transparent 68%)',
        zIndex: 0,
      }} />

      {/* ── ROSE DISPLAY — flanking the exhibit ── */}
      <div className="absolute pointer-events-none" style={{
        left: '-20px', bottom: '180px', width: '100px', zIndex: 2,
        transform: 'scaleX(-1) rotate(-8deg)',
        opacity: 0.75,
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.12))',
      }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%' }} />
      </div>
      <div className="absolute pointer-events-none" style={{
        right: '-20px', bottom: '180px', width: '100px', zIndex: 2,
        transform: 'rotate(8deg)',
        opacity: 0.7,
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.12))',
      }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%' }} />
      </div>

      {/* ── THE EXHIBIT — mannequin + wig display ── */}
      <div
        className="relative flex flex-col items-center"
        style={{
          zIndex: 10,
          transition: isTransitioning ? 'opacity 0.32s ease, transform 0.32s ease' : 'opacity 0.55s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(0.97) translateY(10px)' : `scale(1) translateY(0) ${exhibitTransform}`,
        }}
      >
        {/* WIG PHOTOGRAPHY — the featured hair specimen */}
        <div style={{ position: 'relative', width: '100%', height: '340px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <img
            key={activeUnit.id}
            src={activeUnit.image}
            alt={activeUnit.name}
            style={{
              maxWidth: '340px',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              filter: [
                'drop-shadow(0 40px 72px rgba(0,0,0,0.22))',
                'drop-shadow(0 10px 28px rgba(0,0,0,0.12))',
                'drop-shadow(0 0 80px rgba(255,248,215,0.2))',
              ].join(' '),
            }}
          />
        </div>

        {/* CSS LUXURY MANNEQUIN — visible below the wig */}
        <div style={{ marginTop: '-12px', position: 'relative', zIndex: 5 }}>
          {/* Subtle warmth on the mannequin from above */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '200px', height: '100px',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,248,215,0.3) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 10,
          }} />
          <LuxuryMannequin />
        </div>
      </div>

      {/* ── ILLUMINATED MARBLE PEDESTAL ── */}
      <div className="relative flex flex-col items-center" style={{ zIndex: 11, marginTop: '-6px', width: '100%' }}>

        {/* Floor light pool — spreads from base of pedestal */}
        <div className="absolute pointer-events-none" style={{
          bottom: '-14px', left: '50%', transform: 'translateX(-50%)',
          width: '480px', height: '60px',
          background: 'radial-gradient(ellipse at center, rgba(255,244,200,0.55) 0%, rgba(200,28,36,0.1) 28%, transparent 65%)',
          filter: 'blur(12px)',
          animation: 'pedestalPulse 4s ease-in-out infinite',
        }} />

        {/* Diamond sculptures — flanking the pedestal */}
        <div className="absolute flex items-center gap-3 pointer-events-none" style={{
          bottom: '100px', left: '50%', transform: 'translateX(-50%)',
          width: '400px', justifyContent: 'space-between', zIndex: 20,
        }}>
          <CrystalDiamond size={14} intensity={0.9} />
          <CrystalDiamond size={9} intensity={0.6} />
          <CrystalDiamond size={9} intensity={0.6} />
          <CrystalDiamond size={14} intensity={0.9} />
        </div>
        {/* Secondary row of diamonds */}
        <div className="absolute flex items-center gap-2 pointer-events-none" style={{
          bottom: '68px', left: '50%', transform: 'translateX(-50%)',
          width: '340px', justifyContent: 'space-between', zIndex: 20,
        }}>
          <CrystalDiamond size={7} intensity={0.45} />
          <CrystalDiamond size={7} intensity={0.45} />
          <CrystalDiamond size={7} intensity={0.45} />
          <CrystalDiamond size={7} intensity={0.45} />
        </div>

        {/* TIER 1 — Display capital (narrow top, brightest internal glow) */}
        <div style={{
          width: '180px', height: '14px',
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,243,232,0.92) 100%)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderBottom: 'none',
          boxShadow: [
            'inset 0 2px 0 rgba(255,255,255,1)',
            'inset 0 0 24px rgba(255,248,215,0.75)',
            '0 -10px 28px rgba(255,244,200,0.6)',
          ].join(', '),
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.45) 60%, transparent)' }} />
        </div>

        {/* TIER 2 — Crystal shaft (faceted, internally lit) */}
        <div style={{
          width: '156px', height: '52px',
          background: 'linear-gradient(180deg, rgba(255,253,242,0.96) 0%, rgba(248,243,232,0.88) 45%, rgba(238,232,220,0.92) 100%)',
          border: '1px solid rgba(255,255,255,0.72)',
          borderTop: 'none', borderBottom: 'none',
          position: 'relative', overflow: 'hidden',
          boxShadow: 'inset 0 0 30px rgba(255,248,215,0.45)',
        }}>
          {/* Crystal facet lines */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(255,255,255,0.4) 12px, rgba(255,255,255,0.4) 13px)' }} />
          {/* Internal warm glow from within the marble */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 65% at 50% 0%, rgba(255,248,210,0.6) 0%, transparent 72%)' }} />
          {/* Side edge highlights */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, transparent 18%, transparent 82%, rgba(255,255,255,0.5) 100%)' }} />
        </div>

        {/* TIER 3 — Middle step (wider) */}
        <div style={{
          width: '220px', height: '18px',
          background: 'linear-gradient(180deg, rgba(246,240,228,0.94) 0%, rgba(232,226,214,0.88) 100%)',
          border: '1px solid rgba(255,255,255,0.68)',
          borderTop: 'none', borderBottom: 'none',
          boxShadow: 'inset 0 0 20px rgba(255,244,200,0.3)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.38) 0%, transparent 22%, transparent 78%, rgba(255,255,255,0.38) 100%)' }} />
        </div>

        {/* TIER 4 — Lower step */}
        <div style={{
          width: '270px', height: '14px',
          background: 'linear-gradient(180deg, rgba(236,229,216,0.92) 0%, rgba(222,215,202,0.86) 100%)',
          border: '1px solid rgba(255,255,255,0.62)',
          borderTop: 'none', borderBottom: 'none',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, transparent 25%, transparent 75%, rgba(255,255,255,0.3) 100%)' }} />
        </div>

        {/* TIER 5 — Grand base (widest, heaviest material) */}
        <div style={{
          width: '330px', height: '22px',
          borderRadius: '0 0 6px 6px',
          background: 'linear-gradient(180deg, rgba(224,217,204,0.94) 0%, rgba(208,201,188,0.88) 55%, rgba(198,191,178,0.85) 100%)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderTop: 'none',
          boxShadow: '0 10px 36px rgba(0,0,0,0.12), inset 0 -1px 0 rgba(255,255,255,0.45)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.28) 0%, transparent 28%, transparent 72%, rgba(255,255,255,0.28) 100%)' }} />
        </div>

        {/* Pedestal floor shadow */}
        <div style={{ width: '380px', height: '14px', marginTop: '4px', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, transparent 68%)' }} />
      </div>

      {/* ── EXHIBITION LABEL ── */}
      <div className="text-center" style={{ zIndex: 10, marginTop: '20px' }}>
        {/* Specimen tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '5px 18px',
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.55)',
          borderRadius: '1px',
          marginBottom: '7px',
        }}>
          <CrystalDiamond size={4} intensity={0.7} />
          <span style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9A8868' }}>
            {activeUnit.textureLabel} &nbsp;뿯½&nbsp; {activeUnit.length} &nbsp;뿯½&nbsp; {activeUnit.lace}
          </span>
          <CrystalDiamond size={4} intensity={0.7} />
        </div>

        <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '26px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1A1A1A', lineHeight: 1 }}>
          {activeUnit.name}
        </div>

        <div className="flex items-center justify-center gap-5 mt-3">
          <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '15px', letterSpacing: '0.04em', color: '#C81C24' }}>{activeUnit.price}</span>
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
            ENTER EXHIBIT 뿯↽
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-3 mt-5" style={{ zIndex: 10 }}>
        {UNITS.map((unit, i) => (
          <button key={unit.id} onClick={() => goToUnit(i)} aria-label={`View ${unit.name}`} style={{
            width: i === activeIndex ? '22px' : '6px', height: '6px',
            borderRadius: i === activeIndex ? '3px' : '50%',
            background: i === activeIndex ? '#C81C24' : 'rgba(26,26,26,0.22)',
            border: 'none', cursor: 'pointer', padding: 0,
            transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
          }} />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap justify-center" style={{ zIndex: 10 }}>
        {UNITS.map((unit, i) => (
          <button key={unit.id} onClick={() => goToUnit(i)} style={{
            fontFamily: '"Futura PT Book"', fontSize: '7px', letterSpacing: '0.16em',
            textTransform: 'uppercase', padding: '3px 10px', borderRadius: '20px',
            background: i === activeIndex ? '#C81C24' : 'rgba(255,255,255,0.5)',
            color: i === activeIndex ? '#FFF' : '#9A8868',
            border: i === activeIndex ? '1px solid transparent' : '1px solid rgba(255,255,255,0.62)',
            backdropFilter: 'blur(8px)', cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            {unit.name}
          </button>
        ))}
      </div>
    </div>
  );
}
