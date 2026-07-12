/**
 * Server-safe runtime surface for governed generation — backed by prebuilt bundle.
 * Type-only imports may still reference src/studio-os-core directly (erased at compile).
 */

export {
  createDemoAssetIntent,
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  DEMO_AUTHORIZATION_ID,
  hasCompleteValidationCompileContext,
  buildAuthorizationPayloadForSigning,
  validateAuthorizationStructure,
  representGovernedGenerationRequest,
  buildRegistryLineageMetadata,
  lineageToRegistryRelationships,
  compileAssetIntent,
} from './studio-os-server.bundle.js';
