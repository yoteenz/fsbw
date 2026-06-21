import { useState, useEffect } from 'react';
import { NavBar } from '../../components/desktop-lobby/NavBar';
import { getDesktopLayoutViewportWidth, desktopArtboardHeightStyle, isDesktopArtboardLayoutActive } from '../../utils/desktopPreview';
import { ParticleField } from '../../components/desktop-lobby/ParticleField';
import { BuildAWigPanel } from '../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../components/desktop-lobby/PSAConciergePanel';
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

  const floatIn = (delayMs: number, dy = 24) => ({
    transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${dy}px)`,
  });

  return (
    <section style={{ position: 'relative', height: desktopArtboardHeightStyle(), overflow: 'hidden', background: '#ECE8E4' }}>

      {/* Marble underlay — fills any crop edges from cover */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(/assets/marble%20bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }} />

      {/* ENVIRONMENT — edge-to-edge under nav (cover, no letterbox bars) */}
      <img
        src={bgSrc}
        alt=""
        onError={() => setBgSrc(FALLBACK_BG)}
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          display: 'block',
        }}
      />

      {/* Edge vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 130% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.12) 100%)',
      }} />

      {/* Bottom anchor gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '38%',
        zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.1) 40%, transparent 100%)',
      }} />

      {/* Particle field */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
        <ParticleField />
      </div>

      {/* LEFT PANEL — Build-A-Wig Studio */}
      <div style={{
        position: 'absolute', bottom: '12vh', left: '6%',
        zIndex: 30,
        filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.3))',
        ...floatIn(400, 32),
      }}>
        <BuildAWigPanel />
      </div>

      {/* RIGHT PANEL — PSA Concierge */}
      <div style={{
        position: 'absolute', bottom: '12vh', right: '6%',
        zIndex: 30,
        filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.3))',
        ...floatIn(560, 32),
      }}>
        <PSAConciergePanel />
      </div>

    </section>
  );
}

export default function DesktopLobbyPage() {
  const [isTooSmall, setIsTooSmall] = useState(() => getDesktopLayoutViewportWidth() < 1024);

  useEffect(() => {
    const check = () => setIsTooSmall(getDesktopLayoutViewportWidth() < 1024);
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
          THE DIGITAL FLAGSHIP IS DESIGNED FOR DESKTOP VIEWING. PLEASE VISIT ON A DEVICE WITH A WIDER SCREEN FOR THE FULL EXPERIENCE.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#ECE8E4',
        ...(isDesktopArtboardLayoutActive() ? {} : { minHeight: '100vh' }),
      }}
    >
      <NavBar activeLink="HOME" />
      <DigitalLobby />
      <ZoneLoungeReveal />
    </div>
  );
}
