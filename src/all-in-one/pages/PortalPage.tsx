import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDemoStore } from '../demo/useDemoStore';
import { getPortalRequests } from '../demo/demoActions';
import {
  getCalendarEvents,
  getOrganizationId,
  getPortalNotifications,
  getRenewals,
  getVaultDocuments,
} from '../demo/vaultActions';
import { RoadReadyRing } from '../components/RoadReadyRing';
import { RoadReadyAttentionCenter, RoadReadyNextStep } from '../components/RoadReadyAttentionCenter';
import { useRoadReady } from '../road-ready/useRoadReady';
import { ROAD_READY_PRODUCT_NAME } from '../road-ready/roadReadyConfig';
import { formatDaysRemaining } from '../calendar/calendarService';
import { getBillingSummary } from '../demo/billingActions';
import { formatMoney } from '../billing/money';
import { aioPaths } from '../utils/paths';

export function PortalPage() {
  const store = useDemoStore();
  const orgId = getOrganizationId(store);
  const requests = getPortalRequests();
  const {
    isShipper,
    summary,
    attention,
    nextCopy,
    needsOnboarding,
    onboardingProgress,
  } = useRoadReady();

  const portalDocs = useMemo(
    () => getVaultDocuments(orgId, store).filter((d) => d.status === 'requested'),
    [orgId, store.documents],
  );
  const underReview = useMemo(
    () => getVaultDocuments(orgId, store).filter((d) => ['uploaded', 'under_review'].includes(d.status)),
    [orgId, store.documents],
  );
  const upcomingDeadlines = useMemo(
    () => getCalendarEvents(orgId, store).filter((e) => !e.complete).slice(0, 5),
    [orgId, store.documents, store.renewals, store.deadlines],
  );
  const activeRenewals = useMemo(
    () => getRenewals(orgId, store).filter((r) => !['completed', 'declined', 'not_applicable'].includes(r.status)).slice(0, 3),
    [orgId, store.renewals],
  );
  const unreadNotifs = getPortalNotifications(orgId, store).filter((n) => !n.read).length;
  const billingSummary = useMemo(() => getBillingSummary(orgId, store), [orgId, store.invoices, store.quotes, store.payments]);
  const attentionCount = summary?.scores.needsAttentionCount ?? 0;
  const allCaughtUp = attention.length === 0 && portalDocs.length === 0 && !upcomingDeadlines.some((e) => e.state === 'overdue' || e.state === 'due_soon');

  return (
    <div className="aio-portal-dashboard">
      <header className="aio-portal-dashboard__header">
        <h1>Welcome back</h1>
        <p>Client command center · {ROAD_READY_PRODUCT_NAME} · Vault · Calendar · Renewals</p>
      </header>

      {needsOnboarding && !isShipper && (
        <section className="aio-portal-banner aio-portal-banner--rr">
          <p>
            <strong>{onboardingProgress > 0 ? 'Welcome back.' : `Let's get your business ${ROAD_READY_PRODUCT_NAME}.`}</strong>
            {' '}
            {onboardingProgress > 0
              ? `You're ${onboardingProgress}% through your setup.`
              : 'Tell us where your business stands today.'}
          </p>
          <Link to={aioPaths.portalOnboarding} className="aio-btn aio-btn--gold aio-btn--sm">
            {onboardingProgress > 0 ? 'Continue Setup' : 'Start Road Ready'}
          </Link>
        </section>
      )}

      {!isShipper && portalDocs.length > 0 && (
        <section className="aio-portal-banner aio-vault-banner--warn">
          <p><strong>Complete your Vault</strong> — {portalDocs.length} document(s) will help All In One verify your Road Ready profile.</p>
          <Link to={aioPaths.portalVault} className="aio-btn aio-btn--gold aio-btn--sm">Upload Documents</Link>
        </section>
      )}

      {allCaughtUp && !isShipper && (
        <section className="aio-portal-banner aio-vault-caught-up-banner">
          <p><strong>You&apos;re all caught up.</strong> Your tracked Road Ready items and documents do not require action right now.</p>
          {upcomingDeadlines[0] && (
            <p>Next upcoming: {upcomingDeadlines[0].title} — {formatDaysRemaining(upcomingDeadlines[0].dueDate)}</p>
          )}
        </section>
      )}

      <div className="aio-dashboard-grid">
        {!isShipper && summary ? (
          <section className="aio-portal-panel aio-portal-panel--road-ready">
            <h2 className="aio-portal-panel__title">{ROAD_READY_PRODUCT_NAME}</h2>
            <div className="aio-portal-rr-summary">
              <RoadReadyRing
                setupProgress={summary.scores.setupProgress}
                verifiedProgress={summary.scores.verifiedProgress}
                dual
                size="sm"
              />
              <div>
                <p><strong>{summary.scores.setupProgress}%</strong> setup · <strong>{summary.scores.verifiedProgress}%</strong> verified</p>
                <p>{attentionCount} items need attention</p>
                {nextCopy && <p className="aio-portal-rr-next"><em>Next:</em> {nextCopy.title}</p>}
                <Link to={aioPaths.roadReady} className="aio-portal-panel__link">View {ROAD_READY_PRODUCT_NAME} →</Link>
              </div>
            </div>
          </section>
        ) : isShipper ? (
          <section className="aio-portal-panel">
            <h2 className="aio-portal-panel__title">Shipper Dashboard</h2>
            <p className="aio-empty-state__text">Freight and brokerage tools for your shipper account.</p>
            <Link to={aioPaths.brokerage}>Brokerage Services →</Link>
          </section>
        ) : null}

        {!isShipper && attention.length > 0 && (
          <section className="aio-portal-panel aio-portal-panel--wide">
            <h2 className="aio-portal-panel__title">Needs Your Attention</h2>
            <RoadReadyAttentionCenter items={attention} limit={3} />
          </section>
        )}

        {nextCopy && !isShipper && (
          <section className="aio-portal-panel">
            <RoadReadyNextStep title={nextCopy.title} body={nextCopy.body} cta={nextCopy.cta} />
          </section>
        )}

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">
            Notifications
            {unreadNotifs > 0 && <span className="aio-badge aio-badge--alert">{unreadNotifs}</span>}
          </h2>
          <Link to={aioPaths.portalNotifications} className="aio-portal-panel__link">Open Notification Center →</Link>
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Upcoming</h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="aio-empty-state__text">No upcoming deadlines.</p>
          ) : (
            upcomingDeadlines.slice(0, 4).map((d) => (
              <div key={d.id} className="aio-portal-list__item">
                <span>{d.title}<br /><small>{formatDaysRemaining(d.dueDate)}</small></span>
                <Link to={aioPaths.portalCalendar} className="aio-badge aio-badge--progress">Calendar</Link>
              </div>
            ))
          )}
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Renewals</h2>
          {activeRenewals.length === 0 ? (
            <p className="aio-empty-state__text">No active renewals.</p>
          ) : (
            activeRenewals.map((r) => (
              <div key={r.id} className="aio-portal-list__item">
                <span>{r.title}<br /><small>{formatDaysRemaining(r.expirationDate)}</small></span>
                <Link to={aioPaths.portalRenewals} className="aio-btn aio-btn--sm aio-btn--gold">Review</Link>
              </div>
            ))
          )}
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Documents</h2>
          {portalDocs.length === 0 && underReview.length === 0 ? (
            <p className="aio-empty-state__text">Vault is up to date.</p>
          ) : (
            <>
              {portalDocs.map((doc) => (
                <div key={doc.id} className="aio-portal-list__item">
                  <span>{doc.title}</span>
                  <span className="aio-badge aio-badge--needed">Needed</span>
                </div>
              ))}
              {underReview.map((doc) => (
                <div key={doc.id} className="aio-portal-list__item">
                  <span>{doc.title}</span>
                  <span className="aio-badge aio-badge--progress">Under review</span>
                </div>
              ))}
            </>
          )}
          <Link to={aioPaths.portalVault} className="aio-portal-panel__link">Open Vault →</Link>
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Billing</h2>
          {billingSummary.balanceDueMinor > 0 ? (
            <>
              <p><strong>{formatMoney(billingSummary.balanceDueMinor)}</strong> balance due</p>
              <p>{billingSummary.openInvoices.length} open invoice{billingSummary.openInvoices.length === 1 ? '' : 's'}</p>
            </>
          ) : (
            <p className="aio-vault-caught-up">No balance due</p>
          )}
          <Link to={aioPaths.portalBilling} className="aio-portal-panel__link">View Billing →</Link>
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Active Requests</h2>
          {requests.length === 0 ? (
            <div className="aio-empty-state">
              <p className="aio-empty-state__text">No active requests.</p>
              <Link to={aioPaths.servicePlan}>Submit a service request →</Link>
            </div>
          ) : (
            requests.filter((r) => r.status !== 'completed').slice(0, 3).map((req) => (
              <Link key={req.id} to={aioPaths.portalRequest(req.id)} className="aio-portal-request-card">
                <div>
                  <strong>{req.services.map((s) => s.title).join(' + ')}</strong>
                  <br />
                  <small>{req.requestNumber}</small>
                </div>
                <div>
                  <span className="aio-badge aio-badge--progress">{req.statusLabel}</span>
                </div>
              </Link>
            ))
          )}
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Operate &amp; Grow</h2>
          <div className="aio-portal-operate-cards">
            <Link to={aioPaths.dispatching} className="aio-portal-operate-card">Dispatch</Link>
            <Link to={aioPaths.portalFactoring} className="aio-portal-operate-card">Factoring</Link>
            <Link to={aioPaths.brokerage} className="aio-portal-operate-card">Brokerage</Link>
          </div>
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Fleet</h2>
          <Link to={aioPaths.portalFleet} className="aio-portal-panel__link">View Fleet Profile →</Link>
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Recent Activity</h2>
          {store.activity.filter((a) => a.visibility === 'customer' || a.clientId === store.portalClientId).slice(0, 5).map((a) => (
            <div key={a.id} className="aio-portal-list__item">
              <span>{a.title}</span>
              <small>{new Date(a.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
