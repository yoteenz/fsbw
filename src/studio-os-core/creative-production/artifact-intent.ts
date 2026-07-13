import type { SceneStackLayerId } from '../scene-stack/types';
import { resolveLayerGenerationMode } from '../scene-stack/isolated-layer-contract';

/** Explicit artifact intent governs which validation contract applies — not a universal full-scene rule. */
export type ArtifactIntent =
  | 'final-scene'
  | 'final-scene-preview'
  | 'environment-shell'
  | 'experience-environment'
  | 'world-preview'
  | 'world-expansion'
  | 'isolated-object'
  | 'object-group'
  | 'transparent-overlay'
  | 'material-map'
  | 'campaign-composite'
  | 'logo-component'
  | 'full-logo'
  | 'packaging-composite'
  | 'campaign-model-replacement'
  | 'founder-full-room-preview'
  | 'reception-desk'
  | 'furniture-asset'
  | 'landmark-asset'
  | 'decor-asset'
  | 'architecture-piece'
  | 'fixture'
  | 'lighting-object'
  | 'logo-asset'
  | 'campaign-graphic'
  | 'poster'
  | 'packaging-asset'
  | 'background-cleanup';

export type ArtifactIntentSurface = 'frontal-slayer' | 'experience-lab' | 'creative-direction-studio';

export type ResolveArtifactIntentInput = {
  layerId: SceneStackLayerId;
  surface?: ArtifactIntentSurface;
  /** CDS Director Mode may request full compositions — never treat as Scene Stack furniture layer. */
  creativeStudioStackMode?: boolean;
  /** Optional CDS artifact class when layer id alone is ambiguous. */
  cdsArtifactClass?: string | null;
};

export function resolveArtifactIntent(input: ResolveArtifactIntentInput): ArtifactIntent {
  const { layerId, creativeStudioStackMode, cdsArtifactClass } = input;

  if (creativeStudioStackMode && cdsArtifactClass) {
    const normalized = cdsArtifactClass.toLowerCase();
    if (normalized.includes('campaign') && normalized.includes('composite')) return 'campaign-composite';
    if (normalized.includes('full-logo') || normalized.includes('complete logo')) return 'full-logo';
    if (normalized.includes('logo') && normalized.includes('component')) return 'logo-component';
    if (normalized.includes('packaging')) return 'packaging-composite';
    if (normalized.includes('model-replacement')) return 'campaign-model-replacement';
  }

  if (layerId === 'environment-shell') return 'environment-shell';

  if (layerId === 'signature-landmark') return 'isolated-object';
  if (layerId === 'furniture-objects') return 'object-group';

  const mode = resolveLayerGenerationMode(layerId);
  if (mode === 'atmosphere-overlay' || mode === 'motion-overlay' || mode === 'reflection-overlay') {
    return 'transparent-overlay';
  }
  if (mode === 'texture-map') return 'material-map';
  if (mode === 'lighting-map') return 'material-map';
  if (mode === 'full-scene-shell') return 'environment-shell';

  if (creativeStudioStackMode) return 'campaign-composite';

  return 'transparent-overlay';
}

export function requiresIsolatedObjectValidation(intent: ArtifactIntent): boolean {
  return intent === 'isolated-object' || intent === 'object-group' || intent === 'logo-component';
}

export function allowsFullSceneOutput(intent: ArtifactIntent): boolean {
  return (
    intent === 'final-scene' ||
    intent === 'final-scene-preview' ||
    intent === 'founder-full-room-preview' ||
    intent === 'environment-shell' ||
    intent === 'experience-environment' ||
    intent === 'world-preview' ||
    intent === 'world-expansion' ||
    intent === 'campaign-composite' ||
    intent === 'full-logo' ||
    intent === 'packaging-composite' ||
    intent === 'campaign-model-replacement'
  );
}

export function supportsBackgroundExtractionSalvage(intent: ArtifactIntent): boolean {
  return requiresIsolatedObjectValidation(intent);
}

export function validatorExistsForIntent(intent: ArtifactIntent): boolean {
  return [
    'final-scene',
    'final-scene-preview',
    'environment-shell',
    'experience-environment',
    'world-preview',
    'world-expansion',
    'isolated-object',
    'object-group',
    'transparent-overlay',
    'material-map',
    'campaign-composite',
    'logo-component',
    'full-logo',
    'packaging-composite',
    'campaign-model-replacement',
    'founder-full-room-preview',
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
    'background-cleanup',
  ].includes(intent);
}
