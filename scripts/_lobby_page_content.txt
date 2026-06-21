import { useState, useEffect } from 'react';
import { NavBar } from '../../components/desktop-lobby/NavBar';
import { ParticleField } from '../../components/desktop-lobby/ParticleField';
import { WigPedestalDisplay } from '../../components/desktop-lobby/WigPedestalDisplay';
import { BuildAWigPanel } from '../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../components/desktop-lobby/PSAConciergePanel';
import { ZonePortals } from '../../components/desktop-lobby/ZonePortals';
import { ZoneLoungeReveal } from '../../components/desktop-lobby/ZoneLoungeReveal';

const LOBBY_BG = 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/IMG_3528.png';
const FALLBACK_BG = '/assets/marble%20bg.png';

function ZoneArrival() {
  const [visible, setVisible] = useState(false);
  const [bgSrc, setBgSrc] = useState(LOBBY_BG);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.onerror = () => setBgSrc(FALLBACK_BG);
    img.src = LOBBY_BG;
  }, []);

  const floatIn = (delayMs: number, dy = 32) => ({
    transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${dy}px)`,
  });

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Locked flagship environment — do not replace */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${bgSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Edge vignette — frames the space */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 52%, rgba(0,0,0,0.24) 100%)',
        zIndex: 1,
      }} />
      {/* NavBar gradient support */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 14%, transparent 30%)',
        zIndex: 1,
      }} />
      {/* Particle field */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <ParticleField />
      </div>

      {/* Brand lock-up */}
      <div
        className="absolute pointer-events-none text-center"
        style={{ top: '138px', left: 0, right: 0, zIndex: 10, ...floatIn(200, 20) }}
      >
        <div style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '15px',
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          color: '#C81C24',
          lineHeight: 1,
          textShadow: '0 0 20px rgba(200,28,36,0.6), 0 0 48px rgba(200,28,36,0.32), 0 0 80px rgba(200,28,36,0.16), 0 2px 8px rgba(0,0,0,0.55)',
        }}>
          FRONTAL SLAYER
        </div>
        <div style={{
          fontFamily: '"Futura PT Book"',
          fontSize: '8.5px',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.96)',
          marginTop: '8px',
          lineHeight: 1,
          textShadow: '0 0 14px rgba(255,255,255,0.7), 0 0 28px rgba(255,255,255,0.35), 0 1px 4px rgba(0,0,0,0.45)',
        }}>
          LUXURY WITHOUT LIMITS
        </div>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65))' }} />
          <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: 'rgba(255,255,255,0.85)' }} />
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, rgba(255,255,255,0.65), transparent)' }} />
        </div>
      </div>

      {/* Floating overlay system — acrylic panels above environment */}
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
        <div style={{
          width: '268px', flexShrink: 0, alignSelf: 'center',
          filter: 'drop-shadow(0 60px 90px rgba(0,0,0,0.3))',
          ...floatIn(400, 36),
        }}>
          <BuildAWigPanel />
        </div>
        <div className="flex flex-col items-center" style={{
          flex: 1, minWidth: 0, alignSelf: 'flex-end',
          ...floatIn(120, 24),
        }}>
          <WigPedestalDisplay />
        </div>
        <div style={{
          width: '268px', flexShrink: 0, alignSelf: 'center',
          filter: 'drop-shadow(0 60px 90px rgba(0,0,0,0.3))',
          ...floatIn(560, 36),
        }}>
          <PSAConciergePanel />
        </div>
      </div>
    </section>
  );
}

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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF8F7', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', letterSpacing: '0.3em', color: '#C81C24', marginBottom: '16px' }}>
          FRONTAL SLAYER
        </div>
        <div style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', letterSpacing: '0.06em', color: '#4A3728', maxWidth: '280px', lineHeight: 1.7 }}>
          The Digital Flagship is designed for desktop viewing. Please visit on a device with a wider screen for the full experience.
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <NavBar activeLink="HOME" />
      <ZoneArrival />
      <ZonePortals />
      <ZoneLoungeReveal />
    </div>
  );
}
