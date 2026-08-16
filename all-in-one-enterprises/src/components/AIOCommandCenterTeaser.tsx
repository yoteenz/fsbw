import { mockDashboardMetrics, mockExpiringSoon } from '../data/mockDashboard';

export function AIOCommandCenterTeaser() {
  return (
    <div className="aio-command-teaser" aria-label="Illustrative client portal dashboard preview">
      <div className="aio-command-teaser__device aio-command-teaser__device--desktop">
        <div className="aio-command-teaser__chrome">
          <span />
          <span />
          <span />
          <p>Client Command Center</p>
        </div>
        <div className="aio-command-teaser__body">
          <p className="aio-command-teaser__greeting">Your business overview</p>
          <div className="aio-command-teaser__metrics">
            {mockDashboardMetrics.slice(0, 3).map((metric) => (
              <div key={metric.id} className="aio-command-teaser__metric">
                <span className="aio-command-teaser__metric-value">{metric.value}</span>
                <span className="aio-command-teaser__metric-label">{metric.label}</span>
              </div>
            ))}
          </div>
          <p className="aio-command-teaser__section-label">Expiring soon</p>
          <ul className="aio-command-teaser__list">
            {mockExpiringSoon.slice(0, 2).map((item) => (
              <li key={item.id}>
                <span>{item.label}</span>
                <span className="aio-command-teaser__pill">{item.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="aio-command-teaser__device aio-command-teaser__device--mobile" aria-hidden="true">
        <div className="aio-command-teaser__mobile-bar" />
        <div className="aio-command-teaser__mobile-card">
          <span className="aio-command-teaser__metric-value">87%</span>
          <span className="aio-command-teaser__metric-label">Road Ready</span>
        </div>
        <div className="aio-command-teaser__mobile-card">
          <span className="aio-command-teaser__metric-value">8</span>
          <span className="aio-command-teaser__metric-label">Active Loads</span>
        </div>
      </div>
    </div>
  );
}
