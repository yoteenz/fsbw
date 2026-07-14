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
import {
  approvePackageForProduction,
  assertPackageCanEnterGenerationQueue,
  ensureProductionReadinessForPackage,
} from './ProductionReadinessService';
import { appendPackageAuditEntry, saveProductionReadiness } from './ProductionReadinessRepository';

export type PackageGenerationResult = {
  package: EnvironmentAssetPackage;
  queue: EnvironmentPackageGenerationQueueItem[];
  progressPercent: number;
  cached: boolean;
  gateBlocked?: boolean;
  gateCode?: string;
  gateMessage?: string;
};

/** Stage 1 — concept preview only. Never enters production queue without gate. */
export function startConceptPreviewGeneration(
  pkg: EnvironmentAssetPackage
): PackageGenerationResult {
  ensureProductionReadinessForPackage(pkg);
  const flags = resolveEnvironmentPackageFeatureFlags();
  const queue = buildEnvironmentPackageGenerationQueue(pkg);
  const progress = countQueueProgress(queue);
  return {
    package: pkg,
    queue,
    progressPercent: progress.percent,
    cached: !flags.enablePackageGeneration,
    gateBlocked: true,
    gateCode: 'PREVIEW_ONLY',
    gateMessage: 'Concept preview — production queue requires founder approval',
  };
}

/**
 * Founder approval triggers production generation.
 * Gate validates → blockers checked → readiness 100% → queue begins.
 */
export function approveAndGenerateProductionPackage(
  pkg: EnvironmentAssetPackage,
  approvedBy = 'founder'
): PackageGenerationResult {
  const flags = resolveEnvironmentPackageFeatureFlags();
  const approval = approvePackageForProduction(pkg, approvedBy);

  if (!approval.ok || !approval.record) {
    const queue = buildEnvironmentPackageGenerationQueue(pkg);
    return {
      package: pkg,
      queue,
      progressPercent: countQueueProgress(queue).percent,
      cached: true,
      gateBlocked: true,
      gateCode: approval.code,
      gateMessage: approval.message,
    };
  }

  const gateCheck = assertPackageCanEnterGenerationQueue(pkg);
  if (!gateCheck.ok) {
    const queue = buildEnvironmentPackageGenerationQueue(pkg);
    return {
      package: pkg,
      queue,
      progressPercent: countQueueProgress(queue).percent,
      cached: true,
      gateBlocked: true,
      gateCode: gateCheck.code,
      gateMessage: gateCheck.message,
    };
  }

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

  const now = new Date().toISOString();
  promoted = {
    ...promoted,
    status: 'generating',
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

  let readiness = approval.record;
  readiness = {
    ...readiness,
    lifecycleState: 'generating',
    updatedAt: now,
  };
  readiness = appendPackageAuditEntry(readiness, {
    eventType: 'generated',
    actor: approvedBy,
    detail: 'Production generation queue started',
    occurredAt: now,
    revision: pkg.revision,
  });
  saveProductionReadiness(readiness);

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

/** Attempt queue entry — returns null if gate blocks. */
export function submitPackageToGenerationQueue(
  pkg: EnvironmentAssetPackage
): PackageGenerationResult | null {
  const gate = assertPackageCanEnterGenerationQueue(pkg);
  if (!gate.ok) return null;
  return approveAndGenerateProductionPackage(pkg, pkg.approvedBy ?? 'founder');
}
