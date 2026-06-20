import { useNavigate } from 'react-router-dom';

const SPECS = ['TEXTURE', 'LENGTH', 'COLOR', 'LACE', 'DENSITY', 'ADD-ONS'];

export function BuildAWigPanel() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '380px', transform: 'perspective(700px) rotateY(-1.5deg)' }}>
      {/* Right thickness edge */}
      <div style={{
        position: 'absolute', top: '6px', right: '-7px', bottom: '-6px', width: '7px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 100%)',
        borderRadius: '0 3px 3px 0',
      }} />
      {/* Bottom thickness edge */}
      <div style={{
        position: 'absolute', left: '6px', right: '-7px', bottom: '-6px', height: '6px',
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
        {/* Left red accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: 'linear-gradient(180deg, transparent 0%, rgba(200,28,36,0.75) 18%, rgba(200,28,36,0.75) 82%, transparent 100%)', zIndex: 15 }} />
        {/* Internal diagonal refraction */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, transparent 42%)', zIndex: 1 }} />

        {/* Header */}
        <div style={{ padding: '16px 20px 12px 22px', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '7.5px', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
              DESIGN STUDIO
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C81C24', boxShadow: '0 0 8px rgba(200,28,36,0.8)', animation: 'pedestalPulse 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', letterSpacing: '0.18em', color: '#C81C24' }}>LIVE</span>
            </div>
          </div>
          <div style={{ fontFamily: '"Futura PT Medium"', fontSize: '17px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFFFFF', lineHeight: 1.2 }}>
            BUILD-A-WIG
          </div>
          <div style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
            CONFIGURATION CONSOLE
          </div>
        </div>

        {/* Spec chips */}
        <div style={{ padding: '12px 20px 14px 22px', display: 'flex', flexWrap: 'wrap', gap: '6px', position: 'relative', zIndex: 10 }}>
          {SPECS.map(spec => (
            <span key={spec} style={{
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '20px',
              fontFamily: '"Futura PT Book"', fontSize: '7.5px',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)',
            }}>
              {spec}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: '0 20px 18px 20px', position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => navigate('/build-a-wig')}
            style={{
              width: '100%', padding: '12px 0',
              background: '#C81C24', color: '#FFFFFF',
              fontFamily: '"Futura PT Medium"', fontSize: '10px', letterSpacing: '0.2em',
              textTransform: 'uppercase', border: 'none', borderRadius: '3px',
              cursor: 'pointer', transition: 'opacity 0.2s ease',
              boxShadow: '0 4px 18px rgba(200,28,36,0.48)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
          >
            OPEN STUDIO
          </button>
        </div>
      </div>
    </div>
  );
}
