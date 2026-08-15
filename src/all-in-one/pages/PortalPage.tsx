import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
  mockDashboardGreeting,
  mockExpiringSoon,
  mockRecentActivity,
  mockDocuments,
} from '../data/mockDashboard';
import { roadmapRepository } from '../repositories/roadmapRepository';
import { serviceRequestRepository } from '../repositories/serviceRequestRepository';
import { AIOStatusBadge } from '../components/AIOStatusBadge';
import { aioPaths } from '../utils/paths';

export function PortalPage() {
  const roadmap = roadmapRepository.load();
  const requests = serviceRequestRepository.loadAll();

  const attentionItems = useMemo(
    () => roadmap?.items.filter((i) => i.status === 'recommended' || i.status === 'needs_review').slice(0, 4) ?? [],
    [roadmap],
  );

  return (
    <div className="aio-portal-dashboard">
      <header className="aio-portal-dashboard__header">
        <h1>{mockDashboardGreeting}</h1>
        <p>Client command center · demo data only</p>
      </header>

      <div className="aio-dashboard-grid">
        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Roadmap</h2>
          {roadmap ? (
            <>
              <p>
                <strong>{roadmap.complianceProgress}%</strong> setup progress
              </p>
              {attentionItems.length > 0 ? (
                <ul className="aio-portal-attention">
                  {attentionItems.map((item) => (
                    <li key={item.id}>
                      {item.title} — {item.status.replace('_', ' ')}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="aio-empty-state__text">No immediate attention items.</p>
              )}
              <Link to={aioPaths.roadmapResults} className="aio-portal-panel__link">
                View Full Roadmap →
              </Link>
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
            requests.map((req) => (
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
          {requests.some((r) => r.documentsNeeded.length > 0) ? (
            requests.flatMap((r) =>
              r.documentsNeeded.map((doc) => (
                <div key={`${r.id}-${doc}`} className="aio-portal-list__item">
                  <span>{doc}</span>
                  <span className="aio-badge aio-badge--optional">Upload — Future Sprint</span>
                </div>
              )),
            )
          ) : (
            <p className="aio-empty-state__text">No documents needed.</p>
          )}
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Upcoming Deadlines</h2>
          {mockExpiringSoon.length === 0 ? (
            <p className="aio-empty-state__text">No upcoming deadlines.</p>
          ) : (
            mockExpiringSoon.map((item) => (
              <div key={item.id} className="aio-portal-list__item">
                <span>
                  {item.label}
                  <br />
                  <small style={{ color: 'var(--aio-gray-600)' }}>{item.due}</small>
                </span>
                <AIOStatusBadge status={item.status === 'Action Required' ? 'needed' : 'in-progress'} />
              </div>
            ))
          )}
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Dispatch</h2>
          <p className="aio-empty-state__text">No dispatch activity — operational preview coming soon.</p>
          <Link to={aioPaths.dispatching}>Explore Dispatch →</Link>
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Factoring</h2>
          <p className="aio-empty-state__text">No factoring activity in this demo account.</p>
          <Link to={aioPaths.portalFactoring}>View Factoring Portal →</Link>
        </section>

        <section className="aio-portal-panel aio-portal-panel--placeholder">
          <h2 className="aio-portal-panel__title">Messages</h2>
          <p className="aio-empty-state__text">No messages yet.</p>
        </section>

        <section className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Recent Activity</h2>
          {requests.length > 0 ? (
            requests.slice(0, 3).map((req) => (
              <div key={req.id} className="aio-portal-list__item">
                <span>Demo request {req.requestNumber} submitted</span>
                <small style={{ color: 'var(--aio-gray-600)' }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))
          ) : (
            mockRecentActivity.map((item) => (
              <div key={item.id} className="aio-portal-list__item">
                <span>{item.text}</span>
                <small style={{ color: 'var(--aio-gray-600)' }}>{item.time}</small>
              </div>
            ))
          )}
        </section>
      </div>

      <div className="aio-portal-panel" style={{ marginTop: '1.5rem' }}>
        <h2 className="aio-portal-panel__title">Documents</h2>
        <div className="aio-doc-grid">
          {mockDocuments.map((doc) => (
            <div key={doc} className="aio-doc-tile">
              {doc}
            </div>
          ))}
        </div>
      </div>

      <p className="aio-prototype-note">
        This portal is a design prototype. Demo requests persist in localStorage only — no authentication or production
        workflows connected.
      </p>
    </div>
  );
}
