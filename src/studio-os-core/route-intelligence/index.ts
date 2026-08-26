export {
  DESIGN_ROUTE_MANIFEST_VERSION,
  DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION,
  DESIGN_ROUTE_MANIFEST_SCHEMA_V3,
  DESIGN_ROUTE_MANIFEST_SCHEMA_V2,
  DESIGN_ROUTE_MANIFEST_SCHEMA_V1,
  PROJECT_PAGE_SET_SCHEMA_VERSION,
  PROJECT_WEBSITE_EXPERIENCE_CLASSES,
  PRIMARY_EXPERIENCE_CLASSES,
  COMPILED_PAGE_STATUSES,
  PAGE_COMPILATION_CONFIDENCE_LEVELS,
  CUSTOMER_JOURNEY_STAGES,
  MANIFEST_ARTIFACT_FILENAME,
  MANIFEST_ARTIFACT_RELATIVE_PATH,
  VIEWPORT_CLASSES,
  DEFAULT_VIEWPORT_DIMENSIONS,
  ROUTE_REACHABILITY_CLASSES,
  REFERENCE_NECESSITY_CLASSES,
} from './constants';

export type * from './types';

export {
  discoverStudioWorldProjects,
  getStudioWorldProject,
  listDesignableProjects,
} from './project-registry';

export {
  runCrossProjectRouteForensicAudit,
  registerMissingRoutesAsDesignable,
  auditFailureTaxonomy,
  resolveSourceCommit,
} from './forensic-audit';

export { buildDesignRouteManifest, buildCoverageSummary, buildSyncContracts } from './manifest';

export { diffDesignRouteManifests, collectForensicFailures, collectForensicFailuresV2 } from './manifest-diff';

export {
  buildNeedsReferenceQueue,
  buildNeedsImprovementQueue,
  buildPossibleDeadRouteQueue,
  buildCoverageMatrix,
  buildReferencePolicyReviewQueue,
  groupRoutesForScreenDropdown,
} from './queues';

export {
  buildAllDesignFamilies,
  buildDesignFamilies,
  resolveFamilyKeyForScreen,
} from './design-family-consolidator';

export {
  auditReferenceNecessity,
  computeReferenceGenerationSavings,
  necessityBadge,
} from './reference-necessity-auditor';

export {
  resolveEffectiveDesignReference,
  buildEffectiveReferenceAuthorityHandoff,
  isGenerationRequired,
} from './effective-reference-resolver';

export {
  buildDesignScreens,
  buildRouteTemplates,
  groupDesignScreensForDropdown,
  buildReferenceMigrationMap,
} from './design-screen-normalizer';

export {
  classifyRouteReachability,
  applyReachabilityToRoutes,
  summarizeReachability,
} from './reachability-classifier';

export { scanProgrammaticNavigation } from './discovery/programmatic-navigation-scanner';

export {
  compilePageDesignReferencePrompt,
  validateReferenceGenerationRequest,
  buildReferenceBatchPreview,
  RECONSTRUCTION_PIPELINE_ID,
  ASSET_SLOT_PIPELINE_ID,
  PRODUCT_ASSET_PIPELINE_ID,
} from './prompt-compiler';

export { discoverAllReferences, discoverFilesystemReferences } from './reference-discovery';

export { buildAllCoverage, buildViewportCoverage } from './viewport-coverage';

export { discoverProjectRoutes, discoverAllProjectRoutes } from './discovery/project-adapters';

export { buildDependencyGraph, buildVisualStates } from './dependency-graph';

export {
  classifyWebsiteExperience,
  isPrimaryExperience,
  isExcludedFromPrimary,
} from './experience-classifier';

export {
  compileProjectWebsitePageSet,
  compileAllProjectWebsitePageSets,
  attachPageSetsToManifest,
  groupCompiledPagesForSelector,
  pageStatusBadge,
} from './website-page-compiler';

export {
  compilePrimaryExperiencePages,
  attachExperiencePagesToPageSet,
  attachExperiencePagesToManifest,
  groupExperiencePagesForSelector,
  SITE00_P0_VR_3D_BASELINE_COUNT,
} from './experience-page-abstraction';

export {
  buildExperienceCaptureScope,
  listCaptureAllTargets,
  isDesignScreenCaptureScope,
} from './experience-capture-scope';

export { runExperiencePageAbstractionQa } from './experience-page-qa';

export { diffProjectWebsitePageSets } from './page-set-diff';

export { scanRouteFile } from './discovery/source-scanner';
export { displayNameFromRoute } from './route-labels';
