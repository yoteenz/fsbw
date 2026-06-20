import { useState, useEffect } from 'react';
import { NavBar } from '../../components/desktop-lobby/NavBar';
import { ParticleField } from '../../components/desktop-lobby/ParticleField';
import { WigPedestalDisplay } from '../../components/desktop-lobby/WigPedestalDisplay';
import { BuildAWigPanel } from '../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../components/desktop-lobby/PSAConciergePanel';
import { ZonePortals } from '../../components/desktop-lobby/ZonePortals';
import { ZoneLoungeReveal } from '../../components/desktop-lobby/ZoneLoungeReveal';

// ─── Zone 1 — The Arrival ────────────────────────────────────────────────────
function ZoneArrival() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: '100vh',
        // The room — marble is the dominant material, not a background image
        background: '#EDE5D8',
        backgroundImage: 'url(/assets/marble%20bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      {/* ═══════════════════════════════════════════════════
          ENVIRONMENT DEPTH SYSTEM
          Think: ceiling → midair → floor
      ═══════════════════════════════════════════════════ */}

      {/* Ceiling — warm architectural wash from above */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(255,252,240,0.82) 0%, rgba(255,250,238,0.42) 16%, rgba(255,255,255,0) 38%)',
        zIndex: 1,
      }} />

      {/* Floor — polished marble, warmth from below */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(0deg, rgba(245,236,220,0.62) 0%, rgba(248,240,226,0.28) 18%, rgba(255,255,255,0) 35%)',
        zIndex: 1,
      }} />

      {/* Side walls — architectural vignette creating a room boundary */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(90deg, rgba(220,208,192,0.62) 0%, rgba(228,218,204,0.22) 10%, transparent 20%, transparent 80%, rgba(228,218,204,0.22) 90%, rgba(220,208,192,0.62) 100%)',
        zIndex: 1,
      }} />

      {/* Marble surface tint — preserves texture visibility */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'rgba(255,251,244,0.12)',
        zIndex: 1,
      }} />

      {/* ═══════════════════════════════════════════════════
          CHANDELIER — THE PRIMARY LIGHT SOURCE
          A single dominant cone of warm light from the ceiling
          illuminates the center exhibit below
      ═══════════════════════════════════════════════════ */}

      {/* Primary chandelier beam */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '1100px', height: '680px',
        background: 'radial-gradient(ellipse 42% 60% at 50% 0%, rgba(255,246,210,0.92) 0%, rgba(255,244,202,0.65) 10%, rgba(255,246,215,0.3) 30%, rgba(255,248,225,0.1) 52%, transparent 68%)',
        zIndex: 2,
      }} />
      {/* Soft ambient fill — fills the upper vault */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '2000px', height: '380px',
        background: 'radial-gradient(ellipse 85% 100% at 50% 0%, rgba(255,250,228,0.38) 0%, transparent 68%)',
        zIndex: 2,
      }} />

      {/* ═══════════════════════════════════════════════════
          PERSPECTIVE FLOOR PLANE
          Creates the illusion of depth — you are STANDING
          in this space, looking toward the exhibit
      ═══════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden" style={{ height: '220px', zIndex: 2 }}>
        {/* Polished marble floor surface */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '220px',
          background: 'linear-gradient(0deg, rgba(232,222,206,0.6) 0%, rgba(240,230,215,0.2) 60%, transparent 100%)',
        }} />
        {/* Floor reflection lines — perspective lines converging to center */}
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', opacity: 0.15 }}
        >
          {[...Array(7)].map((_, i) => {
            const x = 120 + i * 200;
            return (
              <line key={i} x1={720} y1={0} x2={x} y2={220}
                stroke="rgba(160,145,128,0.8)" strokeWidth="0.8" />
            );
          })}
        </svg>
      </div>

      {/* ═══════════════════════════════════════════════════
          ARCHITECTURAL PILASTERS
      ═══════════════════════════════════════════════════ */}
      <div className="absolute top-0 bottom-0 left-0 pointer-events-none" style={{
        width: '64px', zIndex: 3,
        background: 'linear-gradient(90deg, rgba(215,204,188,0.72) 0%, rgba(225,215,202,0.32) 55%, transparent 100%)',
        borderRight: '1px solid rgba(255,255,255,0.42)',
      }} />
      <div className="absolute pointer-events-none" style={{ top: '68px', left: 0, width: '64px', height: '1px', background: 'linear-gradient(90deg, rgba(190,178,162,0.95) 0%, transparent 100%)', zIndex: 3 }} />

      <div className="absolute top-0 bottom-0 right-0 pointer-events-none" style={{
        width: '64px', zIndex: 3,
        background: 'linear-gradient(270deg, rgba(215,204,188,0.72) 0%, rgba(225,215,202,0.32) 55%, transparent 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.42)',
      }} />
      <div className="absolute pointer-events-none" style={{ top: '68px', right: 0, width: '64px', height: '1px', background: 'linear-gradient(270deg, rgba(190,178,162,0.95) 0%, transparent 100%)', zIndex: 3 }} />

      {/* ═══════════════════════════════════════════════════
          CRYSTAL PARTICLES
      ═══════════════════════════════════════════════════ */}
      <div className="absolute inset-0" style={{ zIndex: 4 }}>
        <ParticleField />
      </div>

      {/* ═══════════════════════════════════════════════════
          ROSE ARRANGEMENTS — environmental dressing
      ═══════════════════════════════════════════════════ */}
      <div className="absolute left-0 bottom-0 pointer-events-none" style={{
        width: '260px', transform: 'translateX(-50px) translateY(24px)', zIndex: 5, opacity: 0.62,
        animation: 'roseSway 12s ease-in-out infinite',
      }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%', transform: 'scaleX(-1)', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.1))' }} />
      </div>
      <div className="absolute right-0 bottom-0 pointer-events-none" style={{
        width: '280px', transform: 'translateX(55px) translateY(16px)', zIndex: 5, opacity: 0.56,
        animation: 'roseSway 10s ease-in-out infinite reverse',
      }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.1))' }} />
      </div>

      {/* ═══════════════════════════════════════════════════
          SHOWROOM FLOOR PLAN
          Left: Design Console — Center: The Exhibit — Right: Concierge Kiosk
          The exhibit dominates at ~50% of available width
      ═══════════════════════════════════════════════════ */}
      <div
        className="relative flex items-stretch"
        style={{
          minHeight: '100vh',
          paddingTop: '80px',
          paddingBottom: '48px',
          paddingLeft: '80px',
          paddingRight: '80px',
          gap: '32px',
          zIndex: 10,
        }}
      >
        {/* LEFT — Design Console */}
        <div
          className="flex-shrink-0 self-center"
          style={{
            width: '228px',
            transform: visible ? 'translateX(0) translateY(0)' : 'translateX(-32px) translateY(0)',
            opacity: visible ? 1 : 0,
            transition: 'transform 1.1s 0s cubic-bezier(0.16,1,0.3,1), opacity 1s 0s ease',
            // Panels float above the floor — slight bottom shadow
            filter: 'drop-shadow(0 32px 48px rgba(0,0,0,0.12))',
          }}
        >
          <BuildAWigPanel />
        </div>

        {/* CENTER — The Exhibit (museum quality, 40-50% of layout) */}
        <div
          className="flex-1 flex flex-col items-center justify-center"
          style={{
            minWidth: 0,
            transform: visible ? 'translateY(0)' : 'translateY(32px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 1.1s 0.1s cubic-bezier(0.16,1,0.3,1), opacity 1s 0.1s ease',
          }}
        >
          {/* Exhibit title placard — architectural label, not a heading */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '36px',
              transform: visible ? 'translateY(0)' : 'translateY(-16px)',
              opacity: visible ? 1 : 0,
              transition: 'transform 1.1s 0.05s cubic-bezier(0.16,1,0.3,1), opacity 1s 0.05s ease',
            }}
          >
            <div style={{
              fontFamily: '"Futura PT Book"', fontSize: '8px',
              letterSpacing: '0.45em', textTransform: 'uppercase',
              color: '#A08860', marginBottom: '10px',
            }}>
              ── WELCOME TO ──
            </div>
            <div style={{
              fontFamily: '"Futura PT Medium"', fontSize: '46px',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#1A1A1A', lineHeight: 1,
            }}>
              FRONTAL{' '}
              <span style={{ color: '#C81C24' }}>SLAYER</span>
            </div>
            <div style={{
              fontFamily: '"Futura PT Book"', fontSize: '9px',
              letterSpacing: '0.32em', textTransform: 'uppercase',
              color: '#A08860', marginTop: '10px',
            }}>
              THE DIGITAL FLAGSHIP
            </div>
          </div>

          {/* The exhibit itself */}
          <WigPedestalDisplay />
        </div>

        {/* RIGHT — Concierge Kiosk */}
        <div
          className="flex-shrink-0 self-center"
          style={{
            width: '228px',
            transform: visible ? 'translateX(0) translateY(0)' : 'translateX(32px) translateY(0)',
            opacity: visible ? 1 : 0,
            transition: 'transform 1.1s 0.04s cubic-bezier(0.16,1,0.3,1), opacity 1s 0.04s ease',
            filter: 'drop-shadow(0 32px 48px rgba(0,0,0,0.12))',
          }}
        >
          <PSAConciergePanel />
        </div>
      </div>
    </section>
  );
}

// ─── Page Shell ──────────────────────────────────────────────────────────────
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
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: '#FAF8F7', fontFamily: '"Futura PT Medium"' }}
      >
        <div className="text-center px-8">
          <div className="text-2xl tracking-[0.08em] uppercase mb-2" style={{ color: '#1A1A1A' }}>
            FRONTAL <span style={{ color: '#C81C24' }}>SLAYER</span>
          </div>
          <div className="text-sm tracking-[0.06em] uppercase" style={{ color: '#959B9B' }}>
            The Desktop Flagship requires a minimum 1024px viewport.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: '"Futura PT Book"', background: '#FFFFFF', overflowX: 'hidden', minHeight: '100vh' }}
    >
      <NavBar activeLink="HOME" />
      <ZoneArrival />
      <ZonePortals />
      <ZoneLoungeReveal />
    </div>
  );
}
