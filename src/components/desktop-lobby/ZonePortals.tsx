import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PORTALS = [
  { label: 'SHOP', path: '/home/shop' },
  { label: 'BUILD-A-WIG', path: '/build-a-wig' },
  { label: 'GALLERY', path: '/slay-cam' },
  { label: 'MEMBERS', path: '/account' },
  { label: 'BEAUTY LAB', path: '/tools/live-try-on' },
  { label: 'LOUNGE', path: '/desktop/lounge' },
];

export function ZonePortals() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '8px 12px',
      background: 'rgba(0,0,0,0.32)',
      backdropFilter: 'blur(40px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
      borderRadius: '40px',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.14)',
    }}>
      {PORTALS.map((portal, i) => {
        const isHovered = hovered === i;
        return (
          <button
            key={portal.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate(portal.path)}
            style={{
              padding: '6px 16px',
              background: isHovered ? 'rgba(200,28,36,0.88)' : 'rgba(255,255,255,0.07)',
              border: '1px solid',
              borderColor: isHovered ? 'transparent' : 'rgba(255,255,255,0.14)',
              borderRadius: '24px',
              cursor: 'pointer',
              transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isHovered ? '0 4px 14px rgba(200,28,36,0.4)' : 'none',
            }}
          >
            <div style={{
              fontFamily: '"Futura PT Medium"', fontSize: '8px',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.72)',
              lineHeight: 1,
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap',
            }}>
              {portal.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
