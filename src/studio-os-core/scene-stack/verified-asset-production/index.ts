export { VERIFIED_ASSET_PRODUCTION_VERSION } from './contract';
export type {
  AssetCandidateRecord,
  AssetProductionApprovalProof,
  AssetRegistryLifecycleState,
  BackgroundClassification,
  VerifiedAssetFailureState,
  VerifiedAssetProductionResult,
  VerifiedAssetProductionStage,
} from './contract';
export { assertProductionStageTransition, uiLabelForProductionStage } from './state-machine';
export { validateAssetIdentity } from './identity-validation';
export { validateAssetStructure } from './structural-validation';
export { classifyAssetBackground, isExtractionEligible, mustRejectBeforeCleanup } from './background-classification';
export { validatePostprocessAsset } from './postprocess-validation';
export { evaluateAssetApproval, buildApprovalProof } from './approval-gate';
export { decideRecoveryAction } from './regeneration-decisions';
export { quarantineRejectedCandidate, listQuarantinedAssets, getLatestQuarantineForLayer } from './quarantine';
export { validateSceneMount, assertMountRequiresApprovalProof } from './mount-validation';
export { emitVerifiedAssetImmuneEvent } from './immune-events';
export { runVerifiedAssetProductionPipeline } from './pipeline';
export type { VerifiedAssetPipelineInput, BackgroundCleanupRequest } from './pipeline';
