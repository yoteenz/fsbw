import { Link } from 'react-router-dom';
import type { ClientAttentionItem, ClientCommandCenterView, ClientNextAction } from '../portal/clientCommandCenterTypes';
import { clientTypeDisplay } from '../portal/clientCommandCenterService';
import { RoadReadyRing } from './RoadReadyRing';
import { ROAD_READY_PRODUCT_NAME } from '../road-ready/roadReadyConfig';
import { formatMoney } from '../billing/money';
import { aioPaths } from '../utils/paths';

export function CommandCenterHeader({ view }: { view: ClientCommandCenterView }) {
  const { context, greeting, businessStatus } = view;
  return (
    <header className="aio-cc-header">
      <p className="aio-cc-header__greeting">{greeting}</p>
      <h1>{context.companyName}</h1>
      <p className="aio-cc-header__meta">
        {clientTypeDisplay(context)} ·{' '}
        <span className={`aio-cc-status aio-cc-status--${businessStatus.tone}`}>{businessStatus.label}</span>
      </p>
      <p className="aio-cc-header__detail">{businessStatus.detail}</p>
    </header>
  );
}

export function NextActionHero({ action }: { action?: ClientNextAction }) {
  if (!action) return null;
  return (
    <section className="aio-cc-next-action" aria-label="Your next action">
      <p className="aio-cc-section-label">Your Next Action</p>
      <h2>{action.title}</h2>
      <p>{action.description}</p>
      <Link to={action.ctaHref} className="aio-btn aio-btn--gold">{action.ctaLabel}</Link>
    </section>
  );
}

export function AttentionCenter({ items }: { items: ClientAttentionItem[] }) {
  if (!items.length) return null;
  return (
    <section className="aio-cc-panel aio-cc-panel--wide">
      <h2 className="aio-cc-panel__title">Needs Your Attention</h2>
      <ul className="aio-cc-attention-list">
        {items.map((item) => (
          <li key={item.id} className={`aio-cc-attention aio-cc-attention--${item.priority}`}>
            <div className="aio-cc-attention__head">
              <span className="aio-cc-attention__category">{item.category.replace('_', ' ').toUpperCase()}</span>
              {item.deadlineLabel && <span className="aio-cc-attention__deadline">{item.deadlineLabel}</span>}
            </div>
            <strong>{item.title}</strong>
            <p>{item.explanation}</p>
            {item.affectedAreas.length > 1 && (
              <p className="aio-cc-attention__areas">Also affects: {item.affectedAreas.join(' · ')}</p>
            )}
            <Link to={item.ctaHref} className="aio-btn aio-btn--sm aio-btn--outline">{item.ctaLabel}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AllCaughtUpBanner({ view }: { view: ClientCommandCenterView }) {
  if (!view.allCaughtUp) return null;
  return (
    <section className="aio-cc-caught-up">
      <h2>You&apos;re all caught up.</h2>
      <p>No currently tracked items require action.</p>
      {view.nextUpcoming && (
        <p>Next upcoming: {view.nextUpcoming.title} — {view.nextUpcoming.daysLabel}</p>
      )}
    </section>
  );
}

export function RoadReadyHero({ view }: { view: ClientCommandCenterView }) {
  const rr = view.roadReady;
  if (!rr || view.context.isShipper) return null;
  return (
    <section className="aio-cc-panel">
      <h2 className="aio-cc-panel__title">{ROAD_READY_PRODUCT_NAME}</h2>
      <div className="aio-portal-rr-summary">
        <RoadReadyRing setupProgress={rr.setupProgress} verifiedProgress={rr.verifiedProgress} dual size="sm" />
        <div>
          <p><strong>{rr.setupProgress}%</strong> setup · <strong>{rr.verifiedProgress}%</strong> verified</p>
          <p>{rr.attentionCount} items need attention</p>
          <Link to={rr.ctaHref} className="aio-portal-panel__link">View {ROAD_READY_PRODUCT_NAME} →</Link>
        </div>
      </div>
    </section>
  );
}

export function BusinessHealthGrid({ view }: { view: ClientCommandCenterView }) {
  const h = view.businessHealth;
  return (
    <section className="aio-cc-health-grid">
      {h.roadReady && (
        <div className="aio-cc-health-card">
          <span>Road Ready</span>
          <strong>{h.roadReady.setupProgress}% setup</strong>
        </div>
      )}
      <div className="aio-cc-health-card">
        <span>Documents</span>
        <strong>{h.documents.verified} verified · {h.documents.needsAttention} attention</strong>
      </div>
      <div className="aio-cc-health-card">
        <span>Renewals</span>
        <strong>{h.renewalsUpcoming} upcoming</strong>
      </div>
      {h.insuranceStatus && (
        <div className="aio-cc-health-card">
          <span>Insurance</span>
          <strong>{h.insuranceStatus.replace('_', ' ')}</strong>
        </div>
      )}
      {h.fleet && (
        <div className="aio-cc-health-card">
          <span>Fleet</span>
          <strong>{h.fleet.active} active · {h.fleet.needsAttention} attention</strong>
        </div>
      )}
      {h.billing && view.context.canViewBilling && (
        <div className="aio-cc-health-card">
          <span>All In One Billing</span>
          <strong>{formatMoney(h.billing.balanceDueMinor)} due</strong>
        </div>
      )}
    </section>
  );
}

export function CurrentLoadHero({ view }: { view: ClientCommandCenterView }) {
  const load = view.operations?.currentLoad;
  if (!load) return null;
  return (
    <section className="aio-cc-load-hero">
      <p className="aio-cc-section-label">Current Load</p>
      <h2>{load.origin} → {load.destination}</h2>
      <p>Status: {load.statusLabel} · Delivery: {load.deliveryLabel}</p>
      <p>Next: {load.nextActionLabel} · BOL {load.bolComplete ? '✓' : 'pending'} · POD {load.podComplete ? '✓' : 'pending'}</p>
      <Link to={load.href} className="aio-btn aio-btn--gold aio-btn--sm">View Load</Link>
    </section>
  );
}

export function MoneySummaryCards({ view }: { view: ClientCommandCenterView }) {
  const m = view.money;
  if (!m) return null;
  return (
    <section className="aio-cc-money-grid">
      {m.showAioBilling && m.aioBalanceDueMinor != null && (
        <div className="aio-cc-money-card">
          <span>All In One Balance Due</span>
          <strong>{formatMoney(m.aioBalanceDueMinor)}</strong>
          <small>Service invoices only</small>
        </div>
      )}
      {m.showFreightReceivables && m.freightReceivablesInProcessMinor != null && (
        <div className="aio-cc-money-card">
          <span>Freight Receivables In Process</span>
          <strong>{formatMoney(m.freightReceivablesInProcessMinor)}</strong>
          <small>Not All In One revenue</small>
        </div>
      )}
      {m.showFactoring && m.factoringInProcessMinor != null && (
        <div className="aio-cc-money-card">
          <span>Factoring In Process</span>
          <strong>{formatMoney(m.factoringInProcessMinor)}</strong>
          <small>Reported funding — separate domain</small>
        </div>
      )}
      {m.showBrokeragePayables && m.brokeragePayablesMinor != null && (
        <div className="aio-cc-money-card">
          <span>Brokerage Payables</span>
          <strong>{formatMoney(m.brokeragePayablesMinor)}</strong>
          <small>Carrier pay — not service billing</small>
        </div>
      )}
    </section>
  );
}

export function QuickActionsBar({ view }: { view: ClientCommandCenterView }) {
  return (
    <section className="aio-cc-quick-actions">
      <p className="aio-cc-section-label">Quick Actions</p>
      <div className="aio-cc-quick-actions__grid">
        {view.quickActions.map((a) => (
          <Link key={a.id} to={a.href} className="aio-cc-quick-action">{a.label}</Link>
        ))}
      </div>
    </section>
  );
}

export function UpcomingList({ view }: { view: ClientCommandCenterView }) {
  if (!view.upcoming.length) return null;
  return (
    <section className="aio-cc-panel">
      <h2 className="aio-cc-panel__title">Coming Up</h2>
      {view.upcoming.slice(0, 6).map((u) => (
        <div key={u.id} className="aio-portal-list__item">
          <span>{u.title}<br /><small>{u.daysLabel}</small></span>
          <Link to={u.href} className="aio-badge aio-badge--progress">View</Link>
        </div>
      ))}
    </section>
  );
}

export function NotificationDigest({ view }: { view: ClientCommandCenterView }) {
  const d = view.notificationDigest;
  if (!d.unread) return null;
  return (
    <section className="aio-cc-notif-digest">
      <span>{d.unread} unread</span>
      {d.urgent > 0 && <span>{d.urgent} urgent</span>}
      {d.documentRequests > 0 && <span>{d.documentRequests} document requests</span>}
      <Link to={aioPaths.portalCommunication}>View notifications →</Link>
    </section>
  );
}

export function BackToCommandCenter() {
  return (
    <p className="aio-cc-back">
      <Link to={aioPaths.portal}>← Back to Command Center</Link>
    </p>
  );
}
