import { describe, expect, it } from 'vitest';
import { CANONICAL_SERVICE_CATALOG, getCatalogServiceBySlug } from './serviceCatalog';
import { evaluateRoadReadyApplicability } from './roadReadyApplicability';
import { recommendServicesFromIntake } from './serviceNeedRecommendation';

describe('service catalog', () => {
  it('includes required refinement 05 services', () => {
    const slugs = CANONICAL_SERVICE_CATALOG.map((s) => s.slug);
    expect(slugs).toContain('ucr-registration');
    expect(slugs).toContain('hvut-form-2290');
    expect(slugs).toContain('mcs-150-biennial-update');
    expect(slugs).toContain('payroll-services');
    expect(slugs).toContain('tax-preparation');
    expect(slugs).toContain('driver-qualification-files');
  });

  it('does not invent fulfillment for unconfigured services', () => {
    const ucr = getCatalogServiceBySlug('ucr-registration');
    expect(ucr?.fulfillmentType).toBeNull();
  });
});

describe('road ready applicability', () => {
  it('marks UCR as not applicable for pure intrastate with no fleet signal', () => {
    const results = evaluateRoadReadyApplicability({ intrastate: true, vehicleCount: 0 });
    const ucr = results.find((r) => r.requirementKey === 'ucr');
    expect(ucr?.result).toBe('NOT_APPLICABLE');
  });

  it('marks HVUT likely required for heavy vehicles', () => {
    const results = evaluateRoadReadyApplicability({ vehicleWeightOver26000: true });
    const hvut = results.find((r) => r.requirementKey === 'hvut');
    expect(hvut?.result).toBe('LIKELY_REQUIRED');
  });
});

describe('service need recommendation', () => {
  it('recommends bookkeeping for bookkeeping intent', () => {
    const slugs = recommendServicesFromIntake('bookkeeping');
    expect(slugs).toContain('bookkeeping');
  });
});
