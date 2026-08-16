import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SERVICE_NEED_OPTIONS,
  recommendServicesFromIntake,
  type ServiceNeedIntent,
} from '../services/catalog';
import { aioPaths } from '../utils/paths';
import { AIOButton } from '../components/AIOButton';

export function ServiceFindPage() {
  const [step, setStep] = useState<'need' | 'business' | 'results'>('need');
  const [intent, setIntent] = useState<ServiceNeedIntent | null>(null);
  const [interstate, setInterstate] = useState<boolean | null>(null);
  const [hasCdlDrivers, setHasCdlDrivers] = useState<boolean | null>(null);
  const [vehicleCount, setVehicleCount] = useState('');
  const [newEntrant, setNewEntrant] = useState<boolean | null>(null);

  const recommendations = useMemo(() => {
    if (!intent) return [];
    const profile =
      intent === 'not-sure' || step === 'results'
        ? {
            interstate: interstate ?? undefined,
            hasCdlDrivers: hasCdlDrivers ?? undefined,
            vehicleCount: vehicleCount ? Number(vehicleCount) : undefined,
            newEntrant: newEntrant ?? undefined,
            vehicleWeightOver26000: undefined,
          }
        : undefined;
    return recommendServicesFromIntake(intent, profile);
  }, [intent, step, interstate, hasCdlDrivers, vehicleCount, newEntrant]);

  const selectedNeed = SERVICE_NEED_OPTIONS.find((o) => o.id === intent);

  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">
            <Link to={aioPaths.services}>Services</Link> / Find a Service
          </p>
          <h1 className="aio-page-hero__title">What do you need help with?</h1>
          <p className="aio-page-hero__desc">
            Not sure what UCR, MCS-150, or HVUT means? Tell us about your business and we will suggest relevant services.
          </p>
        </div>
      </div>

      <div className="aio-page-content">
        <div className="aio-container" style={{ maxWidth: '40rem' }}>
          {step === 'need' && (
            <section className="aio-intent-grid">
              {SERVICE_NEED_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="aio-marketplace-card"
                  style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid #ccc', background: 'transparent' }}
                  onClick={() => {
                    setIntent(option.id);
                    if (option.id === 'not-sure') setStep('business');
                    else setStep('results');
                  }}
                >
                  <h3 className="aio-marketplace-card__title">{option.label}</h3>
                  <p className="aio-marketplace-card__desc">{option.description}</p>
                </button>
              ))}
            </section>
          )}

          {step === 'business' && (
            <section className="aio-cc-panel">
              <h2>Tell us about your business</h2>
              <p style={{ marginBottom: '1rem' }}>These answers help suggest what you may need — not legal conclusions.</p>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                Interstate operation?
                <select
                  className="aio-input"
                  value={interstate === null ? '' : interstate ? 'yes' : 'no'}
                  onChange={(e) => setInterstate(e.target.value === '' ? null : e.target.value === 'yes')}
                >
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No / Intrastate</option>
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                CDL drivers employed?
                <select
                  className="aio-input"
                  value={hasCdlDrivers === null ? '' : hasCdlDrivers ? 'yes' : 'no'}
                  onChange={(e) => setHasCdlDrivers(e.target.value === '' ? null : e.target.value === 'yes')}
                >
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                Number of power units
                <input
                  type="number"
                  min={0}
                  className="aio-input"
                  value={vehicleCount}
                  onChange={(e) => setVehicleCount(e.target.value)}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '1.5rem' }}>
                New entrant carrier?
                <select
                  className="aio-input"
                  value={newEntrant === null ? '' : newEntrant ? 'yes' : 'no'}
                  onChange={(e) => setNewEntrant(e.target.value === '' ? null : e.target.value === 'yes')}
                >
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <AIOButton variant="gold" onClick={() => setStep('results')}>
                See Recommendations
              </AIOButton>
            </section>
          )}

          {step === 'results' && selectedNeed && (
            <section className="aio-cc-panel">
              <h2>Recommended for you</h2>
              <p style={{ marginBottom: '1rem' }}>{selectedNeed.description}</p>
              <ul className="aio-cc-services-list">
                {recommendations.map((slug) => (
                  <li key={slug}>
                    <Link to={aioPaths.serviceSlug(slug)}>{slug.replace(/-/g, ' ')}</Link>
                  </li>
                ))}
              </ul>
              {recommendations.length === 0 && <p>No specific recommendations — contact us for guidance.</p>}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <AIOButton to={aioPaths.getStarted} variant="gold">
                  Start Smart Intake
                </AIOButton>
                <AIOButton to={aioPaths.contact} variant="outline">
                  Contact Us
                </AIOButton>
                <button type="button" className="aio-btn aio-btn--outline" onClick={() => setStep('need')}>
                  Start Over
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
