import React, { useState, useEffect, useRef } from 'react';
import { NavBar } from '../../components/desktop-lobby/NavBar';
import { ParticleField } from '../../components/desktop-lobby/ParticleField';
import { WigPedestalDisplay } from '../../components/desktop-lobby/WigPedestalDisplay';
import { BuildAWigPanel } from '../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../components/desktop-lobby/PSAConciergePanel';
import { LobbyFeaturesSidebar } from '../../components/desktop-lobby/LobbyFeaturesSidebar';
import { ZonePortals } from '../../components/desktop-lobby/ZonePortals';
import { ZoneLoungeReveal } from '../../components/desktop-lobby/ZoneLoungeReveal';

// Zone 1 — The Arrival
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
        paddingTop: '80px',
        paddingBottom: '40px',
        background: '#FFFFFF',
        backgroundImage: 'url(/assets/marble%20bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* White marble overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.78)' }}
      />

      {/* Chandelier ambient light */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: '600px',
          height: '300px',
          background: 'radial-gradient(ellipse at center top, rgba(255,248,235,0.55) 0%, transparent 70%)',
        }}
      />

      {/* Crystal particle field */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        <ParticleField />
      </div>

      {/* Rose decorations */}
      <div
        className="absolute left-0 bottom-0 pointer-events-none"
        style={{ width: '220px', transform: 'translateX(-40px) translateY(20px)', zIndex: 3, opacity: 0.45 }}
      >
        <img src="/assets/roses.png" alt="" className="w-full" style={{ transform: 'scaleX(-1)' }} />
      </div>
      <div
        className="absolute right-0 bottom-0 pointer-events-none"
        style={{ width: '240px', transform: 'translateX(50px) translateY(10px)', zIndex: 3, opacity: 0.4 }}
      >
        <img src="/assets/roses.png" alt="" className="w-full" />
      </div>

      {/* Main 3-column layout */}
      <div
        className="relative z-10 flex items-stretch gap-6 px-8"
        style={{ minHeight: 'calc(100vh - 160px)' }}
      >
        {/* Left — Build-A-Wig Panel */}
        <div
          className="flex-shrink-0"
          style={{
            width: '280px',
            transform: visible ? 'translateX(0)' : 'translateX(-28px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.7s ease',
          }}
        >
          <BuildAWigPanel />
        </div>

        {/* Center — Wig Pedestal */}
        <div
          className="flex-1 flex flex-col items-center justify-center"
          style={{
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.7s 0.1s cubic-bezier(0.16,1,0.3,1), opacity 0.7s 0.1s ease',
          }}
        >
          {/* Welcome text */}
          <div className="text-center mb-6">
            <div
              className="text-[10px] tracking-[0.3em] uppercase mb-2"
              style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
            >
              WELCOME TO
            </div>
            <div
              className="text-4xl tracking-[0.08em] uppercase"
              style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A', lineHeight: 1.1 }}
            >
              FRONTAL{' '}
              <span style={{ color: '#C81C24' }}>SLAYER</span>
            </div>
            <div
              className="text-xs tracking-[0.22em] uppercase mt-2"
              style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
            >
              THE FUTURE OF BEAUTY IS YOU
            </div>
          </div>

          <WigPedestalDisplay />
        </div>

        {/* Right — PSA Concierge Panel */}
        <div
          className="flex-shrink-0"
          style={{
            width: '280px',
            transform: visible ? 'translateX(0)' : 'translateX(28px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.7s ease',
          }}
        >
          <PSAConciergePanel />
        </div>

        {/* Right sidebar — Lobby Features (fixed to right edge) */}
        <div
          className="flex-shrink-0"
          style={{
            transform: visible ? 'translateX(0)' : 'translateX(16px)',
            opacity: visible ? 1 : 0,
            transition: 'transform 0.7s 0.15s cubic-bezier(0.16,1,0.3,1), opacity 0.7s 0.15s ease',
          }}
        >
          <LobbyFeaturesSidebar />
        </div>
      </div>
    </section>
  );
}

export default function DesktopLobbyPage() {
  // Enforce minimum 1024px
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
      style={{
        fontFamily: '"Futura PT Book"',
        background: '#FFFFFF',
        overflowX: 'hidden',
      }}
    >
      <NavBar activeLink="HOME" />

      {/* Zone 1 — The Arrival */}
      <ZoneArrival />

      {/* Zone 2 — The Portals */}
      <ZonePortals />

      {/* Zone 3 — The Lounge Reveal */}
      <ZoneLoungeReveal />
    </div>
  );
}
