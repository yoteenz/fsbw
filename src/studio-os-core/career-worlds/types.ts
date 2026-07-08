/**
 * Career Worlds™ — persistent professional-life architecture.
 * Education is not a lesson sequence; it is an alternate professional reality.
 */

export const CAREER_WORLD_IDS = [
  'hair-world',
  'marketing-world',
  'architecture-world',
  'construction-world',
  'photography-world',
  'film-world',
  'music-world',
  'finance-world',
  'fashion-world',
  'legal-world',
  'healthcare-world',
  'restaurant-world',
] as const;

export type CareerWorldId = (typeof CAREER_WORLD_IDS)[number];

export const CAREER_WORLD_PROGRESS_PHASES = [
  'entry',
  'apprentice',
  'operator',
  'specialist',
  'leader',
  'founder',
  'master-professional',
  'mentor',
] as const;

export type CareerWorldProgressPhase = (typeof CAREER_WORLD_PROGRESS_PHASES)[number];

export type CareerWorldLifeSystem =
  | 'companies'
  | 'workplaces'
  | 'districts'
  | 'npc-professionals'
  | 'mentors'
  | 'clients'
  | 'suppliers'
  | 'competitors'
  | 'economy'
  | 'events'
  | 'challenges'
  | 'promotions'
  | 'industry-news'
  | 'seasonal-changes'
  | 'community-achievements';

export type CareerWorldIdentityField =
  | 'reputation'
  | 'resume'
  | 'portfolio'
  | 'income'
  | 'network'
  | 'certifications'
  | 'achievements'
  | 'promotion-history'
  | 'mentorship-history'
  | 'industry-influence';

export type CareerWorldEndgameMilestone =
  | 'start-business'
  | 'hire-employees'
  | 'open-new-locations'
  | 'mentor-apprentices'
  | 'invent-techniques'
  | 'publish-research'
  | 'speak-at-conferences'
  | 'win-industry-awards'
  | 'change-the-profession';

export type CareerWorldEconomyModel = {
  currencyName: string;
  revenueSources: string[];
  marketForces: string[];
  offlineActivity: string[];
};

export type CareerWorldBlueprint = {
  id: CareerWorldId;
  slug: CareerWorldId;
  name: string;
  profession: string;
  oneLine: string;
  worldQuestion: string;
  primaryFantasy: string;
  lifeSystems: CareerWorldLifeSystem[];
  identityFields: CareerWorldIdentityField[];
  progressionPhases: CareerWorldProgressPhase[];
  endgameMilestones: CareerWorldEndgameMilestone[];
  economy: CareerWorldEconomyModel;
  canonicalDistricts: string[];
  npcArchetypes: string[];
  mentorArchetypes: string[];
  clientArchetypes: string[];
  challengeLoops: string[];
  offlineEvolutionSignals: string[];
  graphTags: string[];
};

export type CareerWorldRuntimeSnapshot = {
  worldId: CareerWorldId;
  learnerId: string;
  currentPhase: CareerWorldProgressPhase;
  simulatedAt: string;
  offlineDeltaHours: number;
  activeEvents: string[];
  marketSignals: string[];
  reputationSignals: string[];
  recommendedNextLives: string[];
};
