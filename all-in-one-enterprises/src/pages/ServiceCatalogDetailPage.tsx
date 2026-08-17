import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getServiceBySlug,
  isDivisionSlug,
  type ServiceDivision,
} from '../data/services';
import { fulfillmentDisclosure, getCatalogServiceBySlug } from '../services/catalog';
import { useServicePlan } from '../components/AIOServicePlanBar';
import { AIOButton } from '../components/AIOButton';
import { MobileServiceDetailView } from '../components/mobile/service/MobileServiceDetailView';
import { MobileDivisionServicesView } from '../components/mobile/service/MobileDivisionServicesView';
import { isInStartBusinessJourney } from '../journeys/journeyContext';
import { aioPaths } from '../utils/paths';
import { servicePageMeta } from '../data/mockServices';
import { useDemoStore } from '../demo/useDemoStore';
import { customerPriceLabel, getServicePricing } from '../billing/servicePricingConfig';
import { getPublicServiceCta } from '../launch';
import {
  ServiceHubTemplate,
  ServiceDetailTemplate,
  AioTextAction,
  type ProcessStep,
  type FeatureItem,
  type RelatedServiceItem,
} from '../components/page-system';
import {
  resolveMobileServiceBenefits,
  resolveMobileServiceProcess,
  mobileServiceCategoryLabel,
} from '../services/mobileServicePageConfig';
import { buildDivisionServiceRows, getDivisionHubCopy } from './ServicesPage';
import {
  buildServiceDetailRail,
  buildServiceHubRail,
} from '../context-rail/configs';

type Props = {
  slug?: string;
};

export function ServiceCatalogDetailPage({ slug: slugProp }: Props) {
  const { t } = useTranslation('contextRail');
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const [searchParams] = useSearchParams();
  const showJourneyBack = isInStartBusinessJourney(searchParams);
  const slug = slugProp ?? serviceSlug ?? '';
  const { add, items } = useServicePlan();
  const store = useDemoStore();

  const handleAdd = (service: NonNullable<ReturnType<typeof getServiceBySlug>>) => {
    add({
      slug: service.slug,
      title: service.title,
      division: service.division,
      addedAt: new Date().toISOString(),
    });
  };

  if (isDivisionSlug(slug)) {
    const division = slug as ServiceDivision;
    const pageMeta = servicePageMeta[slug];
    const hubCopy = getDivisionHubCopy(division);
    const services = buildDivisionServiceRows(division);

    return (
      <>
        <div className="aio-mobile-only">
          <MobileDivisionServicesView
            division={division}
            headline={pageMeta?.headline ?? hubCopy.title}
            description={pageMeta?.description ?? hubCopy.description}
          />
        </div>
        <div className="aio-desktop-only">
          <ServiceHubTemplate
            eyebrow={hubCopy.eyebrow}
            title={hubCopy.title}
            description={hubCopy.description}
            breadcrumbs={[
              { label: 'Services', href: aioPaths.services },
              { label: hubCopy.breadcrumbLabel },
            ]}
            services={services}
            directoryTitle={`${hubCopy.breadcrumbLabel} services`}
            contextRail={buildServiceHubRail(t, division)}
          />
        </div>
      </>
    );
  }

  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <div className="aio-ps-body">
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

  const handles: FeatureItem[] = resolveMobileServiceBenefits(service.slug).map((b) => ({
    label: b.label,
    iconSrc: b.iconSrc,
  }));

  const processSteps: ProcessStep[] = resolveMobileServiceProcess(
    service.slug,
    service.process,
    service.shortDescription,
  ).map((step, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: step.title,
    description: step.description,
  }));

  const relatedServices: RelatedServiceItem[] = service.relatedServices.flatMap((relSlug) => {
    const rel = getServiceBySlug(relSlug);
    if (!rel) return [];
    return [
      {
        slug: relSlug,
        title: rel.title,
        description: rel.shortDescription,
        href: aioPaths.serviceSlug(relSlug),
      },
    ];
  });

  const sidebar = (
    <>
      <p className="aio-prototype-note" style={{ margin: 0, color: 'rgba(255,255,255,0.65)' }}>
        Service status: {launchCta.state.replace(/_/g, ' ')}
      </p>
      <p className="aio-service-plan-item__pricing">{customerPriceLabel(pricing)}</p>
      {pricing?.externalFeeLabel ? (
        <p className="aio-prototype-note" style={{ margin: 0 }}>
          + {pricing.externalFeeLabel}
        </p>
      ) : null}
      {launchCta.allowed ? (
        <>
          {inPlan ? (
            <Link to={aioPaths.servicePlan}>
              <AIOButton variant="gold">In My Plan — Review</AIOButton>
            </Link>
          ) : (
            <AIOButton variant="gold" onClick={() => handleAdd(service)}>
              Add to My Plan
            </AIOButton>
          )}
          <Link to={aioPaths.getStartedForService(service.slug)}>
            <AIOButton variant="outline-gold">{launchCta.label}</AIOButton>
          </Link>
        </>
      ) : (
        <Link to={aioPaths.contact}>
          <AIOButton variant="outline-gold">{launchCta.label}</AIOButton>
        </Link>
      )}
      <Link to={aioPaths.getStarted}>
        <AIOButton variant="outline-gold" size="sm">
          Start Smart Intake
        </AIOButton>
      </Link>
    </>
  );

  const heroActions = launchCta.allowed ? (
    <>
      {inPlan ? (
        <AIOButton to={aioPaths.servicePlan} variant="gold" showArrow>
          Review My Plan
        </AIOButton>
      ) : (
        <AIOButton variant="gold" onClick={() => handleAdd(service)} showArrow>
          {launchCta.label}
        </AIOButton>
      )}
      <AioTextAction to={aioPaths.login}>Check My Status →</AioTextAction>
    </>
  ) : (
    <AIOButton to={aioPaths.contact} variant="gold" showArrow>
      {launchCta.label}
    </AIOButton>
  );

  return (
    <>
      <div className="aio-mobile-only">
        <MobileServiceDetailView
          service={service}
          onAddToPlan={() => handleAdd(service)}
          showJourneyBack={showJourneyBack}
        />
      </div>

      <div className="aio-desktop-only">
        <ServiceDetailTemplate
          eyebrow={mobileServiceCategoryLabel[service.division] ?? 'Services'}
          title={service.title}
          description={service.description}
          breadcrumbs={[
            { label: 'Services', href: aioPaths.services },
            { label: service.title },
          ]}
          heroActions={heroActions}
          showJourneyBack={showJourneyBack}
          handles={handles}
          processSteps={processSteps}
          requirements={service.requirements}
          sidebar={sidebar}
          relatedServices={relatedServices}
          disclaimer={
            disclosure ??
            (service.division === 'insurance'
              ? 'All In One is not the licensed insurer. Quotes subject to carrier review.'
              : 'Service availability may vary. No legal or regulatory guarantees implied.')
          }
          contextRail={buildServiceDetailRail(
            t,
            { slug: service.slug, title: service.title, shortDescription: service.shortDescription },
            launchCta.allowed ? aioPaths.getStartedForService(service.slug) : aioPaths.contact,
          )}
        />
      </div>
    </>
  );
}
