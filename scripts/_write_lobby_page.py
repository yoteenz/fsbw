#!/usr/bin/env python3
"""Writes src/pages/desktop-lobby/page.tsx as clean UTF-8."""
import os, sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
TARGET = os.path.join(ROOT, 'src', 'pages', 'desktop-lobby', 'page.tsx')

CONTENT = r"""import { useState, useEffect } from 'react';
import { NavBar } from '../../components/desktop-lobby/NavBar';
import { ParticleField } from '../../components/desktop-lobby/ParticleField';
import { WigPedestalDisplay } from '../../components/desktop-lobby/WigPedestalDisplay';
import { BuildAWigPanel } from '../../components/desktop-lobby/BuildAWigPanel';
import { PSAConciergePanel } from '../../components/desktop-lobby/PSAConciergePanel';
import { ZonePortals } from '../../components/desktop-lobby/ZonePortals';
import { ZoneLoungeReveal } from '../../components/desktop-lobby/ZoneLoungeReveal';
import { DESKTOP_LOBBY_BG_URL, hasDesktopLobbyBg } from '../../constants/desktopLobbyEnv';

// ── Crystal Chandelier SVG (CSS fallback only — AI image has a real chandelier) ──────────
function CrystalChandelier() {
  return (
    <svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg" style={{ width: '360px', height: '180px', overflow: 'visible' }}>
      <ellipse cx="180" cy="6" rx="28" ry="6" fill="rgba(215,205,185,0.85)" />
      <ellipse cx="180" cy="5" rx="18" ry="4" fill="rgba(240,232,215,0.9)" />
      <line x1="180" y1="10" x2="180" y2="52" stroke="rgba(195,180,152,0.8)" strokeWidth="2.5" />
      <rect x="175" y="20" width="10" height="4" rx="1" fill="rgba(220,210,188,0.8)" />
      <rect x="176" y="30" width="8" height="4" rx="1" fill="rgba(215,205,185,0.75)" />
      <ellipse cx="180" cy="64" rx="18" ry="8" fill="rgba(255,252,245,0.85)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
      <rect x="162" y="62" width="36" height="22" rx="2" fill="rgba(255,253,247,0.72)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
      <ellipse cx="180" cy="86" rx="18" ry="7" fill="rgba(252,248,238,0.88)" stroke="rgba(255,255,255,0.65)" strokeWidth="0.8" />
      <ellipse cx="180" cy="74" rx="12" ry="8" fill="rgba(255,244,190,0.5)" />
      <line x1="80" y1="90" x2="280" y2="90" stroke="rgba(205,192,168,0.7)" strokeWidth="1.8" />
      {[80, 108, 144, 216, 252, 280].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="92" x2={x} y2={108 + (i % 3) * 5} stroke="rgba(195,183,162,0.55)" strokeWidth="0.9" />
          <ellipse cx={x} cy={114 + (i % 3) * 5} rx="5" ry="8" fill="rgba(255,252,242,0.78)" stroke="rgba(255,255,255,0.65)" strokeWidth="0.6" />
        </g>
      ))}
      {[128, 160, 200, 232].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="92" x2={x} y2="102" stroke="rgba(195,183,162,0.45)" strokeWidth="0.8" />
          <ellipse cx={x} cy="108" rx="4" ry="6.5" fill="rgba(255,252,242,0.7)" stroke="rgba(255,255,255,0.58)" strokeWidth="0.5" />
        </g>
      ))}
      <line x1="180" y1="92" x2="180" y2="118" stroke="rgba(195,183,162,0.6)" strokeWidth="1.2" />
      <ellipse cx="180" cy="128" rx="8" ry="12" fill="rgba(255,253,245,0.82)" stroke="rgba(255,255,255,0.72)" strokeWidth="0.8" />
      <ellipse cx="180" cy="95" rx="90" ry="40" fill="rgba(255,244,190,0.12)" />
    </svg>
  );
}

// ── Perspective floor grid (CSS fallback only) ───────────────────────────────
function FloorGrid({ width, height }: { width: number; height: number }) {
  const cx = width / 2;
  const lines: JSX.Element[] = [];
  for (let i = 0; i < 10; i++) {
    const t = Math.pow(i / 9, 1.7);
    const y = t * height;
    const opacity = 0.08 + t * 0.14;
    lines.push(<line key={'h' + i} x1={0} y1={y} x2={width} y2={y} stroke={`rgba(160,145,120,${opacity})`} strokeWidth="0.8" />);
  }
  const count = 14;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const xBottom = t * width;
    const xTop = cx + (xBottom - cx) * 0.2;
    const opacity = 0.06 + Math.abs(t - 0.5) * 0.16;
    lines.push(<line key={'v' + i} x1={xTop} y1={0} x2={xBottom} y2={height} stroke={`rgba(160,145,120,${opacity})`} strokeWidth="0.8" />);
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {lines}
    </svg>
  );
}

// ── Shared panel + exhibit layout ────────────────────────────────────────────
function ShowroomFloorPlan({ floatIn }: { floatIn: (delayMs: number, dy?: number) => object }) {
  return (
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
      <div style={{ width: '268px', flexShrink: 0, alignSelf: 'center', filter: 'drop-shadow(0 60px 90px rgba(0,0,0,0.22))', ...floatIn(400, 36) }}>
        <BuildAWigPanel />
      </div>

      {/* CENTER — The Museum Exhibit */}
      <div className="flex flex-col items-center" style={{ flex: 1, minWidth: 0, alignSelf: 'flex-end', ...floatIn(120, 24) }}>
        <WigPedestalDisplay />
      </div>

      {/* RIGHT — Concierge Kiosk */}
      <div style={{ width: '268px', flexShrink: 0, alignSelf: 'center', filter: 'drop-shadow(0 60px 90px rgba(0,0,0,0.22))', ...floatIn(560, 36) }}>
        <PSAConciergePanel />
      </div>
    </div>
  );
}

// ── Zone 1 — The Arrival Showroom ────────────────────────────────────────────
function ZoneArrival() {
  const [visible, setVisible] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Pre-load the AI background so we can cross-fade it in smoothly
  useEffect(() => {
    if (!hasDesktopLobbyBg || !DESKTOP_LOBBY_BG_URL) return;
    const img = new Image();
    img.onload = () => setBgLoaded(true);
    img.src = DESKTOP_LOBBY_BG_URL;
  }, []);

  const floatIn = (delayMs: number, dy = 32) => ({
    transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 1.2s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${dy}px)`,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // LIVE MODE — AI-generated photorealistic showroom as the environment stage
  // Activates automatically when VITE_DESKTOP_LOBBY_BG_URL is set.
  // Run: npm run lobby:generate-desktop-bg  then add URL to .env.local + Vercel.
  // ═══════════════════════════════════════════════════════════════════════════
  if (hasDesktopLobbyBg && DESKTOP_LOBBY_BG_URL) {
    return (
      <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
        {/* The environment stage — full-bleed photorealistic showroom */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${DESKTOP_LOBBY_BG_URL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            transition: 'opacity 1.4s ease',
            opacity: bgLoaded ? 1 : 0,
            zIndex: 0,
          }}
        />
        {/* Loading placeholder — warm marble warmth while image loads */}
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(165deg, #EDE5D8 0%, #E4D9C8 35%, #D8CDBF 65%, #CCBEAD 100%)',
            transition: 'opacity 1.4s ease',
            opacity: bgLoaded ? 0 : 1,
            zIndex: 0,
          }}
        />
        {/* Subtle vignette — frames the space, anchors the floating panels */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(0,0,0,0.18) 100%)', zIndex: 1 }} />
        {/* Warm ceiling wash — chandelier in the AI image gets a soft halo */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,250,230,0.28) 0%, rgba(255,248,215,0.06) 18%, transparent 36%)', zIndex: 1 }} />
        {/* Crystal particle overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          <ParticleField />
        </div>
        {/* Brand wordmark + tagline */}
        <div
          className="absolute pointer-events-none text-center"
          style={{ top: '138px', left: 0, right: 0, zIndex: 10, ...floatIn(200, 20) }}
        >
          <div style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '14px',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            color: '#C81C24',
            lineHeight: 1,
            textShadow: '0 0 20px rgba(200,28,36,0.5), 0 0 48px rgba(200,28,36,0.28), 0 0 80px rgba(200,28,36,0.14)',
          }}>
            FRONTAL SLAYER
          </div>
          <div style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '8.5px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.9)',
            marginTop: '8px',
            lineHeight: 1,
            textShadow: '0 0 14px rgba(255,255,255,0.6), 0 0 28px rgba(255,255,255,0.3)',
          }}>
            LUXURY WITHOUT LIMITS
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5))' }} />
            <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: 'rgba(255,255,255,0.7)' }} />
            <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, rgba(255,255,255,0.5), transparent)' }} />
          </div>
        </div>
        {/* Showroom floor plan — panels + exhibit float inside the real environment */}
        <ShowroomFloorPlan floatIn={floatIn} />
      </section>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CSS FALLBACK MODE — architectural environment rendered in CSS
  // Active until VITE_DESKTOP_LOBBY_BG_URL is configured.
  // To generate the real environment: npm run lobby:generate-desktop-bg
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: '100vh',
        background: '#E8DFD0',
        backgroundImage: 'url(/assets/marble%20bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      {/* Ceiling */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,252,238,0.78) 0%, rgba(255,250,230,0.35) 20%, transparent 45%)', zIndex: 1 }} />
      {/* Floor */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(0deg, rgba(178,164,138,0.52) 0%, rgba(200,188,166,0.24) 22%, transparent 44%)', zIndex: 1 }} />
      {/* Side walls */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(130,112,88,0.22) 0%, rgba(160,140,112,0.08) 14%, transparent 26%, transparent 74%, rgba(160,140,112,0.08) 86%, rgba(130,112,88,0.22) 100%)', zIndex: 1 }} />
      {/* Perspective floor */}
      <div className="absolute pointer-events-none" style={{ bottom: 0, left: 0, right: 0, height: '38%', zIndex: 2, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(220,212,196,0.18) 0%, rgba(200,190,172,0.32) 45%, rgba(178,165,142,0.52) 100%)' }} />
        <FloorGrid width={1440} height={400} />
      </div>
      {/* Chandelier SVG */}
      <div className="absolute pointer-events-none flex justify-center" style={{ top: 0, left: 0, right: 0, zIndex: 5 }}>
        <div style={{ transform: 'translateY(-18px)' }}><CrystalChandelier /></div>
      </div>
      {/* Chandelier light cone */}
      <div className="absolute pointer-events-none" style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: '800px', height: '100vh', background: 'radial-gradient(ellipse 28% 55% at 50% 0%, rgba(255,248,195,0.72) 0%, rgba(255,244,185,0.35) 10%, rgba(255,246,200,0.12) 28%, transparent 50%)', zIndex: 3 }} />
      <div className="absolute pointer-events-none" style={{ top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '1200px', height: '600px', background: 'radial-gradient(ellipse 80% 80% at 50% 5%, rgba(255,250,220,0.28) 0%, transparent 62%)', zIndex: 3 }} />
      {/* Left pilaster */}
      <div className="absolute pointer-events-none" style={{ top: 0, left: '5%', bottom: 0, width: '28px', zIndex: 4, background: 'linear-gradient(90deg, rgba(148,132,108,0.38) 0%, rgba(188,174,152,0.18) 60%, transparent 100%)' }} />
      <div className="absolute pointer-events-none" style={{ top: 0, left: '5%', width: '2px', height: '100%', zIndex: 4, background: 'linear-gradient(180deg, rgba(255,252,240,0.55) 0%, rgba(220,210,188,0.3) 50%, rgba(168,152,124,0.45) 100%)' }} />
      {/* Right pilaster */}
      <div className="absolute pointer-events-none" style={{ top: 0, right: '5%', bottom: 0, width: '28px', zIndex: 4, background: 'linear-gradient(270deg, rgba(148,132,108,0.38) 0%, rgba(188,174,152,0.18) 60%, transparent 100%)' }} />
      <div className="absolute pointer-events-none" style={{ top: 0, right: '5%', width: '2px', height: '100%', zIndex: 4, background: 'linear-gradient(180deg, rgba(255,252,240,0.55) 0%, rgba(220,210,188,0.3) 50%, rgba(168,152,124,0.45) 100%)' }} />
      {/* Crystal particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}><ParticleField /></div>
      {/* Environmental roses */}
      <div className="absolute pointer-events-none" style={{ left: '7.5%', bottom: '28%', width: '120px', zIndex: 5, transform: 'rotate(-12deg)', opacity: 0.65, filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.14))', animation: 'roseSway 8s ease-in-out infinite' }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%' }} />
      </div>
      <div className="absolute pointer-events-none" style={{ right: '7.5%', bottom: '28%', width: '120px', zIndex: 5, transform: 'rotate(12deg) scaleX(-1)', opacity: 0.6, filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.14))', animation: 'roseSway 9s ease-in-out infinite 1.5s' }}>
        <img src="/assets/roses.png" alt="" style={{ width: '100%' }} />
      </div>
      {/* Brand wordmark */}
      <div className="absolute pointer-events-none text-center" style={{ top: '138px', left: 0, right: 0, zIndex: 10, ...floatIn(200, 20) }}>
        <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '13px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#C81C24', lineHeight: 1, textShadow: '0 0 20px rgba(200,28,36,0.35), 0 0 48px rgba(200,28,36,0.18), 0 0 80px rgba(200,28,36,0.1)' }}>
          FRONTAL SLAYER
        </div>
        <div style={{ fontFamily: '"Futura PT Book"', fontSize: '8.5px', letterSpacing: '0.32em', textTransform: 'uppercase', color: '#9A8868', marginTop: '8px', lineHeight: 1 }}>
          LUXURY WITHOUT LIMITS
        </div>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, transparent, rgba(154,136,104,0.4))' }} />
          <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: '#9A8868', opacity: 0.5 }} />
          <div style={{ height: '1px', width: '48px', background: 'linear-gradient(90deg, rgba(154,136,104,0.4), transparent)' }} />
        </div>
      </div>
      {/* Showroom floor plan */}
      <ShowroomFloorPlan floatIn={floatIn} />
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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF8F7', padding: '40px 24px', textAlign: 'center' }}>
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
"""

out_path = os.path.normpath(TARGET)
with open(out_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(CONTENT)
print(f"Written {len(CONTENT)} chars to {out_path}")
