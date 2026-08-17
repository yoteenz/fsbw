import type { TFunction } from 'i18next';
import type { ContextRailConfig } from '../components/context-rail/types';
import type { StartBusinessJourneyView } from '../journeys/journeyTypes';
import { getServicesByDivision, type ServiceDivision } from '../data/services';
import { startBusinessJourneyDef } from '../journeys/startBusinessJourneyConfig';
import { aioPaths } from '../utils/paths';
import { AIOButton } from '../components/AIOButton';
import { getDivisionHubCopy } from '../pages/ServicesPage';

export function buildStartBusinessRail(t: TFunction, view?: StartBusinessJourneyView): ContextRailConfig {
  const progressPct = view && view.progress.applicableCount > 0 ? view.progress.percent : undefined;

  const currentStepId = view?.selectedStepId;

  return {
    variant: 'journey',
    eyebrow: t('startBusiness.eyebrow'),
    title: t('startBusiness.title'),
    description: t('startBusiness.description'),
    items: startBusinessJourneyDef.steps.map((step) => {
      const stepView = view?.steps.find((s) => s.def.id === step.id);
      let state: 'complete' | 'current' | 'future' = 'future';
      if (stepView?.status === 'complete') state = 'complete';
      else if (step.id === currentStepId) state = 'current';
      else if (stepView && stepView.status !== 'not_started' && stepView.status !== 'not_applicable') state = 'complete';
      return {
        id: step.id,
        label: step.title,
        subtitle: step.shortTitle,
        href: step.route,
        state,
      };
    }),
    progress:
      progressPct !== undefined
        ? { label: 'Roadmap Progress', value: progressPct }
        : undefined,
    footer: (
      <AIOButton
        to={view?.nextAction?.ctaRoute ?? aioPaths.getStarted}
        variant="gold"
        showArrow
      >
        {view && view.progress.completedCount > 0 ? t('startBusiness.continueRoadmap') : t('startBusiness.getRoadmap')}
      </AIOButton>
    ),
    help: {
      title: t('help.title'),
      copy: t('help.copy'),
      href: aioPaths.contact,
      linkLabel: t('help.link'),
    },
  };
}

export function buildRoadReadyRail(t: TFunction): ContextRailConfig {
  return {
    variant: 'journey',
    eyebrow: t('roadReady.eyebrow'),
    title: t('roadReady.title'),
    description: t('roadReady.description'),
    itemsLabel: t('roadReady.sectionsLabel'),
    items: [
      { id: 'assessment', label: t('roadReady.assessment'), href: aioPaths.getStarted, state: 'current' },
      { id: 'requirements', label: t('roadReady.requirements'), scrollTarget: 'acr-road-ready-requirements' },
      { id: 'documents', label: t('roadReady.documents'), scrollTarget: 'acr-road-ready-documents' },
      { id: 'recommendations', label: t('roadReady.recommendations'), scrollTarget: 'acr-road-ready-recommendations' },
      { id: 'roadmap', label: t('roadReady.roadmap'), href: aioPaths.roadmapResults },
    ],
    footer: (
      <AIOButton to={aioPaths.getStarted} variant="gold" showArrow>
        {t('startBusiness.getRoadmap')}
      </AIOButton>
    ),
  };
}

export function buildServiceHubRail(t: TFunction, division: ServiceDivision): ContextRailConfig {
  const hub = getDivisionHubCopy(division);
  const services = getServicesByDivision(division);

  return {
    variant: 'navigation',
    eyebrow: hub.eyebrow,
    title: hub.breadcrumbLabel,
    description: hub.description,
    itemsLabel: t('serviceHub.sectionsLabel'),
    items: services.slice(0, 12).map((svc) => ({
      id: svc.slug,
      label: svc.title,
      href: aioPaths.serviceSlug(svc.slug),
    })),
    help: {
      title: t('serviceHub.notSure'),
      href: aioPaths.getStarted,
      linkLabel: t('serviceHub.getRoadmap'),
    },
  };
}

export function buildServiceDetailRail(
  t: TFunction,
  service: { slug: string; title: string; shortDescription: string },
  ctaHref: string,
): ContextRailConfig {
  return {
    variant: 'service',
    eyebrow: 'Service',
    title: service.title,
    description: service.shortDescription,
    itemsLabel: t('serviceDetail.sectionsLabel'),
    items: [
      { id: 'handles', label: t('serviceDetail.handles'), scrollTarget: 'acr-svc-handles', state: 'current' },
      { id: 'process', label: t('serviceDetail.process'), scrollTarget: 'acr-svc-process' },
      { id: 'requirements', label: t('serviceDetail.requirements'), scrollTarget: 'acr-svc-requirements' },
      { id: 'related', label: t('serviceDetail.related'), scrollTarget: 'acr-svc-related' },
    ],
    status: [{ label: t('serviceDetail.serviceStatus'), value: t('serviceDetail.available') }],
    footer: (
      <AIOButton to={ctaHref} variant="gold" showArrow>
        {t('serviceDetail.getStarted')}
      </AIOButton>
    ),
  };
}

export function buildBookkeepingRail(t: TFunction): ContextRailConfig {
  return {
    variant: 'service',
    eyebrow: t('bookkeeping.eyebrow'),
    title: t('bookkeeping.title'),
    description: t('bookkeeping.description'),
    itemsLabel: t('serviceDetail.sectionsLabel'),
    items: [
      { id: 'overview', label: t('bookkeeping.overview'), scrollTarget: 'acr-bk-overview', state: 'current' },
      { id: 'packages', label: t('bookkeeping.packages'), scrollTarget: 'acr-bk-packages' },
      { id: 'included', label: t('bookkeeping.included'), scrollTarget: 'acr-bk-included' },
      { id: 'how', label: t('bookkeeping.howItWorks'), scrollTarget: 'acr-bk-how' },
      { id: 'onboarding', label: t('bookkeeping.onboarding'), scrollTarget: 'acr-bk-onboarding' },
    ],
    footer: (
      <AIOButton to={aioPaths.bookkeepingAssessment} variant="gold" showArrow>
        {t('serviceDetail.getStarted')}
      </AIOButton>
    ),
  };
}

export function buildContactRail(t: TFunction, intents: { id: string; label: string }[]): ContextRailConfig {
  return {
    variant: 'navigation',
    eyebrow: t('contact.eyebrow'),
    title: t('contact.title'),
    description: t('contact.description'),
    itemsLabel: t('contact.intentsLabel'),
    items: intents.map((intent, i) => ({
      id: intent.id,
      label: intent.label,
      scrollTarget: 'acr-contact-form',
      state: i === 0 ? 'current' : 'default',
    })),
  };
}

export function buildPortalOverviewRail(t: TFunction): ContextRailConfig {
  return {
    variant: 'dashboard',
    eyebrow: t('portal.myAio'),
    title: t('portal.myAio'),
    description: t('portal.myAioDesc'),
    showLogo: false,
    itemsLabel: t('serviceHub.sectionsLabel'),
    items: [
      { id: 'overview', label: t('portal.overview'), href: aioPaths.portal },
      { id: 'roadReady', label: t('portal.roadReady'), href: aioPaths.roadReady },
      { id: 'services', label: t('portal.services'), href: aioPaths.portalServicesCenter },
      { id: 'documents', label: t('portal.documents'), href: aioPaths.portalDocuments },
      { id: 'fleet', label: t('portal.fleet'), href: aioPaths.portalFleet },
      { id: 'money', label: t('portal.money'), href: aioPaths.portalMoney },
      { id: 'activity', label: t('portal.activity'), href: aioPaths.portalActivity },
    ],
  };
}

export function buildFleetCareClientRail(t: TFunction): ContextRailConfig {
  return {
    variant: 'marketplace',
    title: t('fleetCareClient.title'),
    description: t('fleetCareClient.description'),
    showLogo: false,
    items: [
      { id: 'home', label: t('fleetCareClient.myFleet'), href: aioPaths.portalFleetCare },
      { id: 'request', label: t('fleetCareClient.openRequests'), href: aioPaths.portalFleetCareRequest },
      { id: 'history', label: t('fleetCareClient.history'), href: aioPaths.portalFleetCare },
    ],
  };
}

export function buildDriverLinkCompanyRail(t: TFunction): ContextRailConfig {
  return {
    variant: 'marketplace',
    title: t('driverLinkCompany.title'),
    description: t('driverLinkCompany.description'),
    showLogo: false,
    items: [
      { id: 'home', label: t('driverLinkCompany.positions'), href: aioPaths.portalDriverLink },
      { id: 'candidates', label: t('driverLinkCompany.candidates'), href: aioPaths.portalDriverLinkCandidates },
      { id: 'applications', label: t('driverLinkCompany.applications'), href: aioPaths.portalDriverLink },
    ],
  };
}

export function resolvePortalModuleRail(t: TFunction, pathname: string): ContextRailConfig | null {
  if (pathname.includes('/portal/fleetcare')) return buildFleetCareClientRail(t);
  if (pathname.includes('/portal/driverlink')) return buildDriverLinkCompanyRail(t);
  if (pathname.includes('/portal/vault')) {
    return {
      variant: 'document',
      title: t('vault.title'),
      description: t('vault.description'),
      showLogo: false,
      items: [
        { id: 'all', label: t('vault.all'), href: aioPaths.portalVault },
        { id: 'current', label: t('vault.current'), href: aioPaths.portalVault },
      ],
    };
  }
  if (pathname.includes('/portal/dispatch')) {
    return {
      variant: 'service',
      title: 'Dispatch',
      description: 'Professional dispatch and load coordination.',
      showLogo: false,
      items: [
        { id: 'home', label: 'Overview', href: aioPaths.portalDispatch },
        { id: 'loads', label: 'Loads', href: aioPaths.portalDispatchLoads },
        { id: 'history', label: 'History', href: aioPaths.portalDispatchHistory },
      ],
    };
  }
  return null;
}
