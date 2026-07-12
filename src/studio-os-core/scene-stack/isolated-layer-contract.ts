import type { SceneStackLayerId } from './types';

export const ISOLATED_LAYER_CONTRACT_VERSION = 'isolated-layer-contract.v1';
export const ISOLATED_LAYER_QUALITY_GATE_VERSION = 'isolated-layer-quality.v1';
export const MAX_ISOLATION_REGENERATION_ATTEMPTS = 2;

export type IsolatedLayerGenerationMode =
  | 'full-scene-shell'
  | 'isolated-single-object'
  | 'isolated-object-group'
  | 'texture-map'
  | 'atmosphere-overlay'
  | 'lighting-map'
  | 'motion-overlay'
  | 'reflection-overlay';

export type IsolatedLayerIsolationMode = 'none' | 'object-only' | 'object-group' | 'blend-overlay';

export type IsolatedLayerQualityClassification =
  | 'isolated-valid'
  | 'suspicious-scene-rerender'
  | 'full-scene-rerender'
  | 'opaque-background'
  | 'low-confidence-isolation'
  | 'baked-checkerboard';

export type IsolatedLayerReferencePolicy = 'none' | 'perspective-metadata-only';

export type IsolatedLayerContract = {
  layerId: SceneStackLayerId;
  layerType: string;
  generationMode: IsolatedLayerGenerationMode;
  isolationMode: IsolatedLayerIsolationMode;
  expectedContent: string;
  forbiddenContent: string[];
  expectedAlpha: boolean;
  maximumFrameCoverage: number;
  minimumTransparentSides: number;
  allowFullWidthEdgeContact: boolean;
  allowFullHeightEdgeContact: boolean;
  shellSimilarityThreshold: number;
  referencePolicy: IsolatedLayerReferencePolicy;
  outputFormat: 'png' | 'webp';
  mountBehavior: 'css-composite' | 'structural';
  regenerationPolicy: 'auto-up-to-2' | 'manual-only';
  qualityGateVersion: string;
};

const FORBIDDEN_SCENE_CONTENT = [
  'full room',
  'interior environment',
  'walls',
  'ceiling',
  'floor',
  'windows',
  'architecture',
  'showroom',
  'lobby',
  'wide shot',
  'complete composition',
  'prior layers',
  'shell recreation',
];

export const ISOLATED_OBJECT_LAYER_IDS: ReadonlySet<SceneStackLayerId> = new Set([
  'signature-landmark',
  'furniture-objects',
]);

export function isIsolatedObjectLayer(layerId: SceneStackLayerId): boolean {
  return ISOLATED_OBJECT_LAYER_IDS.has(layerId);
}

export function resolveLayerGenerationMode(layerId: SceneStackLayerId): IsolatedLayerGenerationMode {
  if (layerId === 'environment-shell') return 'full-scene-shell';
  if (layerId === 'signature-landmark') return 'isolated-single-object';
  if (layerId === 'furniture-objects') return 'isolated-object-group';
  if (layerId === 'lighting-systems') return 'lighting-map';
  if (layerId === 'atmospheric-systems') return 'atmosphere-overlay';
  if (layerId === 'surface-materials') return 'texture-map';
  if (layerId === 'ambient-motion') return 'motion-overlay';
  return 'reflection-overlay';
}

export function getIsolatedLayerContract(layerId: SceneStackLayerId): IsolatedLayerContract {
  if (layerId === 'environment-shell') {
    return {
      layerId,
      layerType: 'environment-shell',
      generationMode: 'full-scene-shell',
      isolationMode: 'none',
      expectedContent: 'Architecture shell only — walls, ceiling, floor, proportions.',
      forbiddenContent: ['furniture', 'hero objects', 'lighting effects', 'people'],
      expectedAlpha: false,
      maximumFrameCoverage: 1,
      minimumTransparentSides: 0,
      allowFullWidthEdgeContact: true,
      allowFullHeightEdgeContact: true,
      shellSimilarityThreshold: 1,
      referencePolicy: 'none',
      outputFormat: 'webp',
      mountBehavior: 'structural',
      regenerationPolicy: 'manual-only',
      qualityGateVersion: ISOLATED_LAYER_QUALITY_GATE_VERSION,
    };
  }

  if (layerId === 'signature-landmark') {
    return {
      layerId,
      layerType: 'signature-landmark',
      generationMode: 'isolated-single-object',
      isolationMode: 'object-only',
      expectedContent: 'One hero landmark object only — transparent background, mountable plate.',
      forbiddenContent: FORBIDDEN_SCENE_CONTENT,
      expectedAlpha: true,
      maximumFrameCoverage: 0.7,
      minimumTransparentSides: 3,
      allowFullWidthEdgeContact: false,
      allowFullHeightEdgeContact: false,
      shellSimilarityThreshold: 0.82,
      referencePolicy: 'perspective-metadata-only',
      outputFormat: 'png',
      mountBehavior: 'css-composite',
      regenerationPolicy: 'auto-up-to-2',
      qualityGateVersion: ISOLATED_LAYER_QUALITY_GATE_VERSION,
    };
  }

  if (layerId === 'furniture-objects') {
    return {
      layerId,
      layerType: 'furniture-objects',
      generationMode: 'isolated-object-group',
      isolationMode: 'object-group',
      expectedContent: 'Grouped furniture package only — preserved arrangement, transparent background.',
      forbiddenContent: FORBIDDEN_SCENE_CONTENT,
      expectedAlpha: true,
      maximumFrameCoverage: 0.85,
      minimumTransparentSides: 2,
      allowFullWidthEdgeContact: false,
      allowFullHeightEdgeContact: false,
      shellSimilarityThreshold: 0.84,
      referencePolicy: 'perspective-metadata-only',
      outputFormat: 'png',
      mountBehavior: 'css-composite',
      regenerationPolicy: 'auto-up-to-2',
      qualityGateVersion: ISOLATED_LAYER_QUALITY_GATE_VERSION,
    };
  }

  return {
    layerId,
    layerType: layerId,
    generationMode: resolveLayerGenerationMode(layerId),
    isolationMode: 'blend-overlay',
    expectedContent: 'Isolated overlay pass — not a full scene.',
    forbiddenContent: FORBIDDEN_SCENE_CONTENT,
    expectedAlpha: true,
    maximumFrameCoverage: 0.55,
    minimumTransparentSides: 1,
    allowFullWidthEdgeContact: true,
    allowFullHeightEdgeContact: true,
    shellSimilarityThreshold: 0.9,
    referencePolicy: 'none',
    outputFormat: 'png',
    mountBehavior: 'css-composite',
    regenerationPolicy: 'auto-up-to-2',
    qualityGateVersion: ISOLATED_LAYER_QUALITY_GATE_VERSION,
  };
}

export function resolveIsolatedLayerReferenceUrls(
  layerId: SceneStackLayerId,
  _shellUrl: string | null,
  isolationAttempt = 0
): string[] {
  const contract = getIsolatedLayerContract(layerId);
  if (contract.referencePolicy === 'none') return [];
  if (contract.referencePolicy === 'perspective-metadata-only') {
    // Never pass shell as dominant img2img input — perspective is encoded in prompt only.
    return isolationAttempt > 0 ? [] : [];
  }
  return [];
}
