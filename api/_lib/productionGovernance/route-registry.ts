/**
 * Studio World production route governance registry.
 * GOVERNED routes cannot bypass enforcement via client flags.
 */

export type ProductionRouteGovernanceClass =
  | 'GOVERNED'
  | 'REQUIRES_MIGRATION'
  | 'NON_BILLABLE'
  | 'SAFE_INTERNAL_EXCEPTION';

export type ProductionRouteRegistryEntry = {
  routeKey: string;
  apiPath: string;
  governanceClass: ProductionRouteGovernanceClass;
  label: string;
};

export const PRODUCTION_ROUTE_REGISTRY: ProductionRouteRegistryEntry[] = [
  {
    routeKey: 'studio-virtual-production',
    apiPath: '/api/admin/studio-virtual-production',
    governanceClass: 'GOVERNED',
    label: 'Virtual Production',
  },
  {
    routeKey: 'founder-render-generate',
    apiPath: '/api/admin/founder-render-generate',
    governanceClass: 'GOVERNED',
    label: 'Founder Render',
  },
  {
    routeKey: 'studio-builder-generate',
    apiPath: '/api/admin/studio-builder-generate',
    governanceClass: 'GOVERNED',
    label: 'Studio Builder',
  },
  {
    routeKey: 'studio-foundry-generate',
    apiPath: '/api/admin/studio-foundry-generate',
    governanceClass: 'GOVERNED',
    label: 'Studio Foundry',
  },
  {
    routeKey: 'studio-generate-asset',
    apiPath: '/api/admin/studio-generate-asset',
    governanceClass: 'GOVERNED',
    label: 'Studio Asset Generation',
  },
  {
    routeKey: 'product-photography-generate',
    apiPath: '/api/admin/product-photography-generate',
    governanceClass: 'REQUIRES_MIGRATION',
    label: 'Product Photography',
  },
  {
    routeKey: 'live-try-on',
    apiPath: '/api/live-wig-try-on',
    governanceClass: 'REQUIRES_MIGRATION',
    label: 'Live Try-On',
  },
  {
    routeKey: 'commerce-fal',
    apiPath: '/api/wig-preview',
    governanceClass: 'REQUIRES_MIGRATION',
    label: 'Commerce FAL',
  },
  {
    routeKey: 'slay-forecast',
    apiPath: '/api/admin/slay-forecast-broadcast',
    governanceClass: 'REQUIRES_MIGRATION',
    label: 'Slay Forecast',
  },
  {
    routeKey: 'site00-assets',
    apiPath: '/api/site00-assets',
    governanceClass: 'NON_BILLABLE',
    label: 'SITE 00 Assets',
  },
  {
    routeKey: 'studio-production-governance',
    apiPath: '/api/admin/studio-production-governance',
    governanceClass: 'SAFE_INTERNAL_EXCEPTION',
    label: 'Governance Debug Simulation',
  },
];

const byRouteKey = new Map(PRODUCTION_ROUTE_REGISTRY.map((e) => [e.routeKey, e]));
const byApiPath = new Map(PRODUCTION_ROUTE_REGISTRY.map((e) => [e.apiPath, e]));

export function resolveProductionRoute(apiPathOrKey: string): ProductionRouteRegistryEntry | null {
  const normalized = apiPathOrKey.trim();
  return byRouteKey.get(normalized) ?? byApiPath.get(normalized) ?? null;
}

export function isGovernedProductionRoute(apiPathOrKey: string): boolean {
  return resolveProductionRoute(apiPathOrKey)?.governanceClass === 'GOVERNED';
}

export function listRoutesByClass(
  governanceClass: ProductionRouteGovernanceClass
): ProductionRouteRegistryEntry[] {
  return PRODUCTION_ROUTE_REGISTRY.filter((e) => e.governanceClass === governanceClass);
}

export function countRoutesByClass(): Record<ProductionRouteGovernanceClass, number> {
  return {
    GOVERNED: listRoutesByClass('GOVERNED').length,
    REQUIRES_MIGRATION: listRoutesByClass('REQUIRES_MIGRATION').length,
    NON_BILLABLE: listRoutesByClass('NON_BILLABLE').length,
    SAFE_INTERNAL_EXCEPTION: listRoutesByClass('SAFE_INTERNAL_EXCEPTION').length,
  };
}
