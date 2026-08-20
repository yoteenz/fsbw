/**
 * Partner capability view — derived from production route governance registry.
 */

import type { PartnerCapabilityEntry, PartnerCapabilityState } from './types';

type RegistryClass = 'GOVERNED' | 'REQUIRES_MIGRATION' | 'NON_BILLABLE' | 'SAFE_INTERNAL_EXCEPTION';

const ROUTES: Array<{ routeKey: string; label: string; governanceClass: RegistryClass }> = [
  { routeKey: 'studio-virtual-production', label: 'Virtual Production', governanceClass: 'GOVERNED' },
  { routeKey: 'founder-render-generate', label: 'Founder Render', governanceClass: 'GOVERNED' },
  { routeKey: 'studio-builder-generate', label: 'Studio Builder', governanceClass: 'GOVERNED' },
  { routeKey: 'studio-foundry-generate', label: 'Studio Foundry', governanceClass: 'GOVERNED' },
  { routeKey: 'studio-generate-asset', label: 'Studio Asset Generation', governanceClass: 'GOVERNED' },
  { routeKey: 'product-photography-generate', label: 'Product Photography', governanceClass: 'REQUIRES_MIGRATION' },
  { routeKey: 'live-try-on', label: 'Live Try-On', governanceClass: 'REQUIRES_MIGRATION' },
  { routeKey: 'commerce-fal', label: 'Commerce FAL', governanceClass: 'REQUIRES_MIGRATION' },
  { routeKey: 'slay-forecast', label: 'Slay Forecast', governanceClass: 'REQUIRES_MIGRATION' },
];

export function isExternalPartnerOrgType(organizationType: string): boolean {
  return organizationType === 'AGENCY' || organizationType === 'PARTNER' || organizationType === 'CLIENT_ORG';
}

function stateForRoute(
  governanceClass: RegistryClass,
  externalPartner: boolean
): { state: PartnerCapabilityState; message: string } {
  if (governanceClass === 'GOVERNED') {
    return externalPartner
      ? { state: 'POLICY_DEPENDENT', message: 'Available when entitled and role permits' }
      : { state: 'AVAILABLE', message: 'Governed production path' };
  }
  if (governanceClass === 'REQUIRES_MIGRATION') {
    return externalPartner
      ? { state: 'BLOCKED_EXTERNAL', message: 'Not yet available for partner organizations' }
      : { state: 'MIGRATION_REQUIRED', message: 'Governance migration required' };
  }
  if (governanceClass === 'NON_BILLABLE') {
    return { state: 'NON_BILLABLE', message: 'Non-billable internal path' };
  }
  return { state: 'AVAILABLE', message: 'Internal debug exception' };
}

export function resolvePartnerCapabilities(
  organizationType: string,
  hasFoundingPartner = false
): PartnerCapabilityEntry[] {
  const external = isExternalPartnerOrgType(organizationType);
  return ROUTES.map((route) => {
    const { state, message } = stateForRoute(route.governanceClass, external);
    let resolvedState = state;
    if (external && route.governanceClass === 'GOVERNED' && hasFoundingPartner) {
      resolvedState = route.routeKey === 'studio-virtual-production' ? 'AVAILABLE' : 'POLICY_DEPENDENT';
    }
    return {
      routeKey: route.routeKey,
      label: route.label,
      state: resolvedState,
      message,
    };
  });
}

export function isCapabilityBlockedForExternal(routeKey: string): boolean {
  const route = ROUTES.find((r) => r.routeKey === routeKey);
  return route?.governanceClass === 'REQUIRES_MIGRATION';
}
