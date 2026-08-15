import {
  mockDashboardGreeting,
  mockDashboardMetrics,
  mockExpiringSoon,
  mockRecentActivity,
  mockDocuments,
} from '../data/mockDashboard';
import { AIOStatusBadge } from '../components/AIOStatusBadge';

export function PortalPage() {
  return (
    <div className="aio-portal-dashboard">
      <header className="aio-portal-dashboard__header">
        <h1>{mockDashboardGreeting}</h1>
        <p>Client command center prototype · sample data only</p>
      </header>

      <div className="aio-dashboard-preview__metrics">
        {mockDashboardMetrics.map((m) => (
          <div key={m.id} className="aio-portal-panel aio-metric-card" style={{ background: 'white' }}>
            <div className="aio-metric-card__value" style={{ color: 'var(--aio-gold-dark)' }}>
              {m.value}
            </div>
            <div className="aio-metric-card__label" style={{ color: 'var(--aio-gray-600)' }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div className="aio-two-col">
        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Expiring Soon</h2>
          {mockExpiringSoon.map((item) => (
            <div key={item.id} className="aio-portal-list__item">
              <span>
                {item.label}
                <br />
                <small style={{ color: 'var(--aio-gray-600)' }}>{item.due}</small>
              </span>
              <AIOStatusBadge status={item.status === 'Action Required' ? 'needed' : 'in-progress'} />
            </div>
          ))}
        </div>

        <div className="aio-portal-panel">
          <h2 className="aio-portal-panel__title">Recent Activity</h2>
          {mockRecentActivity.map((item) => (
            <div key={item.id} className="aio-portal-list__item">
              <span>{item.text}</span>
              <small style={{ color: 'var(--aio-gray-600)' }}>{item.time}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="aio-portal-panel">
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
        This portal preview is a design prototype only. No authentication, production data, or workflows are connected
        in Sprint 01.
      </p>
    </div>
  );
}
