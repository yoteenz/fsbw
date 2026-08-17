import { Link } from 'react-router-dom';
import type { IdentityBrandState } from '../../config/identity';
import { GeometricIcon, identityComplexityIcon } from '../icons/GeometricIcon';
import { ArrowIconSmall } from '../icons/ArrowAction';

type StateCardProps = {
  state: IdentityBrandState;
  selected?: boolean;
  onSelect: (stateId: string) => void;
};

export function StateCard({ state, selected, onSelect }: StateCardProps) {
  return (
    <button
      type="button"
      className={`site00-state-card ${selected ? 'site00-state-card--selected' : ''}`.trim()}
      onClick={() => onSelect(state.id)}
      aria-pressed={selected}
    >
      <span className="site00-label-red">{state.code}</span>
      <div style={{ margin: '16px 0', flex: 1, display: 'flex', alignItems: 'center' }}>
        <GeometricIcon variant={identityComplexityIcon(state.iconComplexity)} size="md" />
      </div>
      <p
        style={{
          fontFamily: 'var(--site-font-sans)',
          fontSize: 12,
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}
      >
        {state.title}
      </p>
      <p className="site00-body" style={{ fontSize: 11, whiteSpace: 'pre-line', marginBottom: 16 }}>
        {state.description}
      </p>
      <span className="site00-action-link site00-action-link--red">
        SELECT STATE
        <ArrowIconSmall />
      </span>
    </button>
  );
}

type BuildClassCardProps = {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  icon: 'site' | 'world' | 'enterprise' | 'discovery';
  cta: string;
  selected?: boolean;
  onSelect: () => void;
};

export function BuildClassCard({
  code,
  title,
  subtitle,
  description,
  icon,
  cta,
  selected,
  onSelect,
}: BuildClassCardProps) {
  return (
    <button
      type="button"
      className={`site00-state-card ${selected ? 'site00-state-card--selected' : ''}`.trim()}
      onClick={onSelect}
      aria-pressed={selected}
      style={{ minHeight: 320 }}
    >
      <span className="site00-label-red">{code}</span>
      <div style={{ margin: '12px 0', flex: 1, display: 'flex', alignItems: 'center' }}>
        <GeometricIcon variant={icon} size="md" />
      </div>
      <p
        style={{
          fontFamily: 'var(--site-font-sans)',
          fontSize: 14,
          letterSpacing: '0.08em',
          marginBottom: 4,
        }}
      >
        {title}
      </p>
      <p className="site00-label" style={{ marginBottom: 8 }}>
        {subtitle}
      </p>
      <p className="site00-body" style={{ fontSize: 11, marginBottom: 16, flex: 1 }}>
        {description}
      </p>
      <span className="site00-action-link site00-action-link--red">{cta}</span>
    </button>
  );
}

type InvestmentColumnProps = {
  label: string;
  priceLabel: string;
  items: string[];
  iconVariant?: 'cube-simple' | 'cube-medium' | 'cube-complex' | 'cube-solid' | undefined;
};

export function InvestmentColumn({ label, priceLabel, items, iconVariant }: InvestmentColumnProps) {
  return (
    <div style={{ padding: '12px 8px' }}>
      {iconVariant ? (
        <div style={{ marginBottom: 8 }}>
          <GeometricIcon variant={iconVariant} size="sm" />
        </div>
      ) : null}
      <p className="site00-label-red" style={{ marginBottom: 4 }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--site-font-sans)',
          fontSize: 12,
          letterSpacing: '0.06em',
          marginBottom: 8,
        }}
      >
        {priceLabel}
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => (
          <li key={item} className="site00-body" style={{ fontSize: 10, marginBottom: 4 }}>
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type WorkflowSummaryProps = {
  text: string;
};

export function WorkflowSummary({ text }: WorkflowSummaryProps) {
  return (
    <p
      className="site00-mono"
      style={{
        textAlign: 'center',
        padding: '24px 16px',
        textTransform: 'uppercase',
        color: 'var(--site-text-muted)',
      }}
    >
      {text}
    </p>
  );
}

type DirectoryRowProps = {
  number?: string;
  title: string;
  description: string;
  href: string;
  enabled: boolean;
};

export function DirectoryRow({ number, title, description, href, enabled }: DirectoryRowProps) {
  const content = (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, minWidth: 0, flex: 1 }}>
        {number ? (
          <span className="site00-mono" style={{ color: 'var(--site-text-muted)', flexShrink: 0 }}>
            {number}
          </span>
        ) : (
          <GeometricIcon variant="cube" size="sm" />
        )}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'var(--site-font-sans)',
              fontSize: 12,
              letterSpacing: '0.08em',
              margin: 0,
            }}
          >
            {title}
          </p>
          <p className="site00-body" style={{ fontSize: 11, color: 'var(--site-text-muted)', margin: '2px 0 0' }}>
            {description}
          </p>
        </div>
      </div>
      <ArrowIconSmall />
    </>
  );

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '12px 0',
    borderBottom: '1px solid var(--site-border)',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--site-border)',
    cursor: enabled ? 'pointer' : 'not-allowed',
    opacity: enabled ? 1 : 0.45,
  };

  if (enabled) {
    return (
      <Link to={href} style={{ ...rowStyle, textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    );
  }

  return (
    <div style={rowStyle} aria-disabled="true">
      {content}
    </div>
  );
}
