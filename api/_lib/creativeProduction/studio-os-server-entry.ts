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

export { resolveFounderRenderBrandOrganizationId } from '../../../src/studio-os-core/founder-render/brand-organization.js';

export { resolveBrandMaterialPackage } from '../../../src/studio-os-core/creative-production/brand-asset-grounding/resolver.js';

export {
  resolveLayerIdFromProductionGroupId,
  resolveSceneStackLayerModelRoute,
  SCENE_STACK_SHELL_FAL_MODEL,
} from '../../../src/studio-os-core/scene-stack/layer-model-routing.js';

export { buildNanoBanana2FalInput } from '../../../src/studio-os-core/creative-production/model-registry/nano-banana-2-schema.js';

export {
  MODEL_ROUTING_ENGINE_VERSION,
  resolveModelRoutingDecision,
  resolveModelRoutingFromLayerId,
  getWorldArchitectDefaultModel,
  getAssetManufacturerDefaultModel,
  getBackgroundCleanupModel,
} from '../../../src/studio-os-core/creative-production/model-routing-engine/index.js';

export {
  PROMPT_ROUTER_VERSION,
  resolvePromptRouting,
} from '../../../src/studio-os-core/creative-production/prompt-router/index.js';

export {
  GENERATION_ROUTING_RECORD_VERSION,
  buildGenerationRoutingRecord,
} from '../../../src/studio-os-core/creative-production/generation-routing-record.js';

export {
  validateModelRoutingDecision,
  validateAndResolveModelRouting,
} from '../../../src/studio-os-core/immune-system/model-routing-validation.js';
