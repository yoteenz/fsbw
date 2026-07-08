import { getHeroObject } from './catalog';
import { resolveContextualOrbHeroObjects } from './contextual-orb';
import type { OrbContextDefinition, OrbDisplaySlot, ResolvedOrbToolbelt } from './context-registry/types';
import { ORB_CONTEXT_BY_ID } from './context-registry';

export type OrbToolbeltInput = {
  contextId: string;
  activeWorkTags?: string[];
  limit?: number;
  includeContextActions?: boolean;
};

/**
 * Build the five-slot Contextual Orb toolbelt from registry data.
 * Primary Hero Objects fill slots first; high-priority context actions may
 * replace the lowest-ranked primary when `includeContextActions` is true.
 */
export function resolveOrbToolbelt(input: OrbToolbeltInput): ResolvedOrbToolbelt {
  const limit = input.limit ?? 5;
  const context = ORB_CONTEXT_BY_ID[input.contextId];
  const activeWorkTags = input.activeWorkTags ?? [];

  if (!context) {
    const fallback = resolveContextualOrbHeroObjects({
      contextId: input.contextId,
      activeWorkTags,
      limit,
    });
    return {
      contextId: fallback.contextId,
      contextLabel: fallback.contextId,
      slots: fallback.heroObjects.map((object) => ({
        kind: 'hero-object' as const,
        heroObjectId: object.id,
      })),
      rationale: fallback.rationale,
    };
  }

  const ranked = rankHeroObjectsForContext(context, activeWorkTags);
  const slots: OrbDisplaySlot[] = ranked.slice(0, limit).map((heroObjectId) => ({
    kind: 'hero-object',
    heroObjectId,
  }));

  if (input.includeContextActions !== false && slots.length < limit) {
    const remaining = limit - slots.length;
    const actions = [...context.contextActions]
      .sort((a, b) => a.relevanceRank - b.relevanceRank)
      .slice(0, remaining);
    for (const action of actions) {
      slots.push({ kind: 'context-action', action });
    }
  }

  return {
    contextId: context.contextId,
    contextLabel: context.contextLabel,
    slots: slots.slice(0, limit),
    rationale: `Resolved ${context.contextLabel} toolbelt from the Hero Object context registry.`,
  };
}

function rankHeroObjectsForContext(context: OrbContextDefinition, activeWorkTags: string[]): string[] {
  const pool = [...context.primaryHeroObjectIds, ...context.secondaryHeroObjectIds];
  const unique = [...new Set(pool)];

  return unique.sort((aId, bId) => {
    const a = getHeroObject(aId);
    const b = getHeroObject(bId);
    const aPrimary = context.primaryHeroObjectIds.indexOf(aId);
    const bPrimary = context.primaryHeroObjectIds.indexOf(bId);
    const aRank = aPrimary >= 0 ? aPrimary : 10 + context.secondaryHeroObjectIds.indexOf(aId);
    const bRank = bPrimary >= 0 ? bPrimary : 10 + context.secondaryHeroObjectIds.indexOf(bId);
    const aTagBoost = activeWorkTags.filter((t) => a?.tags.includes(t)).length;
    const bTagBoost = activeWorkTags.filter((t) => b?.tags.includes(t)).length;
    return aRank + aTagBoost * 0.1 - (bRank + bTagBoost * 0.1);
  });
}

export function orbDisplaySlotKey(slot: OrbDisplaySlot, index: number): string {
  if (slot.kind === 'hero-object') return `ho:${slot.heroObjectId}`;
  return `ca:${slot.action.id}:${index}`;
}

export function orbDisplaySlotLabel(slot: OrbDisplaySlot): string {
  if (slot.kind === 'hero-object') {
    return getHeroObject(slot.heroObjectId)?.displayName.replace(/™$/, '') ?? slot.heroObjectId;
  }
  return slot.action.label;
}
