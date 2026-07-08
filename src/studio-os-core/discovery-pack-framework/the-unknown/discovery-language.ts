/**
 * Discovery Language™ — the world speaks like history is unfolding.
 * Never "New Expansion Available."
 */

export const DISCOVERY_LANGUAGE_FRAMES = {
  atlasExpanded: 'The Atlas has expanded.',
  regionCharted: 'A previously unknown region has been charted.',
  explorersReturned: 'Explorers have returned with remarkable findings.',
  civilizationFrontier: 'Civilization has reached a new frontier.',
  worldJustGotBigger: 'The world just got bigger — founders are discovering it now.',
  fogReceded: 'The fog has receded — but the horizon remains.',
  museumRecords: 'The Museum records what was unknown. The Unknown eventually becomes history.',
} as const;

export type DiscoveryLanguageEvent =
  | 'atlas-expanded'
  | 'region-charted'
  | 'explorers-returned'
  | 'civilization-frontier'
  | 'world-expanded'
  | 'fog-receded'
  | 'museum-records';

export function frameDiscoveryLanguage(event: DiscoveryLanguageEvent): string {
  const map: Record<DiscoveryLanguageEvent, string> = {
    'atlas-expanded': DISCOVERY_LANGUAGE_FRAMES.atlasExpanded,
    'region-charted': DISCOVERY_LANGUAGE_FRAMES.regionCharted,
    'explorers-returned': DISCOVERY_LANGUAGE_FRAMES.explorersReturned,
    'civilization-frontier': DISCOVERY_LANGUAGE_FRAMES.civilizationFrontier,
    'world-expanded': DISCOVERY_LANGUAGE_FRAMES.worldJustGotBigger,
    'fog-receded': DISCOVERY_LANGUAGE_FRAMES.fogReceded,
    'museum-records': DISCOVERY_LANGUAGE_FRAMES.museumRecords,
  };
  return map[event];
}

export function selectDiscoveryLanguageLine(input: {
  worldExpansionActive: boolean;
  conditionsMet: number;
  communityUnlocked: number;
  seed: number;
}): string {
  if (input.worldExpansionActive) {
    return frameDiscoveryLanguage('world-expanded');
  }
  if (input.conditionsMet > 0) {
    return frameDiscoveryLanguage('region-charted');
  }
  if (input.communityUnlocked > 0) {
    return frameDiscoveryLanguage('civilization-frontier');
  }

  const ambient: DiscoveryLanguageEvent[] = [
    'atlas-expanded',
    'explorers-returned',
    'fog-receded',
    'museum-records',
  ];
  return frameDiscoveryLanguage(ambient[Math.abs(input.seed) % ambient.length]!);
}

/** Never use product/update language — guard for public copy */
export const FORBIDDEN_DISCOVERY_LANGUAGE = [
  'New Expansion Available',
  'New Feature',
  'Software Update',
  'Download Content',
  'DLC',
] as const;
