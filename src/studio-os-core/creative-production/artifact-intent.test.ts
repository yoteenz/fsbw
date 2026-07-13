import { describe, expect, it } from 'vitest';
import {
  allowsFullSceneOutput,
  requiresIsolatedObjectValidation,
  resolveArtifactIntent,
  validatorExistsForIntent,
} from './artifact-intent';
import { isSalvageableOpaqueStudioPlate } from '../scene-stack/verified-asset-production/salvageable-opaque';
import { validateAssetStructure } from '../scene-stack/verified-asset-production/structural-validation';
import { FIXTURE_SOLID_BACKGROUND_LANDMARK } from '../scene-stack/verified-asset-production/fixtures';

describe('artifact intent contract', () => {
  it('environment-shell uses environment-shell intent', () => {
    expect(resolveArtifactIntent({ layerId: 'environment-shell' })).toBe('environment-shell');
    expect(allowsFullSceneOutput('environment-shell')).toBe(true);
    expect(requiresIsolatedObjectValidation('environment-shell')).toBe(false);
  });

  it('signature-landmark uses isolated-object intent', () => {
    expect(resolveArtifactIntent({ layerId: 'signature-landmark' })).toBe('isolated-object');
    expect(requiresIsolatedObjectValidation('isolated-object')).toBe(true);
  });

  it('furniture-objects uses object-group intent', () => {
    expect(resolveArtifactIntent({ layerId: 'furniture-objects' })).toBe('object-group');
  });

  it('CDS campaign composite skips isolated-object validation', () => {
    const intent = resolveArtifactIntent({
      layerId: 'lighting-systems',
      creativeStudioStackMode: true,
      cdsArtifactClass: 'campaign-composite',
    });
    expect(intent).toBe('campaign-composite');
    expect(requiresIsolatedObjectValidation(intent)).toBe(false);
    expect(allowsFullSceneOutput(intent)).toBe(true);
  });

  it('validator registry covers all intents', () => {
    const intents = [
      'final-scene',
      'environment-shell',
      'isolated-object',
      'object-group',
      'campaign-composite',
      'logo-component',
    ] as const;
    for (const intent of intents) {
      expect(validatorExistsForIntent(intent)).toBe(true);
    }
  });
});

describe('salvageable opaque studio plate', () => {
  it('defers structural transparent-margin rejection before cleanup', () => {
    const structure = validateAssetStructure({
      layerId: 'signature-landmark',
      metrics: FIXTURE_SOLID_BACKGROUND_LANDMARK,
      fullSceneLikelihood: 0.3,
    });
    expect(structure.valid).toBe(true);
    expect(structure.classification).toBe('structurally-valid');
  });

  it('still rejects true full-scene plates', () => {
    const salvageable = isSalvageableOpaqueStudioPlate({
      layerId: 'signature-landmark',
      metrics: {
        alphaChannelPresent: false,
        frameCoverage: 0.95,
        transparentSides: 0,
        fullWidthEdgeContact: true,
        fullHeightEdgeContact: true,
        bakedCheckerboardSuspect: false,
      },
      fullSceneLikelihood: 0.9,
    });
    expect(salvageable).toBe(false);
  });
});
