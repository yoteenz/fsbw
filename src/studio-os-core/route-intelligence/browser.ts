/** Browser-safe route intelligence exports — no Node fs/process APIs */
export type * from './types';
export {
  DESIGN_ROUTE_MANIFEST_VERSION,
  DESIGN_ROUTE_MANIFEST_SCHEMA_VERSION,
  DESIGN_ROUTE_MANIFEST_SCHEMA_V1,
  MANIFEST_ARTIFACT_FILENAME,
  VIEWPORT_CLASSES,
  DEFAULT_VIEWPORT_DIMENSIONS,
} from './constants';

export {
  buildNeedsReferenceQueue,
  buildNeedsImprovementQueue,
  buildPossibleDeadRouteQueue,
  buildCoverageMatrix,
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
