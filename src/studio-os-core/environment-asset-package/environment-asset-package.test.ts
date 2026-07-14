import { describe, expect, it } from 'vitest';
import {
  ENVIRONMENT_VARIANT_IDS,
  ENVIRONMENT_PACKAGE_SCHEMA_VERSION,
} from './types';
import { CORE_ENVIRONMENT_OUTPUT_FORMATS, buildPendingOutputs } from './output-formats';
import {
  buildEnvironmentPackageCacheKey,
  assertPackageReusePolicy,
  shouldRegenerateEnvironmentPackage,
} from './cache-policy';
import { buildEnvironmentAssetPackage } from './package-workflow';
import {
  resolveViewportEnvironmentFromPackage,
  buildPackageDrawerModel,
  promotePackageVariant,
} from './package-resolver';
import {
  EXPERIENCE_LAB_RECEPTION_PACKAGE_ID,
  registerEnvironmentPackage,
  getEnvironmentPackage,
} from './package-registry';
import { resolveCdsEnvironmentBinding } from './cds-consumer';
import { blueprintGeneratorSource } from './asset-manufacturing-consumer';

const PREVIEW = 'https://example.com/preview-mobile.png';
const DESKTOP = 'https://example.com/preview-desktop.png';

function buildTestPackage() {
  return buildEnvironmentAssetPackage({
    packageId: 'envpkg.test.reception.r1',
    environmentId: 'reception',
    departmentId: 'experience-lab',
    displayName: 'Test Reception Package',
    revision: 1,
    prompt: 'test prompt',
    promptVersion: 'test-v1',
    provider: 'test-provider',
    model: 'test-model',
    seed: 'test-seed',
    status: 'review',
    stage: 'concept-preview',
    promotedVariantId: null,
    previewUrls: {
      'light-01': PREVIEW,
      'light-02': PREVIEW,
      'light-03': PREVIEW,
      'dark-01': DESKTOP,
      'dark-02': DESKTOP,
      'dark-03': DESKTOP,
    },
  });
}

describe('Environment Asset Package — types and formats', () => {
  it('defines exactly six architectural variant IDs', () => {
    expect(ENVIRONMENT_VARIANT_IDS).toHaveLength(6);
    expect(ENVIRONMENT_VARIANT_IDS).toEqual([
      'light-01', 'light-02', 'light-03', 'dark-01', 'dark-02', 'dark-03',
    ]);
  });

  it('includes core responsive output formats', () => {
    const ids = CORE_ENVIRONMENT_OUTPUT_FORMATS.map((f) => f.id);
    expect(ids).toContain('desktop-21-9');
    expect(ids).toContain('mobile-9-16');
    expect(ids).toContain('tablet-4-3');
  });

  it('builds pending outputs for all format tiers', () => {
    const outputs = buildPendingOutputs(true);
    expect(outputs.length).toBeGreaterThan(CORE_ENVIRONMENT_OUTPUT_FORMATS.length);
    expect(outputs.every((o) => o.status === 'pending')).toBe(true);
  });
});

describe('Environment Asset Package — cache policy', () => {
  it('builds stable cache keys from department, environment, revision, prompt, seed, provider', () => {
    const key = buildEnvironmentPackageCacheKey({
      departmentId: 'experience-lab',
      environmentId: 'reception',
      revision: 1,
      promptHash: 'v1',
      seed: '42811',
      provider: 'fal',
    });
    expect(key).toBe('experience-lab:reception:r1:v1:42811:fal');
  });

  it('reuses package when cache key matches and no regeneration request', () => {
    const pkg = buildTestPackage();
    const lookup = {
      departmentId: 'experience-lab' as const,
      environmentId: 'reception',
      revision: 1,
      promptHash: 'test-v1',
      seed: 'test-seed',
      provider: 'test-provider',
    };
    expect(assertPackageReusePolicy(pkg, lookup)).toBe('reuse');
    expect(shouldRegenerateEnvironmentPackage(pkg, lookup)).toBe(false);
  });

  it('regenerates when prompt hash changes', () => {
    const pkg = buildTestPackage();
    const lookup = {
      departmentId: 'experience-lab' as const,
      environmentId: 'reception',
      revision: 1,
      promptHash: 'changed-v2',
      seed: 'test-seed',
      provider: 'test-provider',
    };
    expect(assertPackageReusePolicy(pkg, lookup)).toBe('generate');
  });
});

describe('Environment Asset Package — workflow and resolver', () => {
  it('builds package with schema version and six variants', () => {
    const pkg = buildTestPackage();
    expect(pkg.schemaVersion).toBe(ENVIRONMENT_PACKAGE_SCHEMA_VERSION);
    expect(pkg.variants).toHaveLength(6);
    expect(pkg.cacheKey).toBeTruthy();
  });

  it('resolves mobile and desktop outputs from same variant', () => {
    const pkg = buildTestPackage();
    const mobile = resolveViewportEnvironmentFromPackage(pkg, 'light-01', true);
    const desktop = resolveViewportEnvironmentFromPackage(pkg, 'dark-01', false);
    expect(mobile).toBe(PREVIEW);
    expect(desktop).toBe(DESKTOP);
  });

  it('builds drawer model with output counts and production readiness flags', () => {
    const pkg = buildTestPackage();
    const drawer = buildPackageDrawerModel(pkg, 'light-01');
    expect(drawer).not.toBeNull();
    expect(drawer?.environmentName).toBe('Test Reception Package');
    expect(drawer?.variantName).toBe('Light 01');
    expect(drawer?.mobilePreviewUrl).toBe(PREVIEW);
    expect(drawer?.blueprintReady).toBe(false);
  });

  it('promotes variant to production-ready with revision history entry', () => {
    const pkg = buildTestPackage();
    const promoted = promotePackageVariant(pkg, 'light-02');
    expect(promoted.promotedVariantId).toBe('light-02');
    expect(promoted.status).toBe('production-ready');
    expect(promoted.revisionHistory.length).toBeGreaterThan(pkg.revisionHistory.length);
  });
});

describe('Environment Asset Package — consumers', () => {
  it('CDS binds to packageId and variantId — not loose URLs', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const binding = resolveCdsEnvironmentBinding({ packageId: pkg.packageId, variantId: 'light-01' });
    expect(binding).toEqual({
      packageId: pkg.packageId,
      variantId: 'light-01',
      sceneStackLayer: 'environment-shell',
      referenceOnly: true,
    });
  });

  it('Asset Manufacturing blueprint generator references package production assets', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const source = blueprintGeneratorSource({ packageId: pkg.packageId, variantId: 'light-01' });
    expect(source?.packageId).toBe(pkg.packageId);
    expect(source?.assetKind).toBe('blueprint');
    expect(source?.status).toBe('pending');
  });

  it('registers default Experience Lab reception package id', () => {
    expect(EXPERIENCE_LAB_RECEPTION_PACKAGE_ID).toBe('envpkg.experience-lab.reception.r1');
    expect(getEnvironmentPackage(EXPERIENCE_LAB_RECEPTION_PACKAGE_ID)).toBeNull();
  });
});
