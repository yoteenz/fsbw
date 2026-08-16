import { Link, useParams } from 'react-router-dom';
import { getServiceBySlug, getServicesByDivision, isDivisionSlug, divisionMeta, type ServiceDivision } from '../data/services';
import { fulfillmentDisclosure, getCatalogServiceBySlug } from '../services/catalog';
import { useServicePlan } from '../components/AIOServicePlanBar';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';
import { servicePageMeta } from '../data/mockServices';
import { useDemoStore } from '../demo/useDemoStore';
import { customerPriceLabel, getServicePricing } from '../billing/servicePricingConfig';
import { getPublicServiceCta } from '../launch';

type Props = {
  slug?: string;
};

export function ServiceCatalogDetailPage({ slug: slugProp }: Props) {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const slug = slugProp ?? serviceSlug ?? '';
  const { add, items } = useServicePlan();
  const store = useDemoStore();

  if (isDivisionSlug(slug)) {
    const division = slug as ServiceDivision;
    const meta = divisionMeta[division] ?? servicePageMeta[slug];
    return (
      <>
        <div className="aio-page-hero">
          <div className="aio-container">
            <p className="aio-page-hero__breadcrumb">
              <Link to={aioPaths.services}>Services</Link> / {meta?.title}
            </p>
            <h1 className="aio-page-hero__title">{meta?.headline}</h1>
            <p className="aio-page-hero__desc">{meta?.description}</p>
          </div>
        </div>
        <DivisionServicesList division={division} />
      </>
    );
  }

  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <div className="aio-page-content">
        <div className="aio-container">
          <h1>Service Not Found</h1>
          <Link to={aioPaths.services}>← All Services</Link>
        </div>
      </div>
    );
  }

  const inPlan = items.some((i) => i.slug === service.slug);
  const pricing = getServicePricing(service.slug, store.servicePricing);
  const launchCta = getPublicServiceCta(service.slug);
  const catalogEntry = getCatalogServiceBySlug(service.slug);
  const disclosure = catalogEntry ? fulfillmentDisclosure(catalogEntry) : null;

  const handleAdd = () => {
    add({
      slug: service.slug,
      title: service.title,
      division: service.division,
      addedAt: new Date().toISOString(),
    });
  };

  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">
            <Link to={aioPaths.services}>Services</Link> / {service.title}
          </p>
          <h1 className="aio-page-hero__title">{service.title}</h1>
          <p className="aio-page-hero__desc">{service.description}</p>
        </div>
      </div>

      <div className="aio-page-content">
        <div className="aio-container aio-service-detail">
          <div className="aio-two-col">
            <section>
              <h2 className="aio-service-detail__heading">Who It&apos;s For</h2>
              <p>{service.audience}</p>

              <h2 className="aio-service-detail__heading">What All In One Assists With</h2>
              <p>{service.shortDescription}</p>
              {disclosure && (
                <p className="aio-prototype-note" style={{ marginTop: '0.75rem' }}>
                  {disclosure}
                </p>
              )}

              <h2 className="aio-service-detail__heading">General Process</h2>
              <ol>
                {service.process.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <aside className="aio-portal-panel">
              <h2 className="aio-portal-panel__title">Get Started</h2>
              <p className="aio-prototype-note">Service status: {launchCta.state.replace(/_/g, ' ')}</p>
              <p className="aio-service-plan-item__pricing">{customerPriceLabel(pricing)}</p>
              {pricing?.externalFeeLabel && (
                <p className="aio-prototype-note">+ {pricing.externalFeeLabel}</p>
              )}
              {launchCta.allowed ? (
                <>
                  {inPlan ? (
                    <Link to={aioPaths.servicePlan}>
                      <AIOButton variant="gold">In My Plan — Review</AIOButton>
                    </Link>
                  ) : (
                    <AIOButton variant="gold" onClick={handleAdd}>
                      Add to My Plan
                    </AIOButton>
                  )}
                  <Link to={aioPaths.getStartedForService(service.slug)} style={{ display: 'block', marginTop: '1rem' }}>
                    <AIOButton variant="outline-dark">{launchCta.label}</AIOButton>
                  </Link>
                </>
              ) : (
                <Link to={aioPaths.contact}>
                  <AIOButton variant="outline-dark">{launchCta.label}</AIOButton>
                </Link>
              )}
              <Link to={aioPaths.getStarted} style={{ display: 'block', marginTop: '0.5rem' }}>
                <AIOButton variant="outline-dark" size="sm">Start Smart Intake</AIOButton>
              </Link>
            </aside>
          </div>

          {service.requirements.length > 0 && (
            <section className="aio-portal-panel" style={{ marginTop: '2rem' }}>
              <h2 className="aio-portal-panel__title">Information You May Need</h2>
              <ul>
                {service.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {service.documents.length > 0 && (
            <section className="aio-portal-panel">
              <h2 className="aio-portal-panel__title">Preliminary Document Checklist</h2>
              <ul className="aio-doc-checklist">
                {service.documents.map((doc) => (
                  <li key={doc}>
                    {doc}
                    <span className="aio-badge aio-badge--optional">Upload — Future Sprint</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {service.faq.length > 0 && (
            <section className="aio-portal-panel">
              <h2 className="aio-portal-panel__title">FAQs</h2>
              {service.faq.map((f) => (
                <details key={f.question} className="aio-faq-item">
                  <summary>{f.question}</summary>
                  <p>{f.answer}</p>
                </details>
              ))}
            </section>
          )}

          {service.relatedServices.length > 0 && (
            <section>
              <h2 className="aio-service-detail__heading">Related Services</h2>
              <div className="aio-intent-grid">
                {service.relatedServices.map((relSlug) => {
                  const rel = getServiceBySlug(relSlug);
                  if (!rel) return null;
                  return (
                    <Link key={relSlug} to={aioPaths.serviceSlug(relSlug)} className="aio-card">
                      <h3 className="aio-intent-card__title">{rel.title}</h3>
                      <p className="aio-intent-card__desc">{rel.shortDescription}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <p className="aio-prototype-note">{service.division === 'insurance' ? 'All In One is not the licensed insurer. Quotes subject to carrier review.' : 'Service availability may vary. No legal or regulatory guarantees implied.'}</p>
        </div>
      </div>
    </>
  );
}

function DivisionServicesList({ division }: { division: ServiceDivision }) {
  const services = getServicesByDivision(division);
  const { add } = useServicePlan();

  return (
    <div className="aio-page-content">
      <div className="aio-container">
        <div className="aio-marketplace-grid">
          {services.map((service) => (
            <article key={service.id} className="aio-marketplace-card">
              <h2 className="aio-marketplace-card__title">{service.title}</h2>
              <p className="aio-marketplace-card__desc">{service.shortDescription}</p>
              <div className="aio-marketplace-card__actions">
                <Link to={aioPaths.serviceSlug(service.slug)} className="aio-intent-card__cta">
                  Learn More →
                </Link>
                <button
                  type="button"
                  className="aio-btn aio-btn--gold aio-btn--sm"
                  onClick={() =>
                    add({
                      slug: service.slug,
                      title: service.title,
                      division: service.division,
                      addedAt: new Date().toISOString(),
                    })
                  }
                >
                  Add to My Plan
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
