import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoStore } from '../demo/useDemoStore';
import { resolveOfficeStaffContext } from '../office-core/officeContext';
import { hasManagementPermission } from './managementPermissions';
import { getMetricDefinition } from './managementMetricRegistry';
import { formatMetricCount, formatMetricMoney } from './managementFormat';
import { resolveManagementDateRange } from './managementDateRange';
import type { AttentionSeverity, ManagementPeriodId } from './managementTypes';

export function ManagementGate({
  permission,
  children,
  fallback,
}: {
  permission: Parameters<typeof hasManagementPermission>[1];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const store = useDemoStore();
  const ctx = resolveOfficeStaffContext(store);
  if (!hasManagementPermission(ctx, permission)) {
    return (
      fallback ?? (
        <div className="aio-office-page">
          <p className="aio-prototype-note">You do not have permission to view this management area.</p>
        </div>
      )
    );
  }
  return <>{children}</>;
}

const PERIODS: { id: ManagementPeriodId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
  { id: 'year', label: 'This Year' },
];

export function ManagementPeriodFilter({
  periodId,
  onChange,
  comparePrevious,
  onCompareChange,
  dateBasisLabel,
}: {
  periodId: ManagementPeriodId;
  onChange: (id: ManagementPeriodId) => void;
  comparePrevious?: boolean;
  onCompareChange?: (v: boolean) => void;
  dateBasisLabel?: string;
}) {
  return (
    <div className="aio-mgmt-filters">
      <div className="aio-filter-row">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`aio-chip ${periodId === p.id ? 'aio-chip--active' : ''}`}
            onClick={() => onChange(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {onCompareChange && (
        <label className="aio-mgmt-compare">
          <input type="checkbox" checked={comparePrevious} onChange={(e) => onCompareChange(e.target.checked)} />
          vs previous period
        </label>
      )}
      {dateBasisLabel && <p className="aio-muted aio-mgmt-date-basis">Date basis: {dateBasisLabel}</p>}
    </div>
  );
}

export function ManagementHero({ subtitle }: { subtitle?: string }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <header className="aio-mgmt-hero">
      <p className="aio-mgmt-hero__today">TODAY · {today.toUpperCase()}</p>
      <h1>Management Command Center</h1>
      <p className="aio-mgmt-hero__sub">
        {subtitle ?? 'A live view of sales, service, money, operations, customers, and risk across All In One.'}
      </p>
    </header>
  );
}

export function MetricCard({
  label,
  value,
  metricKey,
  href,
  comparison,
  incomplete,
  unknown,
}: {
  label: string;
  value: string;
  metricKey?: string;
  href?: string;
  comparison?: string;
  incomplete?: boolean;
  unknown?: boolean;
}) {
  const def = metricKey ? getMetricDefinition(metricKey) : undefined;
  const inner = (
    <>
      <span className="aio-metric-card__value">{unknown ? '—' : value}</span>
      <span className="aio-metric-card__label">{label}</span>
      {comparison && <span className="aio-muted aio-metric-card__compare">{comparison}</span>}
      {incomplete && <span className="aio-badge aio-badge--urgent">Incomplete data</span>}
      {def && <MetricExplainer description={def.description} />}
    </>
  );
  if (href) {
    return (
      <Link to={href} className="aio-metric-card aio-metric-card--link">
        {inner}
      </Link>
    );
  }
  return <div className="aio-metric-card">{inner}</div>;
}

export function MetricExplainer({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="aio-metric-explainer">
      <button type="button" className="aio-link-btn aio-link-btn--sm" onClick={() => setOpen((o) => !o)}>
        What does this mean?
      </button>
      {open && <span className="aio-metric-explainer__text">{description}</span>}
    </span>
  );
}

export function AttentionCard({
  severity,
  title,
  explanation,
  whyItMatters,
  recommendedAction,
  organizationName,
  ownerLabel,
  ageLabel,
  ctaLabel,
  ctaHref,
  onAcknowledge,
}: {
  severity: AttentionSeverity;
  title: string;
  explanation: string;
  whyItMatters: string;
  recommendedAction: string;
  organizationName?: string;
  ownerLabel?: string;
  ageLabel?: string;
  ctaLabel: string;
  ctaHref: string;
  onAcknowledge?: () => void;
}) {
  return (
    <article className={`aio-mgmt-attention aio-mgmt-attention--${severity}`}>
      <div className="aio-mgmt-attention__head">
        <span className={`aio-badge aio-badge--${severity === 'urgent' ? 'urgent' : 'progress'}`}>{severity}</span>
        <strong>{title}</strong>
      </div>
      <p>{explanation}</p>
      <p className="aio-muted"><em>Why it matters:</em> {whyItMatters}</p>
      <p className="aio-muted"><em>Recommended:</em> {recommendedAction}</p>
      <div className="aio-mgmt-attention__meta">
        {organizationName && <span>{organizationName}</span>}
        {ownerLabel && <span>Owner: {ownerLabel}</span>}
        {ageLabel && <span>{ageLabel}</span>}
      </div>
      <div className="aio-inline-actions">
        <Link to={ctaHref} className="aio-btn aio-btn--sm aio-btn--gold">{ctaLabel}</Link>
        {onAcknowledge && (
          <button type="button" className="aio-btn aio-btn--sm aio-btn--outline" onClick={onAcknowledge}>
            Acknowledge
          </button>
        )}
      </div>
    </article>
  );
}

export function SectionNav({ items }: { items: { label: string; to: string }[] }) {
  return (
    <nav className="aio-mgmt-section-nav">
      {items.map((i) => (
        <Link key={i.to} to={i.to} className="aio-mgmt-section-nav__link">{i.label}</Link>
      ))}
    </nav>
  );
}

export function WaterfallChart({
  grossMinor,
  passThroughMinor,
  refundsMinor,
  serviceMinor,
}: {
  grossMinor: number;
  passThroughMinor: number;
  refundsMinor: number;
  serviceMinor: number;
}) {
  return (
    <div className="aio-mgmt-waterfall" role="img" aria-label="Financial waterfall from gross payments to service fees collected">
      <div className="aio-mgmt-waterfall__row">
        <span>Gross customer payments</span>
        <strong>{formatMetricMoney(grossMinor)}</strong>
      </div>
      <div className="aio-mgmt-waterfall__row aio-mgmt-waterfall__row--deduct">
        <span>Less pass-through</span>
        <strong>−{formatMetricMoney(passThroughMinor)}</strong>
      </div>
      <div className="aio-mgmt-waterfall__row aio-mgmt-waterfall__row--deduct">
        <span>Less refunds</span>
        <strong>−{formatMetricMoney(refundsMinor)}</strong>
      </div>
      <div className="aio-mgmt-waterfall__row aio-mgmt-waterfall__row--total">
        <span>= Service fees collected</span>
        <strong>{formatMetricMoney(serviceMinor)}</strong>
      </div>
      <p className="aio-muted">Not accounting profit. Pass-through is not All In One revenue.</p>
    </div>
  );
}

export function HealthGrid({ areas }: { areas: { area: string; state: string; detail: string }[] }) {
  return (
    <div className="aio-mgmt-health-grid">
      {areas.map((a) => (
        <div key={a.area} className={`aio-mgmt-health aio-mgmt-health--${a.state}`}>
          <span className="aio-mgmt-health__area">{a.area}</span>
          <span className="aio-mgmt-health__state">{a.state.replace(/_/g, ' ')}</span>
          <span className="aio-muted">{a.detail}</span>
        </div>
      ))}
    </div>
  );
}

export function useManagementPeriod(defaultId: ManagementPeriodId = 'month') {
  const store = useDemoStore();
  const prefs = store.managementPreferences;
  const [periodId, setPeriodId] = useState<ManagementPeriodId>(prefs?.defaultPeriodId ?? defaultId);
  const [comparePrevious, setComparePrevious] = useState(false);
  const range = useMemo(
    () => resolveManagementDateRange(periodId, new Date(), undefined, undefined, comparePrevious),
    [periodId, comparePrevious],
  );
  return { periodId, setPeriodId, comparePrevious, setComparePrevious, range };
}

export function FunnelBar({ stages }: { stages: { label: string; count: number }[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div className="aio-mgmt-funnel" role="list" aria-label="Sales funnel">
      {stages.map((s) => (
        <div key={s.label} className="aio-mgmt-funnel__stage" role="listitem">
          <span>{s.label}</span>
          <div className="aio-mgmt-funnel__bar" style={{ width: `${Math.max(8, (s.count / max) * 100)}%` }} />
          <strong>{formatMetricCount(s.count)}</strong>
        </div>
      ))}
    </div>
  );
}
