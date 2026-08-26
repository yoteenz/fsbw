import type { ExperienceCaptureScope, ExperiencePageRecord, MaterialScreenRecord, ProjectCurationState } from './types';
import { captureAllRequiresLockedCuration } from './experience-curation/curation-plans';

/** P0.VR.3G/3I — Screenshot backfill scope lock for P0.VR.3E (uses curated active set) */
export function buildExperienceCaptureScope(
  projectId: string,
  pages: ExperiencePageRecord[],
  materialScreens: MaterialScreenRecord[],
  curation?: ProjectCurationState,
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
    requiresLockedCuration: curation ? captureAllRequiresLockedCuration(curation) === false : true,
  };
}

export function listCaptureAllTargets(scope: ExperienceCaptureScope): string[] {
  return [...scope.experiencePageIds, ...scope.materialScreenIds];
}

export function isDesignScreenCaptureScope(_scope: ExperienceCaptureScope): boolean {
  return false;
}
