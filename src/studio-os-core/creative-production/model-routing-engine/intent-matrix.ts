import type { ArtifactIntent } from '../artifact-intent';
import type { ModelAssetClass } from '../model-registry/types';
import type { GenerationWorkerFamily } from './types';

/** Canonical intent → worker family matrix (P1 sprint). */
export const WORLD_ARCHITECT_INTENTS: ReadonlySet<ArtifactIntent> = new Set([
  'founder-full-room-preview',
  'master-founder-landscape',
  'master-founder-portrait-recompose',
  'experience-environment',
  'world-preview',
  'world-expansion',
  'environment-shell',
  'final-scene',
  'final-scene-preview',
]);

export const ASSET_MANUFACTURER_INTENTS: ReadonlySet<ArtifactIntent> = new Set([
  'reception-desk',
  'furniture-asset',
  'landmark-asset',
  'decor-asset',
  'architecture-piece',
  'fixture',
  'lighting-object',
  'logo-asset',
  'campaign-graphic',
  'poster',
  'packaging-asset',
  'isolated-object',
  'object-group',
  'logo-component',
  'full-logo',
  'campaign-composite',
  'packaging-composite',
  'campaign-model-replacement',
]);

/** Blend / overlay layers — no strict NBP/NB2 immune gate. */
export const BLEND_OVERLAY_INTENTS: ReadonlySet<ArtifactIntent> = new Set([
  'transparent-overlay',
  'material-map',
]);

export const BACKGROUND_CLEANUP_INTENTS: ReadonlySet<ArtifactIntent> = new Set(['background-cleanup']);

const INTENT_TO_ASSET_CLASS: Partial<Record<ArtifactIntent, ModelAssetClass>> = {
  'founder-full-room-preview': 'founder-full-room-preview',
  'master-founder-landscape': 'founder-full-room-preview',
  'master-founder-portrait-recompose': 'founder-full-room-preview',
  'experience-environment': 'environment-shell',
  'world-preview': 'environment-shell',
  'world-expansion': 'environment-shell',
  'environment-shell': 'environment-shell',
  'final-scene': 'environment-shell',
  'final-scene-preview': 'environment-shell',
  'reception-desk': 'reception-structure',
  'furniture-asset': 'furniture-objects',
  'landmark-asset': 'signature-landmark',
  'decor-asset': 'decorative-object',
  'architecture-piece': 'architectural-prop',
  'fixture': 'architectural-prop',
  'lighting-object': 'decorative-object',
  'logo-asset': 'signature-landmark',
  'campaign-graphic': 'decorative-object',
  'poster': 'decorative-object',
  'packaging-asset': 'decorative-object',
  'isolated-object': 'signature-landmark',
  'object-group': 'furniture-objects',
  'logo-component': 'signature-landmark',
  'full-logo': 'signature-landmark',
  'campaign-composite': 'decorative-object',
  'packaging-composite': 'decorative-object',
  'campaign-model-replacement': 'decorative-object',
  'transparent-overlay': 'decorative-object',
  'material-map': 'decorative-object',
  'background-cleanup': 'background-removal',
};

export function resolveWorkerFamilyForIntent(intent: ArtifactIntent): GenerationWorkerFamily {
  if (WORLD_ARCHITECT_INTENTS.has(intent)) return 'world-architect';
  if (BACKGROUND_CLEANUP_INTENTS.has(intent)) return 'background-cleanup';
  if (BLEND_OVERLAY_INTENTS.has(intent)) return 'asset-manufacturer';
  return 'asset-manufacturer';
}

export function resolveAssetClassForIntent(
  intent: ArtifactIntent,
  override?: ModelAssetClass
): ModelAssetClass {
  if (override) return override;
  const mapped = INTENT_TO_ASSET_CLASS[intent];
  if (!mapped) {
    throw new Error(`No asset class mapping for artifact intent: ${intent}`);
  }
  return mapped;
}

export function isWorldEnvironmentIntent(intent: ArtifactIntent): boolean {
  return WORLD_ARCHITECT_INTENTS.has(intent);
}

export function isProductionAssetIntent(intent: ArtifactIntent): boolean {
  return ASSET_MANUFACTURER_INTENTS.has(intent);
}

export function isBackgroundCleanupIntent(intent: ArtifactIntent): boolean {
  return BACKGROUND_CLEANUP_INTENTS.has(intent);
}
