/**
 * Type surface for prebuilt studio-os-server.bundle.js
 * Canonical implementations remain in src/studio-os-core/.
 */
import type { AssetIntent, CreativeInitiative, GovernedGenerationAudit, ProductionAuthorization } from '../../../src/studio-os-core/creative-production/types.js';
import type { RegistryRelationshipDraft } from '../../../src/studio-os-core/creative-production/lineage.js';
import type { GovernedGenerationResult } from '../../../src/studio-os-core/creative-production/types.js';
import type { RepresentGenerationRequestInput } from '../../../src/studio-os-core/creative-production/graph.js';

export const DEMO_AUTHORIZATION_ID: string;

export function createDemoCreativeInitiative(): CreativeInitiative;
export function createDemoProductionAuthorizationPayload(
  initiative: CreativeInitiative
): Omit<ProductionAuthorization, 'signature'>;
export function createDemoAssetIntent(initiativeId: string): AssetIntent;

export function hasCompleteValidationCompileContext(
  ctx: Record<string, unknown> | boolean | null | undefined
): boolean;

export function buildAuthorizationPayloadForSigning(
  payload: Omit<ProductionAuthorization, 'signature'>
): string;

export function validateAuthorizationStructure(
  authorization: ProductionAuthorization
): { ok: true } | { ok: false; code: string; error: string };

export function representGovernedGenerationRequest(
  input: RepresentGenerationRequestInput
): GovernedGenerationResult;

export function buildRegistryLineageMetadata(audit: GovernedGenerationAudit): Record<string, unknown>;

export function lineageToRegistryRelationships(
  lineage: GovernedGenerationAudit['expressionLineage'],
  orgId: string
): RegistryRelationshipDraft[];

export function compileAssetIntent(intent: import('../../../src/studio-os-core/asset-compiler/types.js').AssetCompilerIntent): import('../../../src/studio-os-core/asset-compiler/types.js').AssetCompilerPlan;
