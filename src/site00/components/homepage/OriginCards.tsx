import { OriginPanelIcon } from './OriginPanelIcon';
import { ArrowIconSmall } from '../icons/ArrowAction';

type CollapsedCardProps = {
  number: string;
  title: string;
  subtitle: string;
  cta: string;
  panel: 'idnty' | 'bldr';
  onExpand: () => void;
};

export function CollapsedCard({ number, title, subtitle, cta, panel, onExpand }: CollapsedCardProps) {
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
        minHeight: 260,
        flex: '1 1 180px',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.8)',
        background: 'var(--site-surface-glass)',
        overflow: 'visible',
      }}
      aria-label={`Expand ${title}`}
    >
      <span
        className="site00-label-red site00-origin-card__number"
        style={{ color: 'var(--site00-origin-card-number-color, var(--site-text))' }}
      >
        {number}
      </span>
      <span className="site00-panel-title" style={{ marginTop: 8 }}>
        {title}
      </span>
      <span className="site00-label" style={{ marginTop: 4 }}>
        {subtitle}
      </span>
      <div className="site00-origin-card__icon-wrap">
        <OriginPanelIcon panel={panel} />
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
          panel="idnty"
          onExpand={onExpandIdnty}
        />
        <CollapsedCard
          number="02"
          title="BLDR"
          subtitle="START MY BUILD."
          cta="BEGIN BLDR"
          panel="bldr"
          onExpand={onExpandBldr}
        />
      </div>
    </div>
  );
}
