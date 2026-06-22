import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDesktopLayoutViewportWidth } from '../../../utils/desktopPreview';
import { NavBar } from '../../../components/desktop-lobby/NavBar';
import { ParticleField } from '../../../components/desktop-lobby/ParticleField';
import { DesktopElevatorPanel } from '../../../components/desktop-lobby/DesktopElevatorPanel';

import { DESKTOP_LOUNGE_BG_FALLBACK, DESKTOP_LOUNGE_BG_URL } from '../../../constants/desktopLobbyEnv';

// Acrylic panel used for lounge content blocks
function AcrylicBlock({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(44px) saturate(1.9) brightness(1.06)',
        WebkitBackdropFilter: 'blur(44px) saturate(1.9) brightness(1.06)',
        border: '1px solid rgba(255,255,255,0.52)',
        borderRadius: '4px',
        boxShadow: [
          'inset 0 2px 0 rgba(255,255,255,0.9)',
          'inset 3px 0 10px rgba(255,255,255,0.1)',
          '0 40px 80px rgba(0,0,0,0.16)',
          '0 12px 32px rgba(0,0,0,0.09)',
          '0 0 0 1px rgba(255,255,255,0.28)',
        ].join(', '),
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent 5%, rgba(255,255,255,1) 30%, rgba(255,255,255,1) 70%, transparent 95%)',
        zIndex: 20,
      }} />
      {/* Internal diagonal catch */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(148deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 30%, transparent 55%)',
        zIndex: 1,
      }} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  );
}

// Crystal rose accent
function RoseAccent({ right, delay = 0 }: { right?: boolean; delay?: number }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '14%',
      [right ? 'right' : 'left']: '4%',
      zIndex: 4,
      animation: `roseSway ${8 + delay}s ease-in-out infinite ${delay}s`,
      transform: right ? 'rotate(8deg) scaleX(-1)' : 'rotate(-8deg)',
      opacity: 0.72,
      filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.18))',
      pointerEvents: 'none',
    }}>
      <img src="/assets/roses.png" alt="" style={{ width: '100px' }} />
    </div>
  );
}

// Crystal diamond ornament
function CrystalDiamond({ size = 48, x, y, opacity = 0.55 }: { size?: number; x: string; y: string; opacity?: number }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size,
      transform: 'rotate(45deg)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(230,240,255,0.55) 40%, rgba(255,255,255,0.3) 100%)',
      border: '1px solid rgba(255,255,255,0.8)',
      boxShadow: '0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(200,220,255,0.2), inset 0 0 12px rgba(255,255,255,0.5)',
      opacity,
      zIndex: 3,
      pointerEvents: 'none',
      animation: 'pedestalPulse 4s ease-in-out infinite',
    }} />
  );
}

// Chandelier SVG — more intimate, lower scale
function LoungeChandelier() {
  return (
    <svg viewBox="0 0 280 140" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '280px', height: '140px', overflow: 'visible' }}>
      <ellipse cx="140" cy="5" rx="20" ry="5" fill="rgba(255,255,255,0.9)" />
      <line x1="140" y1="8" x2="140" y2="42" stroke="rgba(200,200,200,0.7)" strokeWidth="2" />
      <ellipse cx="140" cy="52" rx="14" ry="6" fill="rgba(255,255,255,0.88)" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
      <rect x="126" y="50" width="28" height="18" rx="2" fill="rgba(255,255,255,0.7)" stroke="rgba(255,255,255,0.6)" strokeWidth="0.7" />
      <ellipse cx="140" cy="70" rx="14" ry="5.5" fill="rgba(255,255,255,0.88)" />
      <ellipse cx="140" cy="60" rx="9" ry="7" fill="rgba(255,244,190,0.45)" />
      <line x1="60" y1="72" x2="220" y2="72" stroke="rgba(200,200,200,0.65)" strokeWidth="1.5" />
      {[60, 88, 120, 160, 192, 220].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="73" x2={x} y2={85 + (i % 3) * 4} stroke="rgba(180,180,180,0.5)" strokeWidth="0.8" />
          <ellipse cx={x} cy={91 + (i % 3) * 4} rx="4" ry="6.5" fill="rgba(255,255,255,0.82)" stroke="rgba(255,255,255,0.65)" strokeWidth="0.5" />
        </g>
      ))}
      {[104, 140, 176].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="73" x2={x} y2="82" stroke="rgba(180,180,180,0.4)" strokeWidth="0.7" />
          <ellipse cx={x} cy="87" rx="3.5" ry="5.5" fill="rgba(255,255,255,0.75)" stroke="rgba(255,255,255,0.58)" strokeWidth="0.5" />
        </g>
      ))}
      <ellipse cx="140" cy="74" rx="70" ry="28" fill="rgba(255,244,190,0.09)" />
    </svg>
  );
}

// Sofa shape using CSS
function CSSofa({ flipped, style }: { flipped?: boolean; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: 'relative',
      width: '340px',
      ...style,
      ...(flipped ? { transform: 'scaleX(-1)' } : {}),
    }}>
      {/* Back rest */}
      <div style={{
        height: '72px',
        background: 'linear-gradient(180deg, rgba(245,242,238,0.72) 0%, rgba(232,228,222,0.6) 100%)',
        borderRadius: '12px 12px 0 0',
        border: '1px solid rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.8), 0 -4px 20px rgba(0,0,0,0.06)',
        marginBottom: '3px',
      }} />
      {/* Seat */}
      <div style={{
        height: '42px',
        background: 'linear-gradient(180deg, rgba(255,252,248,0.68) 0%, rgba(240,235,228,0.58) 100%)',
        borderRadius: '0 0 14px 14px',
        border: '1px solid rgba(255,255,255,0.5)',
        borderTop: 'none',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      }} />
      {/* Left arm */}
      <div style={{
        position: 'absolute', left: '-18px', bottom: 0,
        width: '22px', height: '95px',
        background: 'linear-gradient(90deg, rgba(235,230,222,0.65) 0%, rgba(248,244,238,0.7) 100%)',
        borderRadius: '10px 10px 10px 10px',
        border: '1px solid rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: 'inset 2px 0 6px rgba(255,255,255,0.5)',
      }} />
      {/* Right arm */}
      <div style={{
        position: 'absolute', right: '-18px', bottom: 0,
        width: '22px', height: '95px',
        background: 'linear-gradient(90deg, rgba(248,244,238,0.7) 0%, rgba(235,230,222,0.65) 100%)',
        borderRadius: '10px 10px 10px 10px',
        border: '1px solid rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: 'inset -2px 0 6px rgba(255,255,255,0.5)',
      }} />
      {/* Legs */}
      <div style={{ position: 'absolute', bottom: '-12px', left: '24px', width: '8px', height: '14px', background: 'rgba(180,165,148,0.6)', borderRadius: '0 0 3px 3px' }} />
      <div style={{ position: 'absolute', bottom: '-12px', right: '24px', width: '8px', height: '14px', background: 'rgba(180,165,148,0.6)', borderRadius: '0 0 3px 3px' }} />
    </div>
  );
}

// Marble coffee table
function CoffeeTable() {
  return (
    <div style={{ position: 'relative', width: '180px', zIndex: 5 }}>
      {/* Table top */}
      <div style={{
        height: '14px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(240,236,230,0.7) 100%)',
        backgroundImage: `url(${DESKTOP_LOUNGE_BG_FALLBACK}), linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(240,236,230,0.7) 100%)`,
        backgroundSize: 'cover',
        backgroundBlendMode: 'overlay',
        borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 4px 12px rgba(0,0,0,0.12)',
        marginBottom: '2px',
      }} />
      {/* Rose bud on table */}
      <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', zIndex: 6 }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#C81C24', boxShadow: '0 0 6px rgba(200,28,36,0.5)' }} />
      </div>
      {/* Legs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ width: '6px', height: '28px', background: 'rgba(200,190,178,0.55)', borderRadius: '0 0 2px 2px' }} />
        <div style={{ width: '6px', height: '28px', background: 'rgba(200,190,178,0.55)', borderRadius: '0 0 2px 2px' }} />
      </div>
    </div>
  );
}

export default function DesktopLoungePage() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [bgSrc, setBgSrc] = useState(DESKTOP_LOUNGE_BG_URL);
  const [isTooSmall, setIsTooSmall] = useState(() => getDesktopLayoutViewportWidth() < 1024);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const check = () => setIsTooSmall(getDesktopLayoutViewportWidth() < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const floatIn = (delayMs: number, dy = 28) => ({
    transition: `opacity 1.2s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms, transform 1.3s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${dy}px)`,
  });

  if (isTooSmall) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F7', flexDirection: 'column', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', letterSpacing: '0.3em', color: '#C81C24', marginBottom: '16px' }}>FRONTAL SLAYER</div>
        <div style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: '#4A3728', maxWidth: '280px', lineHeight: 1.7 }}>The Members Lounge is designed for desktop viewing.</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0A0A0A', height: '100vh', overflow: 'hidden' }}>
      <NavBar activeLink="HOME" />

      <section className="relative overflow-hidden" style={{ height: '100vh', position: 'relative' }}>

        {/* Lounge environment */}
        <img
          src={bgSrc}
          alt=""
          onError={() => setBgSrc(DESKTOP_LOUNGE_BG_FALLBACK)}
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
          }}
        />

        {/* Intimate ceiling — softer, lower gradient than lobby */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.42) 16%, rgba(255,255,255,0.12) 34%, transparent 52%)',
          zIndex: 1,
        }} />

        {/* Floor reflection */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(0deg, rgba(240,238,234,0.48) 0%, rgba(245,242,238,0.22) 18%, transparent 38%)',
          zIndex: 1,
        }} />

        {/* Side architectural columns */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(90deg, rgba(220,215,208,0.35) 0%, rgba(240,238,234,0.12) 12%, transparent 22%, transparent 78%, rgba(240,238,234,0.12) 88%, rgba(220,215,208,0.35) 100%)',
          zIndex: 2,
        }} />

        {/* Warm central ceiling wash — intimate lighting */}
        <div className="absolute pointer-events-none" style={{
          top: '-40px', left: '50%', transform: 'translateX(-50%)',
          width: '900px', height: '520px',
          background: 'radial-gradient(ellipse 70% 70% at 50% 10%, rgba(255,255,255,0.55) 0%, rgba(252,248,240,0.28) 30%, transparent 62%)',
          zIndex: 2,
        }} />

        {/* Chandelier */}
        <div className="absolute pointer-events-none" style={{
          top: 0, left: '50%',
          zIndex: 5,
          transition: floatIn(300, -10).transition,
          opacity: floatIn(300, -10).opacity,
          transform: ('translateX(-50%) translateY(-12px) ' + floatIn(300, -10).transform) as string,
        }}>
          <LoungeChandelier />
        </div>

        {/* Crystal diamonds */}
        <CrystalDiamond size={36} x="8%" y="22%" opacity={0.4} />
        <CrystalDiamond size={20} x="10%" y="38%" opacity={0.3} />
        <CrystalDiamond size={28} x="88%" y="26%" opacity={0.4} />
        <CrystalDiamond size={16} x="86%" y="42%" opacity={0.28} />

        {/* Particle field */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <ParticleField />
        </div>

        {/* Rose arrangements */}
        <RoseAccent delay={0} />
        <RoseAccent right delay={1.2} />

        {/* ── CONTENT LAYER ── */}
        <div className="relative" style={{ zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '130px', paddingBottom: '60px', paddingLeft: '7%', paddingRight: '7%' }}>

          {/* Section label */}
          <div className="text-center mb-10" style={floatIn(200, 16)}>
            <div style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(160,140,118,0.9)', marginBottom: '10px' }}>
              FRONTAL SLAYER FLAGSHIP
            </div>
            <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '20px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#1A1A1A', lineHeight: 1, marginBottom: '8px' }}>
              MEMBERS LOUNGE
            </div>
            <div style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(120,100,82,0.8)' }}>
              PRIVATE · EXCLUSIVE · CURATED
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div style={{ height: '1px', width: '56px', background: 'linear-gradient(90deg, transparent, rgba(160,140,118,0.5))' }} />
              <div style={{ width: '4px', height: '4px', transform: 'rotate(45deg)', background: 'rgba(200,28,36,0.7)' }} />
              <div style={{ height: '1px', width: '56px', background: 'linear-gradient(90deg, rgba(160,140,118,0.5), transparent)' }} />
            </div>
          </div>

          {/* Main floor plan: sofas + panels */}
          <div className="flex items-end justify-center" style={{ gap: '32px', flex: 1 }}>

            {/* LEFT — Member Feature Panel */}
            <div style={{ ...floatIn(380, 30), width: '248px', flexShrink: 0, alignSelf: 'center' }}>
              <AcrylicBlock>
                <div style={{ padding: '20px 22px 16px' }}>
                  <div style={{ fontFamily: '"Futura PT Book"', fontSize: '7.5px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#9A8868', marginBottom: '10px' }}>
                    MEMBER STATUS
                  </div>
                  <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', lineHeight: 1.25, marginBottom: '12px' }}>
                    SLAY CLUB<br />
                    <span style={{ fontSize: '8.5px', color: '#9A8868', fontFamily: '"Futura PT Book"', letterSpacing: '0.08em' }}>MEMBERSHIP ACCESS</span>
                  </div>
                  {[
                    { label: 'SLAY POINTS', value: 'Track & Redeem' },
                    { label: 'EXCLUSIVE OFFERS', value: 'Member Only' },
                    { label: 'EARLY ACCESS', value: 'New Drops' },
                    { label: 'PRIVATE EVENTS', value: 'Invite Only' },
                    { label: 'REFERRAL REWARDS', value: 'Earn Together' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '9px 0',
                      borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.055)',
                    }}>
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A1A1A' }}>{item.label}</span>
                      <span style={{ fontFamily: '"Futura PT Book"', fontSize: '8.5px', letterSpacing: '0.04em', color: '#9A8868' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(0,0,0,0.065)' }}>
                  <button
                    onClick={() => navigate('/account')}
                    style={{ width: '100%', padding: '12px 0', background: '#C81C24', color: '#FFF', fontFamily: '"Futura PT Medium"', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', border: 'none', borderRadius: '2px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(200,28,36,0.35)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                  >
                    MY SUITE
                  </button>
                </div>
              </AcrylicBlock>
            </div>

            {/* CENTER — Seating arrangement */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', alignSelf: 'flex-end', ...floatIn(160, 22) }}>
              {/* Upper sofa pair */}
              <div className="flex items-end justify-center" style={{ gap: '48px', marginBottom: '14px' }}>
                <CSSofa style={{ opacity: 0.88 }} />
                <CSSofa flipped style={{ opacity: 0.88 }} />
              </div>
              {/* Coffee table row */}
              <div className="flex items-center justify-center" style={{ gap: '80px', marginBottom: '14px' }}>
                <CoffeeTable />
                <CoffeeTable />
              </div>
              {/* Lower sofa — faces toward viewer */}
              <div style={{ marginBottom: '10px' }}>
                <CSSofa style={{ width: '420px', opacity: 0.92, transform: 'perspective(600px) rotateX(-4deg)' }} />
              </div>
              {/* Lounge label */}
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <div style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(120,100,82,0.7)' }}>
                  MEMBERS ONLY SEATING
                </div>
              </div>
            </div>

            {/* RIGHT — Content & Booking Panel */}
            <div style={{ ...floatIn(520, 30), width: '248px', flexShrink: 0, alignSelf: 'center' }}>
              <AcrylicBlock>
                <div style={{ padding: '20px 22px 16px' }}>
                  <div style={{ fontFamily: '"Futura PT Book"', fontSize: '7.5px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#9A8868', marginBottom: '10px' }}>
                    LOUNGE SERVICES
                  </div>
                  <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '15px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1A1A1A', lineHeight: 1.25, marginBottom: '12px' }}>
                    CONCIERGE<br />
                    <span style={{ fontSize: '8.5px', color: '#9A8868', fontFamily: '"Futura PT Book"', letterSpacing: '0.08em' }}>LOUNGE DESK</span>
                  </div>
                  {[
                    { label: 'BOOK CONSULTATION', sub: 'Private styling session', path: '/booking/consultation' },
                    { label: 'SLAY CAM', sub: 'Community gallery', path: '/slay-cam' },
                    { label: 'HAIRSTYLE ANALYSIS', sub: 'AI assessment', path: '/tools/hairstyle-analysis' },
                    { label: 'LIVE TRY-ON', sub: 'Virtual fitting room', path: '/tools/live-try-on' },
                    { label: 'GIFT CARDS', sub: 'Send luxury', path: '/tools/gift-card' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(item.path)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '9px 0',
                        borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.055)',
                        background: 'transparent', cursor: 'pointer',
                        textAlign: 'left',
                        border: 'none',
                        borderBottom: 'none',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C81C24'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'inherit'; }}
                    >
                      <div>
                        <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'inherit' }}>{item.label}</div>
                        <div style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#9A8868', letterSpacing: '0.04em', marginTop: '2px' }}>{item.sub}</div>
                      </div>
                      <span style={{ fontSize: '10px', color: 'rgba(26,26,26,0.3)', marginLeft: '8px' }}>›</span>
                    </button>
                  ))}
                </div>
                <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(0,0,0,0.065)' }}>
                  <button
                    onClick={() => navigate('/desktop/penthouse')}
                    style={{ width: '100%', padding: '12px 0', background: 'rgba(255,255,255,0.52)', backdropFilter: 'blur(12px)', color: '#1A1A1A', fontFamily: '"Futura PT Medium"', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', border: '1px solid rgba(0,0,0,0.12)', borderRadius: '2px', cursor: 'pointer' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#C81C24'; el.style.color = '#FFF'; el.style.borderColor = 'transparent'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'rgba(255,255,255,0.52)'; el.style.color = '#1A1A1A'; el.style.borderColor = 'rgba(0,0,0,0.12)'; }}
                  >
                    RETURN TO PENTHOUSE
                  </button>
                </div>
              </AcrylicBlock>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <DesktopElevatorPanel activeFloorPath="/desktop/lounge" />
      </section>
    </div>
  );
}
