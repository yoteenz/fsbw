import { describe, expect, it } from 'vitest';
import {
  assertProductionStageTransition,
  classifyAssetBackground,
  evaluateAssetApproval,
  mustRejectBeforeCleanup,
  validateAssetIdentity,
  validateAssetStructure,
  validatePostprocessAsset,
  decideRecoveryAction,
  assertMountRequiresApprovalProof,
  buildApprovalProof,
  isExtractionEligible,
} from './index';
import {
  FIXTURE_CROPPED_LANDMARK,
  FIXTURE_FAKE_CHECKERBOARD,
  FIXTURE_FULL_SCENE_RERENDER,
  FIXTURE_FURNITURE_GROUP,
  FIXTURE_NATIVE_ALPHA_LANDMARK,
  FIXTURE_SOLID_BACKGROUND_LANDMARK,
} from './fixtures';
import type { AssetCandidateRecord } from './contract';
import { ASSET_APPROVAL_POLICY_VERSION } from './contract';

function baseCandidate(overrides: Partial<AssetCandidateRecord> = {}): AssetCandidateRecord {
  return {
    assetCandidateId: 'cand-test-1',
    organizationId: 'frontal-slayer',
    stationId: 'story-table',
    projectId: 'proj-1',
    layerId: 'signature-landmark',
    layerType: 'signature-landmark',
    requestedAssetClass: 'signature-landmark',
    requestedAssetDescription: 'marble sculpture centerpiece',
    promptVersion: 'isolated-asset-prompt.v2',
    provider: 'fal',
    sourceUrl: 'https://example.com/candidate.png',
    originalMimeType: 'image/png',
    originalWidth: 1024,
    originalHeight: 1024,
    alphaPresent: true,
    backgroundClassification: 'NATIVE_ALPHA',
    identityClassification: 'identity-match',
    structuralClassification: 'structurally-valid',
    qualityClassification: 'isolated-valid',
    cleanupRequired: false,
    postprocessClassification: 'not-required',
    approvalStatus: 'pending',
    mountStatus: 'unmounted',
    sceneValidationStatus: 'pending',
    regenerationAttempt: 0,
    productionStage: 'POSTPROCESS_VALIDATING',
    registryState: 'candidate',
    createdAt: new Date().toISOString(),
    identityMatch: true,
    identityConfidence: 0.85,
    detectedObjectClasses: ['signature-landmark-object'],
    requestedObjectDetected: true,
    unrelatedObjectDominance: 0.1,
    fullSceneLikelihood: 0.2,
    safeExplanation: 'ok',
    opaquePixelRatio: 0.2,
    frameCoverage: 0.32,
    shellSimilarity: 0.2,
    likelyArchitectureDetected: false,
    ...overrides,
  };
}

describe('verified asset production state machine', () => {
  it('rejects GENERATED_CANDIDATE → MOUNTING', () => {
    const r = assertProductionStageTransition('GENERATED_CANDIDATE', 'MOUNTING');
    expect(r.ok).toBe(false);
  });

  it('allows GENERATED_CANDIDATE → IDENTITY_VALIDATING', () => {
    const r = assertProductionStageTransition('GENERATED_CANDIDATE', 'IDENTITY_VALIDATING');
    expect(r.ok).toBe(true);
  });

  it('rejects GENERATING → REGISTERED', () => {
    const r = assertProductionStageTransition('GENERATING', 'REGISTERED');
    expect(r.ok).toBe(false);
  });
});

describe('identity validation', () => {
  it('passes correct landmark identity', () => {
    const r = validateAssetIdentity({
      layerId: 'signature-landmark',
      requestedAssetDescription: 'marble sculpture',
      metrics: FIXTURE_NATIVE_ALPHA_LANDMARK,
      shellSimilarity: 0.2,
    });
    expect(r.identityMatch).toBe(true);
    expect(r.requestedObjectDetected).toBe(true);
  });

  it('rejects full-scene output', () => {
    const r = validateAssetIdentity({
      layerId: 'signature-landmark',
      requestedAssetDescription: 'marble sculpture',
      metrics: FIXTURE_FULL_SCENE_RERENDER,
      shellSimilarity: 0.88,
    });
    expect(r.identityMatch).toBe(false);
    expect(r.classification).toBe('architecture-dominant');
  });

  it('rejects cropped landmark', () => {
    const r = validateAssetIdentity({
      layerId: 'signature-landmark',
      requestedAssetDescription: 'marble sculpture',
      metrics: FIXTURE_CROPPED_LANDMARK,
      shellSimilarity: null,
    });
    expect(r.identityMatch).toBe(false);
    expect(r.classification).toBe('missing-object');
  });
});

describe('structural validation', () => {
  it('passes salvageable opaque studio plate before cleanup', () => {
    const r = validateAssetStructure({
      layerId: 'signature-landmark',
      metrics: FIXTURE_SOLID_BACKGROUND_LANDMARK,
      fullSceneLikelihood: 0.3,
    });
    expect(r.valid).toBe(true);
    expect(r.classification).toBe('structurally-valid');
  });

  it('rejects full-scene before cleanup', () => {
    const r = validateAssetStructure({
      layerId: 'signature-landmark',
      metrics: FIXTURE_FULL_SCENE_RERENDER,
      fullSceneLikelihood: 0.9,
    });
    expect(r.valid).toBe(false);
    expect(r.classification).toBe('full-scene');
  });

  it('passes valid furniture group', () => {
    const r = validateAssetStructure({
      layerId: 'furniture-objects',
      metrics: FIXTURE_FURNITURE_GROUP,
      fullSceneLikelihood: 0.25,
    });
    expect(r.valid).toBe(true);
  });
});

describe('background classification', () => {
  it('marks simple solid background extraction-eligible', () => {
    const r = classifyAssetBackground({
      metrics: FIXTURE_SOLID_BACKGROUND_LANDMARK,
      fullSceneLikelihood: 0.3,
      shellSimilarity: 0.2,
    });
    expect(r.extractionEligible).toBe(true);
    expect(r.cleanupRequired).toBe(true);
  });

  it('rejects full-scene before cleanup', () => {
    const r = classifyAssetBackground({
      metrics: FIXTURE_FULL_SCENE_RERENDER,
      fullSceneLikelihood: 0.9,
      shellSimilarity: 0.88,
    });
    expect(mustRejectBeforeCleanup(r.classification)).toBe(true);
    expect(r.classification).toBe('FULL_SCENE_RERENDER');
  });

  it('detects fake transparency', () => {
    const r = classifyAssetBackground({
      metrics: FIXTURE_FAKE_CHECKERBOARD,
      fullSceneLikelihood: 0.2,
      shellSimilarity: null,
    });
    expect(r.classification).toBe('FAKE_TRANSPARENCY');
    expect(isExtractionEligible(r.classification)).toBe(false);
  });
});

describe('postprocess validation', () => {
  it('passes valid cleaned alpha', () => {
    const r = validatePostprocessAsset({
      metrics: FIXTURE_NATIVE_ALPHA_LANDMARK,
      priorMetrics: FIXTURE_SOLID_BACKGROUND_LANDMARK,
      cleanupUsed: true,
    });
    expect(r.valid).toBe(true);
    expect(r.classification).toBe('cleanup-valid');
  });

  it('rejects halo damage', () => {
    const prior = { ...FIXTURE_SOLID_BACKGROUND_LANDMARK, edgeSharpness: 20 };
    const damaged = { ...FIXTURE_NATIVE_ALPHA_LANDMARK, edgeSharpness: 2 };
    const r = validatePostprocessAsset({
      metrics: damaged,
      priorMetrics: prior,
      cleanupUsed: true,
    });
    expect(r.valid).toBe(false);
    expect(r.classification).toBe('halo-damage');
  });
});

describe('approval gate', () => {
  it('defaults to deny without proof fields', () => {
    const r = evaluateAssetApproval({
      candidate: baseCandidate({ assetCandidateId: '' }),
      identityMatch: false,
      identityConfidence: 0.3,
      identityClassification: 'wrong-asset',
      structuralClassification: 'malformed',
      structuralValid: false,
      backgroundClassification: 'FULL_SCENE_RERENDER',
      postprocessClassification: 'cleanup-failed',
      postprocessValid: false,
      fullSceneLikelihood: 0.9,
      shellSimilarity: 0.9,
      mountMetadataPresent: false,
      organizationId: '',
    });
    expect(r.approved).toBe(false);
    expect(r.deniedReasons.length).toBeGreaterThan(0);
  });

  it('approves valid isolated landmark', () => {
    const candidate = baseCandidate();
    const r = evaluateAssetApproval({
      candidate,
      identityMatch: true,
      identityConfidence: 0.85,
      identityClassification: 'identity-match',
      structuralClassification: 'structurally-valid',
      structuralValid: true,
      backgroundClassification: 'NATIVE_ALPHA',
      postprocessClassification: 'not-required',
      postprocessValid: true,
      fullSceneLikelihood: 0.2,
      shellSimilarity: 0.2,
      mountMetadataPresent: true,
      organizationId: 'frontal-slayer',
    });
    expect(r.approved).toBe(true);
    expect(r.approvalPolicyVersion).toBe(ASSET_APPROVAL_POLICY_VERSION);
  });
});

describe('mount enforcement', () => {
  it('requires approval proof for mount', () => {
    expect(assertMountRequiresApprovalProof(null).ok).toBe(false);
    expect(
      assertMountRequiresApprovalProof(
        buildApprovalProof(
          baseCandidate(),
          'NATIVE_ALPHA',
          'structurally-valid',
          'not-required',
          'https://example.com/approved.png'
        )
      ).ok
    ).toBe(true);
  });
});

describe('regeneration decisions', () => {
  it('wrong asset regenerates', () => {
    const d = decideRecoveryAction({
      identityClassification: 'wrong-asset',
      structuralClassification: 'structurally-valid',
      backgroundClassification: 'SIMPLE_SOLID_BACKGROUND',
      postprocessClassification: 'not-required',
      regenerationAttempt: 0,
      cleanupAttempt: 0,
    });
    expect(d.action).toBe('regenerate');
    expect(d.failureState).toBe('REJECTED_WRONG_ASSET');
  });

  it('full scene never enters background removal path', () => {
    const d = decideRecoveryAction({
      identityClassification: 'architecture-dominant',
      structuralClassification: 'full-scene',
      backgroundClassification: 'FULL_SCENE_RERENDER',
      postprocessClassification: 'cleanup-failed',
      regenerationAttempt: 0,
      cleanupAttempt: 0,
    });
    expect(d.action).toBe('regenerate');
    expect(d.action).not.toBe('background-removal');
  });

  it('placement failure remounts without regenerate', () => {
    const d = decideRecoveryAction({
      identityClassification: 'identity-match',
      structuralClassification: 'structurally-valid',
      backgroundClassification: 'NATIVE_ALPHA',
      postprocessClassification: 'not-required',
      placementFailure: true,
      assetValid: true,
      regenerationAttempt: 0,
      cleanupAttempt: 0,
    });
    expect(d.action).toBe('remount');
  });

  it('bounds regeneration attempts', () => {
    const d = decideRecoveryAction({
      identityClassification: 'low-confidence',
      structuralClassification: 'structurally-valid',
      backgroundClassification: 'UNKNOWN_LOW_CONFIDENCE',
      postprocessClassification: 'not-required',
      regenerationAttempt: 2,
      cleanupAttempt: 0,
    });
    expect(d.action).toBe('stop');
  });
});
