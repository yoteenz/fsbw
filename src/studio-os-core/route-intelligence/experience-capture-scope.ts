import type { ExperienceCaptureScope, ExperiencePageRecord, MaterialScreenRecord } from './types';

/** P0.VR.3G — Screenshot backfill scope lock for P0.VR.3E */
export function buildExperienceCaptureScope(
  projectId: string,
  pages: ExperiencePageRecord[],
  materialScreens: MaterialScreenRecord[],
): ExperienceCaptureScope {
  const primaryPages = pages.filter((p) => p.founderPrimary && p.captureEligible);
  const captureMaterial = materialScreens.filter((m) => m.captureEligible);

  return {
    projectId,
    experiencePageIds: primaryPages.map((p) => p.experiencePageId),
    materialScreenIds: captureMaterial.map((m) => m.materialScreenId),
    instancesExcludedByDefault: true,
    statesExcludedByDefault: true,
    advancedActions: ['CAPTURE_ALL_INSTANCES', 'CAPTURE_ALL_STATES', 'CAPTURE_RAW_DESIGN_SCREENS'],
  };
}

export function listCaptureAllTargets(scope: ExperienceCaptureScope): string[] {
  return [...scope.experiencePageIds, ...scope.materialScreenIds];
}

export function isDesignScreenCaptureScope(_scope: ExperienceCaptureScope): boolean {
  return false;
}
