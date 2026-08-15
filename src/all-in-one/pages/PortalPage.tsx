import { Link } from 'react-router-dom';
import { mockDashboardGreeting, mockExpiringSoon } from '../data/mockDashboard';
import { useDemoStore } from '../demo/useDemoStore';
import { getPortalRequests } from '../demo/demoActions';
import { AIOStatusBadge } from '../components/AIOStatusBadge';
import { RoadReadyRing } from '../components/RoadReadyRing';
import { RoadReadyAttentionCenter, RoadReadyNextStep } from '../components/RoadReadyAttentionCenter';
import { useRoadReady } from '../road-ready/useRoadReady';
import { ROAD_READY_PRODUCT_NAME } from '../road-ready/roadReadyConfig';
import { aioPaths } from '../utils/paths';

export function PortalPage() {
  const store = useDemoStore();
  const requests = getPortalRequests();
  const {
    isShipper,
    summary,
    attention,
    nextCopy,
    needsOnboarding,
    onboardingProgress,
  } = useRoadReady();

  const portalDocs = store.documents.filter(
    (d) => d.clientId === store.portalClientId && d.status === 'requested' && d.visibility === 'customer',
  );

  const portalDeadlines = store.deadlines.filter((d) => d.clientId === store.portalClientId && !d.complete);

  const attentionCount = summary?.scores.needsAttentionCount ?? 0;

  return (
    <div className="aio-portal-dashboard">
      <header className="aio-portal-dashboard__header">
        <h1>{mockDashboardGreeting}</h1>
        <p>Client command center · {ROAD_READY_PRODUCT_NAME} enabled</p>
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
            <RoadReadyAttentionCenter items={attention} limit={3} />
          </section>
        )}

        {nextCopy && !isShipper && (
          <section className="aio-portal-panel">
            <RoadReadyNextStep title={nextCopy.title} body={nextCopy.body} cta={nextCopy.cta} />
          </section>
        )}

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Active Requests</h2>
          {requests.length === 0 ? (
            <div className="aio-empty-state">
              <p className="aio-empty-state__text">No active requests.</p>
              <Link to={aioPaths.servicePlan}>Submit a service request →</Link>
            </div>
          ) : (
            requests.filter((r) => r.status !== 'completed').map((req) => (
              <Link key={req.id} to={aioPaths.portalRequest(req.id)} className="aio-portal-request-card">
                <div>
                  <strong>{req.services.map((s) => s.title).join(' + ')}</strong>
                  <br />
                  <small>{req.requestNumber}</small>
                </div>
                <div>
                  <span className="aio-badge aio-badge--progress">{req.statusLabel}</span>
                  <br />
                  <small>Next: {req.nextStep}</small>
                </div>
              </Link>
            ))
          )}
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Documents Needed</h2>
          {portalDocs.length === 0 ? (
            <p className="aio-empty-state__text">No documents needed.</p>
          ) : (
            portalDocs.map((doc) => (
              <div key={doc.id} className="aio-portal-list__item">
                <span>{doc.name}</span>
                <span className="aio-badge aio-badge--needed">Needed</span>
              </div>
            ))
          )}
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Upcoming Deadlines</h2>
          {portalDeadlines.length === 0 ? (
            mockExpiringSoon.length === 0 ? (
              <p className="aio-empty-state__text">No upcoming deadlines.</p>
            ) : (
              mockExpiringSoon.map((item) => (
                <div key={item.id} className="aio-portal-list__item">
                  <span>{item.label}<br /><small>{item.due}</small></span>
                  <AIOStatusBadge status={item.status === 'Action Required' ? 'needed' : 'in-progress'} />
                </div>
              ))
            )
          ) : (
            portalDeadlines.map((d) => (
              <div key={d.id} className="aio-portal-list__item">
                <span>{d.label}<br /><small>{d.dueDate}</small></span>
                <span className="aio-badge aio-badge--progress">{d.severity.replace('_', ' ')}</span>
              </div>
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
