import type { IsolatedLayerImageMetrics } from '../isolated-layer-quality';
import type { SceneStackLayerId } from '../types';
import { isIsolatedObjectLayer } from '../isolated-layer-contract';
import type { IdentityClassification } from './contract';

export type IdentityValidationInput = {
  layerId: SceneStackLayerId;
  requestedAssetDescription: string;
  metrics: IsolatedLayerImageMetrics;
  shellSimilarity: number | null;
};

export type IdentityValidationResult = {
  identityMatch: boolean;
  confidence: number;
  detectedObjectClasses: string[];
  requestedObjectDetected: boolean;
  unrelatedObjectDominance: number;
  fullSceneLikelihood: number;
  classification: IdentityClassification;
  safeExplanation: string;
};

export function validateAssetIdentity(input: IdentityValidationInput): IdentityValidationResult {
  const { layerId, metrics, shellSimilarity, requestedAssetDescription } = input;
  const detectedObjectClasses: string[] = [];

  const fullSceneLikelihood = computeFullSceneLikelihood(metrics, shellSimilarity);
  const unrelatedObjectDominance = computeUnrelatedDominance(metrics);

  if (layerId === 'environment-shell') {
    return {
      identityMatch: true,
      confidence: 0.95,
      detectedObjectClasses: ['architectural-environment'],
      requestedObjectDetected: true,
      unrelatedObjectDominance: 0,
      fullSceneLikelihood: 1,
      classification: 'identity-match',
      safeExplanation: 'Environment shell is expected to be a full architectural scene.',
    };
  }

  if (!isIsolatedObjectLayer(layerId)) {
    return {
      identityMatch: true,
      confidence: 0.85,
      detectedObjectClasses: ['overlay-layer'],
      requestedObjectDetected: true,
      unrelatedObjectDominance: 0.1,
      fullSceneLikelihood: metrics.frameCoverage,
      classification: 'identity-match',
      safeExplanation: 'Overlay layer uses simplified identity policy.',
    };
  }

  if (fullSceneLikelihood >= 0.82) {
    return {
      identityMatch: false,
      confidence: 0.92,
      detectedObjectClasses: ['architectural-environment', 'room-interior'],
      requestedObjectDetected: false,
      unrelatedObjectDominance: Math.max(unrelatedObjectDominance, 0.85),
      fullSceneLikelihood,
      classification: 'architecture-dominant',
      safeExplanation:
        'Output appears to be a complete room or architectural environment rather than the requested isolated object.',
    };
  }

  if (metrics.frameCoverage >= 0.88 && metrics.transparentSides < 2) {
    return {
      identityMatch: false,
      confidence: 0.88,
      detectedObjectClasses: ['full-scene-composition'],
      requestedObjectDetected: false,
      unrelatedObjectDominance: 0.9,
      fullSceneLikelihood,
      classification: 'embedded-in-scene',
      safeExplanation: 'Landmark appears embedded inside a full scene rather than delivered as a standalone object.',
    };
  }

  if (metrics.frameCoverage < 0.08) {
    return {
      identityMatch: false,
      confidence: 0.75,
      detectedObjectClasses: [],
      requestedObjectDetected: false,
      unrelatedObjectDominance: 0.2,
      fullSceneLikelihood,
      classification: 'missing-object',
      safeExplanation: 'No visually dominant object detected in candidate frame.',
    };
  }

  if (layerId === 'signature-landmark') {
    detectedObjectClasses.push('signature-landmark-object');
  }
  if (layerId === 'furniture-objects') {
    detectedObjectClasses.push('furniture-object-group');
  }

  const descTokens = requestedAssetDescription
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
  if (descTokens.length > 0) {
    detectedObjectClasses.push(`requested:${descTokens.slice(0, 3).join('-')}`);
  }

  const confidence = clamp(
    0.55 +
      (metrics.frameCoverage > 0.12 && metrics.frameCoverage < 0.72 ? 0.2 : 0) +
      (metrics.transparentSides >= 2 ? 0.15 : 0) +
      (fullSceneLikelihood < 0.5 ? 0.1 : -0.2),
    0.35,
    0.95
  );

  const identityMatch = confidence >= 0.62 && fullSceneLikelihood < 0.72 && metrics.frameCoverage >= 0.1;

  return {
    identityMatch,
    confidence,
    detectedObjectClasses,
    requestedObjectDetected: identityMatch,
    unrelatedObjectDominance,
    fullSceneLikelihood,
    classification: identityMatch ? 'identity-match' : 'low-confidence',
    safeExplanation: identityMatch
      ? 'Candidate contains a dominant object consistent with the requested asset specification.'
      : 'Candidate identity is ambiguous relative to the requested asset specification.',
  };
}

function computeFullSceneLikelihood(metrics: IsolatedLayerImageMetrics, shellSimilarity: number | null): number {
  let score = 0;
  if (metrics.frameCoverage > 0.78) score += 0.35;
  if (metrics.transparentSides < 2) score += 0.25;
  if (metrics.fullWidthEdgeContact && metrics.fullHeightEdgeContact) score += 0.2;
  if (metrics.cornerOpacityAvg > 200) score += 0.1;
  if (shellSimilarity !== null && shellSimilarity > 0.75) score += 0.25;
  return clamp(score, 0, 1);
}

function computeUnrelatedDominance(metrics: IsolatedLayerImageMetrics): number {
  if (metrics.frameCoverage > 0.85 && metrics.transparentSides === 0) return 0.95;
  if (metrics.frameCoverage > 0.7 && metrics.transparentSides <= 1) return 0.75;
  return clamp(metrics.frameCoverage * 0.6, 0, 0.9);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
