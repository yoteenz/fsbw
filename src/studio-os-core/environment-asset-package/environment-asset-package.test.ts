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
import { resetProductionReadinessRepository } from './ProductionReadinessRepository';
import {
  buildEnvironmentPackageGenerationQueue,
  countQueueProgress,
} from './EnvironmentPackageGenerationQueue';
import { computeEnvironmentPackageHealth } from './EnvironmentPackageStatus';
import { resolveEnvironmentPackageFeatureFlags } from './environment-package-feature-flags';
import {
  approveAndGenerateProductionPackage,
  startConceptPreviewGeneration,
  submitPackageToGenerationQueue,
} from './EnvironmentPackageGenerationService';
import { resolveCdsEnvironmentBinding, resolveCdsPackageAccess } from './cds-consumer';
import { blueprintGeneratorSource, assertAssetManufacturingAccess } from './asset-manufacturing-consumer';
import { resolveMarketplaceListingFromPackage, assertMarketplacePackageAccess } from './marketplace-consumer';
import {
  approvePackageForProduction,
  assertPackageCanEnterGenerationQueue,
  calculateGenerationEstimate,
  createProductionReadinessForPackage,
  validatePackageReadiness,
} from './ProductionReadinessService';
import { getProductionReadinessForPackage } from './ProductionReadinessRepository';

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
  resetProductionReadinessRepository();
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

  it('computes package health including readiness', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const health = computeEnvironmentPackageHealth(pkg);
    expect(health.readinessPercent).toBeGreaterThanOrEqual(0);
    expect(health.generationPercent).toBeGreaterThan(0);
    expect(health.overallHealth).toBeGreaterThanOrEqual(0);
  });

  it('promotes package on founder approval', () => {
    const pkg = buildTestPackage();
    const promoted = promoteEnvironmentPackage(pkg);
    expect(promoted.canonical).toBe(true);
    expect(promoted.status).toBe('production-ready');
  });

  it('generation service blocks automatic production without explicit approval', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const preview = startConceptPreviewGeneration(pkg);
    expect(preview.gateBlocked).toBe(true);
    const gate = assertPackageCanEnterGenerationQueue(pkg);
    expect(gate.ok).toBe(false);
    expect(submitPackageToGenerationQueue(pkg)).toBeNull();
  });

  it('generation service allows production after founder gate approval', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const production = approveAndGenerateProductionPackage(pkg, 'founder');
    expect(production.gateBlocked).toBeFalsy();
    const flags = resolveEnvironmentPackageFeatureFlags();
    if (flags.enablePackageGeneration) {
      expect(production.package.status).toBe('generating');
    } else {
      expect(production.package.status).toBe('production-ready');
      expect(production.cached).toBe(true);
    }
  });
});

describe('Production Readiness Gate', () => {
  it('every package owns one readiness record on register', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const record = getProductionReadinessForPackage(pkg.packageId);
    expect(record).not.toBeNull();
    expect(record?.packageId).toBe(pkg.packageId);
    expect(record?.readinessId).toBe(`readiness.${pkg.packageId}`);
  });

  it('calculates readiness score and detects blockers', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const evaluation = validatePackageReadiness(pkg);
    expect(evaluation.readinessPercent).toBeGreaterThan(0);
    expect(evaluation.readinessPercent).toBeLessThan(100);
    expect(evaluation.canGenerate).toBe(false);
  });

  it('calculates generation cost estimate before spending', () => {
    const pkg = buildTestPackage();
    const estimate = calculateGenerationEstimate(pkg);
    expect(estimate.estimatedCredits).toBeGreaterThan(0);
    expect(estimate.estimatedDollarsUsd).toBeGreaterThan(0);
    expect(estimate.estimatedRuntimeMs).toBeGreaterThan(0);
    expect(estimate.lineItems.length).toBeGreaterThan(8);
  });

  it('prevents generation below 100% readiness without approval', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const gate = assertPackageCanEnterGenerationQueue(pkg);
    expect(gate.ok).toBe(false);
    expect(gate.code).toBe('FOUNDER_APPROVAL_REQUIRED');
  });

  it('allows generation at 100% readiness with founder approval', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const approval = approvePackageForProduction(pkg, 'founder');
    expect(approval.ok).toBe(true);
    expect(approval.record?.readinessPercent).toBe(100);
    const gate = assertPackageCanEnterGenerationQueue(pkg);
    expect(gate.ok).toBe(true);
    expect(approval.record?.authorizedQueueEntry?.packageId).toBe(pkg.packageId);
  });

  it('writes audit history on create and approval', () => {
    const pkg = buildTestPackage();
    const record = createProductionReadinessForPackage(pkg);
    expect(record.auditLog.some((e) => e.eventType === 'created')).toBe(true);
    registerEnvironmentPackage(pkg);
    const approval = approvePackageForProduction(pkg, 'founder');
    expect(approval.record?.auditLog.some((e) => e.eventType === 'approved')).toBe(true);
    expect(approval.record?.auditLog.some((e) => e.eventType === 'queue-authorized')).toBe(true);
  });
});

describe('Environment Asset Package — consumers', () => {
  it('CDS blocks packages not production ready', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    const blocked = resolveCdsPackageAccess({ packageId: pkg.packageId });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.message).toBe('Awaiting Production Approval');
    }
    expect(resolveCdsEnvironmentBinding({ packageId: pkg.packageId })).toBeNull();
  });

  it('CDS binds after production readiness gate passes', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    approvePackageForProduction(pkg, 'founder');
    const access = resolveCdsPackageAccess({ packageId: pkg.packageId });
    expect(access.ok).toBe(true);
    if (access.ok) {
      expect(access.binding.packageId).toBe(pkg.packageId);
      expect(access.binding.referenceOnly).toBe(true);
    }
  });

  it('Asset Manufacturing blocks incomplete packages', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    expect(blueprintGeneratorSource({ packageId: pkg.packageId })).toBeNull();
    const blocked = assertAssetManufacturingAccess({ packageId: pkg.packageId, assetKind: 'blueprint' });
    expect(blocked.ok).toBe(false);
  });

  it('Asset Manufacturing executes after production ready', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    approvePackageForProduction(pkg, 'founder');
    const access = assertAssetManufacturingAccess({ packageId: pkg.packageId, assetKind: 'blueprint' });
    expect(access.ok).toBe(true);
    if (access.ok) {
      expect(access.source.packageId).toBe(pkg.packageId);
    }
  });

  it('Marketplace blocks incomplete packages', () => {
    const pkg = buildTestPackage();
    registerEnvironmentPackage(pkg);
    expect(resolveMarketplaceListingFromPackage(pkg.packageId, 'Reception Pack')).toBeNull();
    const blocked = assertMarketplacePackageAccess(pkg.packageId);
    expect(blocked.ok).toBe(false);
  });

  it('feature flags default ON for packages and cache; generation gated OFF until verified', () => {
    const flags = resolveEnvironmentPackageFeatureFlags();
    expect(flags.enableEnvironmentPackages).toBe(true);
    expect(flags.enablePackageCache).toBe(true);
    expect(flags.enablePackagePersistence).toBe(true);
    expect(flags.enablePackageProductionGeneration).toBe(false);
    expect(flags.enablePackageCanonicalPromotion).toBe(false);
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
