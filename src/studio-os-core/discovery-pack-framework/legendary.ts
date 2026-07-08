/**
 * Legendary Discoveries™ — reserved for extraordinary achievements.
 * Almost no one knows they exist. Public hints are deliberately vague.
 */

import type { DiscoveryPackRegistryEntry, DiscoveryTier } from './types';
import { resolveDiscoveryState } from './lifecycle';

export const LEGENDARY_TIER: DiscoveryTier = 'legendary';

export const LEGENDARY_HINTS = [
  'Legends speak of districts no cartographer has mapped.',
  'Some Orbs are said to awaken only after civilizations achieve the impossible.',
  'Ancient archives may exist beneath the campus — no founder has confirmed their location.',
  'Forgotten civilizations leave breadcrumbs in the World Graph™ for those who investigate.',
  'Experimental world mechanics sleep in sealed chambers until extraordinary builders arrive.',
  'Historic prototype technologies await rediscovery — not in any release notes.',
] as const;

export function isLegendaryEntry(entry: Pick<DiscoveryPackRegistryEntry, 'tier'>): boolean {
  return entry.tier === 'legendary';
}

export function countLegendarySlots(
  registry: readonly DiscoveryPackRegistryEntry[]
): { total: number; hidden: number; rumored: number } {
  const legendary = registry.filter(isLegendaryEntry);
  let hidden = 0;
  let rumored = 0;

  for (const entry of legendary) {
    const state = resolveDiscoveryState(entry.discoveryState, entry.status);
    if (state === 'hidden' || state === 'conceived' || state === 'research' || state === 'prototype') {
      hidden += 1;
    } else if (state === 'rumored' || state === 'teased') {
      rumored += 1;
    }
  }

  return { total: legendary.length, hidden, rumored };
}

/** Public-safe legendary hint — rotates, never names a pack */
export function selectLegendaryHint(seed: number): string {
  const idx = Math.abs(seed) % LEGENDARY_HINTS.length;
  return LEGENDARY_HINTS[idx]!;
}

export function legendaryMysteryCount(registry: readonly DiscoveryPackRegistryEntry[]): number {
  const { hidden } = countLegendarySlots(registry);
  return hidden;
}
