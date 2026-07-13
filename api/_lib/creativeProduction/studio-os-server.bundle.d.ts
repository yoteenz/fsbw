/**
 * Type surface for prebuilt studio-os-server.bundle.js
 * Canonical implementations remain in src/studio-os-core/.
 * Keep in sync with studio-os-server-entry.ts exports.
 */
import type { AssetIntent, CreativeInitiative, GovernedGenerationAudit, ProductionAuthorization } from '../../../src/studio-os-core/creative-production/types.js';
import type { RegistryRelationshipDraft } from '../../../src/studio-os-core/creative-production/lineage.js';
import type { GovernedGenerationResult } from '../../../src/studio-os-core/creative-production/types.js';
import type { RepresentGenerationRequestInput } from '../../../src/studio-os-core/creative-production/graph.js';
import type { ConstructionPlan } from '../../../src/studio-os-core/blueprint-author/construction-plan-schema.js';
import type { BrandMaterialPackage, BrandAssetResolutionError } from '../../../src/studio-os-core/creative-production/brand-asset-grounding/contract.js';
import type { MaterialRequest } from '../../../src/studio-os-core/creative-production/brand-asset-grounding/resolver.js';
import type { FounderRenderModelRoute } from '../../../src/studio-os-core/founder-render/model-route.js';
import type { FounderRenderPreflightResult } from '../../../src/studio-os-core/founder-render/preflight.js';
import type { FounderFullRoomPrompt } from '../../../src/studio-os-core/founder-render/prompt-builder.js';
import type { SceneStackLayerModelRoute } from '../../../src/studio-os-core/scene-stack/layer-model-routing.js';
import type { SceneStackLayerId } from '../../../src/studio-os-core/scene-stack/types.js';
import type { NanoBanana2FalInput } from '../../../src/studio-os-core/creative-production/model-registry/nano-banana-2-schema.js';

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

export const FOUNDER_RENDER_ARTIFACT_INTENT: 'founder-full-room-preview';
export const FOUNDER_FULL_ROOM_PREVIEW_PROMPT_VERSION: 'founder-full-room-preview-prompt.v1';

export const FOUNDER_RENDER_ROUTE_ID: 'nano-banana-pro-founder-full-room';

export function resolveFounderRenderModelRoute(aspectRatio?: '16:9' | '21:9'): FounderRenderModelRoute;

export function buildFounderFullRoomPreviewPrompt(input: {
  plan: ConstructionPlan;
  brandPackage: BrandMaterialPackage;
  founderRevisionNote?: string | null;
}): FounderFullRoomPrompt;

export function runFounderRenderPreflight(plan: ConstructionPlan): FounderRenderPreflightResult;

export function resolveFounderRenderBrandOrganizationId(plan: ConstructionPlan): string;

export function resolveBrandMaterialPackage(input: {
  organizationId: string;
  organizationName?: string;
  materialRequests: MaterialRequest[];
}): BrandMaterialPackage | BrandAssetResolutionError;

export const SCENE_STACK_SHELL_FAL_MODEL: 'fal-ai/nano-banana-pro/edit';

export function resolveLayerIdFromProductionGroupId(productionGroupId: string): SceneStackLayerId | null;

export function resolveSceneStackLayerModelRoute(
  layerId: SceneStackLayerId,
  isolationAttempt?: number,
  options?: {
    organizationId?: string | null;
    brandGroundingRequired?: boolean;
  }
): SceneStackLayerModelRoute;

export function buildNanoBanana2FalInput(input: {
  prompt: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
  brandReferenceUrls?: string[];
  negativePrompt?: string;
}): { endpoint: string; falInput: NanoBanana2FalInput; usesReferences: boolean };
