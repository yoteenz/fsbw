import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../../demo/useDemoStore';
import { getOfficeBookkeepingMetrics } from '../../demo/bookkeepingActions';
import { DEMO_BOOKKEEPING_LABEL } from '../../bookkeeping/bookkeepingConfig';
import { planDisplayName } from '../../bookkeeping/bookkeepingRecommendation';
import { formatMoney } from '../../billing/money';
import { aioPaths } from '../../utils/paths';

const QUEUES = [
  { key: 'newLeads', label: 'New Leads' },
  { key: 'pricingReview', label: 'Pricing Review' },
  { key: 'booksRescue', label: 'Books Rescue' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'active', label: 'Active Monthly' },
  { key: 'waitingDocuments', label: 'Waiting on Documents' },
  { key: 'reconciliation', label: 'Reconciliation' },
  { key: 'reportsDue', label: 'Report Delivery' },
  { key: 'overdue', label: 'Overdue' },
] as const;

export function BookkeepingCommandCenterPage() {
  const store = useDemoStore();
  const metrics = useMemo(() => getOfficeBookkeepingMetrics(store), [store]);
  const subs = store.bookkeepingSubscriptions ?? [];
  const leads = store.bookkeepingLeads ?? [];

  return (
    <div className="aio-bk-office">
      <header className="aio-office-page__header">
        <h1>Bookkeeping Command Center</h1>
        <p>{DEMO_BOOKKEEPING_LABEL}</p>
        <div className="aio-office-action-bar">
          <Link to={aioPaths.officeBookkeepingSubscriptions} className="aio-btn aio-btn--sm">Subscriptions</Link>
          <Link to={aioPaths.officeBookkeepingRescue} className="aio-btn aio-btn--sm">Books Rescue</Link>
          <Link to={aioPaths.officeBookkeepingLeads} className="aio-btn aio-btn--sm">Leads</Link>
        </div>
      </header>

      <div className="aio-factoring-office-metrics">
        {QUEUES.map(({ key, label }) => (
          <div key={key} className="aio-office-metric-card">
            <span className="aio-office-metric-card__value">{metrics[key] ?? 0}</span>
            <span className="aio-office-metric-card__label">{label}</span>
          </div>
        ))}
      </div>

      <section className="aio-office-panel">
        <h2>Active subscriptions</h2>
        {subs.map((s) => {
          const client = store.clients.find((c) => c.id === s.organizationId);
          return (
            <Link key={s.id} to={aioPaths.officeClient(s.organizationId)} className="aio-office-list-row">
              <span>{client?.companyName ?? s.organizationId}</span>
              <span>{planDisplayName(s.plan)}</span>
              <span>{s.status.replace(/_/g, ' ')}</span>
            </Link>
          );
        })}
      </section>

      <section className="aio-office-panel">
        <h2>Recent leads</h2>
        {leads.slice(0, 5).map((l) => (
          <div key={l.id} className="aio-office-list-row">
            <span>{l.contactEmail ?? 'Assessment lead'}</span>
            <span>{l.status.replace(/_/g, ' ')}</span>
            <span>{l.recommendation ? planDisplayName(l.recommendation.recommendedPlan) : '—'}</span>
          </div>
        ))}
      </section>
    </div>
  );
}

export function BookkeepingSubscriptionsListPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBookkeeping} className="aio-office-link">← Command Center</Link>
      <h1>Bookkeeping Subscriptions</h1>
      <div className="aio-office-table-wrap">
        <table className="aio-office-table">
          <thead>
            <tr><th>Client</th><th>Plan</th><th>Billing</th><th>Status</th><th>Price</th></tr>
          </thead>
          <tbody>
            {(store.bookkeepingSubscriptions ?? []).map((s) => {
              const client = store.clients.find((c) => c.id === s.organizationId);
              const price = s.finalPriceMinor ?? s.basePriceMinor;
              return (
                <tr key={s.id}>
                  <td>{client?.companyName}</td>
                  <td>{planDisplayName(s.plan)}</td>
                  <td>{s.billingInterval}</td>
                  <td>{s.status}</td>
                  <td>{price ? formatMoney(price) : 'Review'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BookkeepingRescueListPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBookkeeping} className="aio-office-link">← Command Center</Link>
      <h1>Books Rescue</h1>
      {(store.booksRescueEngagements ?? []).map((r) => {
        const client = store.clients.find((c) => c.id === r.organizationId);
        return (
          <div key={r.id} className="aio-office-panel">
            <h2>{client?.companyName}</h2>
            <p>{r.status} · {r.monthsBehind?.replace(/_/g, ' ')} behind</p>
            {r.quoteMinor != null && <p>Quote: {formatMoney(r.quoteMinor)}</p>}
            {r.recommendedPlanAfter && <p>After cleanup: {planDisplayName(r.recommendedPlanAfter)}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function BookkeepingLeadsListPage() {
  const store = useDemoStore();
  return (
    <div className="aio-office-page">
      <Link to={aioPaths.officeBookkeeping} className="aio-office-link">← Command Center</Link>
      <h1>Bookkeeping Leads</h1>
      {(store.bookkeepingLeads ?? []).map((l) => (
        <div key={l.id} className="aio-office-list-row">
          <span>{l.contactEmail ?? l.id}</span>
          <span>{l.status}</span>
          <span>{l.recommendation?.recommendedPlan ?? '—'}</span>
        </div>
      ))}
    </div>
  );
}
