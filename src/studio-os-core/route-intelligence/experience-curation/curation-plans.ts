import type {
  DesignReferenceGenerationPlan,
  ExperiencePageRecord,
  MaterialScreenRecord,
  NormalizedCapturePlan,
  NormalizedReferencePlan,
  ProjectCurationState,
  ViewportClass,
} from '../types';
import { FSBW_OWNED_PROJECT_IDS } from '../constants';

const ALL_VIEWPORTS: ViewportClass[] = ['MOBILE', 'TABLET', 'DESKTOP'];

function viewportsForPage(page: ExperiencePageRecord): ViewportClass[] {
  const v: ViewportClass[] = [];
  if (page.viewportRequirements.mobile) v.push('MOBILE');
  if (page.viewportRequirements.tablet) v.push('TABLET');
  if (page.viewportRequirements.desktop) v.push('DESKTOP');
  return v.length ? v : ALL_VIEWPORTS;
}

function viewportsForMaterial(_m: MaterialScreenRecord): ViewportClass[] {
  return ALL_VIEWPORTS;
}

export function buildNormalizedCapturePlan(
  projectId: string,
  curation: ProjectCurationState,
  activePages: ExperiencePageRecord[],
  materialScreens: MaterialScreenRecord[],
): NormalizedCapturePlan {
  const primary = activePages.filter((p) => p.founderPrimary && p.captureEligible);
  const captureMaterial = materialScreens.filter((m) => m.captureEligible);
  const blockedTargets: string[] = [];

  let mobileTargets = 0;
  let tabletTargets = 0;
  let desktopTargets = 0;

  for (const p of primary) {
    const vps = viewportsForPage(p);
    if (p.implementationStatus === 'IMPLEMENTATION_MISSING') blockedTargets.push(p.experiencePageId);
    if (vps.includes('MOBILE')) mobileTargets += 1;
    if (vps.includes('TABLET')) tabletTargets += 1;
    if (vps.includes('DESKTOP')) desktopTargets += 1;
  }
  for (const m of captureMaterial) {
    const vps = viewportsForMaterial(m);
    if (vps.includes('MOBILE')) mobileTargets += 1;
    if (vps.includes('TABLET')) tabletTargets += 1;
    if (vps.includes('DESKTOP')) desktopTargets += 1;
  }

  const theoreticalPageViewportTargets = primary.reduce((n, p) => n + viewportsForPage(p).length, 0);
  const captureEligibleTargets = mobileTargets + tabletTargets + desktopTargets;
  const actualCaptureTargets = captureEligibleTargets - blockedTargets.length * 0; // blocked pages excluded from counts above via filter

  const representativeRoutes: Record<string, string> = {};
  const authContexts: Record<string, string> = {};
  for (const p of primary) {
    representativeRoutes[p.experiencePageId] = p.representativeRoute;
    authContexts[p.experiencePageId] = p.authContext ?? 'anonymous';
  }
  for (const m of captureMaterial) {
    representativeRoutes[m.materialScreenId] = m.representativeRoute;
  }

  const eligiblePrimary = primary.filter((p) => !blockedTargets.includes(p.experiencePageId));

  return {
    projectId,
    curationVersion: curation.curationVersion,
    experiencePageIds: eligiblePrimary.map((p) => p.experiencePageId),
    materialScreenIds: captureMaterial.map((m) => m.materialScreenId),
    viewports: ALL_VIEWPORTS,
    representativeRoutes,
    authContexts,
    estimatedCaptureCount: actualCaptureTargets,
    requiresLockedCuration: true,
    experiencePageTargets: eligiblePrimary.map((p) => p.experiencePageId),
    materialScreenTargets: captureMaterial.map((m) => m.materialScreenId),
    viewportTargets: ALL_VIEWPORTS,
    mobileTargets,
    tabletTargets,
    desktopTargets,
    blockedTargets,
    theoreticalPageViewportTargets,
    captureEligibleTargets,
    actualCaptureTargets,
  };
}

export function buildNormalizedReferencePlan(
  projectId: string,
  curation: ProjectCurationState,
  activePages: ExperiencePageRecord[],
  materialScreens: MaterialScreenRecord[],
): NormalizedReferencePlan {
  const primary = activePages.filter((p) => p.founderPrimary);
  const unique = primary.filter((p) => p.referencePolicy === 'UNIQUE_REFERENCE_REQUIRED').length;
  const familyInherited = primary.filter((p) => p.referencePolicy === 'SHARED_FAMILY_REFERENCE').length;
  const assetOnly = primary.filter((p) => p.referencePolicy === 'ASSET_ONLY_VARIANT').length;
  const stateDerived = primary.filter((p) => p.referencePolicy === 'STATE_DERIVED').length;
  const matUnique = materialScreens.filter((m) => m.captureEligible && m.referencePolicy === 'UNIQUE_REFERENCE_REQUIRED').length;

  const theoreticalPageViewportReferenceNeeds = primary.length * 3 + materialScreens.filter((m) => m.captureEligible).length * 3;
  const uniqueReferencesRequired = unique + matUnique;
  const inheritedReferenceAssignments = familyInherited + assetOnly + stateDerived;
  const noNewReferenceAssignments = primary.filter((p) => p.referencePolicy === 'NO_NEW_REFERENCE_REQUIRED').length;

  return {
    projectId,
    curationVersion: curation.curationVersion,
    uniqueReferenceRequirements: uniqueReferencesRequired,
    familyInherited,
    assetOnly,
    stateDerived,
    experiencePageIds: primary.map((p) => p.experiencePageId),
    materialScreenIds: materialScreens.filter((m) => m.captureEligible).map((m) => m.materialScreenId),
    theoreticalPageViewportReferenceNeeds,
    referenceEligibleRequirements: uniqueReferencesRequired + inheritedReferenceAssignments,
    uniqueReferencesRequired,
    inheritedReferenceAssignments,
    noNewReferenceAssignments,
  };
}

export function captureAllRequiresLockedCuration(curation: ProjectCurationState): boolean {
  return curation.universeStatus === 'LOCKED_FOR_CAPTURE' || curation.lockedForCapture;
}

export function isFsbwCurationProject(projectId: string): boolean {
  return (FSBW_OWNED_PROJECT_IDS as readonly string[]).includes(projectId);
}

/** @deprecated use buildNormalizedCapturePlan */
export function buildImplementationSnapshotCapturePlan(
  projectId: string,
  curation: ProjectCurationState,
  activePages: ExperiencePageRecord[],
  materialScreens: MaterialScreenRecord[],
) {
  return buildNormalizedCapturePlan(projectId, curation, activePages, materialScreens);
}

/** @deprecated use buildNormalizedReferencePlan */
export function buildDesignReferenceGenerationPlan(
  projectId: string,
  curation: ProjectCurationState,
  activePages: ExperiencePageRecord[],
  materialScreens: MaterialScreenRecord[],
): DesignReferenceGenerationPlan {
  return buildNormalizedReferencePlan(projectId, curation, activePages, materialScreens);
}

export function buildFsbwCaptureScopeSummary(
  bundles: Array<{ projectId: string; plan: NormalizedCapturePlan }>,
): import('../types').FsbwCaptureScopeSummary {
  const perProject: import('../types').FsbwCaptureScopeSummary['perProject'] = {};
  let theoretical = 0;
  let eligible = 0;
  let blocked = 0;
  let actual = 0;

  for (const { projectId, plan } of bundles) {
    perProject[projectId] = {
      experiencePages: plan.experiencePageTargets.length,
      materialScreens: plan.materialScreenTargets.length,
      mobile: plan.mobileTargets,
      tablet: plan.tabletTargets,
      desktop: plan.desktopTargets,
      blocked: plan.blockedTargets.length,
      actualTargets: plan.actualCaptureTargets,
    };
    theoretical += plan.theoreticalPageViewportTargets;
    eligible += plan.captureEligibleTargets;
    blocked += plan.blockedTargets.length;
    actual += plan.actualCaptureTargets;
  }

  return {
    projects: bundles.map((b) => b.projectId),
    theoreticalPageViewportTargets: theoretical,
    captureEligibleTargets: eligible,
    blockedTargets: blocked,
    actualCaptureTargets: actual,
    perProject,
  };
}
