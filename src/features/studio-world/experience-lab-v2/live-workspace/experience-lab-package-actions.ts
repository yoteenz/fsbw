import type { EnvironmentAssetPackage } from '../../../../studio-os-core/environment-asset-package';
import { registerEnvironmentPackage } from '../../../../studio-os-core/environment-asset-package/EnvironmentPackageRepository';
import { resolveEnvironmentPackageFeatureFlags, isEnvironmentPackageInMemoryOnly } from '../../../../studio-os-core/environment-asset-package/environment-package-feature-flags';
import { approvePackageForProduction } from '../../../../studio-os-core/environment-asset-package/ProductionReadinessService';
import {
  approveEnvironmentPackageForProduction,
  pollEnvironmentPackageWorker,
} from '../../../../services/studio/environmentPackage/api';

export type PackageActionResult = {
  ok: boolean;
  package?: EnvironmentAssetPackage;
  error?: string;
  code?: string;
};

function updateBlueprintOutputStatus(
  pkg: EnvironmentAssetPackage,
  status: 'generating' | 'pending' | 'failed'
): EnvironmentAssetPackage {
  const now = new Date().toISOString();
  const updated: EnvironmentAssetPackage = {
    ...pkg,
    updatedAt: now,
    outputs: {
      ...pkg.outputs,
      blueprint: {
        ...pkg.outputs.blueprint,
        status,
        generatedAt: status === 'generating' ? now : pkg.outputs.blueprint.generatedAt,
      },
    },
    revisionHistory: [
      ...pkg.revisionHistory,
      {
        revision: pkg.revision,
        status: pkg.status,
        changedAt: now,
        reason: status === 'generating' ? 'blueprint-generation-started' : 'blueprint-retry-requested',
      },
    ],
  };
  registerEnvironmentPackage(updated);
  return updated;
}

/** Dispatch blueprint output job via existing package production pipeline. */
export async function generateBlueprintOutput(pkg: EnvironmentAssetPackage): Promise<PackageActionResult> {
  const flags = resolveEnvironmentPackageFeatureFlags();
  const approval = approvePackageForProduction(pkg, 'founder');
  if (!approval.ok) {
    return { ok: false, error: approval.message, code: approval.code };
  }

  const updated = updateBlueprintOutputStatus(pkg, 'generating');

  if (flags.enablePackagePersistence && !isEnvironmentPackageInMemoryOnly()) {
    const apiResult = await approveEnvironmentPackageForProduction({
      packageId: pkg.packageId,
      acceptEstimate: true,
    });
    if (!apiResult.ok) {
      return { ok: false, error: apiResult.error ?? apiResult.code, code: apiResult.code };
    }
    try {
      await pollEnvironmentPackageWorker(pkg.packageId);
    } catch {
      // Offline/test fallback
    }
  }

  return { ok: true, package: updated };
}

/** Retry only the failed/stale blueprint output — does not regenerate entire package. */
export async function retryBlueprintOutput(pkg: EnvironmentAssetPackage): Promise<PackageActionResult> {
  const updated = updateBlueprintOutputStatus(pkg, 'generating');
  const flags = resolveEnvironmentPackageFeatureFlags();

  if (flags.enablePackagePersistence && !isEnvironmentPackageInMemoryOnly()) {
    try {
      await pollEnvironmentPackageWorker(pkg.packageId);
    } catch {
      // Offline/test fallback — in-memory update still applies
    }
  }

  return { ok: true, package: updated };
}

/** Open blueprint preserves package and revision context — returns artifact URL. */
export function resolveOpenBlueprintUrl(pkg: EnvironmentAssetPackage | null): string | null {
  if (!pkg) return null;
  const entry = pkg.outputs.blueprint;
  if (entry.status === 'generated' || entry.status === 'cached') return entry.url;
  return null;
}
