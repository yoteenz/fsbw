import { Link } from 'react-router-dom';
import { useServicePlan } from '../components/AIOServicePlanBar';
import { getServiceBySlug } from '../data/services';
import { useDemoStore } from '../demo/useDemoStore';
import { customerPriceLabel, getServicePricing } from '../billing/servicePricingConfig';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';

export function ServicePlanPage() {
  const { items, remove } = useServicePlan();
  const store = useDemoStore();

  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">My Service Plan</p>
          <h1 className="aio-page-hero__title">My Service Plan</h1>
          <p className="aio-page-hero__desc">
            Services you&apos;ve selected for All In One to help with. This is not a shopping cart — it&apos;s your
            preliminary assistance plan.
          </p>
        </div>
      </div>

      <div className="aio-page-content">
        <div className="aio-container">
          {items.length === 0 ? (
            <div className="aio-empty-state">
              <h2>No Services Selected Yet</h2>
              <p>Browse the marketplace or complete Smart Intake to add services to your plan.</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <Link to={aioPaths.services}>
                  <AIOButton variant="gold">Browse Services</AIOButton>
                </Link>
                <Link to={aioPaths.getStarted}>
                  <AIOButton variant="outline-dark">Start Smart Intake</AIOButton>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="aio-service-plan-list">
                {items.map((item) => {
                  const service = getServiceBySlug(item.slug);
                  return (
                    <article key={item.slug} className="aio-service-plan-item">
                      <div>
                        <h2 className="aio-service-plan-item__title">{item.title}</h2>
                        <p className="aio-service-plan-item__division">{item.division.replace('-', ' ')}</p>
                        {item.reason && <p className="aio-service-plan-item__reason">{item.reason}</p>}
                        {item.fromRoadmap && (
                          <span className="aio-badge aio-badge--optional">From Roadmap</span>
                        )}
                        <p className="aio-service-plan-item__pricing">
                          {customerPriceLabel(getServicePricing(item.slug, store.servicePricing))}
                        </p>
                        {service && (
                          <details className="aio-service-plan-item__docs">
                            <summary>Information you may need</summary>
                            <ul>
                              {service.requirements.map((r) => (
                                <li key={r}>{r}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                      <div className="aio-service-plan-item__actions">
                        <Link to={aioPaths.serviceSlug(item.slug)}>View Service</Link>
                        <button type="button" className="aio-btn aio-btn--outline-dark aio-btn--sm" onClick={() => remove(item.slug)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="aio-intake__actions" style={{ marginTop: '2rem' }}>
                <Link to={aioPaths.requestSubmit}>
                  <AIOButton variant="gold">Request Help From All In One</AIOButton>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
