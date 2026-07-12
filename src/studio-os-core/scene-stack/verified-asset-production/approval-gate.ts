import {
  ASSET_APPROVAL_POLICY_VERSION,
  type AssetCandidateRecord,
  type AssetProductionApprovalProof,
  type BackgroundClassification,
  type IdentityClassification,
  type PostprocessClassification,
  type StructuralClassification,
} from './contract';
import { isExtractionEligible } from './background-classification';

export type AssetApprovalInput = {
  candidate: AssetCandidateRecord;
  identityMatch: boolean;
  identityConfidence: number;
  identityClassification: IdentityClassification;
  structuralClassification: StructuralClassification;
  structuralValid: boolean;
  backgroundClassification: BackgroundClassification;
  postprocessClassification: PostprocessClassification;
  postprocessValid: boolean;
  fullSceneLikelihood: number;
  shellSimilarity: number | null;
  mountMetadataPresent: boolean;
  organizationId: string;
};

export type AssetApprovalResult = {
  approved: boolean;
  deniedReasons: string[];
  confidence: number;
  approvalPolicyVersion: string;
  requiredNextAction: 'regenerate' | 'remount' | 'manual-review' | 'retry-cleanup' | 'none';
};

export function evaluateAssetApproval(input: AssetApprovalInput): AssetApprovalResult {
  const deniedReasons: string[] = [];

  if (!input.candidate.assetCandidateId) {
    deniedReasons.push('Missing assetCandidateId correlation.');
  }
  if (!input.candidate.sourceUrl) {
    deniedReasons.push('Missing candidate source URL.');
  }
  if (!input.organizationId) {
    deniedReasons.push('Organization ownership not verified.');
  }
  if (!input.mountMetadataPresent) {
    deniedReasons.push('Mount metadata not available.');
  }

  if (!input.identityMatch) {
    deniedReasons.push(`Identity mismatch: ${input.identityClassification}.`);
  }
  if (input.identityConfidence < 0.62) {
    deniedReasons.push(`Identity confidence ${input.identityConfidence.toFixed(2)} below policy threshold.`);
  }

  if (!input.structuralValid) {
    deniedReasons.push(`Structural validation failed: ${input.structuralClassification}.`);
  }

  if (
    input.backgroundClassification === 'FULL_SCENE_RERENDER' ||
    input.backgroundClassification === 'ENVIRONMENT_FUSED' ||
    input.backgroundClassification === 'FAKE_TRANSPARENCY'
  ) {
    deniedReasons.push(`Unacceptable background: ${input.backgroundClassification}.`);
  }

  if (input.fullSceneLikelihood >= 0.78) {
    deniedReasons.push('Full-scene likelihood exceeds policy threshold.');
  }

  if (input.shellSimilarity !== null && input.shellSimilarity > 0.82) {
    deniedReasons.push('Shell contamination detected.');
  }

  if (input.candidate.cleanupRequired) {
    if (!input.postprocessValid) {
      deniedReasons.push(`Post-cleanup validation failed: ${input.postprocessClassification}.`);
    }
  } else {
    const alphaOk =
      input.backgroundClassification === 'NATIVE_ALPHA' ||
      (isExtractionEligible(input.backgroundClassification) === false && input.candidate.alphaPresent);
    if (!alphaOk && input.candidate.layerId !== 'environment-shell') {
      deniedReasons.push('Alpha/transparency not acceptable without successful cleanup.');
    }
  }

  const approved = deniedReasons.length === 0;

  let requiredNextAction: AssetApprovalResult['requiredNextAction'] = approved ? 'none' : 'regenerate';
  if (!approved) {
    if (input.identityClassification === 'wrong-asset') requiredNextAction = 'regenerate';
    else if (input.backgroundClassification === 'FULL_SCENE_RERENDER') requiredNextAction = 'regenerate';
    else if (input.postprocessClassification === 'halo-damage') requiredNextAction = 'retry-cleanup';
    else if (input.identityConfidence < 0.5) requiredNextAction = 'manual-review';
  }

  return {
    approved,
    deniedReasons,
    confidence: input.identityConfidence,
    approvalPolicyVersion: ASSET_APPROVAL_POLICY_VERSION,
    requiredNextAction,
  };
}

export function buildApprovalProof(
  candidate: AssetCandidateRecord,
  backgroundClassification: BackgroundClassification,
  structuralClassification: StructuralClassification,
  postprocessClassification: PostprocessClassification,
  _approvedUrl: string
): AssetProductionApprovalProof {
  return {
    approvalPolicyVersion: ASSET_APPROVAL_POLICY_VERSION,
    assetCandidateId: candidate.assetCandidateId,
    approvedAt: new Date().toISOString(),
    candidateUrl: candidate.sourceUrl,
    cleanedUrl: candidate.cleanedAssetUrl ?? null,
    backgroundClassification,
    identityConfidence: candidate.identityConfidence,
    structuralClassification,
    postprocessClassification,
    cleanupMethod: candidate.cleanupMethod ?? 'none',
    compileRunId: candidate.compileRunId ?? null,
    jobId: candidate.jobId ?? null,
  };
}
