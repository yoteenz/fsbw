/**
 * Career track schema — reusable across every profession.
 */

import type { CareerStageDefinition, ProfessionId, PromotionGateDefinition } from '../types';

export type CareerLevel = {
  id: string;
  order: number;
  displayName: string;
  roleTitle: string;
  summary: string;
};

export type CareerRole = {
  id: string;
  levelId: string;
  title: string;
  responsibilities: string[];
};

export type CareerUnlockBundle = {
  environments: string[];
  aiCharacters: string[];
  tools: string[];
  certifications: string[];
  clientTypes: string[];
  scenarios: string[];
};

export type PromotionRequirements = {
  gates: PromotionGateDefinition[];
  requiredSceneIds: string[];
  minimumReputation?: number;
  requiredCertificationIds?: string[];
};

export type CareerTrackSchema = {
  professionId: ProfessionId;
  workplaceName: string;
  levels: CareerLevel[];
  roles: CareerRole[];
  promotionRequirementsByLevel: Record<string, PromotionRequirements>;
  unlocksByLevel: Record<string, CareerUnlockBundle>;
};

export function careerTrackFromStageDefinitions(
  professionId: ProfessionId,
  workplaceName: string,
  stages: CareerStageDefinition[]
): CareerTrackSchema {
  const ordered = [...stages].sort((a, b) => a.order - b.order);

  return {
    professionId,
    workplaceName,
    levels: ordered.map((stage) => ({
      id: stage.id,
      order: stage.order,
      displayName: stage.displayName,
      roleTitle: stage.displayName,
      summary: stage.summary,
    })),
    roles: ordered.map((stage) => ({
      id: `${stage.id}-role`,
      levelId: stage.id,
      title: stage.displayName,
      responsibilities: stage.responsibilities,
    })),
    promotionRequirementsByLevel: Object.fromEntries(
      ordered.map((stage) => [
        stage.id,
        {
          gates: stage.promotionGates,
          requiredSceneIds: stage.sceneIds,
          requiredCertificationIds: stage.certificationUnlocks,
        },
      ])
    ),
    unlocksByLevel: Object.fromEntries(
      ordered.map((stage) => [
        stage.id,
        {
          environments: stage.unlockedEnvironments,
          aiCharacters: stage.aiScenarioUnlocks,
          tools: stage.unlockedTools,
          certifications: stage.certificationUnlocks,
          clientTypes: stage.unlockedClientTypes,
          scenarios: stage.sceneIds,
        },
      ])
    ),
  };
}
