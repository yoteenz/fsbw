import type { EnvironmentAssetPackage } from './EnvironmentAssetPackage';
import { promoteEnvironmentPackage } from './EnvironmentPackageService';
import { registerEnvironmentPackage } from './EnvironmentPackageRepository';
import { resolveEnvironmentPackageFeatureFlags } from './environment-package-feature-flags';
import {
  buildEnvironmentPackageGenerationQueue,
  countQueueProgress,
  type EnvironmentPackageGenerationQueueItem,
} from './EnvironmentPackageGenerationQueue';
import { setOutputCached } from './EnvironmentPackageOutputs';

export type PackageGenerationResult = {
  package: EnvironmentAssetPackage;
  queue: EnvironmentPackageGenerationQueueItem[];
  progressPercent: number;
  cached: boolean;
};

/** Stage 1 — concept preview only. Stage 2 — production outputs on founder approval. */
export function startConceptPreviewGeneration(
  pkg: EnvironmentAssetPackage
): PackageGenerationResult {
  const flags = resolveEnvironmentPackageFeatureFlags();
  if (!flags.enablePackageGeneration) {
    return {
      package: pkg,
      queue: buildEnvironmentPackageGenerationQueue(pkg),
      progressPercent: 0,
      cached: true,
    };
  }

  const queue = buildEnvironmentPackageGenerationQueue(pkg);
  const progress = countQueueProgress(queue);
  return { package: pkg, queue, progressPercent: progress.percent, cached: false };
}

/** Founder approval triggers production package generation for ONE variant only. */
export function approveAndGenerateProductionPackage(
  pkg: EnvironmentAssetPackage,
  approvedBy = 'founder'
): PackageGenerationResult {
  const flags = resolveEnvironmentPackageFeatureFlags();
  let promoted = promoteEnvironmentPackage(pkg, approvedBy);

  if (!flags.enablePackageGeneration) {
    registerEnvironmentPackage(promoted);
    const queue = buildEnvironmentPackageGenerationQueue(promoted);
    return {
      package: promoted,
      queue,
      progressPercent: countQueueProgress(queue).percent,
      cached: true,
    };
  }

  // Architecture hook — production outputs marked for generation (lazy in stage 1).
  const now = new Date().toISOString();
  promoted = {
    ...promoted,
    updatedAt: now,
    outputs: {
      ...promoted.outputs,
      blueprint: { ...promoted.outputs.blueprint, status: 'generating' },
      constructionPlan: { ...promoted.outputs.constructionPlan, status: 'generating' },
      lightingProfile: { ...promoted.outputs.lightingProfile, status: 'generating' },
      materialsProfile: { ...promoted.outputs.materialsProfile, status: 'generating' },
    },
  };

  registerEnvironmentPackage(promoted);
  const queue = buildEnvironmentPackageGenerationQueue(promoted);
  return {
    package: promoted,
    queue,
    progressPercent: countQueueProgress(queue).percent,
    cached: false,
  };
}

/** Theme switching — swap packages without regeneration when cache exists. */
export function swapThemePackage(
  existing: EnvironmentAssetPackage | null,
  next: EnvironmentAssetPackage
): EnvironmentAssetPackage {
  const flags = resolveEnvironmentPackageFeatureFlags();
  if (flags.enablePackageCache && existing?.cacheKey === next.cacheKey) {
    return existing;
  }
  registerEnvironmentPackage(next);
  return next;
}

export function seedPreviewOutputs(
  pkg: EnvironmentAssetPackage,
  mobileUrl: string,
  desktopUrl?: string | null
): EnvironmentAssetPackage {
  let outputs = pkg.outputs;
  outputs = setOutputCached(outputs, 'mobile', mobileUrl);
  outputs = setOutputCached(outputs, 'squareThumbnail', mobileUrl);
  outputs = setOutputCached(outputs, 'metadata', mobileUrl);
  if (desktopUrl) {
    outputs = setOutputCached(outputs, 'desktop', desktopUrl);
  }
  const updated = { ...pkg, outputs, updatedAt: new Date().toISOString() };
  registerEnvironmentPackage(updated);
  return updated;
}
