/**
 * Civilization Events™ catalog — seed events, professions, collaboration honors.
 */

import type {
  CivilizationEvent,
  CollaborationHonor,
  CrossDisciplineTeam,
  GrandChallenge,
  ProfessionId,
  WorldExpo,
} from './types';

export const INDUSTRY_OLYMPICS_PROFESSIONS: ProfessionId[] = [
  'beauty',
  'architecture',
  'film',
  'music',
  'fashion',
  'photography',
  'software',
  'healthcare',
  'education',
  'marketing',
];

export const COLLABORATION_HONORS: CollaborationHonor[] = [
  {
    id: 'best-cross-profession',
    title: 'Best Cross-Profession Innovation™',
    description: 'Multiple professions united into one breakthrough invention',
    weight: 100,
  },
  {
    id: 'best-knowledge-contribution',
    title: 'Best Knowledge Contribution™',
    description: 'Knowledge that elevated the entire civilization',
    weight: 95,
  },
  {
    id: 'greatest-community-builder',
    title: 'Greatest Community Builder™',
    description: 'Founder who strengthened collaboration across Studio World',
    weight: 90,
  },
  {
    id: 'most-reused-blueprint',
    title: 'Most Reused Blueprint™',
    description: 'Blueprint adopted by the most founders and companies',
    weight: 85,
  },
  {
    id: 'most-helpful-founder',
    title: 'Most Helpful Founder™',
    description: 'Creator who elevated everyone else through teaching and support',
    weight: 88,
  },
  {
    id: 'greatest-educational',
    title: 'Greatest Educational Contribution™',
    description: 'Learning content that permanently enriched the Knowledge Layer™',
    weight: 92,
  },
  {
    id: 'greatest-open-innovation',
    title: 'Greatest Open Innovation™',
    description: 'Invention shared openly for civilization-wide benefit',
    weight: 93,
  },
];

export const CIVILIZATION_EVENT_CATALOG: CivilizationEvent[] = [
  {
    id: 'evt-innovation-challenge-01',
    category: 'innovation-challenge',
    title: 'Invent the Impossible™',
    subtitle: 'Create something never seen before in Studio World',
    status: 'active',
    startsAt: '2026-06-01',
    endsAt: '2026-09-30',
    professions: ['software', 'industrial-design', 'architecture'],
    collaborationRequired: false,
    worldImpactSummary: 'Winning invention becomes permanent World Graph knowledge + Museum exhibit',
    discoveryPackId: 'DP-EVT-INNOVATION-VAULT',
    museumExhibitId: 'lm-evt-innovation-01',
    worldGraphNodeId: 'W-EVT-innovation-challenge-01',
  },
  {
    id: 'evt-industry-olympics-2026',
    category: 'industry-olympics',
    title: 'Industry Olympics™ 2026',
    subtitle: 'Profession vs Profession — each discipline competes with its own expertise',
    status: 'active',
    startsAt: '2026-07-01',
    endsAt: '2026-12-31',
    professions: INDUSTRY_OLYMPICS_PROFESSIONS,
    collaborationRequired: false,
    worldImpactSummary: 'Winning professions unlock new architectural styles + Atlas destinations',
    discoveryPackId: 'DP-EXP-003',
    worldGraphNodeId: 'W-EVT-industry-olympics-2026',
  },
  {
    id: 'evt-cross-discipline-01',
    category: 'cross-discipline-championship',
    title: 'Cross-Discipline Championship™',
    subtitle: 'Beauty + Industrial Design + Software + Film + Brand + Music — one collaborative innovation',
    status: 'active',
    startsAt: '2026-07-15',
    endsAt: '2026-10-15',
    professions: ['beauty', 'industrial-design', 'software', 'film', 'brand-strategy', 'music'],
    collaborationRequired: true,
    worldImpactSummary: 'Highest honor — collaboration weighted 2× over individual competition',
    discoveryPackId: 'DP-CIV-002',
    museumExhibitId: 'lm-evt-cross-01',
    worldGraphNodeId: 'W-EVT-cross-discipline-01',
  },
  {
    id: 'evt-knowledge-tournament-01',
    category: 'knowledge-tournament',
    title: 'Knowledge Tournament™',
    subtitle: 'Applied knowledge — Blueprint creation, architecture, research, strategy',
    status: 'upcoming',
    startsAt: '2026-09-01',
    endsAt: '2026-11-30',
    professions: ['education', 'architecture', 'software'],
    collaborationRequired: false,
    worldImpactSummary: 'Winning knowledge permanently expands Knowledge Library™ wings',
    discoveryPackId: 'DP-EVT-KNOWLEDGE-DEEP',
    worldGraphNodeId: 'W-EVT-knowledge-tournament-01',
  },
  {
    id: 'evt-hq-showcase-2026',
    category: 'headquarters-showcase',
    title: 'Headquarters Showcase™ 2026',
    subtitle: 'Architecture · UX · Innovation · Knowledge · Marketplace · AI · Orb · Community',
    status: 'upcoming',
    startsAt: '2026-10-01',
    endsAt: '2026-12-15',
    professions: ['architecture', 'software', 'brand-strategy', 'marketing'],
    collaborationRequired: false,
    worldImpactSummary: 'Greatest headquarters become permanent Living Museum™ exhibits',
    museumExhibitId: 'lm-evt-hq-showcase-2026',
    worldGraphNodeId: 'W-EVT-hq-showcase-2026',
  },
];

export const GRAND_CHALLENGE_2026: GrandChallenge = {
  id: 'gc-2026-education',
  year: 2026,
  theme: 'Design the Future of Education',
  prompt:
    'Reimagine how humanity learns — the community works together. Winning ideas permanently become part of Studio World.',
  status: 'active',
  communityProgressPct: 34,
  permanentImpact:
    'New Education District™, Knowledge Institute annex, and permanent World Graph curriculum nodes',
  worldGraphNodeId: 'W-EVT-grand-challenge-2026',
};

export const WORLD_EXPO_2026: WorldExpo = {
  id: 'expo-2026',
  year: 2026,
  label: 'Studio World Expo™ 2026',
  status: 'upcoming',
  exhibitCount: 0,
  visitorActions: ['Explore', 'Vote', 'Purchase', 'License', 'Collaborate'],
  worldGraphNodeId: 'W-EVT-world-expo-2026',
};

export const SEED_CROSS_DISCIPLINE_TEAMS: CrossDisciplineTeam[] = [
  {
    id: 'team-luminous-campus',
    eventId: 'evt-cross-discipline-01',
    label: 'Team Luminous Campus',
    professions: ['beauty', 'industrial-design', 'software', 'film', 'brand-strategy', 'music'],
    innovationTitle: 'Immersive Headquarters Experience — beauty ritual meets industrial campus',
    status: 'competing',
  },
  {
    id: 'team-open-blueprint',
    eventId: 'evt-cross-discipline-01',
    label: 'Team Open Blueprint',
    professions: ['software', 'education', 'architecture', 'marketing'],
    innovationTitle: 'Shared Blueprint Library — cross-company knowledge tournament prototype',
    status: 'forming',
  },
];

export function eventsByCategory(category: CivilizationEvent['category']): CivilizationEvent[] {
  return CIVILIZATION_EVENT_CATALOG.filter((e) => e.category === category);
}
