import { useNavigate } from 'react-router-dom';

export function PSAConciergePanel() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '360px', transform: 'perspective(700px) rotateY(1.5deg)' }}>
      {/* Left thickness edge */}
      <div style={{
        position: 'absolute', top: '6px', left: '-7px', bottom: '-6px', width: '7px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.42) 100%)',
        borderRadius: '3px 0 0 3px',
      }} />
      {/* Bottom thickness edge */}
      <div style={{
        position: 'absolute', left: '-7px', right: '6px', bottom: '-6px', height: '6px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.07) 100%)',
        borderRadius: '0 0 3px 3px',
      }} />

      {/* Panel face */}
      <div style={{
        borderRadius: '6px',
        background: 'rgba(255,255,255,0.09)',
        backdropFilter: 'blur(72px) saturate(2.2) brightness(1.12)',
        WebkitBackdropFilter: 'blur(72px) saturate(2.2) brightness(1.12)',
        border: '1px solid rgba(255,255,255,0.24)',
        boxShadow: [
          'inset 0 1px 0 rgba(255,255,255,0.88)',
          '0 24px 56px rgba(0,0,0,0.22)',
          '0 8px 18px rgba(0,0,0,0.12)',
        ].join(', '),
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Top shimmer */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.95) 35%, rgba(255,255,255,0.95) 65%, transparent 92%)', zIndex: 20 }} />
        {/* Right red accent bar */}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '3px', background: 'linear-gradient(180deg, transparent 0%, rgba(200,28,36,0.75) 18%, rgba(200,28,36,0.75) 82%, transparent 100%)', zIndex: 15 }} />
        {/* Internal diagonal refraction */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(215deg, rgba(255,255,255,0.1) 0%, transparent 42%)', zIndex: 1 }} />

        {/* Header */}
        <div style={{ padding: '16px 22px 12px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '7.5px', letterSpacing: '0.38em', textTransform: 'uppercase', color: '#959B9B' }}>
              CONCIERGE SUITE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.75)', animation: 'pedestalPulse 3.5s ease-in-out infinite' }} />
              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', letterSpacing: '0.18em', color: '#22C55E' }}>AVAILABLE</span>
            </div>
          </div>
          <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '17px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A1A1A', lineHeight: 1.2 }}>
            PSA
          </div>
          <div style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.08em', color: '#9A8868', marginTop: '2px' }}>
            PERSONAL STYLE ADVISOR
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: '14px 22px 12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 10 }}>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#4A3728', lineHeight: 1.7, margin: 0 }}>
            Your personal styling advisor is ready to guide you through the Frontal Slayer flagship experience.
          </p>
        </div>

        {/* Service chips */}
        <div style={{ padding: '10px 20px 8px', position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['CONSULTATION', 'UNIT MATCH', 'HAIR ANALYSIS'].map(svc => (
            <span key={svc} style={{
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              fontFamily: '"Futura PT Book"', fontSize: '7.5px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#4A3728',
            }}>
              {svc}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '10px 20px 18px', position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => navigate('/psa')}
            style={{
              width: '100%', padding: '12px 0',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
              color: '#1A1A1A',
              fontFamily: '"Futura PT Medium"', fontSize: '10px', letterSpacing: '0.2em',
              textTransform: 'uppercase',
              border: '1px solid rgba(0,0,0,0.14)', borderRadius: '3px',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = '#C81C24'; el.style.color = '#FFFFFF'; el.style.borderColor = 'transparent'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'rgba(255,255,255,0.12)'; el.style.color = '#1A1A1A'; el.style.borderColor = 'rgba(0,0,0,0.14)'; }}
          >
            ENTER SUITE
          </button>
        </div>
      </div>
    </div>
  );
}
