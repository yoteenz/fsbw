import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SERVICES = [
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
    <div
      className="relative h-full flex flex-col overflow-hidden"
      style={{
        // Concierge kiosk — vertical, architectural
        borderRadius: '2px 2px 12px 12px',
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(44px) saturate(1.9) brightness(1.06)',
        WebkitBackdropFilter: 'blur(44px) saturate(1.9) brightness(1.06)',
        border: '1px solid rgba(255,255,255,0.52)',
        boxShadow: [
          'inset 0 1.5px 0 rgba(255,255,255,0.9)',
          '0 56px 100px rgba(0,0,0,0.18)',
          '0 16px 40px rgba(0,0,0,0.1)',
        ].join(', '),
        // Right red accent bar
        borderRight: '3px solid rgba(200,28,36,0.55)',
      }}
    >
      {/* Crystal top-edge light catch */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95) 30%, rgba(255,255,255,1) 60%, transparent)',
        zIndex: 20,
      }} />

      {/* Kiosk header */}
      <div style={{
        padding: '14px 20px 12px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        background: 'rgba(255,255,255,0.18)',
      }}>
        <div className="flex items-center justify-between mb-1">
          <div style={{
            fontFamily: '"Futura PT Book"', fontSize: '8px',
            letterSpacing: '0.35em', textTransform: 'uppercase', color: '#A89070',
          }}>
            PSA CONCIERGE
          </div>
          {/* Available indicator */}
          <div className="flex items-center gap-1.5">
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%', background: '#2A9D6F',
              boxShadow: '0 0 6px rgba(42,157,111,0.6)',
              animation: 'pedestalPulse 2.5s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', letterSpacing: '0.15em', color: '#2A9D6F' }}>
              AVAILABLE
            </span>
          </div>
        </div>
        <div style={{
          fontFamily: '"Futura PT Medium"', fontSize: '15px',
          letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1A1A1A',
          lineHeight: 1.2,
        }}>
          CONCIERGE<br />
          <span style={{ fontSize: '10px', color: '#A89070', fontFamily: '"Futura PT Book"', letterSpacing: '0.06em' }}>
            DESK
          </span>
        </div>
      </div>

      {/* Kiosk display window — the concierge avatar */}
      <div style={{
        margin: '14px 16px',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        height: '172px',
        background: 'rgba(250,246,240,0.6)',
        border: '1px solid rgba(255,255,255,0.7)',
        flexShrink: 0,
      }}>
        <img
          src="/assets/psa-avatar-neutral-smiling.png"
          alt="Katéena Armstrong"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/psa-avatar-neutral.png'; }}
        />
        {/* Display window vignette — bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px',
          background: 'linear-gradient(0deg, rgba(255,252,248,0.85) 0%, transparent 100%)',
        }} />
        {/* Screen scanline texture — subtle kiosk display effect */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Service menu — kiosk touch buttons */}
      <div className="flex-1 flex flex-col" style={{ padding: '4px 0', overflowY: 'auto' }}>
        {SERVICES.map((item, i) => (
          <button
            key={item.label}
            onMouseEnter={() => setHoveredItem(i)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => navigate(item.path)}
            className="flex items-center text-left"
            style={{
              padding: '8px 20px 8px 17px',
              background: hoveredItem === i ? 'rgba(200,28,36,0.05)' : 'transparent',
              borderRight: hoveredItem === i ? '2px solid #C81C24' : '2px solid transparent',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
              border: 'none',
              borderRight: hoveredItem === i ? '2px solid #C81C24' : '2px solid transparent',
            }}
          >
            <div
              style={{
                width: '2px', height: hoveredItem === i ? '28px' : '16px',
                background: hoveredItem === i ? '#C81C24' : 'rgba(26,26,26,0.18)',
                borderRadius: '1px', marginRight: '12px', flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            />
            <div style={{
              transform: hoveredItem === i ? 'translateX(2px)' : 'translateX(0)',
              transition: 'transform 0.15s ease',
            }}>
              <div style={{
                fontFamily: '"Futura PT Medium"', fontSize: '10px',
                letterSpacing: '0.06em', textTransform: 'none',
                color: hoveredItem === i ? '#C81C24' : '#1A1A1A',
                transition: 'color 0.15s ease',
              }}>
                {item.label}
              </div>
              <div style={{
                fontFamily: '"Futura PT Book"', fontSize: '8px',
                letterSpacing: '0.03em', color: '#A89070', marginTop: '1px',
              }}>
                {item.sub}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Founder signature — kiosk footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        background: 'rgba(255,255,255,0.15)',
      }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            border: '1.5px solid rgba(200,28,36,0.32)',
          }}>
            <img src="/assets/psa-avatar-neutral.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          </div>
          <div>
            <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1A1A1A' }}>
              Katéena Armstrong
            </div>
            <div style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.05em', color: '#A89070' }}>
              Founder & CEO
            </div>
          </div>
          <span style={{
            marginLeft: 'auto', fontFamily: '"Covered By Your Grace"',
            fontSize: '22px', color: '#C81C24',
          }}>
            Fs
          </span>
        </div>
      </div>
    </div>
  );
}
