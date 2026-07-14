import { describe, expect, it } from 'vitest';
import {
  ensureExperienceLabVariantPackages,
  getDesignVariantPackage,
  resolveDesignVariantBlueprintFromPackage,
  resolveDesignVariantEnvironmentFromPackage,
  resolveDesignVariantPackageDrawer,
  resolveDesignVariantPackageId,
} from './experience-lab-environment-package-bridge';
import {
  assertAllVariantsOwnPackages,
  migrateDesignVariantPackageId,
} from './experience-lab-design-variant-package-migration';
import { EXPERIENCE_LAB_DESIGN_VARIANTS } from './experience-lab-design-variants';

describe('Experience Lab design variant package migration', () => {
  it('migrates every variant with environmentPackageId automatically', () => {
    expect(assertAllVariantsOwnPackages(EXPERIENCE_LAB_DESIGN_VARIANTS)).toBe(true);
    expect(EXPERIENCE_LAB_DESIGN_VARIANTS).toHaveLength(6);
    for (const variant of EXPERIENCE_LAB_DESIGN_VARIANTS) {
      expect(variant.environmentPackageId).toContain(variant.id);
      expect(variant.environmentPackageId).toMatch(/^envpkg\./);
    }
  });

  it('generates stable package IDs per variant', () => {
    const variant = EXPERIENCE_LAB_DESIGN_VARIANTS[0];
    expect(migrateDesignVariantPackageId(variant)).toBe(variant.environmentPackageId);
  });
});

describe('Experience Lab environment package bridge', () => {
  it('bootstraps one package per variant idempotently', () => {
    const first = ensureExperienceLabVariantPackages();
    const second = ensureExperienceLabVariantPackages();
    expect(first).toHaveLength(6);
    expect(second).toHaveLength(6);
    expect(first[0].packageId).toBe(second[0].packageId);
  });

  it('resolves viewport URLs from per-variant packages', () => {
    ensureExperienceLabVariantPackages();
    const lightMobile = resolveDesignVariantEnvironmentFromPackage('light-01', true);
    const darkDesktop = resolveDesignVariantEnvironmentFromPackage('dark-01', false);
    expect(lightMobile).toBeTruthy();
    expect(darkDesktop).toBeTruthy();
  });

  it('exposes package drawer model per variant', () => {
    ensureExperienceLabVariantPackages();
    const drawer = resolveDesignVariantPackageDrawer('light-01');
    expect(drawer).not.toBeNull();
    expect(drawer?.variantId).toBe('light-01');
    expect(drawer?.packageId).toBe(resolveDesignVariantPackageId('light-01'));
    expect(drawer?.outputsGenerated).toBeGreaterThan(0);
  });

  it('resolves blueprint output state from per-variant packages', () => {
    ensureExperienceLabVariantPackages();
    const blueprint = resolveDesignVariantBlueprintFromPackage('light-01');
    expect(blueprint.status).toBeDefined();
    expect(['pending', 'generating', 'generated', 'cached', 'failed']).toContain(blueprint.status);
  });

  it('returns registered package per variant from getter', () => {
    ensureExperienceLabVariantPackages();
    const pkg = getDesignVariantPackage('light-02');
    expect(pkg?.variantId).toBe('light-02');
    expect(pkg?.packageId).toBe(EXPERIENCE_LAB_DESIGN_VARIANTS[1].environmentPackageId);
  });
});
