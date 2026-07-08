import { CAREER_WORLD_BLUEPRINT_BY_ID } from '../catalog';
import type { CareerWorldId } from '../types';
import type { CareerWorldBlueprint } from '../types';
import type {
  CareerAwardRecord,
  CareerHistoryEntry,
  CareerNpcProfile,
  CareerPlayerProfile,
  CareerPortfolioItem,
  CareerWorldSave,
  CareerWorldState,
  WorldClockState,
} from '../core/schemas';
import { createInitialWorldState } from '../worlds/initialize';
import { createInitialWorldClock } from '../world-clock/clock';
import { createNpcFromArchetype } from '../social-network/ecosystem';
import { buildHistoryFromProfile } from '../career-history/store';

function nowIso(): string {
  return new Date().toISOString();
}

function createInitialPlayerProfile(
  worldId: CareerWorldId,
  learnerId: string,
  blueprint: CareerWorldBlueprint
): CareerPlayerProfile {
  const ts = nowIso();
  return {
    learnerId,
    worldId,
    careerTitle: `${blueprint.profession} Apprentice`,
    currentPhase: 'entry',
    experience: 0,
    skills: blueprint.challengeLoops.slice(0, 4).map((name, index) => ({
      id: `skill-${index}`,
      name,
      level: 1,
      maxLevel: 10,
    })),
    certifications: [],
    income: 0,
    businessOwnership: null,
    employees: 0,
    professionalReputation: 10,
    mentorshipRelationships: [],
    awards: [],
    publishedWork: [],
    portfolioItemIds: [],
    promotionHistory: [],
    createdAt: ts,
    updatedAt: ts,
  };
}

function seedNpcs(blueprint: CareerWorldBlueprint): CareerNpcProfile[] {
  const npcs: CareerNpcProfile[] = [];
  blueprint.mentorArchetypes.slice(0, 2).forEach((archetype, i) => {
    npcs.push(createNpcFromArchetype(archetype, 'mentor', i));
  });
  blueprint.npcArchetypes.slice(0, 2).forEach((archetype, i) => {
    npcs.push(createNpcFromArchetype(archetype, 'coworker', i));
  });
  blueprint.clientArchetypes.slice(0, 2).forEach((archetype, i) => {
    npcs.push(createNpcFromArchetype(archetype, 'client', i));
  });
  return npcs;
}

export function createCareerWorldSave(input: {
  worldId: CareerWorldId;
  learnerId: string;
}): CareerWorldSave {
  const blueprint = CAREER_WORLD_BLUEPRINT_BY_ID[input.worldId];
  if (!blueprint) throw new Error(`Unknown career world: ${input.worldId}`);
  const ts = nowIso();
  const playerProfile = createInitialPlayerProfile(input.worldId, input.learnerId, blueprint);
  const worldState = createInitialWorldState(blueprint);
  const clock = createInitialWorldClock();
  const npcs = seedNpcs(blueprint);

  return {
    saveId: `${input.worldId}:${input.learnerId}`,
    worldId: input.worldId,
    learnerId: input.learnerId,
    worldState,
    playerProfile,
    npcs,
    clock,
    portfolio: [],
    awards: [] as CareerAwardRecord[],
    careerHistory: buildHistoryFromProfile(playerProfile),
    lastSeenAt: ts,
    updatedAt: ts,
  };
}

export function touchCareerWorldSave(save: CareerWorldSave): CareerWorldSave {
  return { ...save, updatedAt: nowIso() };
}

export type CareerWorldSimulationBundle = {
  save: CareerWorldSave;
  blueprint: CareerWorldBlueprint;
  worldState: CareerWorldState;
  clock: WorldClockState;
  playerProfile: CareerPlayerProfile;
  npcs: CareerNpcProfile[];
  portfolio: CareerPortfolioItem[];
  awards: CareerAwardRecord[];
  careerHistory: CareerHistoryEntry[];
};

export function bundleCareerWorldSave(save: CareerWorldSave): CareerWorldSimulationBundle {
  const blueprint = CAREER_WORLD_BLUEPRINT_BY_ID[save.worldId];
  if (!blueprint) throw new Error(`Unknown career world: ${save.worldId}`);
  return {
    save,
    blueprint,
    worldState: save.worldState,
    clock: save.clock,
    playerProfile: save.playerProfile,
    npcs: save.npcs,
    portfolio: save.portfolio,
    awards: save.awards,
    careerHistory: save.careerHistory,
  };
}
