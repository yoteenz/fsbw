/**
 * Living Museum™ — permanent exhibits for major winners.
 */

import type { LivingMuseumExhibit } from './types';

export const LIVING_MUSEUM_EXHIBITS: LivingMuseumExhibit[] = [
  {
    id: 'lm-evt-innovation-01',
    eventId: 'evt-innovation-challenge-01',
    title: 'Invent the Impossible™ — Winner Gallery',
    winnerLabel: 'Awaiting first civilization discovery',
    walkthrough: [
      'The winning headquarters — walkable in full scale',
      'Design process timeline — sketches to Scene Stack™',
      'Prototype vault — failed experiments honored',
      "Founder's notes — decision journal preserved",
      'Final breakthrough — permanent Golden Build™ installation',
    ],
    professions: ['software', 'industrial-design', 'architecture'],
    permanent: true,
    worldGraphNodeId: 'W-MUS-evt-innovation-01',
  },
  {
    id: 'lm-evt-cross-01',
    eventId: 'evt-cross-discipline-01',
    title: 'Cross-Discipline Championship™ — Collaboration Hall',
    winnerLabel: 'Team exhibition pending jury',
    walkthrough: [
      'Six-profession collaboration map — who contributed what',
      'Joint invention assembly — every discipline visible',
      'Skybridge origin story — how collaboration unlocked architecture',
      'Marketplace licensing history — civilization-wide reuse',
      'Living Orb narration — Civilization Curator tells the story',
    ],
    professions: ['beauty', 'industrial-design', 'software', 'film', 'brand-strategy', 'music'],
    permanent: true,
    worldGraphNodeId: 'W-MUS-evt-cross-01',
  },
  {
    id: 'lm-evt-hq-showcase-2026',
    eventId: 'evt-hq-showcase-2026',
    title: 'Headquarters Showcase™ — Greatest Campuses Hall',
    winnerLabel: 'Showcase opens October 2026',
    walkthrough: [
      'Winning headquarters — full campus walkthrough',
      'Architecture jury scores — transparency preserved',
      'Knowledge systems exhibit — how the HQ teaches',
      'Orb utilization case study — civilization integration',
      'Community impact wall — who was elevated',
    ],
    professions: ['architecture', 'software', 'brand-strategy'],
    permanent: true,
    worldGraphNodeId: 'W-MUS-hq-showcase-2026',
  },
];

export function museumExhibitForEvent(eventId: string): LivingMuseumExhibit | undefined {
  return LIVING_MUSEUM_EXHIBITS.find((e) => e.eventId === eventId);
}
