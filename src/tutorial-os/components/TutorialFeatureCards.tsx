import type { TutorialFeatureCardDef } from '../types';

type Props = {
  features: TutorialFeatureCardDef[];
  onShowMe: (feature: TutorialFeatureCardDef) => void;
};

export function TutorialFeatureCards({ features, onShowMe }: Props) {
  if (features.length === 0) return null;
  return (
    <div className="tutorial-os-feature-cards" style={{ marginBottom: '14px' }}>
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '9px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#808080',
          marginBottom: '8px',
        }}
      >
        EXPLORE FEATURES
      </p>
      <div className="flex flex-col gap-2">
        {features.map((f) => (
          <div
            key={f.id}
            style={{
              border: '1.3px solid rgba(0,0,0,0.15)',
              borderRadius: '6px',
              padding: '10px',
              background: 'rgba(255,255,255,0.55)',
            }}
          >
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '10px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#EB1C24',
                marginBottom: '4px',
              }}
            >
              {f.title}
            </p>
            <p
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '10px',
                lineHeight: 1.4,
                textTransform: 'uppercase',
                color: '#1A1A1A',
                marginBottom: '6px',
              }}
            >
              {f.description}
            </p>
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '9px',
                color: '#808080',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              {f.benefits.join(' · ')}
            </p>
            <button type="button" onClick={() => onShowMe(f)} className="tutorial-os-btn tutorial-os-btn--outline">
              SHOW ME
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
