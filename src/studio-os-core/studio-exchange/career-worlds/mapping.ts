import { CAREER_WORLD_BLUEPRINTS } from '../../career-worlds/catalog';
import type { CareerWorldId } from '../../career-worlds/types';
import type { ProfessionId } from '../../profession-simulation-engine/types';

/** Maps Career World™ IDs to Profession Simulation / Profession Brain references. */
export const CAREER_WORLD_PROFESSION_MAP: Record<CareerWorldId, ProfessionId> = {
  'hair-world': 'hair',
  'marketing-world': 'marketing',
  'architecture-world': 'architecture',
  'construction-world': 'construction',
  'photography-world': 'photography',
  'film-world': 'film',
  'music-world': 'music',
  'finance-world': 'finance',
  'fashion-world': 'fashion',
  'legal-world': 'legal',
  'healthcare-world': 'healthcare',
  'restaurant-world': 'cooking',
};

export function professionIdForCareerWorld(worldId: CareerWorldId): ProfessionId {
  return CAREER_WORLD_PROFESSION_MAP[worldId];
}

export function professionBrainRef(professionId: ProfessionId): string {
  return `profession-brain:${professionId}`;
}

export function simulationEngineRef(professionId: ProfessionId): string {
  return `profession-simulation-engine:${professionId}`;
}

export function careerWorldBlueprint(worldId: CareerWorldId) {
  const blueprint = CAREER_WORLD_BLUEPRINTS.find((w) => w.id === worldId);
  if (!blueprint) {
    throw new Error(`Unknown Career World: ${worldId}`);
  }
  return blueprint;
}
