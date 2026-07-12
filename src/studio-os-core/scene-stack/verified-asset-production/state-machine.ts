import type { VerifiedAssetFailureState, VerifiedAssetProductionStage } from './contract';

export type StateTransitionResult =
  | { ok: true; from: VerifiedAssetProductionStage; to: VerifiedAssetProductionStage }
  | { ok: false; code: 'INVALID_TRANSITION'; from: VerifiedAssetProductionStage; to: VerifiedAssetProductionStage; reason: string };

const ALLOWED: Record<VerifiedAssetProductionStage, VerifiedAssetProductionStage[]> = {
  REQUESTED: ['GENERATING'],
  GENERATING: ['GENERATED_CANDIDATE'],
  GENERATED_CANDIDATE: ['IDENTITY_VALIDATING'],
  IDENTITY_VALIDATING: ['STRUCTURE_VALIDATING'],
  STRUCTURE_VALIDATING: ['BACKGROUND_CLASSIFYING'],
  BACKGROUND_CLASSIFYING: ['BACKGROUND_REMOVING', 'POSTPROCESS_VALIDATING'],
  BACKGROUND_REMOVING: ['POSTPROCESS_VALIDATING'],
  POSTPROCESS_VALIDATING: ['APPROVED'],
  APPROVED: ['REGISTERED'],
  REGISTERED: ['MOUNTING'],
  MOUNTING: ['MOUNTED'],
  MOUNTED: ['SCENE_VALIDATED'],
  SCENE_VALIDATED: [],
};

const FORBIDDEN_DIRECT: Array<[VerifiedAssetProductionStage, VerifiedAssetProductionStage]> = [
  ['GENERATED_CANDIDATE', 'MOUNTING'],
  ['GENERATED_CANDIDATE', 'MOUNTED'],
  ['GENERATED_CANDIDATE', 'APPROVED'],
  ['GENERATING', 'REGISTERED'],
  ['GENERATING', 'MOUNTED'],
  ['GENERATING', 'APPROVED'],
  ['IDENTITY_VALIDATING', 'MOUNTING'],
  ['BACKGROUND_CLASSIFYING', 'MOUNTED'],
];

export function assertProductionStageTransition(
  from: VerifiedAssetProductionStage,
  to: VerifiedAssetProductionStage
): StateTransitionResult {
  const forbidden = FORBIDDEN_DIRECT.find(([a, b]) => a === from && b === to);
  if (forbidden) {
    return {
      ok: false,
      code: 'INVALID_TRANSITION',
      from,
      to,
      reason: `Forbidden direct transition ${from} → ${to}. Candidate assets must pass inspection before mount.`,
    };
  }

  const allowed = ALLOWED[from] ?? [];
  if (!allowed.includes(to)) {
    return {
      ok: false,
      code: 'INVALID_TRANSITION',
      from,
      to,
      reason: `Transition ${from} → ${to} is not allowed. Allowed: ${allowed.join(', ') || 'none'}.`,
    };
  }

  return { ok: true, from, to };
}

export function failureStateForStage(stage: VerifiedAssetProductionStage): VerifiedAssetFailureState | null {
  if (stage === 'IDENTITY_VALIDATING') return 'REJECTED_WRONG_ASSET';
  if (stage === 'STRUCTURE_VALIDATING') return 'REJECTED_DAMAGED';
  if (stage === 'BACKGROUND_CLASSIFYING') return 'REJECTED_FULL_SCENE';
  if (stage === 'POSTPROCESS_VALIDATING') return 'REJECTED_BACKGROUND';
  return null;
}

export function uiLabelForProductionStage(stage: VerifiedAssetProductionStage, layerLabel: string): string {
  switch (stage) {
    case 'REQUESTED':
      return `Queued ${layerLabel}`;
    case 'GENERATING':
      return `Generating ${layerLabel}`;
    case 'GENERATED_CANDIDATE':
      return `Inspecting delivered ${layerLabel}`;
    case 'IDENTITY_VALIDATING':
      return `Verifying requested object`;
    case 'STRUCTURE_VALIDATING':
      return `Checking object structure`;
    case 'BACKGROUND_CLASSIFYING':
      return `Classifying background`;
    case 'BACKGROUND_REMOVING':
      return `Removing background`;
    case 'POSTPROCESS_VALIDATING':
      return `Inspecting cleaned asset`;
    case 'APPROVED':
      return `Approving asset`;
    case 'REGISTERED':
      return `Registering approved asset`;
    case 'MOUNTING':
      return `Installing ${layerLabel}`;
    case 'MOUNTED':
      return `Verifying placement`;
    case 'SCENE_VALIDATED':
      return `${layerLabel} scene validated`;
    default:
      return layerLabel;
  }
}
