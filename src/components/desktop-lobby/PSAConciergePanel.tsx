import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassPanel } from './ui/GlassPanel';

const MENU_ITEMS = [
  { label: 'Start Consultation', sub: 'Begin your hair journey', path: '/account/concierge' },
  { label: 'Analyze My Face', sub: 'AI-powered match', path: '/tools/live-try-on' },
  { label: 'Recommend Units', sub: 'Personalized for you', path: '/account/concierge' },
  { label: 'Build My Wig', sub: 'Custom configuration', path: '/build-a-wig' },
  { label: 'Membership Help', sub: 'Plans & benefits', path: '/account/membership' },
];

export function PSAConciergePanel() {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <GlassPanel className="h-full flex flex-col" style={{ padding: '28px 24px' }}>
      {/* Header */}
      <div className="mb-4">
        <div
          className="text-[10px] tracking-[0.22em] uppercase mb-1.5"
          style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
        >
          PSA CONCIERGE
        </div>
        <div
          className="text-[13px] tracking-[0.04em]"
          style={{ fontFamily: '"Futura PT Book"', color: '#1A1A1A', lineHeight: 1.4 }}
        >
          We're here for you.
        </div>
      </div>

      {/* Avatar */}
      <div className="relative mb-5">
        <div
          className="rounded-xl overflow-hidden"
          style={{
            height: '180px',
            background: 'rgba(250,248,247,0.6)',
          }}
        >
          <img
            src="/assets/psa-avatar-neutral-smiling.png"
            alt="Katéena Armstrong"
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/psa-avatar-neutral.png';
            }}
          />
        </div>
        {/* Avatar glow */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: 'inset 0 -40px 40px rgba(255,255,255,0.5)',
          }}
        />
      </div>

      {/* Diamond divider */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.1)' }} />
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
          <path d="M3 0L6 3L3 6L0 3L3 0Z" fill="rgba(0,0,0,0.15)" />
        </svg>
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.1)' }} />
      </div>

      {/* Consultation menu */}
      <div className="flex-1 flex flex-col gap-0.5">
        {MENU_ITEMS.map((item, i) => (
          <button
            key={item.label}
            onMouseEnter={() => setHoveredItem(i)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => navigate(item.path)}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-150"
            style={{
              background: hoveredItem === i ? 'rgba(200,28,36,0.04)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-2.5">
              {/* Left red bar */}
              <div
                className="flex-shrink-0 rounded-full transition-all duration-150"
                style={{
                  width: '2.5px',
                  height: hoveredItem === i ? '28px' : '16px',
                  background: hoveredItem === i ? '#C81C24' : 'rgba(26,26,26,0.15)',
                }}
              />
              <div
                style={{
                  transform: hoveredItem === i ? 'translateX(3px)' : 'translateX(0)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div
                  className="text-[11px] tracking-[0.06em]"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: hoveredItem === i ? '#C81C24' : '#1A1A1A',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {item.label}
                </div>
                <div
                  className="text-[9px] tracking-[0.04em] mt-0.5"
                  style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
                >
                  {item.sub}
                </div>
              </div>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={hoveredItem === i ? '#C81C24' : '#D0D0D0'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: hoveredItem === i ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.15s ease, stroke 0.15s ease' }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>

      {/* Founder signature */}
      <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: '1.5px solid rgba(200,28,36,0.3)' }}
          >
            <img
              src="/assets/psa-avatar-neutral.png"
              alt="Katéena Armstrong"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <div
              className="text-[10px] tracking-[0.08em] uppercase"
              style={{ fontFamily: '"Futura PT Medium"', color: '#1A1A1A' }}
            >
              Katéena Armstrong
            </div>
            <div
              className="text-[9px] tracking-[0.06em] uppercase"
              style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
            >
              Founder & CEO
            </div>
          </div>
          {/* FS monogram */}
          <div className="ml-auto">
            <span
              className="text-base"
              style={{
                fontFamily: '"Covered By Your Grace"',
                color: '#C81C24',
                fontSize: '20px',
              }}
            >
              Fs
            </span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
