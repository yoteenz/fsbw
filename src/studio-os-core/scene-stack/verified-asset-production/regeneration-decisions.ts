import type { VerifiedAssetFailureState } from './contract';
import type { BackgroundClassification } from './contract';
import type { IdentityClassification } from './contract';
import type { StructuralClassification } from './contract';
import type { PostprocessClassification } from './contract';

export type RegenerationDecisionInput = {
  identityClassification: IdentityClassification;
  structuralClassification: StructuralClassification;
  backgroundClassification: BackgroundClassification;
  postprocessClassification: PostprocessClassification;
  placementFailure?: boolean;
  assetValid?: boolean;
  regenerationAttempt: number;
  cleanupAttempt: number;
};

export type RegenerationDecision = {
  action: 'regenerate' | 'background-removal' | 'remount' | 'manual-review' | 'stop';
  failureState: VerifiedAssetFailureState;
  reason: string;
};

export function decideRecoveryAction(input: RegenerationDecisionInput): RegenerationDecision {
  if (input.placementFailure && input.assetValid) {
    return {
      action: 'remount',
      failureState: 'REJECTED_DAMAGED',
      reason: 'Valid asset with bad placement — correct mount metadata and remount.',
    };
  }

  if (input.identityClassification === 'wrong-asset' || input.identityClassification === 'missing-object') {
    return {
      action: 'regenerate',
      failureState: 'REJECTED_WRONG_ASSET',
      reason: 'Wrong or missing asset — regenerate with corrected object description.',
    };
  }

  if (
    input.backgroundClassification === 'FULL_SCENE_RERENDER' ||
    input.structuralClassification === 'full-scene' ||
    input.structuralClassification === 'fused-with-environment'
  ) {
    return {
      action: 'regenerate',
      failureState: 'REJECTED_FULL_SCENE',
      reason: 'Full scene detected — regenerate with strict isolated mode and no appearance reference.',
    };
  }

  if (
    input.structuralClassification === 'malformed' ||
    input.structuralClassification === 'cropped' ||
    input.structuralClassification === 'unusable-silhouette'
  ) {
    return {
      action: 'regenerate',
      failureState: 'REJECTED_DAMAGED',
      reason: 'Malformed or cropped object — regenerate using alternate governed model route.',
    };
  }

  if (
    input.backgroundClassification === 'SIMPLE_SOLID_BACKGROUND' ||
    input.backgroundClassification === 'SIMPLE_GRADIENT_BACKGROUND' ||
    input.backgroundClassification === 'SHADOW_PLANE_ONLY'
  ) {
    if (input.cleanupAttempt < 1) {
      return {
        action: 'background-removal',
        failureState: 'REJECTED_BACKGROUND',
        reason: 'Simple background — governed extraction eligible.',
      };
    }
    if (input.postprocessClassification === 'halo-damage' && input.cleanupAttempt < 2) {
      return {
        action: 'background-removal',
        failureState: 'REJECTED_BACKGROUND',
        reason: 'Cleanup damaged edges — retry alternate extraction path once.',
      };
    }
  }

  if (input.identityClassification === 'low-confidence' && input.regenerationAttempt < 1) {
    return {
      action: 'regenerate',
      failureState: 'REJECTED_LOW_CONFIDENCE',
      reason: 'Low-confidence identity — regenerate before manual review.',
    };
  }

  if (input.regenerationAttempt >= 2) {
    return {
      action: 'stop',
      failureState: 'REGENERATION_REQUIRED',
      reason: 'Maximum provider generation attempts reached.',
    };
  }

  return {
    action: 'manual-review',
    failureState: 'MANUAL_REVIEW_REQUIRED',
    reason: 'Unable to classify safe recovery automatically.',
  };
}
