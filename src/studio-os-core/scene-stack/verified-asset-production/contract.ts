import type { MaterialFidelityEvidence } from '../../creative-production/brand-asset-grounding/contract';
import type { SceneStackLayerId } from '../types';

export const VERIFIED_ASSET_PRODUCTION_VERSION = 'verified-asset-production.v1';
export const ASSET_APPROVAL_POLICY_VERSION = 'asset-approval-policy.v1';

export type VerifiedAssetProductionStage =
  | 'REQUESTED'
  | 'GENERATING'
  | 'GENERATED_CANDIDATE'
  | 'IDENTITY_VALIDATING'
  | 'STRUCTURE_VALIDATING'
  | 'BACKGROUND_CLASSIFYING'
  | 'BACKGROUND_REMOVING'
  | 'POSTPROCESS_VALIDATING'
  | 'APPROVED'
  | 'REGISTERED'
  | 'MOUNTING'
  | 'MOUNTED'
  | 'SCENE_VALIDATED';

export type VerifiedAssetFailureState =
  | 'REJECTED_WRONG_ASSET'
  | 'REJECTED_FULL_SCENE'
  | 'REJECTED_BACKGROUND'
  | 'REJECTED_DAMAGED'
  | 'REJECTED_LOW_CONFIDENCE'
  | 'REGENERATION_REQUIRED'
  | 'MANUAL_REVIEW_REQUIRED';

export type BackgroundClassification =
  | 'NATIVE_ALPHA'
  | 'SIMPLE_SOLID_BACKGROUND'
  | 'SIMPLE_GRADIENT_BACKGROUND'
  | 'SHADOW_PLANE_ONLY'
  | 'COMPLEX_NONARCHITECTURAL_BACKGROUND'
  | 'ENVIRONMENT_FUSED'
  | 'FULL_SCENE_RERENDER'
  | 'FAKE_TRANSPARENCY'
  | 'UNKNOWN_LOW_CONFIDENCE';

export type IdentityClassification =
  | 'identity-match'
  | 'wrong-asset'
  | 'architecture-dominant'
  | 'missing-object'
  | 'embedded-in-scene'
  | 'low-confidence';

export type StructuralClassification =
  | 'structurally-valid'
  | 'cropped'
  | 'malformed'
  | 'fused-with-environment'
  | 'duplicate-object'
  | 'wrong-perspective'
  | 'unusable-silhouette'
  | 'full-scene';

export type PostprocessClassification =
  | 'cleanup-valid'
  | 'residual-background'
  | 'halo-damage'
  | 'object-damage'
  | 'incomplete-extraction'
  | 'fake-alpha'
  | 'environment-remnant'
  | 'cleanup-failed'
  | 'not-required';

export type AssetRegistryLifecycleState = 'candidate' | 'quarantined' | 'approved' | 'mounted' | 'retired';

export type AssetProductionApprovalProof = {
  approvalPolicyVersion: string;
  assetCandidateId: string;
  approvedAt: string;
  candidateUrl: string;
  cleanedUrl?: string | null;
  backgroundClassification: BackgroundClassification;
  identityConfidence: number;
  structuralClassification: StructuralClassification;
  postprocessClassification: PostprocessClassification;
  cleanupMethod?: 'none' | 'ideogram' | 'white-studio-fallback';
  compileRunId?: string | null;
  jobId?: string | null;
  materialFidelityVerdict?: string | null;
  routeId?: string | null;
};

export type AssetCandidateRecord = {
  assetCandidateId: string;
  jobId?: string | null;
  providerRequestId?: string | null;
  compileRunId?: string | null;
  organizationId: string;
  stationId: string;
  projectId: string;
  layerId: SceneStackLayerId;
  layerType: SceneStackLayerId;
  requestedAssetClass: string;
  requestedAssetDescription: string;
  generationMode?: string;
  promptVersion: string;
  provider: 'fal';
  providerModel?: string;
  sourceUrl: string;
  originalMimeType: 'image/png' | 'image/webp' | 'unknown';
  originalWidth: number;
  originalHeight: number;
  alphaPresent: boolean;
  backgroundClassification: BackgroundClassification;
  identityClassification: IdentityClassification;
  structuralClassification: StructuralClassification;
  qualityClassification: string;
  cleanupRequired: boolean;
  cleanupMethod?: 'none' | 'ideogram' | 'white-studio-fallback';
  cleanupJobId?: string | null;
  cleanedAssetUrl?: string | null;
  cleanedMimeType?: 'image/png' | null;
  cleanedAlphaPresent?: boolean;
  postprocessClassification: PostprocessClassification;
  approvalStatus: 'pending' | 'approved' | 'denied';
  approvalReason?: string;
  registryAssetId?: string | null;
  mountMetadata?: Record<string, unknown>;
  mountStatus: 'unmounted' | 'mounting' | 'mounted' | 'scene-validated';
  sceneValidationStatus: 'pending' | 'passed' | 'failed';
  regenerationAttempt: number;
  productionStage: VerifiedAssetProductionStage;
  failureState?: VerifiedAssetFailureState;
  registryState: AssetRegistryLifecycleState;
  createdAt: string;
  approvedAt?: string;
  mountedAt?: string;
  rejectedAt?: string;
  identityMatch: boolean;
  identityConfidence: number;
  detectedObjectClasses: string[];
  requestedObjectDetected: boolean;
  unrelatedObjectDominance: number;
  fullSceneLikelihood: number;
  safeExplanation: string;
  opaquePixelRatio: number;
  frameCoverage: number;
  shellSimilarity: number | null;
  likelyArchitectureDetected: boolean;
  referenceStrategy?: string;
  effectivePromptVersion?: string;
  routeId?: string | null;
  resolutionTruth?: {
    requestedResolution: string;
    providerNativeResolution: string;
    outputResolution: string;
    upscaleApplied: boolean;
    truthState: string;
  } | null;
  materialFidelity?: MaterialFidelityEvidence | null;
  brandReferenceUrls?: string[];
};

export type VerifiedAssetProductionResult =
  | {
      ok: true;
      stage: 'APPROVED';
      approvedUrl: string;
      candidate: AssetCandidateRecord;
      approvalProof: AssetProductionApprovalProof;
      cleanupUsed: boolean;
    }
  | {
      ok: false;
      stage: VerifiedAssetProductionStage;
      failureState: VerifiedAssetFailureState;
      candidate: AssetCandidateRecord;
      deniedReasons: string[];
      requiredNextAction: 'regenerate' | 'remount' | 'manual-review' | 'retry-cleanup';
      quarantineId: string;
    };

export const MAX_VERIFIED_ASSET_GENERATION_ATTEMPTS = 2;
export const MAX_BACKGROUND_REMOVAL_ATTEMPTS = 1;
export const MAX_MOUNT_CORRECTION_ATTEMPTS = 2;

export const QUARANTINE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
