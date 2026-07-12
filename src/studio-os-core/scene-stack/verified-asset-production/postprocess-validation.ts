import type { IsolatedLayerImageMetrics } from '../isolated-layer-quality';
import type { PostprocessClassification } from './contract';

export type PostprocessValidationInput = {
  metrics: IsolatedLayerImageMetrics;
  priorMetrics?: IsolatedLayerImageMetrics;
  cleanupUsed: boolean;
};

export type PostprocessValidationResult = {
  classification: PostprocessClassification;
  valid: boolean;
  issues: string[];
  alphaPresent: boolean;
  transparentMargin: number;
  haloSuspect: boolean;
  objectIntegrityPreserved: boolean;
};

export function validatePostprocessAsset(input: PostprocessValidationInput): PostprocessValidationResult {
  const { metrics, priorMetrics, cleanupUsed } = input;
  const issues: string[] = [];

  if (!cleanupUsed) {
    const valid = metrics.alphaChannelPresent && metrics.transparentSides >= 2;
    return {
      classification: 'not-required',
      valid,
      issues: valid ? [] : ['Native alpha insufficient without cleanup.'],
      alphaPresent: metrics.alphaChannelPresent,
      transparentMargin: metrics.transparentSides,
      haloSuspect: false,
      objectIntegrityPreserved: true,
    };
  }

  if (metrics.bakedCheckerboardSuspect) {
    return {
      classification: 'fake-alpha',
      valid: false,
      issues: ['Fake checkerboard alpha detected after cleanup.'],
      alphaPresent: false,
      transparentMargin: metrics.transparentSides,
      haloSuspect: true,
      objectIntegrityPreserved: false,
    };
  }

  if (!metrics.alphaChannelPresent || metrics.transparentSides < 2) {
    issues.push('Insufficient alpha channel after cleanup.');
  }

  if (metrics.cornerOpacityAvg > 180 && metrics.transparentSides < 2) {
    issues.push('Large residual background regions remain.');
  }

  const haloSuspect =
    metrics.edgeSharpness < (priorMetrics?.edgeSharpness ?? metrics.edgeSharpness) * 0.45 &&
    metrics.alphaChannelPresent;

  if (haloSuspect) {
    issues.push('Edge halo or matte damage suspected.');
  }

  const coverageDrop =
    priorMetrics && priorMetrics.frameCoverage > 0.1
      ? metrics.frameCoverage < priorMetrics.frameCoverage * 0.55
      : false;

  if (coverageDrop) {
    issues.push('Object section may have been deleted during cleanup.');
    return {
      classification: 'object-damage',
      valid: false,
      issues,
      alphaPresent: metrics.alphaChannelPresent,
      transparentMargin: metrics.transparentSides,
      haloSuspect,
      objectIntegrityPreserved: false,
    };
  }

  if (metrics.frameCoverage > 0.78 && metrics.transparentSides < 2) {
    issues.push('Architectural residue remains after cleanup.');
    return {
      classification: 'environment-remnant',
      valid: false,
      issues,
      alphaPresent: metrics.alphaChannelPresent,
      transparentMargin: metrics.transparentSides,
      haloSuspect,
      objectIntegrityPreserved: false,
    };
  }

  if (haloSuspect) {
    return {
      classification: 'halo-damage',
      valid: false,
      issues,
      alphaPresent: metrics.alphaChannelPresent,
      transparentMargin: metrics.transparentSides,
      haloSuspect: true,
      objectIntegrityPreserved: true,
    };
  }

  const valid =
    metrics.alphaChannelPresent &&
    metrics.transparentSides >= 2 &&
    metrics.cornerOpacityAvg < 120 &&
    issues.length === 0;

  return {
    classification: valid ? 'cleanup-valid' : 'cleanup-failed',
    valid,
    issues,
    alphaPresent: metrics.alphaChannelPresent,
    transparentMargin: metrics.transparentSides,
    haloSuspect,
    objectIntegrityPreserved: !coverageDrop,
  };
}
