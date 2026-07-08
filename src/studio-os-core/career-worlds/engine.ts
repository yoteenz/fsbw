import { evaluateImplementationEra } from '../world-graph/era-evaluation';
import { CAREER_WORLD_BLUEPRINTS, CAREER_WORLD_BLUEPRINT_BY_ID } from './catalog';
import type {
  CareerWorldBlueprint,
  CareerWorldId,
  CareerWorldProgressPhase,
  CareerWorldRuntimeSnapshot,
} from './types';

export const CAREER_WORLDS_SYSTEM = {
  article: 'ARTICLE-E02',
  name: 'Career Worlds™',
  oneLine:
    'Career Worlds™ replace education with persistent professional lives where learners inhabit evolving professions for months or years.',
  coreQuestion: 'What kind of life are you building?',
  antiPattern: 'Do not frame professional growth as Academies, courses, lessons, or static training tracks.',
  runtimeOwner: 'Profession Simulation Engine™',
  graphOwner: 'World Graph™',
} as const;

export function listCareerWorlds(): CareerWorldBlueprint[] {
  return CAREER_WORLD_BLUEPRINTS;
}

export function getCareerWorld(id: CareerWorldId): CareerWorldBlueprint {
  return CAREER_WORLD_BLUEPRINT_BY_ID[id];
}

export function assertCareerWorld(id: string): CareerWorldBlueprint {
  const blueprint = CAREER_WORLD_BLUEPRINT_BY_ID[id as CareerWorldId];
  if (!blueprint) {
    throw new Error(`Unknown Career World™: ${id}`);
  }
  return blueprint;
}

export function buildCareerWorldRuntimeSnapshot(input: {
  worldId: CareerWorldId;
  learnerId: string;
  currentPhase?: CareerWorldProgressPhase;
  lastSeenAt?: string;
  now?: string;
}): CareerWorldRuntimeSnapshot {
  const blueprint = getCareerWorld(input.worldId);
  const now = input.now ? new Date(input.now) : new Date();
  const lastSeen = input.lastSeenAt ? new Date(input.lastSeenAt) : now;
  const offlineDeltaHours = Math.max(0, Math.round((now.getTime() - lastSeen.getTime()) / 36_000) / 100);

  return {
    worldId: input.worldId,
    learnerId: input.learnerId,
    currentPhase: input.currentPhase ?? 'entry',
    simulatedAt: now.toISOString(),
    offlineDeltaHours,
    activeEvents: blueprint.offlineEvolutionSignals.slice(0, 3),
    marketSignals: blueprint.economy.marketForces,
    reputationSignals: [
      `${blueprint.profession} reputation changes through client outcomes`,
      `${blueprint.profession} network expands through collaborators and mentors`,
      `${blueprint.profession} portfolio grows through completed work`,
    ],
    recommendedNextLives: blueprint.challengeLoops.map((loop) => `Practice ${loop} inside ${blueprint.name}`),
  };
}

export const CAREER_WORLDS_ERA_EVALUATION = evaluateImplementationEra({
  systemName: 'Career Worlds™',
  proposedEra: 'world',
  establishesFoundationForNext: true,
  unnecessaryComplexityTooEarly: false,
  evolvesWithoutRewrite: true,
  notes:
    'ARTICLE-E02 is an Era 2 World™ architecture, implemented now as graph/canon foundation only. Runtime NPC autonomy, economies, and persistent offline simulation can mature without replacing the model.',
});
