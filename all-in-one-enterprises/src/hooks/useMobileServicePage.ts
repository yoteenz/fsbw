import { useMemo } from 'react';
import type { AioService } from '../data/services';
import { getServiceBySlug } from '../data/services';
import { getCatalogServiceBySlug, fulfillmentDisclosure } from '../services/catalog';
import { customerPriceLabel, getServicePricing } from '../billing/servicePricingConfig';
import { getPublicServiceCta } from '../launch';
import { useServicePlan } from '../components/AIOServicePlanBar';
import { useDemoStore } from '../demo/useDemoStore';
import { getServiceTrackerView } from '../demo/workflowActions';
import { resolveOrganizationId } from '../portal/organizationContext';
import { aioPaths } from '../utils/paths';
import {
  mobileServiceCategoryLabel,
  resolveMobileServiceBenefits,
  resolveMobileServiceFaq,
  resolveMobileServiceHeroIcon,
  resolveMobileServiceProcess,
  type MobileServiceBenefit,
  type MobileServiceProcessStep,
} from '../services/mobileServicePageConfig';

export type MobileServiceCta = {
  primaryLabel: string;
  primaryHref?: string;
  primaryOnClick?: () => void;
  secondaryLabel: string;
  secondaryHref: string;
  tertiaryLabel: string;
  tertiaryHref: string;
  statusState: string;
  pricingLabel: string;
  inPlan: boolean;
};

export type MobileServiceProgressPhase = {
  label: string;
  status: 'complete' | 'current' | 'upcoming';
};

export type MobileServiceProgressView = {
  ready: boolean;
  title: string;
  phases: MobileServiceProgressPhase[];
  completedCount: number;
  totalCount: number;
  percent: number;
  trackerHref?: string;
};

export type MobileRelatedServiceView = {
  slug: string;
  title: string;
  href: string;
  badge?: 'IN MY PLAN' | 'RECOMMENDED';
};

export type MobileServicePageView = {
  service: AioService;
  categoryLabel: string;
  heroIconSrc?: string;
  disclosure: string | null;
  benefits: MobileServiceBenefit[];
  processSteps: MobileServiceProcessStep[];
  faq: { question: string; answer: string }[];
  requirements: string[];
  documents: string[];
  related: MobileRelatedServiceView[];
  notice: string;
  ctas: MobileServiceCta;
  progress: MobileServiceProgressView;
};

function buildProgress(service: AioService, orgId: string, store: ReturnType<typeof useDemoStore>): MobileServiceProgressView {
  const request = store.requests.find(
    (r) => r.clientId === orgId && r.services.some((s) => s.slug === service.slug) && r.status !== 'cancelled',
  );

  if (!request) {
    return {
      ready: false,
      title: `Your ${service.title.replace(/ Assistance$/, '')} Journey`,
      phases: [],
      completedCount: 0,
      totalCount: 0,
      percent: 0,
    };
  }

  const tracker = getServiceTrackerView(request.id);
  if (!tracker?.hasWorkflow) {
    return {
      ready: true,
      title: `Your ${service.title.replace(/ Assistance$/, '')} Journey`,
      phases: [{ label: 'Request Started', status: 'current' }],
      completedCount: 0,
      totalCount: 1,
      percent: 0,
      trackerHref: aioPaths.portalRequest(request.id),
    };
  }

  const phases: MobileServiceProgressPhase[] = tracker.phases.map((p) => ({
    label: p.customerLabel,
    status: p.status === 'complete' ? 'complete' : p.status === 'current' ? 'current' : 'upcoming',
  }));

  const completedCount = phases.filter((p) => p.status === 'complete').length;

  return {
    ready: true,
    title: `Your ${tracker.template?.name ?? service.title} Journey`,
    phases,
    completedCount,
    totalCount: phases.length,
    percent: tracker.progress,
    trackerHref: aioPaths.portalServiceTracker(request.id),
  };
}

function buildCtas(
  service: AioService,
  inPlan: boolean,
  onAddToPlan: () => void,
  progress: MobileServiceProgressView,
  pricingLabel: string,
): MobileServiceCta {
  const launchCta = getPublicServiceCta(service.slug);

  if (progress.ready && progress.percent >= 100 && progress.trackerHref) {
    return {
      primaryLabel: 'View Service',
      primaryHref: progress.trackerHref,
      secondaryLabel: launchCta.label,
      secondaryHref: aioPaths.getStartedForService(service.slug),
      tertiaryLabel: 'Start Smart Intake',
      tertiaryHref: aioPaths.getStarted,
      statusState: launchCta.state.replace(/_/g, ' '),
      pricingLabel,
      inPlan,
    };
  }

  if (progress.ready && progress.percent > 0 && progress.trackerHref) {
    return {
      primaryLabel: 'Continue Application',
      primaryHref: progress.trackerHref,
      secondaryLabel: launchCta.allowed ? launchCta.label : 'Contact Us',
      secondaryHref: launchCta.allowed ? aioPaths.getStartedForService(service.slug) : aioPaths.contact,
      tertiaryLabel: 'Start Smart Intake',
      tertiaryHref: aioPaths.getStarted,
      statusState: launchCta.state.replace(/_/g, ' '),
      pricingLabel,
      inPlan,
    };
  }

  if (inPlan) {
    return {
      primaryLabel: 'In My Plan — Review',
      primaryHref: aioPaths.servicePlan,
      secondaryLabel: launchCta.allowed ? launchCta.label : 'Contact Us',
      secondaryHref: launchCta.allowed ? aioPaths.getStartedForService(service.slug) : aioPaths.contact,
      tertiaryLabel: 'Start Smart Intake',
      tertiaryHref: aioPaths.getStarted,
      statusState: launchCta.state.replace(/_/g, ' '),
      pricingLabel,
      inPlan,
    };
  }

  return {
    primaryLabel: 'Add to My Plan',
    primaryOnClick: onAddToPlan,
    secondaryLabel: launchCta.allowed ? launchCta.label : 'Contact Us',
    secondaryHref: launchCta.allowed ? aioPaths.getStartedForService(service.slug) : aioPaths.contact,
    tertiaryLabel: 'Start Smart Intake',
    tertiaryHref: aioPaths.getStarted,
    statusState: launchCta.state.replace(/_/g, ' '),
    pricingLabel,
    inPlan,
  };
}

export function useMobileServicePage(service: AioService, onAddToPlan: () => void): MobileServicePageView {
  const { items } = useServicePlan();
  const store = useDemoStore();
  const orgId = resolveOrganizationId(store, 'carrier');

  return useMemo(() => {
    const inPlan = items.some((i) => i.slug === service.slug);
    const catalogEntry = getCatalogServiceBySlug(service.slug);
    const disclosure = catalogEntry ? fulfillmentDisclosure(catalogEntry) : null;
    const progress = buildProgress(service, orgId, store);
    const pricingLabel = customerPriceLabel(getServicePricing(service.slug, store.servicePricing));
    const ctas = buildCtas(service, inPlan, onAddToPlan, progress, pricingLabel);

    const related: MobileRelatedServiceView[] = service.relatedServices
      .map((relSlug) => {
        const rel = getServiceBySlug(relSlug);
        if (!rel) return null;
        const inRelatedPlan = items.some((i) => i.slug === relSlug);
        return {
          slug: relSlug,
          title: rel.title,
          href: aioPaths.serviceSlug(relSlug),
          badge: inRelatedPlan ? ('IN MY PLAN' as const) : undefined,
        };
      })
      .filter(Boolean) as MobileRelatedServiceView[];

    const notice =
      service.division === 'insurance'
        ? 'All In One is not the licensed insurer. Quotes subject to carrier review.'
        : 'Service availability may vary. No legal or regulatory guarantees implied.';

    return {
      service,
      categoryLabel: mobileServiceCategoryLabel[service.division] ?? 'Services',
      heroIconSrc: resolveMobileServiceHeroIcon(service.slug, service.division),
      disclosure,
      benefits: resolveMobileServiceBenefits(service.slug),
      processSteps: resolveMobileServiceProcess(service.slug, service.process, service.description),
      faq: resolveMobileServiceFaq(service.slug, service.faq),
      requirements: service.requirements,
      documents: service.documents,
      related,
      notice,
      ctas,
      progress,
    };
  }, [service, items, orgId, store, onAddToPlan]);
}
