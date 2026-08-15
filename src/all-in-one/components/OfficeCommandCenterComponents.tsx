import { Link } from 'react-router-dom';
import type { OfficeAttentionItem, OfficeCommandCenterView, OfficeNextAction, OfficeWorkItemView } from '../office-core/officeWorkTypes';
import { OFFICE_WAITING_ON_LABELS } from '../office-core/officeWorkTypes';

export function OfficeCommandCenterHeader({ view }: { view: OfficeCommandCenterView }) {
  return (
    <header className="aio-oc-header">
      <p className="aio-oc-header__greeting">{view.greeting}</p>
      <p className="aio-oc-header__summary">
        You have <strong>{view.assignedCount}</strong> items assigned to you.
        {view.dueTodayCount > 0 && <> · <strong>{view.dueTodayCount}</strong> require attention today.</>}
        {view.customersWaitingOnUsCount > 0 && <> · <strong>{view.customersWaitingOnUsCount}</strong> customers are waiting on All In One.</>}
      </p>
    </header>
  );
}

export function OfficeNextActionHero({ action }: { action?: OfficeNextAction }) {
  if (!action) return null;
  return (
    <section className="aio-oc-next-action" aria-label="Your next action">
      <p className="aio-oc-section-label">Your Next Action</p>
      <h2>{action.title}</h2>
      {action.organizationName && <p className="aio-oc-next-action__org">{action.organizationName}</p>}
      <p>{action.description}</p>
      <span className="aio-oc-next-action__reason">{action.reason}</span>
      <Link to={action.ctaHref} className="aio-btn aio-btn--gold">{action.ctaLabel}</Link>
    </section>
  );
}

export function OfficeAttentionList({ items }: { items: OfficeAttentionItem[] }) {
  if (!items.length) return null;
  return (
    <section className="aio-oc-panel">
      <h2 className="aio-oc-panel__title">Needs Attention</h2>
      <ul className="aio-oc-attention-list">
        {items.map((item) => (
          <li key={item.id} className={`aio-oc-attention aio-oc-attention--${item.priority}`}>
            <div className="aio-oc-attention__head">
              <span>{item.category.replace('_', ' ').toUpperCase()}</span>
              {item.organizationName && <span>{item.organizationName}</span>}
            </div>
            <strong>{item.title}</strong>
            <p>{item.explanation}</p>
            {item.affectedAreas.length > 1 && (
              <p className="aio-oc-attention__areas">Affected: {item.affectedAreas.join(' · ')}</p>
            )}
            <Link to={item.ctaHref} className="aio-btn aio-btn--sm aio-btn--outline-dark">{item.ctaLabel}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OfficeWorkList({ title, items, emptyText }: { title: string; items: OfficeWorkItemView[]; emptyText?: string }) {
  return (
    <section className="aio-oc-panel">
      <h2 className="aio-oc-panel__title">{title}</h2>
      {items.length === 0 ? (
        <p className="aio-empty-state__text">{emptyText ?? 'None right now.'}</p>
      ) : (
        <ul className="aio-oc-work-list">
          {items.map((w) => (
            <li key={w.id} className="aio-oc-work-row">
              <div>
                <Link to={w.ctaHref} className="aio-oc-work-row__title">{w.title}</Link>
                <p className="aio-oc-work-row__meta">
                  {w.organizationName} · {w.statusLabel}
                  {w.isOverdue && <span className="aio-badge aio-badge--alert">Overdue</span>}
                  {w.isStale && <span className="aio-badge aio-badge--progress">No recent activity</span>}
                </p>
              </div>
              <div className="aio-oc-work-row__aside">
                {w.waitingOn !== 'none' && (
                  <span className="aio-oc-waiting">{OFFICE_WAITING_ON_LABELS[w.waitingOn]}</span>
                )}
                {w.dueAt && <time>{w.dueAt.slice(0, 10)}</time>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function OfficeQueueGrid({ queues }: { queues: OfficeCommandCenterView['queues'] }) {
  if (!queues.length) return null;
  return (
    <section className="aio-oc-panel">
      <h2 className="aio-oc-panel__title">Operational Queues</h2>
      <div className="aio-office-metrics">
        {queues.map((q) => (
          <Link key={q.id} to={q.href} className="aio-office-metric-card">
            <span className="aio-office-metric-card__value">{q.count}</span>
            <span className="aio-office-metric-card__label">{q.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function OfficeRoleModules({ modules }: { modules: OfficeCommandCenterView['roleModules'] }) {
  if (!modules.length) return null;
  return (
    <>
      {modules.map((mod) => (
        <section key={mod.id} className="aio-oc-panel">
          <h2 className="aio-oc-panel__title">{mod.title}</h2>
          <div className="aio-office-metrics">
            {mod.items.map((item) => (
              <Link key={item.label} to={item.href} className="aio-office-metric-card">
                <span className="aio-office-metric-card__value">{item.value}</span>
                <span className="aio-office-metric-card__label">{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export function OfficeManagerSummary({ view }: { view: OfficeCommandCenterView }) {
  const s = view.managerSummary;
  if (!s) return null;
  return (
    <section className="aio-oc-panel aio-oc-panel--dark">
      <h2 className="aio-oc-panel__title">Operational Summary</h2>
      <div className="aio-office-metrics">
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{s.customersWaitingOnUs}</span><span className="aio-office-metric-card__label">Customers Waiting on Us</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{s.unassignedWork}</span><span className="aio-office-metric-card__label">Unassigned</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{s.overdueWork}</span><span className="aio-office-metric-card__label">Overdue</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{s.escalations}</span><span className="aio-office-metric-card__label">Escalations</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{s.approvals}</span><span className="aio-office-metric-card__label">Approvals</span></div>
        <div className="aio-office-metric-card"><span className="aio-office-metric-card__value">{s.waitingExternally}</span><span className="aio-office-metric-card__label">Waiting Externally</span></div>
      </div>
      {view.bottlenecks.length > 0 && (
        <ul className="aio-oc-bottlenecks">
          {view.bottlenecks.map((b) => (
            <li key={b.label}><Link to={b.href}>{b.label}</Link></li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function OfficeAllCaughtUp() {
  return (
    <section className="aio-oc-caught-up">
      <h2>Queue clear for now.</h2>
      <p>No assigned work items require immediate action.</p>
    </section>
  );
}

export function OfficeWorkSkeleton() {
  return (
    <div className="aio-oc-skeleton" aria-busy="true" aria-label="Loading office data">
      <div className="aio-oc-skeleton__bar" />
      <div className="aio-oc-skeleton__bar aio-oc-skeleton__bar--short" />
      <div className="aio-oc-skeleton__grid">
        <div className="aio-oc-skeleton__card" />
        <div className="aio-oc-skeleton__card" />
        <div className="aio-oc-skeleton__card" />
      </div>
    </div>
  );
}
