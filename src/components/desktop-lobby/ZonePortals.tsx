import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DiamondDivider } from './ui/DiamondDivider';

const PORTALS = [
  {
    label: 'SHOP UNITS',
    sub: 'Find your perfect match',
    path: '/home/shop',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: 'BUILD-A-WIG',
    sub: 'Design your unit',
    path: '/build-a-wig',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    label: 'SLAY CAM',
    sub: 'Get inspired',
    path: '/slay-cam',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    label: 'MEMBERSHIP',
    sub: 'Unlock exclusive perks',
    path: '/account/membership',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    label: 'ANALYSIS',
    sub: 'Find your style',
    path: '/tools/live-try-on',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    label: 'PSA',
    sub: 'We assist you',
    path: '/account/concierge',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export function ZonePortals() {
  const navigate = useNavigate();
  const [hoveredPortal, setHoveredPortal] = useState<number | null>(null);

  return (
    <section className="relative py-1">
      <DiamondDivider />

      <div
        className="flex items-center justify-around px-16 py-4"
        style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {PORTALS.map((portal, i) => (
          <button
            key={portal.label}
            onMouseEnter={() => setHoveredPortal(i)}
            onMouseLeave={() => setHoveredPortal(null)}
            onClick={() => navigate(portal.path)}
            className="flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200"
            style={{
              transform: hoveredPortal === i ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div
              className="transition-colors duration-200"
              style={{
                color: hoveredPortal === i ? '#C81C24' : '#1A1A1A',
              }}
            >
              {portal.icon}
            </div>
            <div className="flex flex-col items-center">
              <span
                className="text-[9px] tracking-[0.14em] uppercase transition-colors duration-200"
                style={{
                  fontFamily: '"Futura PT Medium"',
                  color: hoveredPortal === i ? '#C81C24' : '#1A1A1A',
                }}
              >
                {portal.label}
              </span>
              <span
                className="text-[8px] tracking-[0.04em] transition-colors duration-200"
                style={{
                  fontFamily: '"Futura PT Book"',
                  color: hoveredPortal === i ? 'rgba(200,28,36,0.7)' : '#959B9B',
                }}
              >
                {portal.sub}
              </span>
            </div>
            {/* Active dot */}
            <div
              className="w-1 h-1 rounded-full transition-all duration-200"
              style={{
                background: hoveredPortal === i ? '#C81C24' : 'transparent',
              }}
            />
          </button>
        ))}
      </div>

      <DiamondDivider />
    </section>
  );
}
