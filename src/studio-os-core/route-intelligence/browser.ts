/** Browser-safe route intelligence exports — no Node fs/process APIs */
export type * from './types';
export {
  DESIGN_ROUTE_MANIFEST_VERSION,
  DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION,
  DESIGN_ROUTE_MANIFEST_SCHEMA_V3,
  DESIGN_ROUTE_MANIFEST_SCHEMA_V2,
  DESIGN_ROUTE_MANIFEST_SCHEMA_V1,
  PROJECT_PAGE_SET_SCHEMA_VERSION,
  PRIMARY_EXPERIENCE_CLASSES,
  MANIFEST_ARTIFACT_FILENAME,
  VIEWPORT_CLASSES,
  DEFAULT_VIEWPORT_DIMENSIONS,
  REFERENCE_NECESSITY_CLASSES,
} from './constants';

export {
  buildNeedsReferenceQueue,
  buildNeedsImprovementQueue,
  buildPossibleDeadRouteQueue,
  buildCoverageMatrix,
  buildReferencePolicyReviewQueue,
  groupRoutesForScreenDropdown,
} from './queues';

export { groupDesignScreensForDropdown } from './design-screen-dropdown';

export {
  compilePageDesignReferencePrompt,
  validateReferenceGenerationRequest,
  buildReferenceBatchPreview,
  RECONSTRUCTION_PIPELINE_ID,
  ASSET_SLOT_PIPELINE_ID,
  PRODUCT_ASSET_PIPELINE_ID,
} from './prompt-compiler';

export { diffDesignRouteManifests } from './manifest-diff';

export { buildCoverageSummary } from './manifest';

export { displayNameFromRoute } from './route-labels';

export { necessityBadge } from './reference-necessity-auditor';

export { resolveEffectiveDesignReference, isGenerationRequired } from './effective-reference-resolver';

export {
  groupCompiledPagesForSelector,
  pageStatusBadge,
} from './website-page-compiler';

export { groupExperiencePagesForSelector } from './experience-page-abstraction';

export { listCaptureAllTargets, isDesignScreenCaptureScope } from './experience-capture-scope';

export {
  buildComposerCreatedPagesReviewQueue,
  filterComposerReviewQueueByProject,
  countReadyForApproval,
  countNeedsCreativeDirection,
  countNeedsFunctionalReview,
} from './fsbw-missing-route-completion/review-queue';

export { isProductionNavBlocked, composerPreviewRoutePath } from './fsbw-missing-route-completion/draft-guard';

export { isPrimaryExperience, isExcludedFromPrimary } from './experience-classifier';

export function groupDesignFamiliesForDropdown(
  families: import('./types').DesignFamilyRecord[],
  projectId: string,
): Record<string, import('./types').DesignFamilyRecord[]> {
  const projectFamilies = families.filter((f) => f.projectId === projectId);
  const groups: Record<string, import('./types').DesignFamilyRecord[]> = {};
  for (const f of projectFamilies) {
    const list = groups[f.routeFamily] ?? [];
    list.push(f);
    groups[f.routeFamily] = list;
  }
  for (const key of Object.keys(groups)) {
    groups[key]!.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
  return groups;
}
