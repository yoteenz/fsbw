/**
 * Discovery Events™ — mythology language for world expansions.
 * Never "We added a feature." Always "Explorers confirmed…"
 */

import type { DiscoveryPackCategory } from './types';

export const DISCOVERY_DESIGN_PRINCIPLE =
  'Every Discovery Pack answers one question while creating three new mysteries.';

export const CURIOSITY_PROMPTS = [
  'What else exists beyond the Atlas?',
  'What district will appear next?',
  'What civilization is being discovered?',
  'What new intelligence is coming?',
  'What has the community not uncovered yet?',
  'Which frontier sleeps until civilization earns it?',
  'What do the historical breadcrumbs in the World Graph™ mean?',
  'What legendary discovery awaits extraordinary builders?',
] as const;

const CATEGORY_DISCOVERY_FRAMES: Record<
  DiscoveryPackCategory,
  { rumor: string; announcement: string; discovery: string }
> = {
  district: {
    rumor: 'Cartographers report anomalies beyond mapped districts.',
    announcement: 'Explorers have confirmed the existence of a new region beyond the Innovation District.',
    discovery: 'A new district has been discovered — the Atlas expands. The world just got bigger.',
  },
  civilization: {
    rumor: 'Historians detect civilizations not yet catalogued in the World Graph™.',
    announcement: 'Researchers confirm a civilization emerging at the edge of known Studio World.',
    discovery: 'A civilization has been discovered — professions, ecosystems, and headquarters evolve permanently.',
  },
  intelligence: {
    rumor: 'Orb senses dormant intelligences beneath the campus.',
    announcement: 'Signals suggest a new Orb Intelligence is stirring.',
    discovery: 'A new Orb Intelligence has awakened — not a software update, a world event.',
  },
  'world-mechanics': {
    rumor: 'The physics of Studio World may hold sealed mechanics.',
    announcement: 'World architects report fundamental mechanics shifting at the civilization layer.',
    discovery: 'World mechanics have evolved — reality in Studio World deepens permanently.',
  },
  creator: {
    rumor: 'Partner institutions may emerge when collaboration reaches historic depth.',
    announcement: 'Explorers confirm a creator civilization seeking alliance with Studio World.',
    discovery: 'A creator partnership has become permanent history in the Marketplace and Museum.',
  },
  experience: {
    rumor: 'Expeditions speak of events not yet inscribed in the Living Museum™.',
    announcement: 'The civilization prepares for a world-scale experience beyond any single headquarters.',
    discovery: 'A world experience has concluded — the Museum records it as permanent civilization history.',
  },
};

export function frameDiscoveryRumor(category: DiscoveryPackCategory): string {
  return CATEGORY_DISCOVERY_FRAMES[category].rumor;
}

export function frameDiscoveryAnnouncement(category: DiscoveryPackCategory): string {
  return CATEGORY_DISCOVERY_FRAMES[category].announcement;
}

export function frameDiscoveryEvent(category: DiscoveryPackCategory, publicName?: string): string {
  const base = CATEGORY_DISCOVERY_FRAMES[category].discovery;
  if (publicName) return `${base} Explorers name it: ${publicName}.`;
  return base;
}

export function frameWorldExpansion(): string {
  return 'The world just got bigger — no countdown preceded it. Founders are discovering it now.';
}

export function frameHiddenDiscovery(): string {
  return 'Something shifted in Studio World. The Atlas, Orb, and Museum respond as though explorers found a new continent.';
}

export function selectCuriosityPrompt(seed: number): string {
  return CURIOSITY_PROMPTS[Math.abs(seed) % CURIOSITY_PROMPTS.length]!;
}

export function generateMysteryTriad(answeredQuestion: string): [string, string, string] {
  const idx = Math.abs(answeredQuestion.length) % CURIOSITY_PROMPTS.length;
  const mysteries: [string, string, string] = [
    CURIOSITY_PROMPTS[idx]!,
    CURIOSITY_PROMPTS[(idx + 3) % CURIOSITY_PROMPTS.length]!,
    CURIOSITY_PROMPTS[(idx + 5) % CURIOSITY_PROMPTS.length]!,
  ];
  return mysteries;
}

export function currentEraSummary(releaseEra: string): string {
  return `${releaseEra} — only this era's frontiers are visible. The complete map is not published.`;
}
