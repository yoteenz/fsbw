import type {
  EnvironmentAssetPackage,
  EnvironmentPackageDrawerModel,
  EnvironmentVariantId,
} from './EnvironmentAssetPackage';
import {
  buildVariantEnvironmentPackage,
  buildVariantPackageId,
} from './EnvironmentAssetPackage';
import {
  getEnvironmentPackage,
  getEnvironmentPackageForVariant,
  registerEnvironmentPackage,
} from './EnvironmentPackageRepository';
import { resolveEnvironmentPackageFeatureFlags } from './environment-package-feature-flags';
import {
  assertPackageReusePolicy,
  resolveOrCachePackage,
} from './EnvironmentPackageCache';
import { computeEnvironmentPackageHealth } from './EnvironmentPackageStatus';
import {
  countOutputRegistry,
  resolveOutputUrl,
  resolveViewportOutputUrl,
} from './EnvironmentPackageOutputs';
import { buildEnvironmentPackageGenerationQueue } from './EnvironmentPackageGenerationQueue';
import { getProductionReadinessForPackage } from './ProductionReadinessRepository';

export function resolveActiveEnvironmentUrl(
  pkg: EnvironmentAssetPackage,
  preferMobile: boolean
): string | null {
  return resolveViewportOutputUrl(pkg.outputs, preferMobile);
}

export function buildPackageDrawerModel(pkg: EnvironmentAssetPackage): EnvironmentPackageDrawerModel {
  const counts = countOutputRegistry(pkg.outputs);
  const health = computeEnvironmentPackageHealth(pkg);
  const readiness = getProductionReadinessForPackage(pkg.packageId);
  const failedCount = Object.values(pkg.outputs).filter((o) => o?.status === 'failed').length;
  const lifecycleState = readiness?.lifecycleState ?? (pkg.status === 'generating' ? 'generating' : 'preview-ready');
  const readinessPercent = readiness?.readinessPercent ?? health.readinessPercent;
  const canApprove = !readiness?.founderApproved && readinessPercent >= 80 && pkg.status !== 'generating';
  const canPromote =
    (lifecycleState === 'awaiting-founder-approval' || lifecycleState === 'production-complete')
    && !pkg.canonical
    && counts.generated >= 3;

  return {
    packageId: pkg.packageId,
    environmentName: `${pkg.environmentId} — ${pkg.variantName}`,
    variantName: pkg.variantName,
    variantId: pkg.variantId,
    packageStatus: pkg.status,
    revision: pkg.revision,
    desktopPreviewUrl: resolveOutputUrl(pkg.outputs, 'desktop'),
    mobilePreviewUrl: resolveOutputUrl(pkg.outputs, 'mobile'),
    tabletPreviewUrl: resolveOutputUrl(pkg.outputs, 'tablet'),
    outputsGenerated: counts.generated,
    outputsPending: counts.pending,
    outputsFailed: failedCount,
    assetCount: counts.generated,
    generationCostUsd: pkg.estimatedCostUsd,
    actualCostUsd: pkg.actualCostUsd,
    estimatedCostUsd: readiness?.generationEstimate.estimatedDollarsUsd ?? pkg.estimatedCostUsd,
    provider: pkg.provider,
    seed: pkg.seed,
    promptVersion: pkg.promptVersion,
    blueprintReady: resolveOutputUrl(pkg.outputs, 'blueprint') !== null,
    constructionReady: resolveOutputUrl(pkg.outputs, 'constructionPlan') !== null,
    lightingReady: resolveOutputUrl(pkg.outputs, 'lightingProfile') !== null,
    materialReady: resolveOutputUrl(pkg.outputs, 'materialsProfile') !== null,
    marketplaceReady: pkg.marketplaceReady,
    overallHealthPercent: health.overallHealth,
    readinessPercent,
    readinessBlockers: readiness?.blockers ?? [],
    generationProgress: health.generationPercent,
    lifecycleState,
    canonical: pkg.canonical,
    canApproveForProduction: canApprove,
    canPromoteToCanonical: canPromote && !pkg.canonical,
  };
}

export function promoteEnvironmentPackage(
  pkg: EnvironmentAssetPackage,
  approvedBy = 'founder'
): EnvironmentAssetPackage {
  const now = new Date().toISOString();
  return {
    ...pkg,
    canonical: true,
    status: 'production-ready',
    stage: 'production-package',
    approvedAt: now,
    approvedBy,
    updatedAt: now,
    revisionHistory: [
      ...pkg.revisionHistory,
      {
        revision: pkg.revision,
        status: 'production-ready',
        changedAt: now,
        reason: 'founder-approved-variant',
      },
    ],
  };
}

export type EnsureVariantPackageInput = {
  departmentId: 'experience-lab';
  environmentId: string;
  variantId: EnvironmentVariantId;
  variantName: string;
  theme: 'light' | 'dark';
  promptHash: string;
  promptVersion: string;
  seed: string;
  estimatedCostUsd?: number;
  previewUrl?: string | null;
  desktopPreviewUrl?: string | null;
  status?: EnvironmentAssetPackage['status'];
  canonical?: boolean;
};

export function ensureVariantEnvironmentPackage(input: EnsureVariantPackageInput): EnvironmentAssetPackage {
  const flags = resolveEnvironmentPackageFeatureFlags();
  const existing = getEnvironmentPackageForVariant(
    input.departmentId,
    input.environmentId,
    input.variantId
  );
  if (existing) return existing;

  const lookup = {
    departmentId: input.departmentId,
    environmentId: input.environmentId,
    variantId: input.variantId,
    revision: 1,
    promptHash: input.promptHash,
    seed: input.seed,
    provider: 'preview-cache',
    departmentBibleVersion: 'bible-v1',
  };

  if (flags.enablePackageCache && existing) {
    const policy = assertPackageReusePolicy(existing, lookup);
    if (policy === 'reuse') return existing;
  }

  const factory = () =>
    buildVariantEnvironmentPackage({
      departmentId: input.departmentId,
      environmentId: input.environmentId,
      variantId: input.variantId,
      variantName: input.variantName,
      theme: input.theme,
      promptHash: input.promptHash,
      promptVersion: input.promptVersion,
      seed: input.seed,
      estimatedCostUsd: input.estimatedCostUsd,
      previewUrl: input.previewUrl,
      desktopPreviewUrl: input.desktopPreviewUrl,
      status: input.status,
      canonical: input.canonical,
    });

  const pkg = flags.enablePackageCache
    ? resolveOrCachePackage(lookup, factory)
    : factory();

  registerEnvironmentPackage(pkg);
  return pkg;
}

export function resolvePackageIdForVariant(
  departmentId: string,
  environmentId: string,
  variantId: EnvironmentVariantId,
  revision = 1
): string {
  return buildVariantPackageId({ departmentId, environmentId, variantId, revision });
}

export function getPackageGenerationQueue(pkg: EnvironmentAssetPackage) {
  return buildEnvironmentPackageGenerationQueue(pkg);
}

export function getPackageByIdOrVariant(
  packageId: string | null | undefined,
  departmentId: string,
  environmentId: string,
  variantId: EnvironmentVariantId
): EnvironmentAssetPackage | null {
  if (packageId) {
    const byId = getEnvironmentPackage(packageId);
    if (byId) return byId;
  }
  return getEnvironmentPackageForVariant(departmentId, environmentId, variantId);
}
