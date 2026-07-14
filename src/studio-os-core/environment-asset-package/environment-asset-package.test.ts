import { describe, expect, it, beforeEach } from 'vitest';
import {
  ENVIRONMENT_VARIANT_IDS,
  ENVIRONMENT_PACKAGE_SCHEMA_VERSION,
  buildVariantEnvironmentPackage,
  buildVariantPackageId,
} from './EnvironmentAssetPackage';
import {
  buildEmptyOutputRegistry,
  countOutputRegistry,
} from './EnvironmentPackageOutputs';
import {
  buildEnvironmentPackageCacheKey,
  assertPackageReusePolicy,
  clearEnvironmentPackageCache,
} from './EnvironmentPackageCache';
import {
  ensureVariantEnvironmentPackage,
  resolveActiveEnvironmentUrl,
  buildPackageDrawerModel,
  promoteEnvironmentPackage,
} from './EnvironmentPackageService';
import {
  registerEnvironmentPackage,
  getEnvironmentPackage,
  resetEnvironmentPackageRepository,
} from './EnvironmentPackageRepository';
import {
  buildEnvironmentPackageGenerationQueue,
  countQueueProgress,
} from './EnvironmentPackageGenerationQueue';
import { computeEnvironmentPackageHealth } from './EnvironmentPackageStatus';
import { resolveEnvironmentPackageFeatureFlags } from './environment-package-feature-flags';
import {
  approveAndGenerateProductionPackage,
  startConceptPreviewGeneration,
} from './EnvironmentPackageGenerationService';
import { resolveCdsEnvironmentBinding } from './cds-consumer';
import { blueprintGeneratorSource } from './asset-manufacturing-consumer';
import { resolveMarketplaceListingFromPackage } from './marketplace-consumer';

const PREVIEW = 'https://example.com/preview-mobile.png';
const DESKTOP = 'https://example.com/preview-desktop.png';

function buildTestPackage(variantId: 'light-01' | 'dark-01' = 'light-01') {
  return buildVariantEnvironmentPackage({
    departmentId: 'experience-lab',
    environmentId: 'reception',
    variantId,
    variantName: variantId === 'light-01' ? 'Light 01' : 'Dark 01',
    theme: variantId.startsWith('light') ? 'light' : 'dark',
    promptHash: `elab-${variantId}-v1`,
    promptVersion: `elab-${variantId}-v1`,
    seed: variantId === 'light-01' ? '42811' : '51801',
    previewUrl: PREVIEW,
    desktopPreviewUrl: DESKTOP,
  });
}

beforeEach(() => {
  resetEnvironmentPackageRepository();
  clearEnvironmentPackageCache();
});

describe('Environment Asset Package — per-variant canonical model', () => {
  it('defines exactly six architectural variant IDs', () => {
    expect(ENVIRONMENT_VARIANT_IDS).toHaveLength(6);
  });

  it('builds one package per variant with unique packageId', () => {
    const light = buildTestPackage('light-01');
    const dark = buildTestPackage('dark-01');
    expect(light.schemaVersion).toBe(ENVIRONMENT_PACKAGE_SCHEMA_VERSION);
    expect(light.packageId).not.toBe(dark.packageId);
    expect(light.variantId).toBe('light-01');
    expect(dark.variantId).toBe('dark-01');
  });

  it('builds stable package IDs from department, environment, variant, revision', () => {
    expect(buildVariantPackageId({
      departmentId: 'experience-lab',
      environmentId: 'reception',
      variantId: 'light-02',
      revision: 1,
    })).toBe('envpkg.experience-lab.reception.light-02.r1');
  });

  it('output registry includes desktop, mobile, blueprint, and future outputs', () => {
    const registry = buildEmptyOutputRegistry();
    expect(registry.desktop).toBeDefined();
    expect(registry.mobile).toBeDefined();
    expect(registry.futureVR).toBeDefined();
    expect(countOutputRegistry(registry).pending).toBeGreaterThan(10);
  });
});

describe('Environment Asset Package — cache and repository', () => {
  it('builds cache keys including department bible version', () => {
    const key = buildEnvironmentPackageCacheKey({
      departmentId: 'experience-lab',
      environmentId: 'reception',
      variantId: 'light-01',
      revision: 1,
      promptHash: 'v1',
      seed: '42811',
      provider: 'fal',
      departmentBibleVersion: 'bible-v1',
    });
    expect(key).toContain('light-01');
    expect(key).toContain('bible-v1');
  });

  it('reuses package when cache key matches', () => {
    const pkg = buildTestPackage();
    const lookup = {
      departmentId: 'experience-lab' as const,
      environmentId: 'reception',
      variantId: 'light-01' as const,
      revision: 1,
      promptHash: 'elab-light-01-v1',
      seed: '42811',
      provider: 'preview-cache',
      departmentBibleVersion: 'bible-v1',
    };
    expect(assertPackageReusePolicy(pkg, lookup)).toBe('reuse');
  });

  it('repository stores and retrieves by packageId', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    expect(getEnvironmentPackage(pkg.packageId)?.variantId).toBe('light-01');
  });
});

describe('Environment Asset Package — service, queue, health', () => {
  it('resolves viewport URLs from package outputs', () => {
    const pkg = buildTestPackage('light-01');
    const mobile = resolveActiveEnvironmentUrl(pkg, true);
    const desktop = resolveActiveEnvironmentUrl(pkg, false);
    expect(mobile).toBe(PREVIEW);
    expect(desktop).toBe(DESKTOP);
  });

  it('builds drawer model with package metadata', () => {
    const pkg = buildTestPackage();
    const drawer = buildPackageDrawerModel(pkg);
    expect(drawer.packageId).toBe(pkg.packageId);
    expect(drawer.outputsGenerated).toBeGreaterThan(0);
    expect(drawer.overallHealthPercent).toBeGreaterThanOrEqual(0);
  });

  it('generation queue tracks desktop, mobile, blueprint, materials', () => {
    const pkg = buildTestPackage();
    const queue = buildEnvironmentPackageGenerationQueue(pkg);
    expect(queue.map((q) => q.kind)).toContain('desktop');
    expect(queue.map((q) => q.kind)).toContain('materials');
    expect(countQueueProgress(queue).total).toBe(8);
  });

  it('computes package health percentages', () => {
    const pkg = buildTestPackage();
    const health = computeEnvironmentPackageHealth(pkg);
    expect(health.generationPercent).toBeGreaterThan(0);
    expect(health.overallHealth).toBeGreaterThanOrEqual(0);
  });

  it('promotes package on founder approval', () => {
    const pkg = buildTestPackage();
    const promoted = promoteEnvironmentPackage(pkg);
    expect(promoted.canonical).toBe(true);
    expect(promoted.status).toBe('production-ready');
  });

  it('generation service starts concept preview and production on approval', () => {
    const pkg = buildTestPackage();
    const preview = startConceptPreviewGeneration(pkg);
    expect(preview.queue.length).toBe(8);
    const production = approveAndGenerateProductionPackage(pkg);
    expect(production.package.status).toBe('production-ready');
  });
});

describe('Environment Asset Package — consumers', () => {
  it('CDS binds to packageId — not loose image URLs', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const binding = resolveCdsEnvironmentBinding({ packageId: pkg.packageId });
    expect(binding?.packageId).toBe(pkg.packageId);
    expect(binding?.referenceOnly).toBe(true);
  });

  it('Asset Manufacturing blueprint generator references package', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const source = blueprintGeneratorSource({ packageId: pkg.packageId });
    expect(source?.packageId).toBe(pkg.packageId);
    expect(source?.assetKind).toBe('blueprint');
  });

  it('Marketplace references package not image', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const listing = resolveMarketplaceListingFromPackage(pkg.packageId, 'Reception Pack');
    expect(listing?.packageId).toBe(pkg.packageId);
  });

  it('feature flags default ON', () => {
    const flags = resolveEnvironmentPackageFeatureFlags();
    expect(flags.enableEnvironmentPackages).toBe(true);
    expect(flags.enablePackageGeneration).toBe(true);
    expect(flags.enablePackageCache).toBe(true);
  });

  it('ensureVariantEnvironmentPackage is idempotent', () => {
    const first = ensureVariantEnvironmentPackage({
      departmentId: 'experience-lab',
      environmentId: 'reception',
      variantId: 'light-03',
      variantName: 'Light 03',
      theme: 'light',
      promptHash: 'elab-light-03-v1',
      promptVersion: 'elab-light-03-v1',
      seed: '42813',
      previewUrl: PREVIEW,
    });
    const second = ensureVariantEnvironmentPackage({
      departmentId: 'experience-lab',
      environmentId: 'reception',
      variantId: 'light-03',
      variantName: 'Light 03',
      theme: 'light',
      promptHash: 'elab-light-03-v1',
      promptVersion: 'elab-light-03-v1',
      seed: '42813',
    });
    expect(second.packageId).toBe(first.packageId);
  });
});
