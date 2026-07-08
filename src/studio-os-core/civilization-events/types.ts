/**
 * Civilization Events™ — world-scale events that permanently evolve Studio World.
 * ERA 2 — WORLD™ · Civilization Events™ · Discovery Pack Framework™
 */

import type { PublicDiscoveryFrameworkSnapshot, DiscoveryEligibilitySnapshot, PublicDiscoveryCultureSnapshot, PublicUnknownSnapshot } from '../discovery-pack-framework/types';

export type CivilizationEventCategory =
  | 'innovation-challenge'
  | 'industry-olympics'
  | 'cross-discipline-championship'
  | 'world-expo'
  | 'grand-challenge'
  | 'knowledge-tournament'
  | 'headquarters-showcase';

export type CivilizationEventStatus = 'upcoming' | 'active' | 'judging' | 'completed' | 'archived';

export type ProfessionId =
  | 'beauty'
  | 'architecture'
  | 'film'
  | 'music'
  | 'fashion'
  | 'photography'
  | 'software'
  | 'healthcare'
  | 'education'
  | 'marketing'
  | 'industrial-design'
  | 'brand-strategy';

export type CivilizationEvent = {
  id: string;
  category: CivilizationEventCategory;
  title: string;
  subtitle: string;
  status: CivilizationEventStatus;
  startsAt: string;
  endsAt: string;
  professions: ProfessionId[];
  collaborationRequired: boolean;
  worldImpactSummary: string;
  discoveryPackId?: string;
  museumExhibitId?: string;
  worldGraphNodeId: string;
};

export type CrossDisciplineTeam = {
  id: string;
  eventId: string;
  label: string;
  professions: ProfessionId[];
  innovationTitle: string;
  status: 'forming' | 'competing' | 'won' | 'exhibited';
};

export type GrandChallenge = {
  id: string;
  year: number;
  theme: string;
  prompt: string;
  status: CivilizationEventStatus;
  communityProgressPct: number;
  permanentImpact: string;
  worldGraphNodeId: string;
};

export type WorldExpo = {
  id: string;
  year: number;
  label: string;
  status: CivilizationEventStatus;
  exhibitCount: number;
  visitorActions: string[];
  worldGraphNodeId: string;
};

export type LivingMuseumExhibit = {
  id: string;
  eventId: string;
  title: string;
  winnerLabel: string;
  walkthrough: string[];
  professions: ProfessionId[];
  permanent: true;
  worldGraphNodeId: string;
};

export type CollaborationHonorId =
  | 'best-cross-profession'
  | 'best-knowledge-contribution'
  | 'greatest-community-builder'
  | 'most-reused-blueprint'
  | 'most-helpful-founder'
  | 'greatest-educational'
  | 'greatest-open-innovation';

export type CollaborationHonor = {
  id: CollaborationHonorId;
  title: string;
  description: string;
  weight: number;
};

export type EventWorldImpact = {
  id: string;
  eventId: string;
  label: string;
  who: string;
  why: string;
  invented: string;
  collaborators: string[];
  professions: ProfessionId[];
  knowledgeCreated: string;
  graphNodeId: string;
  permanentEffects: string[];
};

export type CivilizationEventsSnapshot = {
  computedAt: string;
  eventsSummary: string;
  activeEvents: CivilizationEvent[];
  upcomingEvents: CivilizationEvent[];
  grandChallenge: GrandChallenge | null;
  worldExpo: WorldExpo | null;
  crossDisciplineTeams: CrossDisciplineTeam[];
  /** Public-safe — no reserved pack names exposed */
  discoveryFramework: PublicDiscoveryFrameworkSnapshot;
  /** Discovery Culture™ — mythology and mystery, never the full roadmap */
  discoveryCulture: PublicDiscoveryCultureSnapshot;
  /** The Unknown™ — permanent mystery philosophy; the map is never complete */
  theUnknown: PublicUnknownSnapshot;
  discoveryEligibility: DiscoveryEligibilitySnapshot;
  /** Count of eligible reward grants — identity hidden until release */
  eligibleDiscoveryGrantCount: number;
  museumExhibits: LivingMuseumExhibit[];
  collaborationHonors: CollaborationHonor[];
  worldImpacts: EventWorldImpact[];
  orbCuratorLine: string | null;
  /** Discovery Oracle™ — exploration voice, higher priority than curator when world expands */
  orbDiscoveryLine: string | null;
  /** Orb hint from The Unknown™ — hints without explaining */
  orbUnknownHint: string | null;
  participationEligible: string[];
};

export type CivilizationEventsInput = {
  warehouseAssetCount: number;
  warehouseGoldenBuildTotal: number;
  warehouseFavoriteCount: number;
  civilizationHealth: number;
  collaborationCapital: number;
  knowledgeCapital: number;
  innovationCapital: number;
  companyName: string;
};
