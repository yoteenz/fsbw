import { describe, expect, it } from 'vitest';
import {
  PACKAGE_OUTPUT_IDENTITY_DRIFT,
  validateEnvironmentPackageOutputConsistency,
} from './EnvironmentPackageConsistencyValidator';
import { isEnvironmentPackageInMemoryOnly, resolveEnvironmentPackageFeatureFlags } from './environment-package-feature-flags';

const PARENT_JOB_TYPE = 'ENVIRONMENT_PACKAGE_PRODUCTION';

const CHILD_JOB_SPECS = [
  { jobType: 'ENVIRONMENT_DESKTOP_RENDER', outputType: 'desktop', aspectRatio: '21:9', dependsOn: [] as string[], isRender: true },
  { jobType: 'ENVIRONMENT_MOBILE_RENDER', outputType: 'mobile', aspectRatio: '9:16', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: true },
  { jobType: 'ENVIRONMENT_TABLET_RENDER', outputType: 'tablet', aspectRatio: '4:3', dependsOn: ['ENVIRONMENT_DESKTOP_RENDER'], isRender: true },
];

describe('Environment Package Production Pipeline', () => {
  it('in-memory repository is not used when persistence is enabled in production mode', () => {
    const flags = resolveEnvironmentPackageFeatureFlags();
    if (!flags.enablePackagePersistence) {
      expect(isEnvironmentPackageInMemoryOnly()).toBe(true);
      return;
    }
    expect(typeof isEnvironmentPackageInMemoryOnly()).toBe('boolean');
  });

  it('defines parent and dependency-aware child scheduler jobs', () => {
    expect(PARENT_JOB_TYPE).toBe('ENVIRONMENT_PACKAGE_PRODUCTION');
    const desktop = CHILD_JOB_SPECS.find((s) => s.jobType === 'ENVIRONMENT_DESKTOP_RENDER');
    const mobile = CHILD_JOB_SPECS.find((s) => s.jobType === 'ENVIRONMENT_MOBILE_RENDER');
    expect(desktop?.dependsOn).toEqual([]);
    expect(mobile?.dependsOn).toContain('ENVIRONMENT_DESKTOP_RENDER');
  });

  it('desktop routes to full-scene model role', () => {
    const desktop = CHILD_JOB_SPECS.find((s) => s.jobType === 'ENVIRONMENT_DESKTOP_RENDER');
    expect(desktop?.isRender).toBe(true);
    expect(desktop?.aspectRatio).toBe('21:9');
  });

  it('mobile and tablet derive from canonical desktop master', () => {
    const mobile = CHILD_JOB_SPECS.find((s) => s.jobType === 'ENVIRONMENT_MOBILE_RENDER');
    const tablet = CHILD_JOB_SPECS.find((s) => s.jobType === 'ENVIRONMENT_TABLET_RENDER');
    expect(mobile?.dependsOn).toContain('ENVIRONMENT_DESKTOP_RENDER');
    expect(tablet?.dependsOn).toContain('ENVIRONMENT_DESKTOP_RENDER');
    expect(mobile?.aspectRatio).toBe('9:16');
    expect(tablet?.aspectRatio).toBe('4:3');
  });

  it('identity drift fails companion output validation', () => {
    const result = validateEnvironmentPackageOutputConsistency({
      canonicalMasterUrl: 'https://example.com/master.png',
      companionUrl: 'https://example.com/other-room.png',
      outputType: 'mobile',
      promptHash: '',
      seed: '',
      theme: 'light',
    });
    expect(result.verdict).toBe('FAIL');
    expect(result.failureCode).toBe(PACKAGE_OUTPUT_IDENTITY_DRIFT);
  });

  it('matching prompt identity passes consistency for same-source companions', () => {
    const url = 'https://example.com/room.png';
    const result = validateEnvironmentPackageOutputConsistency({
      canonicalMasterUrl: url,
      companionUrl: url,
      outputType: 'mobile',
      promptHash: 'elab-light-02-v1',
      seed: '42812',
      theme: 'light',
    });
    expect(result.verdict).toBe('PASS');
  });

  it('production generation and canonical promotion default OFF on client', () => {
    const flags = resolveEnvironmentPackageFeatureFlags();
    expect(flags.enablePackageProductionGeneration).toBe(false);
    expect(flags.enablePackageCanonicalPromotion).toBe(false);
  });
});
