import { Link } from 'react-router-dom';
import {
  mockDashboardGreeting,
  mockDashboardMetrics,
  mockExpiringSoon,
} from '../data/mockDashboard';
import { mockFactoringDashboardCard } from '../data/mockFactoring';
import {
  mockActiveLoad,
  mockDeliveredLoad,
  mockBrokerageQuoteFields,
  mockShipperTimeline,
  mockShipperLoadNumber,
} from '../data/mockLoads';
import { aioPaths } from '../utils/paths';
import { AIOButton } from './AIOButton';

export function AIOPortalPreview() {
  const load = mockDeliveredLoad;

  return (
    <div className="aio-platform-grid">
      <div className="aio-platform-panel">
        <div className="aio-platform-panel__header">Client command center modules</div>
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
          <div className="aio-cash-flow-card" style={{ marginTop: '1rem' }}>
            <p className="aio-cash-flow-card__title">Cash Flow</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Eligible for Factoring</span>
                <div className="aio-metric-card__value" style={{ fontSize: '1rem' }}>
                  ${mockFactoringDashboardCard.eligibleForFactoring.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>In Review</span>
                <div className="aio-metric-card__value" style={{ fontSize: '1rem' }}>
                  ${mockFactoringDashboardCard.inReview.toLocaleString()}
                </div>
              </div>
            </div>
            <Link to={aioPaths.portalFactoring} style={{ display: 'inline-block', marginTop: '0.75rem' }}>
              <AIOButton variant="gold" size="sm">
                View Factoring
              </AIOButton>
            </Link>
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
        <div className="aio-platform-panel__header">Dispatch Portal · Load #{load.id.replace('LD-', '')}</div>
        <div className="aio-platform-panel__body">
          <p>
            <strong>{load.origin}</strong> → <strong>{load.destination}</strong>
          </p>
          <div className="aio-map-placeholder">Route Map Preview</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
            <span>Rate: {load.rate}</span>
            <span>Miles: {load.mileage}</span>
            <span>Delivery: {load.delivery}</span>
            <span>Status: {load.status}</span>
          </div>

          <p className="aio-label" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
            Payment Options
          </p>
          <div className="aio-payment-options">
            <div className="aio-payment-options__item">
              <strong>Standard Payment</strong>
              <p>Broker payment according to normal invoice terms.</p>
            </div>
            <div className="aio-payment-options__item aio-payment-options__item--highlight">
              <strong>Factoring</strong>
              <p>Submit the eligible invoice for faster funding review.</p>
              <Link to={aioPaths.portalFactoring}>
                <AIOButton variant="gold" size="sm">
                  View Factoring Option
                </AIOButton>
              </Link>
            </div>
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

      {/* In-transit load reference kept out of primary preview — delivered load drives factoring link */}
      <span className="aio-sr-only">Active in-transit load {mockActiveLoad.id} available in dispatch prototype.</span>
    </div>
  );
}
