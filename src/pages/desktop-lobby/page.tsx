import { useState, useEffect } from 'react';
import { NavBar } from '../../components/desktop-lobby/NavBar';
import { ParticleField } from '../../components/desktop-lobby/ParticleField';
import { WigPedestalDisplay } from '../../components/desktop-lobby/WigPedestalDisplay';
import { BuildAWigPanel } from '../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../components/desktop-lobby/PSAConciergePanel';
import { ZonePortals } from '../../components/desktop-lobby/ZonePortals';
import { ZoneLoungeReveal } from '../../components/desktop-lobby/ZoneLoungeReveal';

// ── Crystal Chandelier — SVG luxury fixture ───────────────────────────────────
function CrystalChandelier() {
  return (
    <svg
      viewBox="0 0 360 180"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '360px', height: '180px', overflow: 'visible' }}
    >
      {/* Ceiling rose */}
      <ellipse cx="180" cy="6" rx="28" ry="6" fill="rgba(215,205,185,0.85)" />
      <ellipse cx="180" cy="5" rx="18" ry="4" fill="rgba(240,232,215,0.9)" />

      {/* Main drop chain */}
      <line x1="180" y1="10" x2="180" y2="52" stroke="rgba(195,180,152,0.8)" strokeWidth="2.5" />
      <rect x="175" y="20" width="10" height="4" rx="1" fill="rgba(220,210,188,0.8)" />
      <rect x="176" y="30" width="8" height="4" rx="1" fill="rgba(215,205,185,0.75)" />

      {/* Central chandelier body — faceted crystal */}
      <ellipse cx="180" cy="64" rx="18" ry="8" fill="rgba(255,252,245,0.85)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
      <rect x="162" y="62" width="36" height="22" rx="2" fill="rgba(255,253,247,0.72)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
      <ellipse cx="180" cy="86" rx="18" ry="7" fill="rgba(252,248,238,0.88)" stroke="rgba(255,255,255,0.65)" strokeWidth="0.8" />
      {/* Internal warm glow */}
      <ellipse cx="180" cy="74" rx="12" ry="8" fill="rgba(255,244,190,0.5)" />

      {/* Crown arms — horizontal bar */}
      <line x1="80" y1="90" x2="280" y2="90" stroke="rgba(205,192,168,0.7)" strokeWidth="1.8" />
      <line x1="108" y1="88" x2="108" y2="96" stroke="rgba(205,192,168,0.6)" strokeWidth="1.5" />
      <line x1="144" y1="87" x2="144" y2="97" stroke="rgba(205,192,168,0.6)" strokeWidth="1.5" />
      <line x1="180" y1="86" x2="180" y2="97" stroke="rgba(205,192,168,0.55)" strokeWidth="1.5" />
      <line x1="216" y1="87" x2="216" y2="97" stroke="rgba(205,192,168,0.6)" strokeWidth="1.5" />
      <line x1="252" y1="88" x2="252" y2="96" stroke="rgba(205,192,168,0.6)" strokeWidth="1.5" />

      {/* Hanging crystal pendants — outer tier */}
      {[80, 108, 144, 216, 252, 280].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="92" x2={x} y2={108 + (i % 3) * 5} stroke="rgba(195,183,162,0.55)" strokeWidth="0.9" />
          {/* Crystal teardrop */}
          <ellipse cx={x} cy={114 + (i % 3) * 5} rx="5" ry="8" fill="rgba(255,252,242,0.78)" stroke="rgba(255,255,255,0.65)" strokeWidth="0.6" />
          <ellipse cx={x} cy={110 + (i % 3) * 5} rx="3" ry="2" fill="rgba(255,248,225,0.6)" />
        </g>
      ))}

      {/* Inner tier pendants */}
      {[128, 160, 200, 232].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="92" x2={x} y2="102" stroke="rgba(195,183,162,0.45)" strokeWidth="0.8" />
          <ellipse cx={x} cy="108" rx="4" ry="6.5" fill="rgba(255,252,242,0.7)" stroke="rgba(255,255,255,0.58)" strokeWidth="0.5" />
        </g>
      ))}

      {/* Central drop — largest crystal */}
      <line x1="180" y1="92" x2="180" y2="118" stroke="rgba(195,183,162,0.6)" strokeWidth="1.2" />
      <ellipse cx="180" cy="128" rx="8" ry="12" fill="rgba(255,253,245,0.82)" stroke="rgba(255,255,255,0.72)" strokeWidth="0.8" />
      <ellipse cx="180" cy="120" rx="5" ry="3" fill="rgba(255,248,215,0.65)" />
      {/* Sparkle points on central crystal */}
      <line x1="180" y1="115" x2="180" y2="112" stroke="rgba(255,252,235,0.8)" strokeWidth="0.7" />
      <line x1="177" y1="118" x2="175" y2="116" stroke="rgba(255,252,235,0.6)" strokeWidth="0.6" />
      <line x1="183" y1="118" x2="185" y2="116" stroke="rgba(255,252,235,0.6)" strokeWidth="0.6" />

      {/* Ambient glow halo around chandelier */}
      <ellipse cx="180" cy="95" rx="90" ry="40" fill="rgba(255,244,190,0.12)" />
    </svg>
  );
}

// ── Perspective Floor Grid ────────────────────────────────────────────────────
function FloorGrid({ width, height }: { width: number; height: number }) {
  const cx = width / 2;
  const lines = [];

  // Receding horizontal lines
  for (let i = 0; i < 10; i++) {
    const t = Math.pow(i / 9, 1.7);
    const y = t * height;
    const opacity = 0.08 + t * 0.14;
    lines.push(<line key={`h${i}`} x1={0} y1={y} x2={width} y2={y} stroke={`rgba(160,145,120,${opacity})`} strokeWidth="0.8" />);
  }

  // Receding vertical (perspective) lines fanning from vanishing point
  const count = 14;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const xBottom = t * width;
    const xTop = cx + (xBottom - cx) * 0.2;
    const opacity = 0.06 + Math.abs(t - 0.5) * 0.16;
    lines.push(<line key={`v${i}`} x1={xTop} y1={0} x2={xBottom} y2={height} stroke={`rgba(160,145,120,${opacity})`} strokeWidth="0.8" />);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {lines}
    </svg>
  );
}

// ── Zone 1 — The Arrival: The Showroom ───────────────────────────────────────
function ZoneArrival() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const floatIn = (delayMs: number, dy = 32) => ({
    transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${dy}px)`,
  });

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: '100vh',
        // Warm marble — the dominant material of the room
        background: '#E8DFD0',
        backgroundImage: 'url(/assets/marble%20bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      {/* ═══════════════════════════════════════════
          ROOM DEPTH — ceiling, floor, side walls
      ═══════════════════════════════════════════ */}

      {/* Ceiling — warm light wash, keeps the top bright */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(255,252,238,0.78) 0%, rgba(255,250,230,0.35) 20%, transparent 45%)',
        zIndex: 1,
      }} />

      {/* Floor — warm depth gradient at the base */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(0deg, rgba(178,164,138,0.52) 0%, rgba(200,188,166,0.24) 22%, transparent 44%)',
        zIndex: 1,
      }} />

      {/* Side walls — architectural shadows to suggest room edges */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(90deg, rgba(130,112,88,0.22) 0%, rgba(160,140,112,0.08) 14%, transparent 26%, transparent 74%, rgba(160,140,112,0.08) 86%, rgba(130,112,88,0.22) 100%)',
        zIndex: 1,
      }} />

      {/* PERSPECTIVE FLOOR — polished marble surface at the base */}
      <div className="absolute pointer-events-none" style={{
        bottom: 0, left: 0, right: 0, height: '38%', zIndex: 2,
        overflow: 'hidden',
      }}>
        {/* Polished marble surface */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(220,212,196,0.18) 0%, rgba(200,190,172,0.32) 45%, rgba(178,165,142,0.52) 100%)',
        }} />
        {/* Perspective grid */}
        <FloorGrid width={1440} height={400} />
        {/* Floor reflection shimmer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,252,240,0.1) 35%, rgba(255,252,240,0.18) 50%, rgba(255,252,240,0.1) 65%, transparent 100%)',
        }} />
      </div>

      {/* ═══════════════════════════════════════════
          CHANDELIER — The primary light source
      ═══════════════════════════════════════════ */}

      {/* Chandelier fixture */}
      <div className="absolute pointer-events-none flex justify-center" style={{
        top: 0, left: 0, right: 0, zIndex: 5,
      }}>
        <div style={{ transform: 'translateY(-18px)' }}>
          <CrystalChandelier />
        </div>
      </div>

      {/* Primary chandelier light cone — tight, dramatic */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '100vh',
        background: [
          'radial-gradient(ellipse 28% 55% at 50% 0%, rgba(255,248,195,0.72) 0%, rgba(255,244,185,0.35) 10%, rgba(255,246,200,0.12) 28%, transparent 50%)',
        ].join(', '),
        zIndex: 3,
      }} />

      {/* Chandelier ambient halo — wide, soft fill */}
      <div className="absolute pointer-events-none" style={{
        top: '-40px', left: '50%', transform: 'translateX(-50%)',
        width: '1200px', height: '600px',
        background: 'radial-gradient(ellipse 80% 80% at 50% 5%, rgba(255,250,220,0.28) 0%, rgba(255,248,210,0.1) 35%, transparent 62%)',
        zIndex: 3,
      }} />

      {/* ═══════════════════════════════════════════
          ARCHITECTURAL COLUMNS / PILASTERS
      ═══════════════════════════════════════════ */}

      {/* Left pilaster */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '5%', bottom: 0, width: '28px', zIndex: 4,
        background: 'linear-gradient(90deg, rgba(148,132,108,0.38) 0%, rgba(188,174,152,0.18) 60%, transparent 100%)',
      }} />
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '5%', width: '2px', height: '100%', zIndex: 4,
        background: 'linear-gradient(180deg, rgba(255,252,240,0.55) 0%, rgba(220,210,188,0.3) 50%, rgba(168,152,124,0.45) 100%)',
      }} />

      {/* Right pilaster */}
      <div className="absolute pointer-events-none" style={{
        top: 0, right: '5%', bottom: 0, width: '28px', zIndex: 4,
        background: 'linear-gradient(270deg, rgba(148,132,108,0.38) 0%, rgba(188,174,152,0.18) 60%, transparent 100%)',
      }} />
      <div className="absolute pointer-events-none" style={{
        top: 0, right: '5%', width: '2px', height: '100%', zIndex: 4,
        background: 'linear-gradient(180deg, rgba(255,252,240,0.55) 0%, rgba(220,210,188,0.3) 50%, rgba(168,152,124,0.45) 100%)',
      }} />

      {/* ═══════════════════════════════════════════
          CRYSTAL PARTICLES
      ═══════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
        <ParticleField />
      </div>

      {/* ═══════════════════════════════════════════
          ENVIRONMENTAL ROSE ARRANGEMENTS
      ═══════════════════════════════════════════ */}
      <div className="absolute pointer-events-none" style={{
        left: '7.5%', bottom: '28%', width: '120px', zIndex: 5,
        transform: 'rotate(-12deg)',
        opacity: 0.65,
        filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.14)) drop-shadow(0 0 20px rgba(200,28,36,0.08))',
        animation: 'roseSway 8s ease-in-out infinite',
      }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%' }} />
      </div>
      <div className="absolute pointer-events-none" style={{
        right: '7.5%', bottom: '28%', width: '120px', zIndex: 5,
        transform: 'rotate(12deg) scaleX(-1)',
        opacity: 0.6,
        filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.14)) drop-shadow(0 0 20px rgba(200,28,36,0.08))',
        animation: 'roseSway 9s ease-in-out infinite 1.5s',
      }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%' }} />
      </div>

      {/* ═══════════════════════════════════════════
          TITLE PLACARD — Brand presence
          Anchored above the exhibit
      ═══════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-none text-center"
        style={{
          top: '138px', left: 0, right: 0, zIndex: 10,
          ...floatIn(200, 20),
        }}
      >
        <div style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '13px',
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          color: '#C81C24',
          lineHeight: 1,
          textShadow: [
            '0 0 20px rgba(200,28,36,0.35)',
            '0 0 48px rgba(200,28,36,0.18)',
            '0 0 80px rgba(200,28,36,0.1)',
          ].join(', '),
        }}>
          FRONTAL SLAYER
        </div>
        <div style={{
          fontFamily: '"Futura PT Book"',
          fontSize: '8.5px',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: '#9A8868',
          marginTop: '8px',
          lineHeight: 1,
        }}>
          LUXURY WITHOUT LIMITS
        </div>
        {/* Diamond divider */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, transparent, rgba(154,136,104,0.4))' }} />
          <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: '#9A8868', opacity: 0.5 }} />
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, rgba(154,136,104,0.4), transparent)' }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SHOWROOM FLOOR PLAN
          LEFT: Design Console
          CENTER: The Museum Exhibit
          RIGHT: Concierge Kiosk
      ═══════════════════════════════════════════ */}
      <div
        className="relative flex items-end justify-center"
        style={{
          zIndex: 12,
          paddingTop: '200px',
          paddingBottom: '56px',
          paddingLeft: '7%',
          paddingRight: '7%',
          gap: '40px',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* LEFT — Acrylic Design Console */}
        <div style={{
          width: '268px',
          flexShrink: 0,
          alignSelf: 'center',
          filter: 'drop-shadow(0 60px 90px rgba(0,0,0,0.14))',
          ...floatIn(400, 36),
        }}>
          <BuildAWigPanel />
        </div>

        {/* CENTER — The Museum Exhibit */}
        <div
          className="flex flex-col items-center"
          style={{
            flex: 1,
            minWidth: 0,
            alignSelf: 'flex-end',
            ...floatIn(120, 24),
          }}
        >
          <WigPedestalDisplay />
        </div>

        {/* RIGHT — Concierge Kiosk */}
        <div style={{
          width: '268px',
          flexShrink: 0,
          alignSelf: 'center',
          filter: 'drop-shadow(0 60px 90px rgba(0,0,0,0.14))',
          ...floatIn(560, 36),
        }}>
          <PSAConciergePanel />
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DesktopLobbyPage() {
  const [isTooSmall, setIsTooSmall] = useState(false);

  useEffect(() => {
    const check = () => setIsTooSmall(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isTooSmall) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#FAF8F7', padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', letterSpacing: '0.3em', color: '#C81C24', marginBottom: '16px' }}>
          FRONTAL SLAYER
        </div>
        <div style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', letterSpacing: '0.06em', color: '#4A3728', maxWidth: '280px', lineHeight: 1.7 }}>
          The Digital Flagship is designed for desktop viewing. Please visit on a device with a wider screen for the full luxury experience.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#1A1714', minHeight: '100vh' }}>
      <NavBar activeLink="HOME" />
      <ZoneArrival />
      <ZonePortals />
      <ZoneLoungeReveal />
    </div>
  );
}
