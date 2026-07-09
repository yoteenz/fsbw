import { getStudioBootstrapReport, runStudioBootstrap, STUDIO_DEFAULT_FALLBACK_CONTRACT } from '../bootstrap';
import type { StudioBootReport } from '../bootstrap';
import type { XerRuntimeBootReport } from '../genesis/experience-runtime/runtime-boot/runtime-boot-validator';

export type ResolvedRuntimeContract = {
  brandId: string;
  departmentId: string;
  sceneId: string;
  templateId: string;
  platformDnaVersion: string;
  brandDnaVersion: string;
  departmentDnaVersion: string;
  sceneDnaVersion: string;
  stateDnaVersion: string;
  designDnaVersion: string;
  motionDnaId: string;
};

export type RuntimeReadinessSnapshot = {
  bootReady: boolean;
  bootReport: StudioBootReport | null;
  runtimeReport: XerRuntimeBootReport | null;
  contract: ResolvedRuntimeContract;
  missingDependencies: string[];
  fallbacksUsed: string[];
  errors: string[];
  warnings: string[];
};

/** RuntimeReadinessEngine™ — resolves whether Experience Runtime may assemble. */
export class RuntimeReadinessEngine {
  async ensureReady(force = false): Promise<RuntimeReadinessSnapshot> {
    const bootReport = await runStudioBootstrap({
      through: 'experience-runtime',
      force,
    });

    let runtimeReport: XerRuntimeBootReport | null = null;
    try {
      const validator = await import('../genesis/experience-runtime/runtime-boot/runtime-boot-validator');
      runtimeReport = validator.validateRuntimeBoot();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      bootReport.errors.push(msg);
    }

    const missingDependencies = bootReport.modules
      .filter((m) => m.required && m.status !== 'ready' && m.status !== 'fallback')
      .map((m) => m.id);

    const resolved = runtimeReport?.resolved;
    const contract: ResolvedRuntimeContract = {
      brandId: resolved?.brandId ?? STUDIO_DEFAULT_FALLBACK_CONTRACT.brandId,
      departmentId: resolved?.departmentId ?? STUDIO_DEFAULT_FALLBACK_CONTRACT.departmentId,
      sceneId: resolved?.sceneId ?? STUDIO_DEFAULT_FALLBACK_CONTRACT.sceneId,
      templateId: resolved?.templateId ?? STUDIO_DEFAULT_FALLBACK_CONTRACT.templateId,
      stateDnaVersion:
        runtimeReport?.resolvedVersions.stateDna ?? STUDIO_DEFAULT_FALLBACK_CONTRACT.stateDnaVersion,
      platformDnaVersion:
        runtimeReport?.resolvedVersions.platformDna ?? STUDIO_DEFAULT_FALLBACK_CONTRACT.platformDnaVersion,
      brandDnaVersion: STUDIO_DEFAULT_FALLBACK_CONTRACT.brandDnaVersion,
      departmentDnaVersion: STUDIO_DEFAULT_FALLBACK_CONTRACT.departmentDnaVersion,
      sceneDnaVersion: STUDIO_DEFAULT_FALLBACK_CONTRACT.sceneDnaVersion,
      designDnaVersion: STUDIO_DEFAULT_FALLBACK_CONTRACT.designDnaVersion,
      motionDnaId: STUDIO_DEFAULT_FALLBACK_CONTRACT.motionDnaId,
    };

    return {
      bootReady: bootReport.ready && missingDependencies.length === 0,
      bootReport,
      runtimeReport,
      contract,
      missingDependencies,
      fallbacksUsed: [
        ...bootReport.fallbacksUsed,
        ...(runtimeReport?.fallbacksUsed ?? []),
      ],
      errors: [...bootReport.errors, ...(runtimeReport ? [] : ['Runtime validator unavailable'])],
      warnings: [...bootReport.warnings, ...(runtimeReport?.warnings ?? [])],
    };
  }

  getCachedSnapshot(): RuntimeReadinessSnapshot | null {
    const bootReport = getStudioBootstrapReport();
    if (!bootReport) return null;
    return {
      bootReady: bootReport.ready,
      bootReport,
      runtimeReport: null,
      contract: { ...STUDIO_DEFAULT_FALLBACK_CONTRACT },
      missingDependencies: bootReport.modules
        .filter((m) => m.required && m.status !== 'ready' && m.status !== 'fallback')
        .map((m) => m.id),
      fallbacksUsed: bootReport.fallbacksUsed,
      errors: bootReport.errors,
      warnings: bootReport.warnings,
    };
  }
}

export const runtimeReadinessEngine = new RuntimeReadinessEngine();
