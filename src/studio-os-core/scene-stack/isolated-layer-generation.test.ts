import { describe, expect, it } from 'vitest';
import {
  getIsolatedLayerContract,
  isIsolatedObjectLayer,
  MAX_ISOLATION_REGENERATION_ATTEMPTS,
  resolveIsolatedLayerReferenceUrls,
  resolveLayerGenerationMode,
} from './isolated-layer-contract';
import { buildIsolatedLayerPromptClauses, resolveIsolatedOutputFormat } from './isolated-layer-prompt';
import { evaluateIsolatedLayerQualityRules } from './isolated-layer-quality';
import { formatLayerQualityFailureMessage } from './quality-guard';
import { getLockedReferenceUrlsForLayer } from './reference-chain';
import { enforceFalReferenceLaw } from './reference-enforcement';
import type { SceneStackLayerId } from './types';

const FIXTURE = {
  validLandmark: {
    alphaChannelPresent: true,
    frameCoverage: 0.35,
    transparentSides: 4,
    fullWidthEdgeContact: false,
    fullHeightEdgeContact: false,
    bakedCheckerboardSuspect: false,
  },
  fullSceneRerender: {
    alphaChannelPresent: false,
    frameCoverage: 0.92,
    transparentSides: 0,
    fullWidthEdgeContact: true,
    fullHeightEdgeContact: true,
    bakedCheckerboardSuspect: false,
  },
  furnitureGroupValid: {
    alphaChannelPresent: true,
    frameCoverage: 0.72,
    transparentSides: 2,
    fullWidthEdgeContact: false,
    fullHeightEdgeContact: false,
    bakedCheckerboardSuspect: false,
  },
  furnitureFullRoom: {
    alphaChannelPresent: false,
    frameCoverage: 0.95,
    transparentSides: 0,
    fullWidthEdgeContact: true,
    fullHeightEdgeContact: true,
    bakedCheckerboardSuspect: false,
  },
  bakedCheckerboard: {
    alphaChannelPresent: true,
    frameCoverage: 0.4,
    transparentSides: 3,
    fullWidthEdgeContact: false,
    fullHeightEdgeContact: false,
    bakedCheckerboardSuspect: true,
  },
  opaqueStudioBg: {
    alphaChannelPresent: false,
    frameCoverage: 0.6,
    transparentSides: 0,
    fullWidthEdgeContact: false,
    fullHeightEdgeContact: false,
    bakedCheckerboardSuspect: false,
  },
  edgeTouchValid: {
    alphaChannelPresent: true,
    frameCoverage: 0.55,
    transparentSides: 3,
    fullWidthEdgeContact: false,
    fullHeightEdgeContact: false,
    bakedCheckerboardSuspect: false,
  },
};

describe('isolated layer contract', () => {
  it('signature-landmark uses isolated-single-object mode', () => {
    expect(resolveLayerGenerationMode('signature-landmark')).toBe('isolated-single-object');
    expect(getIsolatedLayerContract('signature-landmark').generationMode).toBe('isolated-single-object');
  });

  it('furniture-objects uses isolated-object-group mode', () => {
    expect(resolveLayerGenerationMode('furniture-objects')).toBe('isolated-object-group');
    expect(getIsolatedLayerContract('furniture-objects').generationMode).toBe('isolated-object-group');
  });

  it('environment-shell remains full-scene-shell mode', () => {
    expect(resolveLayerGenerationMode('environment-shell')).toBe('full-scene-shell');
  });

  it('isolated object layers require PNG output', () => {
    expect(resolveIsolatedOutputFormat('signature-landmark', 'webp')).toBe('png');
    expect(resolveIsolatedOutputFormat('furniture-objects', 'webp')).toBe('png');
  });

  it('does not pass shell as reference for isolated layers', () => {
    expect(resolveIsolatedLayerReferenceUrls('signature-landmark', 'https://shell.example/a.png')).toEqual([]);
    expect(resolveIsolatedLayerReferenceUrls('furniture-objects', 'https://shell.example/a.png')).toEqual([]);
  });

  it('getLockedReferenceUrlsForLayer returns empty for isolated layers', () => {
    const urls = getLockedReferenceUrlsForLayer(
      'studio-creative-direction',
      'default',
      'executive-atrium',
      'signature-landmark',
      {}
    );
    expect(urls).toEqual([]);
  });

  it('regeneration attempt count is bounded at 2', () => {
    expect(MAX_ISOLATION_REGENERATION_ATTEMPTS).toBe(2);
  });
});

describe('isolated layer prompts', () => {
  it('dedicated isolated prompt excludes room-generation language in positive clause', () => {
    const { isolationClause } = buildIsolatedLayerPromptClauses({
      layerId: 'signature-landmark',
      displayName: 'Signature Landmark™',
      stationName: 'Executive Atrium',
      objectDescription: 'Hero bronze sculpture',
    });
    expect(isolationClause).toMatch(/NO room/i);
    expect(isolationClause).toMatch(/TRANSPARENT BACKGROUND/i);
    expect(isolationClause).not.toMatch(/create the room/i);
    expect(isolationClause).not.toMatch(/render the environment/i);
  });

  it('negative prompt forbids architecture and full scenes', () => {
    const { negativeClause } = buildIsolatedLayerPromptClauses({
      layerId: 'furniture-objects',
      displayName: 'Furniture Objects',
      stationName: 'Executive Atrium',
      objectDescription: 'Desk cluster',
    });
    expect(negativeClause).toMatch(/full room/i);
    expect(negativeClause).toMatch(/ceiling/i);
    expect(negativeClause).toMatch(/photorealistic room/i);
  });

  it('strengthens isolation language on regeneration attempt', () => {
    const first = buildIsolatedLayerPromptClauses({
      layerId: 'signature-landmark',
      displayName: 'Signature Landmark™',
      stationName: 'Atrium',
      objectDescription: 'Sculpture',
      isolationAttempt: 0,
    });
    const second = buildIsolatedLayerPromptClauses({
      layerId: 'signature-landmark',
      displayName: 'Signature Landmark™',
      stationName: 'Atrium',
      objectDescription: 'Sculpture',
      isolationAttempt: 1,
    });
    expect(second.isolationClause).toMatch(/REGENERATION PASS/i);
    expect(second.isolationClause.length).toBeGreaterThan(first.isolationClause.length);
  });
});

describe('reference enforcement', () => {
  it('strips shell reference for isolated layers without blocking', () => {
    const result = enforceFalReferenceLaw({
      departmentId: 'studio-creative-direction',
      projectId: 'default',
      stationId: 'executive-atrium',
      targetLayerId: 'signature-landmark',
      requestedUrls: [],
    });
    expect(result.ok).toBe(true);
    expect(result.sanitizedUrls).toEqual([]);
  });
});

describe('isolated layer quality fixtures', () => {
  function evaluate(layerId: SceneStackLayerId, fixture: keyof typeof FIXTURE, shellSimilarity: number | null = null) {
    const contract = getIsolatedLayerContract(layerId);
    return evaluateIsolatedLayerQualityRules({
      layerId,
      contract,
      metrics: FIXTURE[fixture],
      shellSimilarity,
    });
  }

  it('valid isolated landmark passes', () => {
    const result = evaluate('signature-landmark', 'validLandmark');
    expect(result.classification).toBe('isolated-valid');
    expect(result.issues).toHaveLength(0);
  });

  it('full-scene rerender is classified correctly', () => {
    const result = evaluate('signature-landmark', 'fullSceneRerender', 0.9);
    expect(result.classification).toBe('full-scene-rerender');
    expect(result.issues.some((i) => i.includes('REGENERATE REQUIRED'))).toBe(true);
  });

  it('valid furniture group passes', () => {
    const result = evaluate('furniture-objects', 'furnitureGroupValid');
    expect(result.classification).toBe('isolated-valid');
  });

  it('furniture full-room rerender fails', () => {
    const result = evaluate('furniture-objects', 'furnitureFullRoom');
    expect(result.classification).toBe('full-scene-rerender');
  });

  it('baked checkerboard is rejected', () => {
    const result = evaluate('signature-landmark', 'bakedCheckerboard');
    expect(result.classification).toBe('baked-checkerboard');
  });

  it('opaque studio background is rejected', () => {
    const result = evaluate('signature-landmark', 'opaqueStudioBg');
    expect(result.classification).toBe('opaque-background');
  });

  it('object touching one edge can still pass when otherwise valid', () => {
    const result = evaluate('signature-landmark', 'edgeTouchValid');
    expect(result.classification).toBe('isolated-valid');
  });

  it('high shell similarity with coverage triggers full-scene-rerender', () => {
    const contract = getIsolatedLayerContract('signature-landmark');
    const result = evaluateIsolatedLayerQualityRules({
      layerId: 'signature-landmark',
      contract,
      metrics: {
        ...FIXTURE.validLandmark,
        frameCoverage: 0.55,
      },
      shellSimilarity: 0.88,
    });
    expect(result.classification).toBe('full-scene-rerender');
  });
});

describe('layer quality failure messaging', () => {
  it('UI identifies landmark full-scene failure with precise reason', () => {
    const msg = formatLayerQualityFailureMessage('signature-landmark', 'Signature Landmark™', {
      status: 'regenerate_required',
      issues: ['full scene'],
      classification: 'full-scene-rerender',
      metrics: {
        width: 1024,
        height: 1024,
        frameCoverage: 0.9,
        shellSimilarity: 0.9,
        edgeSharpness: 3,
      },
    });
    expect(msg).toMatch(/Signature Landmark™ rejected/i);
    expect(msg).toMatch(/full-scene background/i);
    expect(msg).toMatch(/isolated landmark/i);
  });
});

describe('isolated layer identity', () => {
  it('only signature-landmark and furniture-objects are isolated object layers', () => {
    expect(isIsolatedObjectLayer('signature-landmark')).toBe(true);
    expect(isIsolatedObjectLayer('furniture-objects')).toBe(true);
    expect(isIsolatedObjectLayer('environment-shell')).toBe(false);
    expect(isIsolatedObjectLayer('lighting-systems')).toBe(false);
  });
});
