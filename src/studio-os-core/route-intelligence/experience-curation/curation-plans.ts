import type {
  DesignReferenceGenerationPlan,
  ExperiencePageRecord,
  ImplementationSnapshotCapturePlan,
  MaterialScreenRecord,
  ProjectCurationState,
  ViewportClass,
} from '../types';

const DEFAULT_VIEWPORTS: ViewportClass[] = ['MOBILE', 'TABLET', 'DESKTOP'];

export function buildImplementationSnapshotCapturePlan(
  projectId: string,
  curation: ProjectCurationState,
  activePages: ExperiencePageRecord[],
  materialScreens: MaterialScreenRecord[],
): ImplementationSnapshotCapturePlan {
  const primary = activePages.filter((p) => p.founderPrimary && p.captureEligible);
  const captureMaterial = materialScreens.filter((m) => m.captureEligible);
  const representativeRoutes: Record<string, string> = {};
  const authContexts: Record<string, string> = {};

  for (const p of primary) {
    representativeRoutes[p.experiencePageId] = p.representativeRoute;
    authContexts[p.experiencePageId] = p.authContext ?? 'anonymous';
  }
  for (const m of captureMaterial) {
    representativeRoutes[m.materialScreenId] = m.representativeRoute;
  }

  return {
    projectId,
    curationVersion: curation.curationVersion,
    experiencePageIds: primary.map((p) => p.experiencePageId),
    materialScreenIds: captureMaterial.map((m) => m.materialScreenId),
    viewports: DEFAULT_VIEWPORTS,
    representativeRoutes,
    authContexts,
    estimatedCaptureCount: (primary.length + captureMaterial.length) * DEFAULT_VIEWPORTS.length,
    requiresLockedCuration: true,
  };
}

export function buildDesignReferenceGenerationPlan(
  projectId: string,
  curation: ProjectCurationState,
  activePages: ExperiencePageRecord[],
  materialScreens: MaterialScreenRecord[],
): DesignReferenceGenerationPlan {
  const primary = activePages.filter((p) => p.founderPrimary);
  const unique = primary.filter((p) => p.referencePolicy === 'UNIQUE_REFERENCE_REQUIRED').length;
  const familyInherited = primary.filter((p) => p.referencePolicy === 'SHARED_FAMILY_REFERENCE').length;
  const assetOnly = primary.filter((p) => p.referencePolicy === 'ASSET_ONLY_VARIANT').length;
  const stateDerived = primary.filter((p) => p.referencePolicy === 'STATE_DERIVED').length;

  return {
    projectId,
    curationVersion: curation.curationVersion,
    uniqueReferenceRequirements: unique + materialScreens.filter((m) => m.captureEligible).length,
    familyInherited,
    assetOnly,
    stateDerived,
    experiencePageIds: primary.map((p) => p.experiencePageId),
    materialScreenIds: materialScreens.filter((m) => m.captureEligible).map((m) => m.materialScreenId),
  };
}

export function captureAllRequiresLockedCuration(curation: ProjectCurationState): boolean {
  return curation.universeStatus === 'LOCKED_FOR_CAPTURE' || curation.lockedForCapture;
}
