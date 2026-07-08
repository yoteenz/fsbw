import { CONTEXTUAL_ORB_TOOLBELTS, HERO_OBJECTS, getContextualHeroObjects } from './catalog';
import type { HeroObjectDefinition } from './types';

export type ContextualOrbResolutionInput = {
  contextId: string;
  activeWorkTags?: string[];
  limit?: number;
};

export type ContextualOrbResolution = {
  contextId: string;
  heroObjects: HeroObjectDefinition[];
  fallbackUsed: boolean;
  rationale: string;
};

function scoreObject(object: HeroObjectDefinition, activeWorkTags: string[]): number {
  const contextPlacement = object.contextualOrbPlacements[0]?.relevanceRank ?? 9;
  const tagBoost = activeWorkTags.filter((tag) => object.tags.includes(tag)).length * 2;
  return 20 - contextPlacement + tagBoost;
}

/**
 * Resolve the Orb™ toolbelt for the current Studio World location.
 *
 * This is architecture logic only: future UI should render these as living objects,
 * never as static icon buttons.
 */
export function resolveContextualOrbHeroObjects(input: ContextualOrbResolutionInput): ContextualOrbResolution {
  const limit = input.limit ?? 5;
  const activeWorkTags = input.activeWorkTags ?? [];
  const contextual = getContextualHeroObjects(input.contextId);
  const candidates = contextual.length > 0 ? contextual : HERO_OBJECTS;

  const heroObjects = [...candidates]
    .sort((a, b) => scoreObject(b, activeWorkTags) - scoreObject(a, activeWorkTags))
    .slice(0, limit);

  return {
    contextId: input.contextId,
    heroObjects,
    fallbackUsed: contextual.length === 0,
    rationale:
      contextual.length > 0
        ? 'Resolved from the current Studio World location toolbelt.'
        : 'No exact toolbelt found; fell back to global Hero Object relevance.',
  };
}

export function listContextualOrbToolbeltIds(): string[] {
  return CONTEXTUAL_ORB_TOOLBELTS.map((toolbelt) => toolbelt.contextId);
}
