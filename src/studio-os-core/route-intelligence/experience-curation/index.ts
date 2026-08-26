export {
  EXPERIENCE_CURATION_SCHEMA_VERSION,
  EXPERIENCE_CURATION_STORE_RELATIVE_PATH,
  FS_INTERNAL_WORKSPACE_SECTION,
} from './constants';

export {
  loadExperienceCurationStore,
  saveExperienceCurationStore,
  emptyCurationStore,
  getProjectCurationState,
  upsertOverride,
  appendReview,
  activeOverridesForProject,
} from './override-store';

export {
  isFrontalSlayerInternalRoute,
  auditFrontalSlayerPrimaryExperience,
  demotePageToInternalWorkspace,
  isHardProtectedCustomerPage,
  buildCompiledByScreen,
} from './fs-internal-audit';

export {
  auditAioServiceConsolidation,
  consolidateAioServicePages,
  isAioServiceMarketingPage,
} from './aio-service-consolidation';

export { applyExperiencePageOverrides } from './override-applier';

export {
  buildImplementationSnapshotCapturePlan,
  buildDesignReferenceGenerationPlan,
  buildNormalizedCapturePlan,
  buildNormalizedReferencePlan,
  buildFsbwCaptureScopeSummary,
  captureAllRequiresLockedCuration,
  isFsbwCurationProject,
} from './curation-plans';

export {
  applyExperienceCurationToPageSet,
  attachExperienceCurationToManifest,
  applyAutoCuration,
} from './pipeline';

export { buildCurationReviewQueueForProject, filterReviewByConfidence } from './review-queue';
export { buildFrontalSlayerReviewGroups, buildAioReviewGroups } from './review-groups';
export { auditBawMaterialScreens } from './fs-baw-material-audit';
export { auditStudioWorldSurfaces, extractStudioWorldExperiencePages } from './studio-world-audit';
export { executeCurationAction, startCurationReviewSession } from './curation-actions';
export { evaluateCurationGates, bumpCurationVersion } from './curation-gates';
export { diffCurationSource, captureSourceSnapshot, shouldMarkStale } from './stale-detection';
