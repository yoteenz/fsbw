/**
 * Production route governance registry tests.
 */

import { describe, expect, it } from 'vitest';
import {
  countRoutesByClass,
  isGovernedProductionRoute,
  listRoutesByClass,
  resolveProductionRoute,
} from '../../../api/_lib/productionGovernance/route-registry.js';
import { isExternalPartnerOrganization } from '../../../api/_lib/productionGovernance/operator-context.js';

describe('Production route governance registry', () => {
  it('registers 5 GOVERNED production routes', () => {
    expect(countRoutesByClass().GOVERNED).toBe(5);
    expect(listRoutesByClass('GOVERNED').map((r) => r.routeKey)).toEqual(
      expect.arrayContaining([
        'studio-virtual-production',
        'founder-render-generate',
        'studio-builder-generate',
        'studio-foundry-generate',
        'studio-generate-asset',
      ])
    );
  });

  it('registers 4 REQUIRES_MIGRATION bypass routes', () => {
    expect(countRoutesByClass().REQUIRES_MIGRATION).toBe(4);
    expect(listRoutesByClass('REQUIRES_MIGRATION').map((r) => r.label)).toEqual(
      expect.arrayContaining(['Product Photography', 'Live Try-On', 'Commerce FAL', 'Slay Forecast'])
    );
  });

  it('registers SITE 00 as NON_BILLABLE', () => {
    expect(countRoutesByClass().NON_BILLABLE).toBe(1);
    expect(resolveProductionRoute('site00-assets')?.governanceClass).toBe('NON_BILLABLE');
  });

  it('registers governance debug simulation as SAFE_INTERNAL_EXCEPTION', () => {
    expect(countRoutesByClass().SAFE_INTERNAL_EXCEPTION).toBe(1);
    expect(resolveProductionRoute('studio-production-governance')?.governanceClass).toBe(
      'SAFE_INTERNAL_EXCEPTION'
    );
  });

  it('resolves GOVERNED routes by API path', () => {
    expect(isGovernedProductionRoute('/api/admin/studio-builder-generate')).toBe(true);
    expect(isGovernedProductionRoute('studio-foundry-generate')).toBe(true);
    expect(isGovernedProductionRoute('product-photography-generate')).toBe(false);
  });

  it('does not mark REQUIRES_MIGRATION routes as governed', () => {
    for (const entry of listRoutesByClass('REQUIRES_MIGRATION')) {
      expect(isGovernedProductionRoute(entry.routeKey)).toBe(false);
    }
  });

  it('treats AGENCY and PARTNER org types as external partner organizations', () => {
    expect(isExternalPartnerOrganization('AGENCY')).toBe(true);
    expect(isExternalPartnerOrganization('PARTNER')).toBe(true);
    expect(isExternalPartnerOrganization('CLIENT_ORG')).toBe(true);
    expect(isExternalPartnerOrganization('OWNER')).toBe(false);
  });

  it('GOVERNED routes cannot be silently reclassified without registry update', () => {
    const governedKeys = listRoutesByClass('GOVERNED').map((r) => r.routeKey);
    expect(governedKeys).not.toContain('product-photography-generate');
    expect(governedKeys).not.toContain('live-try-on');
  });

  it('executeGovernedProduction canonical routes match gateway source routes', () => {
    expect(resolveProductionRoute('studio-builder-generate')?.apiPath).toBe(
      '/api/admin/studio-builder-generate'
    );
    expect(resolveProductionRoute('/api/admin/founder-render-generate')?.routeKey).toBe(
      'founder-render-generate'
    );
  });
});
