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
      <span className="site00-label site00-origin-card__number">{number}</span>
      <span className="site00-panel-title" style={{ marginTop: 8 }}>
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
  return (
    <div className="site00-origin-cards">
      <p className="site00-label-red site00-origin-cards__prompt">WHERE DO WE BEGIN?</p>
      <div className="site00-origin-cards__pointer" aria-hidden="true">
        <span />
        <span>▼</span>
        <span />
      </div>
      <div className="site00-origin-cards__row">
        <CollapsedCard
          number="01"
          title="IDNTY"
          subtitle="DEFINE MY BRAND."
          cta="BEGIN IDNTY"
          onExpand={onExpandIdnty}
        />
        <CollapsedCard
          number="02"
          title="BLDR"
          subtitle="START MY BUILD."
          cta="BEGIN BLDR"
          onExpand={onExpandBldr}
        />
      </div>
    </div>
  );
}
