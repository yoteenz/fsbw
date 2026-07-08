/**
 * Certification schema — earned through simulation performance, not course completion.
 */

import type { ProfessionId } from '../types';

export type CertificationStatus = 'locked' | 'in-progress' | 'earned' | 'expired';

export type CertificationDefinition = {
  id: string;
  professionId: ProfessionId;
  displayName: string;
  stageId: string;
  summary: string;
  requiredSceneIds: string[];
  minimumReputation?: number;
};

export type CertificationProgress = {
  certificationId: string;
  status: CertificationStatus;
  progressPercent: number;
  earnedAt?: string;
  evidenceSceneIds: string[];
};

export function evaluateCertificationProgress(
  definition: CertificationDefinition,
  completedSceneIds: string[],
  reputationScore: number
): CertificationProgress {
  const matchedScenes = definition.requiredSceneIds.filter((sceneId) => completedSceneIds.includes(sceneId));
  const sceneProgress =
    definition.requiredSceneIds.length === 0
      ? 1
      : matchedScenes.length / definition.requiredSceneIds.length;
  const reputationOk = reputationScore >= (definition.minimumReputation ?? 0);
  const progressPercent = Math.round(sceneProgress * (reputationOk ? 100 : 80));

  let status: CertificationStatus = 'locked';
  if (progressPercent >= 100 && reputationOk) status = 'earned';
  else if (progressPercent > 0) status = 'in-progress';

  return {
    certificationId: definition.id,
    status,
    progressPercent,
    earnedAt: status === 'earned' ? new Date().toISOString() : undefined,
    evidenceSceneIds: matchedScenes,
  };
}
