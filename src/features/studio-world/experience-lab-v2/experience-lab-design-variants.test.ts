import { describe, expect, it } from 'vitest';
import {
  DESIGN_VARIANT_IDS,
  DESIGN_VARIANTS_SECTION_LABEL,
  EXPERIENCE_LAB_DESIGN_VARIANTS,
  designVariantCacheKey,
  parseDesignVariantFromQuery,
  resolveVariantCardBadge,
} from './experience-lab-design-variants';

describe('Experience Lab design variants', () => {
  it('defines exactly six variants in light then dark order', () => {
    expect(DESIGN_VARIANT_IDS).toHaveLength(6);
    expect(DESIGN_VARIANT_IDS).toEqual([
      'light-01', 'light-02', 'light-03', 'dark-01', 'dark-02', 'dark-03',
    ]);
    expect(EXPERIENCE_LAB_DESIGN_VARIANTS.map((v) => v.theme).slice(0, 3)).toEqual(['light', 'light', 'light']);
    expect(EXPERIENCE_LAB_DESIGN_VARIANTS.map((v) => v.theme).slice(3)).toEqual(['dark', 'dark', 'dark']);
  });

  it('every variant owns exactly one environmentPackageId', () => {
    for (const variant of EXPERIENCE_LAB_DESIGN_VARIANTS) {
      expect(variant.environmentPackageId).toContain(variant.id);
    }
    const ids = EXPERIENCE_LAB_DESIGN_VARIANTS.map((v) => v.environmentPackageId);
    expect(new Set(ids).size).toBe(6);
  });

  it('parses variant query param', () => {
    expect(parseDesignVariantFromQuery('?variant=dark-02')).toBe('dark-02');
    expect(parseDesignVariantFromQuery('?variant=invalid')).toBeNull();
  });

  it('resolves ACTIVE badge for active variant only', () => {
    const variant = EXPERIENCE_LAB_DESIGN_VARIANTS[0];
    expect(resolveVariantCardBadge(variant, true)).toBe('ACTIVE');
    expect(resolveVariantCardBadge(variant, false)).not.toBe('ACTIVE');
  });

  it('uses stable cache keys for cost protection', () => {
    const variant = EXPERIENCE_LAB_DESIGN_VARIANTS[0];
    expect(designVariantCacheKey(variant)).toBe('elab-light-01-v1:42811:preview');
  });

  it('labels section as DESIGN VARIANTS', () => {
    expect(DESIGN_VARIANTS_SECTION_LABEL).toBe('DESIGN VARIANTS');
  });
});
