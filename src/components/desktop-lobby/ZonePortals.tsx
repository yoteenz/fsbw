import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PORTALS = [
  { num: '01', label: 'SHOP\nUNITS', sub: 'The Collection', path: '/home/shop',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { num: '02', label: 'DESIGN\nSTUDIO', sub: 'Build-A-Wig', path: '/build-a-wig',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
  { num: '03', label: 'COMMUNITY\nGALLERY', sub: 'Slay Cam', path: '/slay-cam',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg> },
  { num: '04', label: 'MEMBERSHIP\nCLUB', sub: 'Exclusive Access', path: '/account/membership',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  { num: '05', label: 'BEAUTY\nLAB', sub: 'Analysis', path: '/tools/live-try-on',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
  { num: '06', label: 'CONCIERGE\nSUITE', sub: 'Expert Guidance', path: '/account/concierge',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
];

export function ZonePortals() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#1A1714' }}
    >
      {/* Marble texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'url(/assets/mini-marble.png)',
        backgroundSize: '500px',
        backgroundBlendMode: 'soft-light',
        opacity: 0.5,
        zIndex: 1,
      }} />

      {/* Top transition — lobby fades to corridor */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{
        height: '100px', zIndex: 5,
        background: 'linear-gradient(180deg, rgba(245,239,232,1) 0%, rgba(26,23,20,0) 100%)',
      }} />

      {/* Bottom transition — corridor fades to lounge */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
        height: '100px', zIndex: 5,
        background: 'linear-gradient(0deg, rgba(253,249,248,1) 0%, rgba(26,23,20,0) 100%)',
      }} />

      {/* Center atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(200,28,36,0.07) 0%, transparent 70%)',
        zIndex: 2,
      }} />

      {/* Content */}
      <div className="relative" style={{ zIndex: 10, paddingTop: '96px', paddingBottom: '96px' }}>

        {/* Corridor heading */}
        <div className="text-center mb-16">
          <div style={{
            fontFamily: '"Futura PT Book"', fontSize: '8px',
            letterSpacing: '0.5em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)', marginBottom: '10px',
          }}>
            ── THE CAMPUS ──
          </div>
          <div style={{
            fontFamily: '"Futura PT Medium"', fontSize: '18px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.78)',
          }}>
            CHOOSE YOUR DESTINATION
          </div>
        </div>

        {/* Illuminated portal gateways */}
        <div className="flex items-end justify-center gap-4 px-8">
          {PORTALS.map((portal, i) => {
            const isHovered = hovered === i;
            return (
              <button
                key={portal.num}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(portal.path)}
                className="relative flex flex-col items-center"
                style={{
                  width: '162px',
                  height: '220px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                  transition: 'transform 0.38s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {/* Portal arch — the illuminated doorway frame */}
                <div
                  className="relative w-full flex-1 flex flex-col items-center justify-end"
                  style={{
                    background: isHovered
                      ? 'linear-gradient(180deg, rgba(255,244,210,0.12) 0%, rgba(200,28,36,0.07) 60%, rgba(255,255,255,0.04) 100%)'
                      : 'linear-gradient(180deg, rgba(255,248,220,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                    border: isHovered
                      ? '1px solid rgba(200,28,36,0.32)'
                      : '1px solid rgba(255,255,255,0.08)',
                    borderBottom: 'none',
                    borderRadius: '80px 80px 0 0',
                    padding: '0 16px 20px',
                    transition: 'background 0.35s ease, border-color 0.35s ease',
                    boxShadow: isHovered
                      ? 'inset 0 80px 80px rgba(255,244,200,0.07), 0 0 40px rgba(200,28,36,0.15), 0 -20px 60px rgba(255,244,200,0.08)'
                      : 'none',
                  }}
                >
                  {/* Overhead light source — inside the arch */}
                  <div className="absolute top-0 left-1/2 pointer-events-none" style={{
                    transform: 'translateX(-50%)',
                    width: '80px', height: '80px',
                    background: isHovered
                      ? 'radial-gradient(ellipse at 50% 0%, rgba(255,248,210,0.55) 0%, transparent 70%)'
                      : 'radial-gradient(ellipse at 50% 0%, rgba(255,248,210,0.18) 0%, transparent 70%)',
                    transition: 'background 0.35s ease',
                  }} />

                  {/* Portal number — room designation plate */}
                  <div style={{
                    position: 'absolute', top: '22px', left: '50%', transform: 'translateX(-50%)',
                    fontFamily: '"Futura PT Book"', fontSize: '10px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: isHovered ? 'rgba(200,28,36,0.9)' : 'rgba(255,255,255,0.22)',
                    transition: 'color 0.25s ease',
                  }}>
                    {portal.num}
                  </div>

                  {/* Icon — destination emblem */}
                  <div style={{
                    color: isHovered ? '#C81C24' : 'rgba(255,255,255,0.42)',
                    marginBottom: '14px',
                    transform: isHovered ? 'scale(1.08) translateY(-4px)' : 'scale(1) translateY(0)',
                    transition: 'color 0.28s ease, transform 0.38s cubic-bezier(0.16,1,0.3,1)',
                    filter: isHovered ? 'drop-shadow(0 0 8px rgba(200,28,36,0.4))' : 'none',
                  }}>
                    {portal.icon}
                  </div>

                  {/* Destination name — door plate */}
                  <div style={{
                    fontFamily: '"Futura PT Medium"', fontSize: '10px',
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.62)',
                    lineHeight: 1.5, textAlign: 'center',
                    transition: 'color 0.25s ease',
                    whiteSpace: 'pre-line',
                  }}>
                    {portal.label}
                  </div>
                </div>

                {/* Portal threshold — the floor sill of the doorway */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: isHovered
                    ? 'linear-gradient(180deg, rgba(200,28,36,0.5) 0%, rgba(200,28,36,0.25) 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)',
                  border: isHovered ? '1px solid rgba(200,28,36,0.35)' : '1px solid rgba(255,255,255,0.1)',
                  borderTop: 'none',
                  transition: 'background 0.35s ease, border-color 0.35s ease',
                }} />

                {/* Sub-label — destination description */}
                <div style={{
                  marginTop: '10px',
                  fontFamily: '"Futura PT Book"', fontSize: '8px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: isHovered ? 'rgba(200,28,36,0.75)' : 'rgba(255,255,255,0.25)',
                  transition: 'color 0.25s ease',
                }}>
                  {portal.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
