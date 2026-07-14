import { describe, expect, it } from 'vitest';
import {
  ensureExperienceLabEnvironmentPackage,
  getExperienceLabEnvironmentPackage,
  resolveDesignVariantEnvironmentFromPackage,
  resolveDesignVariantPackageDrawer,
  EXPERIENCE_LAB_ENVIRONMENT_PACKAGE_ID,
} from './experience-lab-environment-package-bridge';

describe('Experience Lab environment package bridge', () => {
  it('bootstraps reception package idempotently', () => {
    const first = ensureExperienceLabEnvironmentPackage();
    const second = ensureExperienceLabEnvironmentPackage();
    expect(first.packageId).toBe(EXPERIENCE_LAB_ENVIRONMENT_PACKAGE_ID);
    expect(second.packageId).toBe(first.packageId);
  });

  it('resolves viewport URLs from package outputs for light and dark variants', () => {
    ensureExperienceLabEnvironmentPackage();
    const lightMobile = resolveDesignVariantEnvironmentFromPackage('light-01', true);
    const darkDesktop = resolveDesignVariantEnvironmentFromPackage('dark-01', false);
    expect(lightMobile).toBeTruthy();
    expect(darkDesktop).toBeTruthy();
    expect(lightMobile).not.toBe(darkDesktop);
  });

  it('exposes package drawer model for variant metadata', () => {
    ensureExperienceLabEnvironmentPackage();
    const drawer = resolveDesignVariantPackageDrawer('light-01');
    expect(drawer).not.toBeNull();
    expect(drawer?.variantId).toBe('light-01');
    expect(drawer?.environmentName).toContain('Reception');
    expect(drawer?.mobilePreviewUrl).toBeTruthy();
  });

  it('returns registered package from getter', () => {
    ensureExperienceLabEnvironmentPackage();
    const pkg = getExperienceLabEnvironmentPackage();
    expect(pkg?.packageId).toBe(EXPERIENCE_LAB_ENVIRONMENT_PACKAGE_ID);
    expect(pkg?.variants).toHaveLength(6);
  });
});
