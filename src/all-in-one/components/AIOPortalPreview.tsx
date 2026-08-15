import {
  mockDashboardGreeting,
  mockDashboardMetrics,
  mockExpiringSoon,
} from '../data/mockDashboard';
import {
  mockActiveLoad,
  mockBrokerageQuoteFields,
  mockShipperTimeline,
  mockShipperLoadNumber,
} from '../data/mockLoads';
import { AIOButton } from './AIOButton';

export function AIOPortalPreview() {
  return (
    <div className="aio-platform-grid">
      <div className="aio-platform-panel">
        <div className="aio-platform-panel__header">Customer Dashboard</div>
        <div className="aio-platform-panel__body">
          <p style={{ marginBottom: '1rem', fontWeight: 600 }}>{mockDashboardGreeting}</p>
          <div className="aio-dashboard-preview__metrics">
            {mockDashboardMetrics.map((m) => (
              <div key={m.id} className="aio-metric-card">
                <div className="aio-metric-card__value">{m.value}</div>
                <div className="aio-metric-card__label">{m.label}</div>
              </div>
            ))}
          </div>
          <p style={{ margin: '1rem 0 0.5rem', fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            Expiring Soon
          </p>
          {mockExpiringSoon.slice(0, 2).map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', fontSize: '0.75rem' }}>
              <span>{item.label}</span>
              <span className="aio-badge aio-badge--alert">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="aio-platform-panel">
        <div className="aio-platform-panel__header">Dispatch Portal</div>
        <div className="aio-platform-panel__body">
          <p>
            <strong>{mockActiveLoad.origin}</strong> → <strong>{mockActiveLoad.destination}</strong>
          </p>
          <div className="aio-map-placeholder">Route Map Preview</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span>Rate: {mockActiveLoad.rate}</span>
            <span>Miles: {mockActiveLoad.mileage}</span>
            <span>Pickup: {mockActiveLoad.pickup}</span>
            <span>Status: {mockActiveLoad.status}</span>
          </div>
        </div>
      </div>

      <div className="aio-platform-panel">
        <div className="aio-platform-panel__header">Brokerage Portal</div>
        <div className="aio-platform-panel__body">
          <div className="aio-form-preview">
            {mockBrokerageQuoteFields.map((field) => (
              <div key={field.id} className="aio-form-preview__field">
                <label className="aio-form-preview__label">{field.label}</label>
                <div className="aio-form-preview__input">{field.placeholder}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <AIOButton variant="gold" size="sm">
              Get Quote
            </AIOButton>
          </div>
        </div>
      </div>

      <div className="aio-platform-panel">
        <div className="aio-platform-panel__header">Shipper Portal · {mockShipperLoadNumber}</div>
        <div className="aio-platform-panel__body">
          <div className="aio-timeline">
            {mockShipperTimeline.map((step) => (
              <div
                key={step.id}
                className={`aio-timeline__step ${step.complete ? 'aio-timeline__step--complete' : ''} ${'current' in step && step.current ? 'aio-timeline__step--current' : ''}`}
              >
                <div className="aio-timeline__dot" />
                <div className="aio-timeline__label">{step.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>
            Documents · BOL · POD · Invoice
          </p>
        </div>
      </div>
    </div>
  );
}
