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

export {
  FOUNDER_RENDER_ARTIFACT_INTENT,
  FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION,
} from '../../../src/studio-os-core/founder-render/contract.js';

export {
  resolveFounderRenderModelRoute,
  FOUNDER_RENDER_ROUTE_ID,
} from '../../../src/studio-os-core/founder-render/model-route.js';

export { buildFounderFullRoomPreviewPrompt } from '../../../src/studio-os-core/founder-render/prompt-builder.js';

export { runFounderRenderPreflight } from '../../../src/studio-os-core/founder-render/preflight.js';

export { resolveBrandMaterialPackage } from '../../../src/studio-os-core/creative-production/brand-asset-grounding/resolver.js';
