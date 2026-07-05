import { Link } from 'react-router-dom';
import type { ChiefConciergeBrief } from '../../../../studio-os-core/studio-immersion/types';
import { SI_VISUAL } from './studioImmersionTheme';

type Props = {
  brief: ChiefConciergeBrief;
  compact?: boolean;
};

/** Chief Concierge proactive guidance — contextual · calm · non-intrusive. */
export function StudioChiefConciergeBrief({ brief, compact = false }: Props) {
  return (
    <section
      className="studio-living-panel studio-glass-sheen studio-glass-depth mb-2 px-3 py-2 rounded-sm"
      style={{
        border: '1.3px solid rgba(146,112,74,0.22)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(250,248,245,0.92) 100%)',
      }}
      data-studio-manual="chief-concierge-brief"
    >
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '6px',
          letterSpacing: '0.08em',
          color: SI_VISUAL.champagne,
          margin: 0,
        }}
      >
        CHIEF CONCIERGE · TODAY&apos;S GUIDANCE
      </p>
      <p
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          fontSize: compact ? '14px' : '16px',
          color: '#1a1a1a',
          margin: '4px 0 6px',
        }}
      >
        {brief.greeting}
      </p>
      <div className="space-y-1">
        {brief.lines.slice(0, compact ? 2 : 4).map((line: string) => (
          <p
            key={line}
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '7px',
              color: '#444',
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            {line}
          </p>
        ))}
      </div>
      {brief.cta ? (
        <Link
          to={brief.cta.route}
          style={{
            display: 'inline-block',
            marginTop: 8,
            fontFamily: '"Futura PT Medium"',
            fontSize: '6px',
            letterSpacing: '0.06em',
            color: '#EB1C24',
            textDecoration: 'none',
          }}
        >
          → {brief.cta.label}
        </Link>
      ) : null}
    </section>
  );
}
