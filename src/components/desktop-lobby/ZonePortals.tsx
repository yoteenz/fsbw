import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PORTALS = [
  {
    num: '01',
    label: 'SHOP UNITS',
    sub: 'Explore the collection',
    path: '/home/shop',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    num: '02',
    label: 'BUILD-A-WIG',
    sub: 'Design your unit',
    path: '/build-a-wig',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    num: '03',
    label: 'SLAY CAM',
    sub: 'Community gallery',
    path: '/slay-cam',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    num: '04',
    label: 'MEMBERSHIP',
    sub: 'Exclusive access',
    path: '/account/membership',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    num: '05',
    label: 'ANALYSIS',
    sub: 'Beauty intelligence',
    path: '/tools/live-try-on',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    num: '06',
    label: 'PSA CONCIERGE',
    sub: 'Expert consultation',
    path: '/account/concierge',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export function ZonePortals() {
  const navigate = useNavigate();
  const [hoveredPortal, setHoveredPortal] = useState<number | null>(null);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        // Dark architectural band — a threshold between the Lobby and the campus
        background: '#1A1714',
        backgroundImage: 'url(/assets/mini-marble.png)',
        backgroundSize: '480px',
        backgroundBlendMode: 'soft-light',
      }}
    >
      {/* Top fade from lobby */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '80px',
          background: 'linear-gradient(180deg, rgba(245,239,232,1) 0%, rgba(26,23,20,0) 100%)',
          zIndex: 2,
        }}
      />

      {/* Bottom fade back to lounge */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '80px',
          background: 'linear-gradient(0deg, rgba(253,249,248,1) 0%, rgba(26,23,20,0) 100%)',
          zIndex: 2,
        }}
      />

      {/* Subtle center glow — warmth from within the corridor */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,28,36,0.06) 0%, transparent 70%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative" style={{ zIndex: 10, paddingTop: '80px', paddingBottom: '80px' }}>
        {/* Architectural section label */}
        <div className="text-center mb-14">
          <div
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '8px',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)',
              marginBottom: '10px',
            }}
          >
            ── THE CAMPUS ──
          </div>
          <div
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '19px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.82)',
            }}
          >
            CHOOSE YOUR DESTINATION
          </div>
        </div>

        {/* Gateway portal cards */}
        <div
          className="flex items-center justify-center gap-4 px-10"
        >
          {PORTALS.map((portal, i) => {
            const isHovered = hoveredPortal === i;
            return (
              <button
                key={portal.label}
                onMouseEnter={() => setHoveredPortal(i)}
                onMouseLeave={() => setHoveredPortal(null)}
                onClick={() => navigate(portal.path)}
                className="relative flex flex-col items-center text-center"
                style={{
                  width: '158px',
                  height: '200px',
                  padding: '28px 18px 24px',
                  background: isHovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.028)',
                  border: isHovered ? '1px solid rgba(200,28,36,0.38)' : '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '2px',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transform: isHovered ? 'translateY(-7px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? '0 28px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,28,36,0.22), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 4px 20px rgba(0,0,0,0.25)',
                  transition: 'all 0.32s cubic-bezier(0.16,1,0.3,1)',
                  cursor: 'pointer',
                }}
              >
                {/* Portal number — editorial marker */}
                <div
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '10px',
                    letterSpacing: '0.18em',
                    color: isHovered ? '#C81C24' : 'rgba(255,255,255,0.22)',
                    marginBottom: '14px',
                    transition: 'color 0.25s ease',
                  }}
                >
                  {portal.num}
                </div>

                {/* Icon */}
                <div
                  style={{
                    color: isHovered ? '#C81C24' : 'rgba(255,255,255,0.5)',
                    marginBottom: '16px',
                    transform: isHovered ? 'scale(1.1) translateY(-2px)' : 'scale(1) translateY(0)',
                    transition: 'color 0.25s ease, transform 0.32s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  {portal.icon}
                </div>

                {/* Destination label */}
                <div
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '10px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.68)',
                    lineHeight: 1.35,
                    marginBottom: '6px',
                    transition: 'color 0.25s ease',
                  }}
                >
                  {portal.label}
                </div>

                {/* Sub-label */}
                <div
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '8px',
                    letterSpacing: '0.06em',
                    color: isHovered ? 'rgba(200,28,36,0.82)' : 'rgba(255,255,255,0.28)',
                    transition: 'color 0.25s ease',
                  }}
                >
                  {portal.sub}
                </div>

                {/* Red entry line — appears on hover like a door opening */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #C81C24, transparent)',
                    transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'center',
                    borderRadius: '0 0 2px 2px',
                    transition: 'transform 0.32s cubic-bezier(0.16,1,0.3,1)',
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
