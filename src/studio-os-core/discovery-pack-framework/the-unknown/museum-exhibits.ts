/**
 * Unknown Museum Exhibits™ — when The Unknown becomes history.
 * Every discovery receives a permanent historical exhibit scaffold.
 */

import type { PublicUnknownMuseumExhibit } from '../types';

export type UnknownMuseumExhibitTemplate = {
  id: string;
  publicTitle: string;
  discoveryStory: string;
  whyHidden: string;
  contributorFraming: string;
  worldChange: string;
  permanent: true;
};

export const UNKNOWN_MUSEUM_EXHIBIT_TEMPLATES: UnknownMuseumExhibitTemplate[] = [
  {
    id: 'ume-frontier-expansion',
    publicTitle: 'The First Frontier Expansion',
    discoveryStory: 'Explorers confirmed a region the Atlas had never charted.',
    whyHidden: 'Civilization had not yet reached the knowledge threshold required to see it.',
    contributorFraming: 'Thousands of founders contributed Blueprints, collaborations, and headquarters.',
    worldChange: 'The Atlas expanded permanently. The World Graph recorded a new chapter.',
    permanent: true,
  },
  {
    id: 'ume-forgotten-district',
    publicTitle: 'The Forgotten District',
    discoveryStory: 'Historical records mentioned a district no living founder had visited.',
    whyHidden: 'It existed beyond fog — not beyond code.',
    contributorFraming: 'Community Investigation™ decoded breadcrumbs across the World Graph™.',
    worldChange: 'The Living Museum™ opened a wing that had waited empty for years.',
    permanent: true,
  },
  {
    id: 'ume-community-threshold',
    publicTitle: 'The Community Threshold',
    discoveryStory: 'No single founder unlocked this — civilization itself advanced.',
    whyHidden: 'Discovery Conditions™ required collective progress no individual could achieve.',
    contributorFraming: 'One million reusable assets. One hundred thousand headquarters. Historic collaboration.',
    worldChange: 'The Unknown became history. Three new mysteries opened beyond the new horizon.',
    permanent: true,
  },
];

export function buildPublicUnknownMuseumExhibits(
  input: { hiddenActivationCount: number; conditionsMet: number }
): PublicUnknownMuseumExhibit[] {
  if (input.hiddenActivationCount === 0 && input.conditionsMet === 0) {
    return [];
  }

  const templates = UNKNOWN_MUSEUM_EXHIBIT_TEMPLATES.slice(
    0,
    Math.min(UNKNOWN_MUSEUM_EXHIBIT_TEMPLATES.length, input.conditionsMet + 1)
  );

  return templates.map((t) => ({
    id: t.id,
    publicTitle: t.publicTitle,
    discoveryStory: t.discoveryStory,
    whyHidden: t.whyHidden,
    contributorFraming: t.contributorFraming,
    worldChange: t.worldChange,
    permanent: t.permanent,
  }));
}

export function museumExhibitAmbientLine(exhibitCount: number): string | null {
  if (exhibitCount === 0) {
    return 'The Museum prepares empty halls for discoveries not yet made.';
  }
  return `${exhibitCount} exhibit${exhibitCount > 1 ? 's' : ''} record how The Unknown became history.`;
}
