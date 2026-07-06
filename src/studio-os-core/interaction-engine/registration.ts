import type { InteractionPatternEntry } from './types';
import { buildInteractionPatternCatalog, getInteractionPattern } from './pattern-catalog';

const customPatterns: InteractionPatternEntry[] = [];

export function registerInteractionPattern(entry: InteractionPatternEntry): InteractionPatternEntry {
  const idx = customPatterns.findIndex((p) => p.patternId === entry.patternId);
  if (idx >= 0) customPatterns[idx] = entry;
  else customPatterns.push(entry);
  return entry;
}

export function getAllInteractionPatterns(): InteractionPatternEntry[] {
  const byId = new Map(buildInteractionPatternCatalog().map((p) => [p.patternId, p]));
  for (const custom of customPatterns) {
    byId.set(custom.patternId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredInteractionPattern(patternId: string): InteractionPatternEntry | undefined {
  return getAllInteractionPatterns().find((p) => p.patternId === patternId) ?? getInteractionPattern(patternId);
}
