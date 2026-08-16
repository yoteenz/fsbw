import { SERVICE_NEED_OPTIONS } from './serviceCatalog';
import type { ServiceNeedIntent } from './serviceCatalogTypes';
import { recommendServicesFromBusinessProfile } from './roadReadyApplicability';
import type { RoadReadyApplicabilityInput } from './serviceCatalogTypes';

export function getServiceNeedOptions() {
  return SERVICE_NEED_OPTIONS;
}

export function recommendServicesForNeed(intent: ServiceNeedIntent): string[] {
  const option = SERVICE_NEED_OPTIONS.find((o) => o.id === intent);
  return option?.recommendedSlugs ?? [];
}

export function recommendServicesFromIntake(
  intent: ServiceNeedIntent,
  businessProfile?: RoadReadyApplicabilityInput,
): string[] {
  if (intent === 'not-sure' && businessProfile) {
    return recommendServicesFromBusinessProfile(businessProfile);
  }
  const fromNeed = recommendServicesForNeed(intent);
  if (intent !== 'not-sure' || !businessProfile) return fromNeed;
  const fromProfile = recommendServicesFromBusinessProfile(businessProfile);
  return [...new Set([...fromNeed, ...fromProfile])];
}

export function crossSellRecommendations(activeSlug: string): string[] {
  const map: Record<string, string[]> = {
    'operating-authority-assistance': ['boc-3-assistance', 'commercial-auto-liability', 'ucr-registration'],
    'irp-apportioned-registration': ['ifta-fuel-tax-assistance', 'tag-services'],
    'bookkeeping': ['tax-preparation'],
    'carrier-dispatch-support': ['factoring-consultation'],
    'all-in-one-bookkeeping': ['payroll-services', 'tax-preparation'],
  };
  return map[activeSlug] ?? [];
}
