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
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  const floatIn = (delay: string, dx = 0, dy = 24) => ({
    transform: visible ? 'translate(0,0)' : `translate(${dx}px,${dy}px)`,
    opacity: visible ? 1 : 0,
    transition: `transform 1s ${delay} cubic-bezier(0.16,1,0.3,1), opacity 0.9s ${delay} ease`,
  });

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: '100vh',
        // Marble environment — visible and rich, NOT bleached
        background: '#F5EFE8',
        backgroundImage: 'url(/assets/marble%20bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'local',
      }}
    >
      {/* === DEPTH LAYER SYSTEM === */}

      {/* Layer 1: Very subtle warm tint — preserves marble visibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(255,252,246,0.18)', zIndex: 1 }}
      />

      {/* Layer 2: Ceiling atmospheric gradient — sense of architectural ceiling above */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,252,242,0.78) 0%, rgba(255,250,240,0.35) 14%, rgba(255,255,255,0) 36%)',
          zIndex: 2,
        }}
      />

      {/* Layer 3: Floor warmth — sense of polished marble floor below */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(0deg, rgba(248,242,234,0.52) 0%, rgba(255,255,255,0) 28%)',
          zIndex: 2,
        }}
      />

      {/* Layer 4: Side architectural vignette — frames the space like walls */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(228,218,206,0.55) 0%, rgba(235,226,216,0.18) 12%, transparent 22%, transparent 78%, rgba(235,226,216,0.18) 88%, rgba(228,218,206,0.55) 100%)',
          zIndex: 2,
        }}
      />

      {/* === CHANDELIER LIGHT SOURCE === */}

      {/* Primary chandelier cone — dominant warm beam from above center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '560px',
          background: 'radial-gradient(ellipse 52% 65% at 50% 0%, rgba(255,246,215,0.95) 0%, rgba(255,244,205,0.7) 12%, rgba(255,245,220,0.35) 32%, rgba(255,248,230,0.12) 55%, transparent 72%)',
          zIndex: 3,
        }}
      />

      {/* Secondary diffused ambient glow — fills the upper vault */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1800px',
          height: '340px',
          background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(255,250,232,0.42) 0%, transparent 70%)',
          zIndex: 3,
        }}
      />

      {/* === ARCHITECTURAL COLUMN ELEMENTS === */}

      {/* Left pilaster */}
      <div
        className="absolute top-0 bottom-0 left-0 pointer-events-none"
        style={{
          width: '72px',
          background: 'linear-gradient(90deg, rgba(222,212,200,0.65) 0%, rgba(228,220,210,0.28) 55%, transparent 100%)',
          borderRight: '1px solid rgba(255,255,255,0.45)',
          zIndex: 4,
        }}
      />
      {/* Left capital shadow */}
      <div
        className="absolute left-0 pointer-events-none"
        style={{ top: '68px', width: '72px', height: '1px', background: 'linear-gradient(90deg, rgba(195,183,168,0.9) 0%, transparent 100%)', zIndex: 4 }}
      />

      {/* Right pilaster */}
      <div
        className="absolute top-0 bottom-0 right-0 pointer-events-none"
        style={{
          width: '72px',
          background: 'linear-gradient(270deg, rgba(222,212,200,0.65) 0%, rgba(228,220,210,0.28) 55%, transparent 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.45)',
          zIndex: 4,
        }}
      />
      {/* Right capital shadow */}
      <div
        className="absolute right-0 pointer-events-none"
        style={{ top: '68px', width: '72px', height: '1px', background: 'linear-gradient(270deg, rgba(195,183,168,0.9) 0%, transparent 100%)', zIndex: 4 }}
      />

      {/* === CRYSTAL PARTICLE FIELD === */}
      <div className="absolute inset-0" style={{ zIndex: 5 }}>
        <ParticleField />
      </div>

      {/* === ROSE ARRANGEMENTS === */}
      <div
        className="absolute left-0 bottom-0 pointer-events-none"
        style={{ width: '280px', transform: 'translateX(-55px) translateY(28px)', zIndex: 6, opacity: 0.58 }}
      >
        <img src="/assets/roses.png" alt="" className="w-full" style={{ transform: 'scaleX(-1)' }} />
      </div>
      <div
        className="absolute right-0 bottom-0 pointer-events-none"
        style={{ width: '300px', transform: 'translateX(68px) translateY(18px)', zIndex: 6, opacity: 0.52 }}
      >
        <img src="/assets/roses.png" alt="" className="w-full" />
      </div>

      {/* === MAIN STAGE LAYOUT === */}
      <div
        className="relative flex items-center gap-8 px-16"
        style={{
          minHeight: '100vh',
          paddingTop: '88px',
          paddingBottom: '64px',
          zIndex: 10,
        }}
      >
        {/* LEFT — Build-A-Wig Panel: floats in from left */}
        <div
          className="flex-shrink-0 self-center"
          style={{ width: '264px', ...floatIn('0.05s', -28, 0) }}
        >
          <BuildAWigPanel />
        </div>

        {/* CENTER — The Showroom Stage */}
        <div
          className="flex-1 flex flex-col items-center justify-center"
          style={{ minWidth: 0, ...floatIn('0.15s', 0, 28) }}
        >
          {/* Venue title — architectural label, not a website header */}
          <div
            className="text-center mb-10"
            style={{
              transform: visible ? 'translateY(0)' : 'translateY(-16px)',
              opacity: visible ? 1 : 0,
              transition: 'transform 1s 0.05s cubic-bezier(0.16,1,0.3,1), opacity 0.9s 0.05s ease',
            }}
          >
            <div
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '9px',
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color: '#A89070',
                marginBottom: '10px',
              }}
            >
              ── WELCOME TO ──
            </div>
            <div
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '44px',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#1A1A1A',
                lineHeight: 1,
              }}
            >
              FRONTAL{' '}
              <span style={{ color: '#C81C24' }}>SLAYER</span>
            </div>
            <div
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '10px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#A89070',
                marginTop: '10px',
              }}
            >
              THE DIGITAL FLAGSHIP
            </div>
          </div>

          {/* The stage centerpiece */}
          <WigPedestalDisplay />
        </div>

        {/* RIGHT — PSA Concierge Panel: floats in from right */}
        <div
          className="flex-shrink-0 self-center"
          style={{ width: '264px', ...floatIn('0.08s', 28, 0) }}
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
      className="min-h-screen"
      style={{ fontFamily: '"Futura PT Book"', background: '#FFFFFF', overflowX: 'hidden' }}
    >
      <NavBar activeLink="HOME" />
      <ZoneArrival />
      <ZonePortals />
      <ZoneLoungeReveal />
    </div>
  );
}
