/**
 * Progression schema — promotion evidence and career advancement.
 */

import type { ProfessionId } from '../types';

export type ProgressionEvidenceKind =
  | 'shift-completion'
  | 'skill-evidence'
  | 'mentor-approval'
  | 'client-satisfaction'
  | 'certification'
  | 'reputation';

export type ProgressionEvidence = {
  id: string;
  kind: ProgressionEvidenceKind;
  label: string;
  recordedAt: string;
  sceneId?: string;
  score?: number;
};

export type LearnerProgressionState = {
  learnerId: string;
  professionId: ProfessionId;
  activeStageId: string;
  completedSceneIds: string[];
  reputationScore: number;
  evidence: ProgressionEvidence[];
  certificationIds: string[];
};

export function createInitialProgressionState(input: {
  learnerId: string;
  professionId: ProfessionId;
  activeStageId: string;
}): LearnerProgressionState {
  return {
    learnerId: input.learnerId,
    professionId: input.professionId,
    activeStageId: input.activeStageId,
    completedSceneIds: [],
    reputationScore: 50,
    evidence: [],
    certificationIds: [],
  };
}

export function applySessionToProgression(
  state: LearnerProgressionState,
  input: {
    sceneId: string;
    reputationDelta: number;
    skillEvidence: string[];
    passed: boolean;
  }
): LearnerProgressionState {
  const now = new Date().toISOString();
  const completedSceneIds = state.completedSceneIds.includes(input.sceneId)
    ? state.completedSceneIds
    : [...state.completedSceneIds, input.sceneId];

  return {
    ...state,
    completedSceneIds,
    reputationScore: Math.min(100, Math.max(0, state.reputationScore + input.reputationDelta)),
    evidence: [
      ...state.evidence,
      {
        id: `${now}-shift`,
        kind: 'shift-completion',
        label: `Completed shift ${input.sceneId}`,
        recordedAt: now,
        sceneId: input.sceneId,
        score: input.passed ? 1 : 0.5,
      },
      ...input.skillEvidence.map((label, index) => ({
        id: `${now}-skill-${index}`,
        kind: 'skill-evidence' as const,
        label,
        recordedAt: now,
        sceneId: input.sceneId,
      })),
    ],
  };
}
