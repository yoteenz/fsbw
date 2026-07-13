import type { IsolatedLayerImageMetrics } from '../isolated-layer-quality';
import type { SceneStackLayerId } from '../types';
import { getIsolatedLayerContract, isIsolatedObjectLayer } from '../isolated-layer-contract';
import type { StructuralClassification } from './contract';
import { isSalvageableOpaqueStudioPlate } from './salvageable-opaque';

export type StructuralValidationInput = {
  layerId: SceneStackLayerId;
  metrics: IsolatedLayerImageMetrics;
  fullSceneLikelihood: number;
};

export type StructuralValidationResult = {
  classification: StructuralClassification;
  valid: boolean;
  issues: string[];
  mountableSilhouette: boolean;
  expectedObjectCount: number;
  detectedObjectCount: number;
};

export function validateAssetStructure(input: StructuralValidationInput): StructuralValidationResult {
  const { layerId, metrics, fullSceneLikelihood } = input;
  const contract = getIsolatedLayerContract(layerId);
  const issues: string[] = [];

  if (layerId === 'environment-shell') {
    return {
      classification: 'structurally-valid',
      valid: metrics.width >= 512 && metrics.height >= 512,
      issues: metrics.width < 512 ? ['Shell resolution below minimum.'] : [],
      mountableSilhouette: true,
      expectedObjectCount: 1,
      detectedObjectCount: 1,
    };
  }

  if (!isIsolatedObjectLayer(layerId)) {
    return {
      classification: 'structurally-valid',
      valid: true,
      issues: [],
      mountableSilhouette: true,
      expectedObjectCount: 1,
      detectedObjectCount: 1,
    };
  }

  if (fullSceneLikelihood >= 0.8) {
    return {
      classification: 'full-scene',
      valid: false,
      issues: ['Full-scene vanishing geometry detected.'],
      mountableSilhouette: false,
      expectedObjectCount: layerId === 'furniture-objects' ? 2 : 1,
      detectedObjectCount: 0,
    };
  }

  if (metrics.frameCoverage > contract.maximumFrameCoverage) {
    issues.push(`Frame coverage ${(metrics.frameCoverage * 100).toFixed(0)}% exceeds ${(contract.maximumFrameCoverage * 100).toFixed(0)}% threshold.`);
  }

  if (metrics.frameCoverage < 0.06) {
    issues.push('Object occupies too little of the frame — likely missing or severely cropped.');
    return {
      classification: 'cropped',
      valid: false,
      issues,
      mountableSilhouette: false,
      expectedObjectCount: layerId === 'furniture-objects' ? 2 : 1,
      detectedObjectCount: 0,
    };
  }

  if (metrics.fullWidthEdgeContact && metrics.fullHeightEdgeContact && metrics.transparentSides < 2) {
    issues.push('Object fused with environment edges — full-room vanishing geometry.');
    return {
      classification: 'fused-with-environment',
      valid: false,
      issues,
      mountableSilhouette: false,
      expectedObjectCount: layerId === 'furniture-objects' ? 2 : 1,
      detectedObjectCount: 1,
    };
  }

  if (metrics.bakedCheckerboardSuspect) {
    issues.push('Fake transparency pattern detected.');
    return {
      classification: 'malformed',
      valid: false,
      issues,
      mountableSilhouette: false,
      expectedObjectCount: layerId === 'furniture-objects' ? 2 : 1,
      detectedObjectCount: 1,
    };
  }

  const salvageableOpaque = isSalvageableOpaqueStudioPlate({
    layerId,
    metrics,
    fullSceneLikelihood,
    shellSimilarity: metrics.shellSimilarity,
  });

  const transparentOk = metrics.transparentSides >= contract.minimumTransparentSides;
  if (!transparentOk && metrics.frameCoverage > 0.65 && !salvageableOpaque) {
    issues.push('Insufficient transparent margin for mountable silhouette.');
  }

  const valid =
    issues.length === 0 &&
    metrics.frameCoverage <= contract.maximumFrameCoverage &&
    metrics.frameCoverage >= 0.08 &&
    (transparentOk || metrics.alphaChannelPresent || salvageableOpaque);

  let classification: StructuralClassification = 'structurally-valid';
  if (!valid) {
    if (metrics.frameCoverage > contract.maximumFrameCoverage) classification = 'full-scene';
    else if (!transparentOk) classification = 'unusable-silhouette';
    else classification = 'malformed';
  }

  return {
    classification,
    valid,
    issues,
    mountableSilhouette: valid,
    expectedObjectCount: layerId === 'furniture-objects' ? 2 : 1,
    detectedObjectCount: valid ? (layerId === 'furniture-objects' ? 2 : 1) : 0,
  };
}
