import { useState, useEffect } from 'react';
import { NavBar } from '../../components/desktop-lobby/NavBar';
import { ParticleField } from '../../components/desktop-lobby/ParticleField';
import { BuildAWigPanel } from '../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../components/desktop-lobby/PSAConciergePanel';
import { ZonePortals } from '../../components/desktop-lobby/ZonePortals';
import { ZoneLoungeReveal } from '../../components/desktop-lobby/ZoneLoungeReveal';

const LOBBY_BG = 'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/Desktop/IMG_3528.png';
const FALLBACK_BG = '/assets/marble%20bg.png';

function DigitalLobby() {
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

  const floatIn = (delayMs: number, dy = 24) => ({
    transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${dy}px)`,
  });

  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

      {/* ENVIRONMENT — locked flagship background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `url(${bgSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }} />

      {/* Edge vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 130% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.2) 100%)',
      }} />

      {/* NavBar gradient support */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.08) 12%, transparent 26%)',
      }} />

      {/* Bottom anchor gradient — floats panels above darkness */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '42%',
        zIndex: 1, pointerEvents: 'none',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)',
      }} />

      {/* Particle field */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        <ParticleField />
      </div>

      {/* BRAND LOCK-UP */}
      <div style={{
        position: 'absolute', top: '138px', left: 0, right: 0,
        zIndex: 20, textAlign: 'center', pointerEvents: 'none',
        ...floatIn(200, 16),
      }}>
        <div style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '15px',
          letterSpacing: '0.5em',
          textTransform: 'uppercase',
          color: '#C81C24',
          lineHeight: 1,
          textShadow: '0 0 20px rgba(200,28,36,0.65), 0 0 48px rgba(200,28,36,0.35), 0 0 80px rgba(200,28,36,0.18), 0 2px 8px rgba(0,0,0,0.55)',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55))' }} />
          <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: 'rgba(255,255,255,0.8)' }} />
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, rgba(255,255,255,0.55), transparent)' }} />
        </div>
      </div>

      {/* LEFT PANEL — Build-A-Wig Studio */}
      <div style={{
        position: 'absolute', bottom: '92px', left: '6%',
        zIndex: 30,
        filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.3))',
        ...floatIn(400, 32),
      }}>
        <BuildAWigPanel />
      </div>

      {/* RIGHT PANEL — PSA Concierge */}
      <div style={{
        position: 'absolute', bottom: '92px', right: '6%',
        zIndex: 30,
        filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.3))',
        ...floatIn(560, 32),
      }}>
        <PSAConciergePanel />
      </div>

      {/* BOTTOM NAV — Holographic portal strip */}
      <div style={{
        position: 'absolute', bottom: '22px', left: 0, right: 0,
        zIndex: 30,
        display: 'flex', justifyContent: 'center',
        ...floatIn(700, 18),
      }}>
        <ZonePortals />
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
      <DigitalLobby />
      <ZoneLoungeReveal />
    </div>
  );
}
