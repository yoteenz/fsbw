import type { CharacterClassification, ValidationSeverity } from './types';

export type SkeletonRecord = {
  skeletonId: string;
  rootJointName: string;
  boneCount: number;
  boneHierarchyValid: boolean;
  bindPoseRef?: string;
  rigVersion: string;
  validationStatus: 'PASS' | 'FAIL' | 'UNVERIFIED' | 'NOT_APPLICABLE';
};

export type SkinWeightsRecord = {
  weightsId: string;
  skeletonId: string;
  meshRef: string;
  maxInfluencesPerVertex: number;
  validationStatus: 'PASS' | 'FAIL' | 'UNVERIFIED' | 'NOT_APPLICABLE';
};

export type AnimationClipRecord = {
  animationId: string;
  targetAssetId: string;
  animationType:
    | 'SKELETAL'
    | 'OBJECT_TRANSFORM'
    | 'MORPH_TARGET'
    | 'FACIAL'
    | 'CAMERA'
    | 'ENVIRONMENTAL'
    | 'PROCEDURAL'
    | 'INTERACTION_STATE';
  durationSeconds: number;
  frameRate: number;
  loop: boolean;
  rootMotion: boolean;
  sourceFileRef?: string;
  exportFileRef?: string;
  rigDependencyIds: string[];
  validationStatus: 'PASS' | 'FAIL' | 'UNVERIFIED' | 'NOT_APPLICABLE';
};

/** Season 1 resident IDs — creative canon; technical profiles only. */
export const STUDIO_WORLD_SEASON1_RESIDENT_IDS = [
  '001_ETTA_VALE',
  '002_ZURI_HALE',
  '003_JULES_MERCER',
  '004_NOA_KLINE',
  '005_CASPIAN_REED',
  '006_IONA_WELLS',
  '007_MARLOWE_SAINT',
  '008_ELIO_VAHN',
] as const;

export function validateCharacterRequirements(
  classification: CharacterClassification,
  skeleton?: SkeletonRecord,
  weights?: SkinWeightsRecord,
  animations?: AnimationClipRecord[]
): { severity: ValidationSeverity; messages: string[] } {
  const messages: string[] = [];
  if (classification === 'STATIC_CHARACTER') {
    return { severity: 'NOT_APPLICABLE', messages: ['Static character — rig optional'] };
  }
  const needsRig =
    classification === 'ANIMATED_CHARACTER' ||
    classification === 'INTERACTIVE_CHARACTER' ||
    classification === 'REALTIME_AVATAR' ||
    classification === 'CINEMATIC_CHARACTER';

  if (needsRig && (!skeleton || skeleton.validationStatus === 'FAIL')) {
    messages.push('Skeleton required and missing or failed');
  }
  if (needsRig && (!weights || weights.validationStatus === 'FAIL')) {
    messages.push('Skin weights required and missing or failed');
  }
  if (
    (classification === 'INTERACTIVE_CHARACTER' || classification === 'REALTIME_AVATAR') &&
    (!animations || animations.length === 0)
  ) {
    messages.push('Interactive/realtime character expects animation clips');
  }
  if (messages.length > 0) return { severity: 'CRITICAL', messages };
  return { severity: 'ACCEPTABLE_EXCEPTION', messages: ['Character technical checks passed at contract level'] };
}
