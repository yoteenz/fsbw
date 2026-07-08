/**
 * World Lore™ — every Discovery Pack adds to Studio World's history.
 * Museum, World Graph, Atlas, Orb, and Expeditions record the unfolding story.
 */

import type { DiscoveryPackCategory, DiscoveryPackRegistryEntry } from './types';
import { resolveDiscoveryState, hasReachedState } from './lifecycle';

export type WorldLoreRecord = {
  loreId: string;
  /** Public title only when discovered — otherwise null */
  publicTitle: string | null;
  category: DiscoveryPackCategory;
  era: string;
  museumExhibitReady: boolean;
  atlasUpdated: boolean;
  orbNarration: string | null;
  expeditionTeachable: boolean;
  historicalSummary: string | null;
};

const CATEGORY_LORE_FRAMES: Record<DiscoveryPackCategory, { undiscovered: string; discovered: string }> = {
  district: {
    undiscovered: 'Cartographers report unmapped regions beyond known districts.',
    discovered: 'Explorers confirmed a new region — the Atlas expands permanently.',
  },
  civilization: {
    undiscovered: 'Whispers of civilizations not yet catalogued in the World Graph™.',
    discovered: 'A civilization has been discovered — professions and ecosystems evolve.',
  },
  intelligence: {
    undiscovered: 'Orb senses intelligences not yet awakened.',
    discovered: 'A new Orb Intelligence has awakened — the campus will never be the same.',
  },
  'world-mechanics': {
    undiscovered: 'The physics of Studio World may hold mechanics no founder has tested.',
    discovered: 'World mechanics have shifted — reality in Studio World deepens.',
  },
  creator: {
    undiscovered: 'Partner ateliers and institutions may emerge from collaboration milestones.',
    discovered: 'A creator civilization has joined Studio World — partnerships become permanent.',
  },
  experience: {
    undiscovered: 'Expeditions speak of events not yet inscribed in the Museum.',
    discovered: 'A world experience has become history — the Living Museum™ records it forever.',
  },
};

export function buildWorldLoreRecord(entry: DiscoveryPackRegistryEntry): WorldLoreRecord {
  const state = resolveDiscoveryState(entry.discoveryState, entry.status);
  const discovered = hasReachedState(state, 'discovered');
  const frames = CATEGORY_LORE_FRAMES[entry.category];

  return {
    loreId: entry.loreId ?? `lore-${entry.packId.toLowerCase()}`,
    publicTitle: discovered && entry.publicName ? entry.publicName : null,
    category: entry.category,
    era: entry.releaseEra,
    museumExhibitReady: entry.integrations.museum.enabled && discovered,
    atlasUpdated: entry.integrations.atlas.enabled && discovered,
    orbNarration: discovered
      ? entry.canonicalHistory ?? frames.discovered
      : frames.undiscovered,
    expeditionTeachable: discovered,
    historicalSummary: entry.canonicalHistory,
  };
}

export function buildInternalLoreCatalog(
  registry: readonly DiscoveryPackRegistryEntry[]
): WorldLoreRecord[] {
  return registry.map(buildWorldLoreRecord);
}

/** Public lore pulse — category-level only, no pack identity */
export function publicLorePulse(registry: readonly DiscoveryPackRegistryEntry[]): string {
  const undiscoveredCategories = new Set<DiscoveryPackCategory>();

  for (const entry of registry) {
    const state = resolveDiscoveryState(entry.discoveryState, entry.status);
    if (!hasReachedState(state, 'discovered')) {
      undiscoveredCategories.add(entry.category);
    }
  }

  if (undiscoveredCategories.has('district')) {
    return 'The Atlas holds regions beyond what any founder has walked.';
  }
  if (undiscoveredCategories.has('intelligence')) {
    return 'Orb reports dormant intelligences — not all have awakened.';
  }
  if (undiscoveredCategories.has('experience')) {
    return 'The Museum prepares empty halls for histories not yet written.';
  }

  return 'Studio World history continues — every discovery becomes permanent lore.';
}
