import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassPanel } from './ui/GlassPanel';
import { RedButton } from './ui/Buttons';

const OPTIONS = [
  { label: 'TEXTURE', value: 'Straight, Wavy, Curly' },
  { label: 'LENGTH', value: '12" – 30"' },
  { label: 'DENSITY', value: '130% – 250%' },
  { label: 'LACE TYPE', value: 'HD, Transparent, 13×6' },
  { label: 'COLOR', value: '15+ Options' },
  { label: 'HAIRLINE', value: 'Natural, Baby Hair' },
  { label: 'ADD-ONS', value: 'Tint, Bleach, Style' },
];

export function BuildAWigPanel() {
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <GlassPanel className="h-full flex flex-col" style={{ padding: '28px 24px' }}>
      {/* Header */}
      <div className="mb-6">
        <div
          className="text-[10px] tracking-[0.22em] uppercase mb-1.5"
          style={{ fontFamily: '"Futura PT Book"', color: '#959B9B' }}
        >
          BUILD-A-WIG STUDIO
        </div>
        <div
          className="text-[13px] tracking-[0.06em]"
          style={{ fontFamily: '"Futura PT Book"', color: '#1A1A1A', lineHeight: 1.4 }}
        >
          Design your perfect unit.
        </div>
      </div>

      {/* Diamond divider */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.1)' }} />
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
          <path d="M3 0L6 3L3 6L0 3L3 0Z" fill="rgba(0,0,0,0.15)" />
        </svg>
        <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.1)' }} />
      </div>

      {/* Options */}
      <div className="flex-1 flex flex-col gap-0.5">
        {OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            onClick={() => navigate('/build-a-wig')}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 text-left"
            style={{
              background: hoveredRow === i ? 'rgba(200,28,36,0.04)' : 'transparent',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-1 rounded-full flex-shrink-0 transition-colors duration-150"
                style={{ background: hoveredRow === i ? '#C81C24' : 'rgba(26,26,26,0.2)' }}
              />
              <span
                className="text-[11px] tracking-[0.1em] uppercase"
                style={{
                  fontFamily: '"Futura PT Medium"',
                  color: hoveredRow === i ? '#C81C24' : '#1A1A1A',
                  transition: 'color 0.15s ease',
                }}
              >
                {opt.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] tracking-[0.05em]"
                style={{
                  fontFamily: '"Futura PT Book"',
                  color: '#959B9B',
                }}
              >
                {opt.value}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={hoveredRow === i ? '#C81C24' : '#959B9B'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: hoveredRow === i ? 'translateX(3px)' : 'translateX(0)',
                  transition: 'transform 0.15s ease, stroke 0.15s ease',
                }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="my-5 h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />

      {/* CTA */}
      <RedButton
        fullWidth
        onClick={() => navigate('/build-a-wig')}
        size="md"
      >
        START BUILDING →
      </RedButton>
    </GlassPanel>
  );
}
