export {
  DESIGN_ROUTE_MANIFEST_VERSION,
  DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION,
  DESIGN_ROUTE_MANIFEST_SCHEMA_V1,
  MANIFEST_ARTIFACT_FILENAME,
  MANIFEST_ARTIFACT_RELATIVE_PATH,
  VIEWPORT_CLASSES,
  DEFAULT_VIEWPORT_DIMENSIONS,
  ROUTE_REACHABILITY_CLASSES,
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
  groupRoutesForScreenDropdown,
} from './queues';

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

export { scanRouteFile } from './discovery/source-scanner';
export { displayNameFromRoute } from './route-labels';
