import { getProfessionDefinition } from './catalog';
import type {
  CareerStageDefinition,
  ProfessionDefinition,
  ProfessionSimulationBlueprint,
  ProfessionSimulationResolution,
  SimulationSceneDefinition,
} from './types';

export type ProfessionSimulationResolutionInput = {
  professionId: string;
  activeStageId?: string;
  completedSceneIds?: string[];
  demonstratedSkillTags?: string[];
};

function sortStages(stages: CareerStageDefinition[]): CareerStageDefinition[] {
  return [...stages].sort((a, b) => a.order - b.order);
}

function scenesForStage(
  profession: ProfessionDefinition,
  stage: CareerStageDefinition
): SimulationSceneDefinition[] {
  return stage.sceneIds
    .map((sceneId) => profession.simulationScenes.find((scene) => scene.id === sceneId))
    .filter((scene): scene is SimulationSceneDefinition => Boolean(scene));
}

export function createProfessionSimulationBlueprint(
  profession: ProfessionDefinition
): ProfessionSimulationBlueprint {
  const orderedStages = sortStages(profession.careerStages);
  return {
    professionId: profession.id,
    entryStageId: orderedStages[0]?.id ?? 'entry',
    stageIds: orderedStages.map((stage) => stage.id),
    sceneIds: profession.simulationScenes.map((scene) => scene.id),
    characterIds: profession.aiCharacters.map((character) => character.id),
  };
}

export function resolveProfessionSimulation(
  input: ProfessionSimulationResolutionInput
): ProfessionSimulationResolution {
  const profession = getProfessionDefinition(input.professionId);
  if (!profession) {
    throw new Error(`Unknown profession simulation: ${input.professionId}`);
  }

  const orderedStages = sortStages(profession.careerStages);
  const activeStage =
    orderedStages.find((stage) => stage.id === input.activeStageId) ?? orderedStages[0];
  if (!activeStage) {
    throw new Error(`Profession has no career stages: ${input.professionId}`);
  }

  const activeIndex = orderedStages.findIndex((stage) => stage.id === activeStage.id);
  const nextPromotionStage = activeIndex >= 0 ? orderedStages[activeIndex + 1] : undefined;
  const availableScenes = scenesForStage(profession, activeStage);
  const availableCharacterIds = new Set(availableScenes.flatMap((scene) => scene.aiCharacters));
  const availableCharacters = profession.aiCharacters.filter((character) =>
    availableCharacterIds.has(character.id)
  );

  return {
    profession,
    activeStage,
    availableScenes,
    availableCharacters,
    nextPromotionStage,
    rationale: nextPromotionStage
      ? `${activeStage.displayName} is active; learner is preparing for ${nextPromotionStage.displayName}.`
      : `${activeStage.displayName} is the capstone stage; learner is building legacy and mastery.`,
  };
}

export function getPromotionReadinessSummary(
  professionId: string,
  activeStageId: string,
  completedSceneIds: string[]
): {
  stage: CareerStageDefinition;
  completedRequiredScenes: number;
  totalRequiredScenes: number;
  readyForPromotion: boolean;
} {
  const resolution = resolveProfessionSimulation({ professionId, activeStageId });
  const requiredSceneIds = resolution.activeStage.sceneIds;
  const completedRequiredScenes = requiredSceneIds.filter((sceneId) =>
    completedSceneIds.includes(sceneId)
  ).length;

  return {
    stage: resolution.activeStage,
    completedRequiredScenes,
    totalRequiredScenes: requiredSceneIds.length,
    readyForPromotion:
      requiredSceneIds.length > 0 && completedRequiredScenes === requiredSceneIds.length,
  };
}

