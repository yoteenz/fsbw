import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { mockDashboardGreeting, mockExpiringSoon, mockDocuments } from '../data/mockDashboard';
import { useDemoStore } from '../demo/useDemoStore';
import { getPortalRequests } from '../demo/demoActions';
import { AIOStatusBadge } from '../components/AIOStatusBadge';
import { aioPaths } from '../utils/paths';

export function PortalPage() {
  const store = useDemoStore();
  const requests = getPortalRequests();
  const roadmap = store.roadmap;

  const attentionItems = useMemo(
    () => roadmap?.items.filter((i) => i.status === 'recommended' || i.status === 'needs_review').slice(0, 4) ?? [],
    [roadmap],
  );

  const portalDocs = store.documents.filter(
    (d) => d.clientId === store.portalClientId && d.status === 'requested' && d.visibility === 'customer',
  );

  const portalDeadlines = store.deadlines.filter((d) => d.clientId === store.portalClientId && !d.complete);

  const factoring = store.factoringSubmissions.filter((f) => f.clientId === store.portalClientId);

  return (
    <div className="aio-portal-dashboard">
      <header className="aio-portal-dashboard__header">
        <h1>{mockDashboardGreeting}</h1>
        <p>Client command center · synced demo data</p>
      </header>

      <div className="aio-dashboard-grid">
        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Roadmap</h2>
          {roadmap ? (
            <>
              <p><strong>{roadmap.complianceProgress}%</strong> setup progress</p>
              {attentionItems.length > 0 ? (
                <ul className="aio-portal-attention">
                  {attentionItems.map((item) => (
                    <li key={item.id}>{item.title} — {item.status.replace('_', ' ')}</li>
                  ))}
                </ul>
              ) : (
                <p className="aio-empty-state__text">No immediate attention items.</p>
              )}
              <Link to={aioPaths.roadmapResults} className="aio-portal-panel__link">View Full Roadmap →</Link>
            </>
          ) : (
            <div className="aio-empty-state">
              <p className="aio-empty-state__text">Complete Smart Intake to generate your roadmap.</p>
              <Link to={aioPaths.getStarted}>Start Smart Intake →</Link>
            </div>
          )}
        </section>

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
          <h2 className="aio-portal-panel__title">Dispatch</h2>
          {store.loads.filter((l) => l.clientId === store.portalClientId).length === 0 ? (
            <>
              <p className="aio-empty-state__text">No dispatch activity.</p>
              <Link to={aioPaths.dispatching}>Explore Dispatch →</Link>
            </>
          ) : (
            store.loads.filter((l) => l.clientId === store.portalClientId).map((l) => (
              <div key={l.id} className="aio-portal-list__item">
                <span>{l.loadNumber}: {l.origin} → {l.destination}</span>
                <span>{l.status}</span>
              </div>
            ))
          )}
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Factoring</h2>
          {factoring.length === 0 ? (
            <>
              <p className="aio-empty-state__text">No factoring activity.</p>
              <Link to={aioPaths.portalFactoring}>View Factoring Portal →</Link>
            </>
          ) : (
            factoring.map((f) => (
              <div key={f.id} className="aio-portal-list__item">
                <span>{f.statusLabel}</span>
                <small>Sample net ${f.estimatedNet}</small>
              </div>
            ))
          )}
        </section>

        <section className="aio-portal-panel aio-portal-panel--placeholder">
          <h2 className="aio-portal-panel__title">Messages</h2>
          <p className="aio-empty-state__text">View messages on each request detail page.</p>
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

      <div className="aio-portal-panel" style={{ marginTop: '1.5rem' }}>
        <h2 className="aio-portal-panel__title">Documents</h2>
        <div className="aio-doc-grid">
          {mockDocuments.map((doc) => (
            <div key={doc} className="aio-doc-tile">{doc}</div>
          ))}
        </div>
      </div>

      <p className="aio-prototype-note">
        Portal syncs with All In One Office via shared demo store (localStorage). Internal staff notes are never shown here.
      </p>
    </div>
  );
}
