import type { IsolatedLayerImageMetrics } from '../isolated-layer-quality';
import type { BackgroundClassification } from './contract';

export type BackgroundClassificationInput = {
  metrics: IsolatedLayerImageMetrics;
  fullSceneLikelihood: number;
  shellSimilarity: number | null;
};

export type BackgroundClassificationResult = {
  classification: BackgroundClassification;
  extractionEligible: boolean;
  cleanupRequired: boolean;
  safeExplanation: string;
};

export function classifyAssetBackground(input: BackgroundClassificationInput): BackgroundClassificationResult {
  const { metrics, fullSceneLikelihood, shellSimilarity } = input;

  if (metrics.bakedCheckerboardSuspect) {
    return {
      classification: 'FAKE_TRANSPARENCY',
      extractionEligible: false,
      cleanupRequired: false,
      safeExplanation: 'Checkerboard or matte transparency baked into pixels.',
    };
  }

  if (fullSceneLikelihood >= 0.78 && metrics.frameCoverage > 0.75) {
    return {
      classification: 'FULL_SCENE_RERENDER',
      extractionEligible: false,
      cleanupRequired: false,
      safeExplanation: 'Complete room or shell reproduction — not eligible for background removal.',
    };
  }

  if (shellSimilarity !== null && shellSimilarity > 0.82 && metrics.frameCoverage > 0.45) {
    return {
      classification: 'FULL_SCENE_RERENDER',
      extractionEligible: false,
      cleanupRequired: false,
      safeExplanation: 'Complete room or shell reproduction — not eligible for background removal.',
    };
  }

  if (
    metrics.frameCoverage > 0.75 &&
    metrics.transparentSides < 2 &&
    (metrics.fullWidthEdgeContact || metrics.fullHeightEdgeContact)
  ) {
    return {
      classification: 'ENVIRONMENT_FUSED',
      extractionEligible: false,
      cleanupRequired: false,
      safeExplanation: 'Object visually fused with architectural environment.',
    };
  }

  if (metrics.alphaChannelPresent && metrics.transparentSides >= 3 && metrics.cornerOpacityAvg < 40) {
    return {
      classification: 'NATIVE_ALPHA',
      extractionEligible: false,
      cleanupRequired: false,
      safeExplanation: 'Native transparent alpha channel is usable.',
    };
  }

  const opaqueRatio = 1 - (metrics.alphaChannelPresent ? 0.15 : 0);
  const cornerOpaque = metrics.cornerOpacityAvg > 220;
  const uniformBackground =
    metrics.avgLuminance > 200 || metrics.avgLuminance < 35 || (cornerOpaque && metrics.transparentSides <= 1);

  if (uniformBackground && metrics.frameCoverage < 0.72 && fullSceneLikelihood < 0.55) {
    return {
      classification: 'SIMPLE_SOLID_BACKGROUND',
      extractionEligible: true,
      cleanupRequired: true,
      safeExplanation: 'Simple studio-like background suitable for governed extraction.',
    };
  }

  if (
    metrics.transparentSides <= 1 &&
    metrics.avgLuminance > 120 &&
    metrics.avgLuminance < 200 &&
    fullSceneLikelihood < 0.5
  ) {
    return {
      classification: 'SIMPLE_GRADIENT_BACKGROUND',
      extractionEligible: true,
      cleanupRequired: true,
      safeExplanation: 'Gradient background potentially extraction-eligible.',
    };
  }

  if (metrics.frameCoverage < 0.65 && metrics.transparentSides >= 1 && fullSceneLikelihood < 0.45) {
    return {
      classification: 'SHADOW_PLANE_ONLY',
      extractionEligible: metrics.frameCoverage < 0.55,
      cleanupRequired: metrics.frameCoverage < 0.55,
      safeExplanation: 'Shadow plane only — salvageable if object boundaries are separable.',
    };
  }

  if (fullSceneLikelihood > 0.45 || opaqueRatio > 0.85) {
    return {
      classification: 'COMPLEX_NONARCHITECTURAL_BACKGROUND',
      extractionEligible: false,
      cleanupRequired: false,
      safeExplanation: 'Complex background — manual or advanced extraction may be required.',
    };
  }

  return {
    classification: 'UNKNOWN_LOW_CONFIDENCE',
    extractionEligible: false,
    cleanupRequired: false,
    safeExplanation: 'Background type cannot be determined safely.',
  };
}

export function isExtractionEligible(classification: BackgroundClassification): boolean {
  return (
    classification === 'NATIVE_ALPHA' ||
    classification === 'SIMPLE_SOLID_BACKGROUND' ||
    classification === 'SIMPLE_GRADIENT_BACKGROUND' ||
    classification === 'SHADOW_PLANE_ONLY'
  );
}

export function mustRejectBeforeCleanup(classification: BackgroundClassification): boolean {
  return (
    classification === 'ENVIRONMENT_FUSED' ||
    classification === 'FULL_SCENE_RERENDER' ||
    classification === 'FAKE_TRANSPARENCY' ||
    classification === 'UNKNOWN_LOW_CONFIDENCE' ||
    classification === 'COMPLEX_NONARCHITECTURAL_BACKGROUND'
  );
}
