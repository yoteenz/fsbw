/** Remembrance Garden V1.0 — preserve gratitude (Milestone 59.6). */

export type RemembranceGardenWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'portfolio';

export type PrivacyLevel = 'private' | 'family' | 'executive' | 'organization' | 'public';

export type MemorialType =
  | 'flower-garden'
  | 'cherry-blossom'
  | 'oak-tree'
  | 'olive-tree'
  | 'rose-garden'
  | 'reflection-pool'
  | 'glass-sculpture'
  | 'marble-monument'
  | 'walking-bridge'
  | 'lantern-pathway'
  | 'crystal-installation'
  | 'garden-pavilion'
  | 'stone-engraving';

export type DedicationSpace = {
  id: string;
  category: string;
  honoree: string;
  memorialType: MemorialType;
  architecturalElement: string;
  privacy: PrivacyLevel;
};

export type MemoryPreservation = {
  id: string;
  dedicationId: string;
  reflection: string;
  lifeLesson?: string;
  quote?: string;
  hasMedia?: boolean;
};

export type ReflectionSpace = {
  id: string;
  label: string;
  purpose: string;
  locationInGarden: string;
};

export type LivingSeasonChange = {
  id: string;
  element: string;
  evolution: string;
  season: string;
  timeOfDay?: string;
};

export type GratitudeMoment = {
  id: string;
  signal: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
};

export type LegacyLetter = {
  id: string;
  recipient: string;
  subject: string;
  excerpt: string;
  unlockPolicy: 'private' | 'scheduled' | 'legacy';
  privacy: PrivacyLevel;
};

export type FamilyHeritageEntry = {
  id: string;
  category: string;
  title: string;
  note: string;
  institutionalShare: PrivacyLevel;
};

export type FutureGenerationInsight = {
  id: string;
  category: string;
  insight: string;
};

export type PortfolioRemembranceLink = {
  id: string;
  fromCompany: string;
  toCompany: string;
  sharedInfluence: string;
};

export type CampusIntegrationPoint = {
  id: string;
  campusLocation: string;
  connection: string;
};

export type RemembranceGardenStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: RemembranceGardenWorkspaceId;
  companyName: string;
  dashboard: {
    summary: string;
    dedicationCount: number;
    reflectionSpaces: number;
    preservedMemories: number;
    legacyLetters: number;
    gardenMaturityPct: number;
    gratitudeDepthPct: number;
    activeSeason: string;
  };
  gardenPhilosophy: string[];
  dedicationSpaces: DedicationSpace[];
  memoryPreservations: MemoryPreservation[];
  reflectionSpaces: ReflectionSpace[];
  livingSeasons: LivingSeasonChange[];
  gratitudeMoments: GratitudeMoment[];
  legacyLetters: LegacyLetter[];
  familyHeritage: FamilyHeritageEntry[];
  futureGenerations: FutureGenerationInsight[];
  portfolioRemembrance: PortfolioRemembranceLink[];
  campusIntegration: CampusIntegrationPoint[];
  recommendedNextSteps: string[];
  futureOpportunities: string[];
};
