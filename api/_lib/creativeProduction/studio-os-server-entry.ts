/**
 * Vercel serverless pre-bundle entry — canonical src re-exports for governed generation.
 * Built to studio-os-server.bundle.js at prebuild. Source of truth remains src/studio-os-core/.
 */

export {
  createDemoAssetIntent,
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  DEMO_AUTHORIZATION_ID,
} from '../../../src/studio-os-core/creative-production/demo-seed.js';

export { hasCompleteValidationCompileContext } from '../../../src/studio-os-core/creative-production/validation-compile-context.js';

export {
  buildAuthorizationPayloadForSigning,
  validateAuthorizationStructure,
} from '../../../src/studio-os-core/creative-production/authorization.js';

export { representGovernedGenerationRequest } from '../../../src/studio-os-core/creative-production/graph.js';

export {
  buildRegistryLineageMetadata,
  lineageToRegistryRelationships,
} from '../../../src/studio-os-core/creative-production/lineage.js';

export { compileAssetIntent } from '../../../src/studio-os-core/asset-compiler/compiler.js';
