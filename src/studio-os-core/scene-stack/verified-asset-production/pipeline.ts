import { analyzeIsolatedLayerQuality } from '../isolated-layer-quality';
import { isIsolatedObjectLayer } from '../isolated-layer-contract';
import type { SceneStackLayerId } from '../types';
import { validateAssetIdentity } from './identity-validation';
import { validateAssetStructure } from './structural-validation';
import { classifyAssetBackground, mustRejectBeforeCleanup } from './background-classification';
import { validatePostprocessAsset } from './postprocess-validation';
import { buildApprovalProof, evaluateAssetApproval } from './approval-gate';
import { decideRecoveryAction } from './regeneration-decisions';
import { quarantineRejectedCandidate } from './quarantine';
import { assertProductionStageTransition } from './state-machine';
import { emitVerifiedAssetImmuneEvent } from './immune-events';
import {
  type AssetCandidateRecord,
  type VerifiedAssetProductionResult,
  type VerifiedAssetProductionStage,
  VERIFIED_ASSET_PRODUCTION_VERSION,
} from './contract';

export type BackgroundCleanupRequest = (
  sourceUrl: string,
  assetCandidateId: string
) => Promise<{ ok: true; cleanedUrl: string; method?: 'ideogram' | 'white-studio-fallback' } | { ok: false; error: string }>;

export type VerifiedAssetPipelineInput = {
  layerId: SceneStackLayerId;
  candidateUrl: string;
  requestedAssetDescription: string;
  shellReferenceUrl?: string | null;
  departmentId: string;
  stationId: string;
  projectId: string;
  organizationId: string;
  promptVersion: string;
  providerModel?: string;
  generationMode?: string;
  jobId?: string | null;
  providerRequestId?: string | null;
  compileRunId?: string | null;
  regenerationAttempt?: number;
  cleanupAttempt?: number;
  onStageChange?: (stage: VerifiedAssetProductionStage, label: string) => void;
  requestBackgroundCleanup?: BackgroundCleanupRequest;
};

function candidateId(): string {
  return `cand-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function transition(
  from: VerifiedAssetProductionStage,
  to: VerifiedAssetProductionStage
): void {
  const result = assertProductionStageTransition(from, to);
  if (!result.ok) {
    throw new Error(result.reason);
  }
}

export async function runVerifiedAssetProductionPipeline(
  input: VerifiedAssetPipelineInput
): Promise<VerifiedAssetProductionResult> {
  const regenerationAttempt = input.regenerationAttempt ?? 0;
  const cleanupAttempt = input.cleanupAttempt ?? 0;
  const assetCandidateId = candidateId();

  let stage: VerifiedAssetProductionStage = 'GENERATED_CANDIDATE';
  input.onStageChange?.(stage, 'Inspecting delivered asset');

  emitVerifiedAssetImmuneEvent('AssetCandidateGenerated', {
    layerId: input.layerId,
    stationId: input.stationId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    assetCandidateId,
    stage,
  });

  const quality = await analyzeIsolatedLayerQuality({
    layerId: input.layerId,
    publicUrl: input.candidateUrl,
    shellReferenceUrl: input.shellReferenceUrl,
  });

  transition(stage, 'IDENTITY_VALIDATING');
  stage = 'IDENTITY_VALIDATING';
  input.onStageChange?.(stage, 'Verifying requested object');

  const identity = validateAssetIdentity({
    layerId: input.layerId,
    requestedAssetDescription: input.requestedAssetDescription,
    metrics: quality.metrics,
    shellSimilarity: quality.metrics.shellSimilarity,
  });

  emitVerifiedAssetImmuneEvent('AssetIdentityChecked', {
    layerId: input.layerId,
    stationId: input.stationId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    assetCandidateId,
    stage,
    classification: identity.classification,
    message: identity.safeExplanation,
  });

  if (!identity.identityMatch && isIsolatedObjectLayer(input.layerId)) {
    emitVerifiedAssetImmuneEvent('WrongAssetDetected', {
      layerId: input.layerId,
      stationId: input.stationId,
      departmentId: input.departmentId,
      projectId: input.projectId,
      assetCandidateId,
      classification: identity.classification,
    });
    return rejectCandidate({
      input,
      assetCandidateId,
      stage,
      identity,
      quality,
      regenerationAttempt,
      cleanupAttempt,
      failureReason: identity.safeExplanation,
      failureState:
        identity.classification === 'architecture-dominant' || identity.fullSceneLikelihood >= 0.78
          ? 'REJECTED_FULL_SCENE'
          : 'REJECTED_WRONG_ASSET',
    });
  }

  transition(stage, 'STRUCTURE_VALIDATING');
  stage = 'STRUCTURE_VALIDATING';
  input.onStageChange?.(stage, 'Checking object structure');

  const structure = validateAssetStructure({
    layerId: input.layerId,
    metrics: quality.metrics,
    fullSceneLikelihood: identity.fullSceneLikelihood,
  });

  emitVerifiedAssetImmuneEvent('AssetStructureChecked', {
    layerId: input.layerId,
    stationId: input.stationId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    assetCandidateId,
    stage,
    classification: structure.classification,
    message: structure.issues.join(' '),
  });

  if (!structure.valid && isIsolatedObjectLayer(input.layerId)) {
    if (structure.classification === 'full-scene' || structure.classification === 'fused-with-environment') {
      emitVerifiedAssetImmuneEvent('FullSceneDetected', {
        layerId: input.layerId,
        stationId: input.stationId,
        departmentId: input.departmentId,
        projectId: input.projectId,
        assetCandidateId,
        classification: structure.classification,
      });
    }
    return rejectCandidate({
      input,
      assetCandidateId,
      stage,
      identity,
      quality,
      structure,
      regenerationAttempt,
      cleanupAttempt,
      failureReason: structure.issues.join(' ') || 'Structural validation failed.',
      failureState: 'REJECTED_DAMAGED',
    });
  }

  transition(stage, 'BACKGROUND_CLASSIFYING');
  stage = 'BACKGROUND_CLASSIFYING';
  input.onStageChange?.(stage, 'Classifying background');

  const background = classifyAssetBackground({
    metrics: quality.metrics,
    fullSceneLikelihood: identity.fullSceneLikelihood,
    shellSimilarity: quality.metrics.shellSimilarity,
  });

  emitVerifiedAssetImmuneEvent('BackgroundClassified', {
    layerId: input.layerId,
    stationId: input.stationId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    assetCandidateId,
    stage,
    classification: background.classification,
    message: background.safeExplanation,
  });

  if (mustRejectBeforeCleanup(background.classification) && isIsolatedObjectLayer(input.layerId)) {
    if (background.classification === 'FULL_SCENE_RERENDER' || background.classification === 'ENVIRONMENT_FUSED') {
      emitVerifiedAssetImmuneEvent('FullSceneDetected', {
        layerId: input.layerId,
        stationId: input.stationId,
        departmentId: input.departmentId,
        projectId: input.projectId,
        assetCandidateId,
        classification: background.classification,
      });
    }
    return rejectCandidate({
      input,
      assetCandidateId,
      stage,
      identity,
      quality,
      structure,
      background,
      regenerationAttempt,
      cleanupAttempt,
      failureReason: background.safeExplanation,
      failureState: 'REJECTED_FULL_SCENE',
    });
  }

  let approvedUrl = input.candidateUrl;
  let cleanupUsed = false;
  let cleanupMethod: AssetCandidateRecord['cleanupMethod'] = 'none';
  let postprocessValid = true;
  let postprocessClassification = validatePostprocessAsset({
    metrics: quality.metrics,
    cleanupUsed: false,
  }).classification;

  const needsCleanup =
    isIsolatedObjectLayer(input.layerId) &&
    background.cleanupRequired &&
    background.extractionEligible &&
    input.requestBackgroundCleanup;

  if (needsCleanup && input.requestBackgroundCleanup) {
    emitVerifiedAssetImmuneEvent('SimpleBackgroundDetected', {
      layerId: input.layerId,
      stationId: input.stationId,
      departmentId: input.departmentId,
      projectId: input.projectId,
      assetCandidateId,
      classification: background.classification,
    });
    emitVerifiedAssetImmuneEvent('BackgroundRemovalRequested', {
      layerId: input.layerId,
      stationId: input.stationId,
      departmentId: input.departmentId,
      projectId: input.projectId,
      assetCandidateId,
    });

    transition(stage, 'BACKGROUND_REMOVING');
    stage = 'BACKGROUND_REMOVING';
    input.onStageChange?.(stage, 'Removing background');
    emitVerifiedAssetImmuneEvent('BackgroundRemovalStarted', {
      layerId: input.layerId,
      stationId: input.stationId,
      departmentId: input.departmentId,
      projectId: input.projectId,
      assetCandidateId,
    });

    const cleanup = await input.requestBackgroundCleanup(input.candidateUrl, assetCandidateId);
    if (!cleanup.ok) {
      return rejectCandidate({
        input,
        assetCandidateId,
        stage,
        identity,
        quality,
        structure,
        background,
        regenerationAttempt,
        cleanupAttempt,
        failureReason: cleanup.error,
        failureState: 'REJECTED_BACKGROUND',
      });
    }

    cleanupUsed = true;
    cleanupMethod = cleanup.method ?? 'ideogram';
    approvedUrl = cleanup.cleanedUrl;

    transition(stage, 'POSTPROCESS_VALIDATING');
    stage = 'POSTPROCESS_VALIDATING';
    input.onStageChange?.(stage, 'Inspecting cleaned asset');

    const cleanedQuality = await analyzeIsolatedLayerQuality({
      layerId: input.layerId,
      publicUrl: approvedUrl,
      shellReferenceUrl: input.shellReferenceUrl,
    });

    const postprocess = validatePostprocessAsset({
      metrics: cleanedQuality.metrics,
      priorMetrics: quality.metrics,
      cleanupUsed: true,
    });

    postprocessValid = postprocess.valid;
    postprocessClassification = postprocess.classification;

    emitVerifiedAssetImmuneEvent('AssetPostprocessChecked', {
      layerId: input.layerId,
      stationId: input.stationId,
      departmentId: input.departmentId,
      projectId: input.projectId,
      assetCandidateId,
      stage,
      classification: postprocess.classification,
      message: postprocess.issues.join(' '),
    });

    if (!postprocess.valid) {
      if (postprocess.classification === 'halo-damage' || postprocess.classification === 'object-damage') {
        emitVerifiedAssetImmuneEvent('CleanupDamageDetected', {
          layerId: input.layerId,
          stationId: input.stationId,
          departmentId: input.departmentId,
          projectId: input.projectId,
          assetCandidateId,
          classification: postprocess.classification,
        });
      }
      return rejectCandidate({
        input,
        assetCandidateId,
        stage,
        identity,
        quality: cleanedQuality,
        structure,
        background,
        postprocess,
        regenerationAttempt,
        cleanupAttempt: cleanupAttempt + 1,
        failureReason: postprocess.issues.join(' ') || 'Post-cleanup validation failed.',
        failureState: 'REJECTED_BACKGROUND',
        cleanedUrl: approvedUrl,
        cleanupMethod,
      });
    }
  } else {
    transition(stage, 'POSTPROCESS_VALIDATING');
    stage = 'POSTPROCESS_VALIDATING';
    const postprocess = validatePostprocessAsset({ metrics: quality.metrics, cleanupUsed: false });
    postprocessValid = postprocess.valid;
    postprocessClassification = postprocess.classification;
    emitVerifiedAssetImmuneEvent('AssetPostprocessChecked', {
      layerId: input.layerId,
      stationId: input.stationId,
      departmentId: input.departmentId,
      projectId: input.projectId,
      assetCandidateId,
      stage,
      classification: postprocess.classification,
    });
  }

  const candidate = buildCandidateRecord({
    input,
    assetCandidateId,
    identity,
    quality,
    structure,
    background,
    regenerationAttempt,
    cleanupUsed,
    cleanupMethod,
    cleanedUrl: cleanupUsed ? approvedUrl : null,
    postprocessClassification,
    stage: 'POSTPROCESS_VALIDATING',
  });

  const approval = evaluateAssetApproval({
    candidate,
    identityMatch: identity.identityMatch,
    identityConfidence: identity.confidence,
    identityClassification: identity.classification,
    structuralClassification: structure.classification,
    structuralValid: structure.valid,
    backgroundClassification: background.classification,
    postprocessClassification,
    postprocessValid,
    fullSceneLikelihood: identity.fullSceneLikelihood,
    shellSimilarity: quality.metrics.shellSimilarity,
    mountMetadataPresent: true,
    organizationId: input.organizationId,
  });

  if (!approval.approved) {
    const recovery = decideRecoveryAction({
      identityClassification: identity.classification,
      structuralClassification: structure.classification,
      backgroundClassification: background.classification,
      postprocessClassification,
      regenerationAttempt,
      cleanupAttempt,
    });
    return rejectCandidate({
      input,
      assetCandidateId,
      stage,
      identity,
      quality,
      structure,
      background,
      regenerationAttempt,
      cleanupAttempt,
      failureReason: approval.deniedReasons.join(' '),
      failureState:
        recovery.failureState === 'REGENERATION_REQUIRED'
          ? 'REGENERATION_REQUIRED'
          : recovery.failureState,
      deniedReasons: approval.deniedReasons,
      requiredNextAction:
        approval.requiredNextAction === 'none' ? undefined : approval.requiredNextAction,
      candidate,
    });
  }

  transition(stage, 'APPROVED');
  stage = 'APPROVED';
  input.onStageChange?.(stage, 'Approving asset');

  const approvedCandidate: AssetCandidateRecord = {
    ...candidate,
    productionStage: 'APPROVED',
    approvalStatus: 'approved',
    approvedAt: new Date().toISOString(),
    registryState: 'approved',
    cleanedAssetUrl: cleanupUsed ? approvedUrl : null,
    cleanedAlphaPresent: cleanupUsed ? true : candidate.alphaPresent,
  };

  const approvalProof = buildApprovalProof(
    approvedCandidate,
    background.classification,
    structure.classification,
    postprocessClassification,
    approvedUrl
  );

  emitVerifiedAssetImmuneEvent('AssetApproved', {
    layerId: input.layerId,
    stationId: input.stationId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    assetCandidateId,
    stage,
    message: `Policy ${approval.approvalPolicyVersion}`,
  });

  return {
    ok: true,
    stage: 'APPROVED',
    approvedUrl,
    candidate: approvedCandidate,
    approvalProof,
    cleanupUsed,
  };
}

function buildCandidateRecord(args: {
  input: VerifiedAssetPipelineInput;
  assetCandidateId: string;
  identity: ReturnType<typeof validateAssetIdentity>;
  quality: Awaited<ReturnType<typeof analyzeIsolatedLayerQuality>>;
  structure: ReturnType<typeof validateAssetStructure>;
  background: ReturnType<typeof classifyAssetBackground>;
  regenerationAttempt: number;
  cleanupUsed: boolean;
  cleanupMethod: AssetCandidateRecord['cleanupMethod'];
  cleanedUrl: string | null;
  postprocessClassification: AssetCandidateRecord['postprocessClassification'];
  stage: VerifiedAssetProductionStage;
}): AssetCandidateRecord {
  const { input, identity, quality, structure, background } = args;
  return {
    assetCandidateId: args.assetCandidateId,
    jobId: input.jobId ?? null,
    providerRequestId: input.providerRequestId ?? null,
    compileRunId: input.compileRunId ?? null,
    organizationId: input.organizationId,
    stationId: input.stationId,
    projectId: input.projectId,
    layerId: input.layerId,
    layerType: input.layerId,
    requestedAssetClass: input.layerId,
    requestedAssetDescription: input.requestedAssetDescription,
    generationMode: input.generationMode,
    promptVersion: input.promptVersion,
    provider: 'fal',
    providerModel: input.providerModel,
    sourceUrl: input.candidateUrl,
    originalMimeType: 'image/png',
    originalWidth: quality.metrics.width,
    originalHeight: quality.metrics.height,
    alphaPresent: quality.metrics.alphaChannelPresent,
    backgroundClassification: background.classification,
    identityClassification: identity.classification,
    structuralClassification: structure.classification,
    qualityClassification: quality.classification,
    cleanupRequired: background.cleanupRequired,
    cleanupMethod: args.cleanupMethod,
    cleanedAssetUrl: args.cleanedUrl,
    cleanedMimeType: args.cleanedUrl ? 'image/png' : undefined,
    cleanedAlphaPresent: args.cleanedUrl ? true : undefined,
    postprocessClassification: args.postprocessClassification,
    approvalStatus: 'pending',
    mountStatus: 'unmounted',
    sceneValidationStatus: 'pending',
    regenerationAttempt: args.regenerationAttempt,
    productionStage: args.stage,
    registryState: 'candidate',
    createdAt: new Date().toISOString(),
    identityMatch: identity.identityMatch,
    identityConfidence: identity.confidence,
    detectedObjectClasses: identity.detectedObjectClasses,
    requestedObjectDetected: identity.requestedObjectDetected,
    unrelatedObjectDominance: identity.unrelatedObjectDominance,
    fullSceneLikelihood: identity.fullSceneLikelihood,
    safeExplanation: identity.safeExplanation,
    opaquePixelRatio: 1 - (quality.metrics.alphaChannelPresent ? 0.2 : 0),
    frameCoverage: quality.metrics.frameCoverage,
    shellSimilarity: quality.metrics.shellSimilarity,
    likelyArchitectureDetected: identity.fullSceneLikelihood >= 0.75,
    effectivePromptVersion: input.promptVersion,
  };
}

function rejectCandidate(args: {
  input: VerifiedAssetPipelineInput;
  assetCandidateId: string;
  stage: VerifiedAssetProductionStage;
  identity: ReturnType<typeof validateAssetIdentity>;
  quality: Awaited<ReturnType<typeof analyzeIsolatedLayerQuality>>;
  structure?: ReturnType<typeof validateAssetStructure>;
  background?: ReturnType<typeof classifyAssetBackground>;
  postprocess?: ReturnType<typeof validatePostprocessAsset>;
  regenerationAttempt: number;
  cleanupAttempt: number;
  failureReason: string;
  failureState: import('./contract').VerifiedAssetFailureState;
  deniedReasons?: string[];
  requiredNextAction?: 'regenerate' | 'remount' | 'manual-review' | 'retry-cleanup';
  cleanedUrl?: string | null;
  cleanupMethod?: AssetCandidateRecord['cleanupMethod'];
  candidate?: AssetCandidateRecord;
}): VerifiedAssetProductionResult {
  const candidate =
    args.candidate ??
    buildCandidateRecord({
      input: args.input,
      assetCandidateId: args.assetCandidateId,
      identity: args.identity,
      quality: args.quality,
      structure:
        args.structure ??
        validateAssetStructure({
          layerId: args.input.layerId,
          metrics: args.quality.metrics,
          fullSceneLikelihood: args.identity.fullSceneLikelihood,
        }),
      background:
        args.background ??
        classifyAssetBackground({
          metrics: args.quality.metrics,
          fullSceneLikelihood: args.identity.fullSceneLikelihood,
          shellSimilarity: args.quality.metrics.shellSimilarity,
        }),
      regenerationAttempt: args.regenerationAttempt,
      cleanupUsed: Boolean(args.cleanedUrl),
      cleanupMethod: args.cleanupMethod ?? 'none',
      cleanedUrl: args.cleanedUrl ?? null,
      postprocessClassification: args.postprocess?.classification ?? 'cleanup-failed',
      stage: args.stage,
    });

  const denied = args.deniedReasons ?? [args.failureReason];
  const recovery = decideRecoveryAction({
    identityClassification: args.identity.classification,
    structuralClassification: candidate.structuralClassification,
    backgroundClassification: candidate.backgroundClassification,
    postprocessClassification: candidate.postprocessClassification,
    regenerationAttempt: args.regenerationAttempt,
    cleanupAttempt: args.cleanupAttempt,
  });

  const quarantine = quarantineRejectedCandidate({
    candidate: {
      ...candidate,
      failureState: args.failureState,
      productionStage: args.stage,
      approvalStatus: 'denied',
      approvalReason: args.failureReason,
    },
    rejectionReason: args.failureReason,
    deniedReasons: denied,
  });

  return {
    ok: false,
    stage: args.stage,
    failureState: args.failureState,
    candidate: { ...candidate, failureState: args.failureState },
    deniedReasons: denied,
    requiredNextAction:
      args.requiredNextAction ??
      (recovery.action === 'remount'
        ? 'remount'
        : recovery.action === 'background-removal'
          ? 'retry-cleanup'
          : recovery.action === 'manual-review'
            ? 'manual-review'
            : 'regenerate'),
    quarantineId: quarantine.quarantineId,
  };
}

export { VERIFIED_ASSET_PRODUCTION_VERSION };
