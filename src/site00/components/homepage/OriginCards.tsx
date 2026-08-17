import { useNavigate } from 'react-router-dom';
import { SITE00_ROUTES } from '../../config/routes';
import { GeometricIcon } from '../icons/GeometricIcon';
import { ArrowIconSmall } from '../icons/ArrowAction';

type CollapsedCardProps = {
  number: string;
  title: string;
  subtitle: string;
  cta: string;
  onExpand: () => void;
};

export function CollapsedCard({ number, title, subtitle, cta, onExpand }: CollapsedCardProps) {
  return (
    <button
      type="button"
      className="site00-glass-panel"
      onClick={onExpand}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px',
        minWidth: 180,
        maxWidth: 220,
        flex: '1 1 180px',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.8)',
        background: 'var(--site-surface-glass)',
      }}
      aria-label={`Expand ${title}`}
    >
      <span className="site00-label-red">{number}</span>
      <span
        style={{
          fontFamily: 'var(--site-font-sans)',
          fontSize: 22,
          letterSpacing: '0.08em',
          marginTop: 8,
        }}
      >
        {title}
      </span>
      <span className="site00-label" style={{ marginTop: 4 }}>
        {subtitle}
      </span>
      <div style={{ margin: '16px 0' }}>
        <GeometricIcon variant={number === '01' ? 'idnty-header' : 'bldr-header'} size="md" />
      </div>
      <span className="site00-action-link" style={{ marginTop: 'auto' }}>
        {cta}
        <ArrowIconSmall />
      </span>
    </button>
  );
}

type OriginCardsProps = {
  onExpandIdnty: () => void;
  onExpandBldr: () => void;
};

export function OriginCards({ onExpandIdnty, onExpandBldr }: OriginCardsProps) {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', paddingBottom: 80 }}>
      <p className="site00-label-red" style={{ marginBottom: 8 }}>
        WHERE DO WE BEGIN?
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 16,
          opacity: 0.5,
        }}
        aria-hidden="true"
      >
        <span style={{ width: 40, height: 1, background: 'var(--site-red)' }} />
        <span style={{ fontSize: 10, color: 'var(--site-red)' }}>▼</span>
        <span style={{ width: 40, height: 1, background: 'var(--site-red)' }} />
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 16,
          maxWidth: 520,
          margin: '0 auto',
        }}
      >
        <CollapsedCard
          number="01"
          title="IDNTY"
          subtitle="DEFINE MY BRAND."
          cta="BEGIN IDNTY"
          onExpand={() => {
            onExpandIdnty();
          }}
        />
        <CollapsedCard
          number="02"
          title="BLDR"
          subtitle="START MY BUILD."
          cta="BEGIN BLDR"
          onExpand={() => {
            onExpandBldr();
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="site00-action-link site00-action-link--red"
          onClick={() => navigate(SITE00_ROUTES.idntyState)}
        >
          BEGIN IDNTY
          <ArrowIconSmall />
        </button>
        <button
          type="button"
          className="site00-action-link site00-action-link--red"
          onClick={() => navigate(SITE00_ROUTES.bldrState)}
        >
          BEGIN BLDR
          <ArrowIconSmall />
        </button>
      </div>
    </div>
  );
}
