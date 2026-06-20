import React from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'IMMERSIVE 3D',
    sub: 'Step into the Frontal Slayer experience.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'HOLOGRAPHIC',
    sub: 'Build, explore & customize in real time.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'PSA CONCIERGE',
    sub: 'Expert guidance from our founder.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'QUICK PORTALS',
    sub: 'Everything you need, one click away.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'LUXURY NAV',
    sub: 'Elegant, intuitive. Future-forward.',
  },
];

export function LobbyFeaturesSidebar() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col"
      style={{ width: '220px' }}
    >
      {/* Features */}
      <div
        className="rounded-xl p-5 mb-4"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <div
          className="text-[9px] tracking-[0.2em] uppercase mb-4"
          style={{ fontFamily: '"Futura PT Medium"', color: '#959B9B' }}
        >
          LOBBY FEATURES
        </div>
        <div className="flex flex-col gap-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5" style={{ color: '#C81C24' }}>
                {feature.icon}
              </div>
              <div>
                <div
                  className="text-[10px] tracking-[0.1em] uppercase mb-0.5"
                  style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
                >
                  {feature.title}
                </div>
                <div
                  className="text-[10px] leading-snug"
                  style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
                >
                  {feature.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join the Movement */}
      <div
        className="rounded-xl p-5"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <div
          className="text-[11px] tracking-[0.12em] uppercase mb-1"
          style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
        >
          JOIN THE MOVEMENT
        </div>
        <div
          className="text-[10px] leading-snug mb-4"
          style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
        >
          Become a member & unlock exclusive luxury benefits.
        </div>
        <button
          onClick={() => navigate('/account/membership')}
          className="w-full py-2.5 text-[10px] tracking-[0.12em] uppercase text-white rounded-lg transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            fontFamily: '"Futura PT Medium"',
            background: '#C81C24',
          }}
        >
          VIEW MEMBERSHIPS
        </button>
      </div>
    </div>
  );
}
