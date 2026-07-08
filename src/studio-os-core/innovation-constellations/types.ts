import type {
  CELESTIAL_LEVELS,
  CONSTELLATION_IDS,
  GALAXY_IDS,
  STAR_INFLUENCE_TIERS,
} from './constants';

export type CelestialLevel = (typeof CELESTIAL_LEVELS)[number];
export type StarInfluenceTier = (typeof STAR_INFLUENCE_TIERS)[number];
export type GalaxyId = (typeof GALAXY_IDS)[number];
export type ConstellationId = (typeof CONSTELLATION_IDS)[number];

export type InnovationStar = {
  id: string;
  innovationId: string;
  title: string;
  level: 'star' | 'sun';
  influenceTier: StarInfluenceTier;
  influenceLabel: string;
  brightness: number;
  companiesUsing: number;
  creativeEquity: number;
  mapX: number;
  mapY: number;
  constellationId: ConstellationId;
  solarSystemId: string;
  descendants: number;
  collaborators: string[];
  evolving: boolean;
};

export type SolarSystem = {
  id: string;
  title: string;
  familyKind: 'headquarters' | 'blueprints' | 'departments' | 'workflows' | 'ai-families';
  starIds: string[];
  constellationId: ConstellationId;
};

export type InnovationConstellation = {
  id: ConstellationId;
  title: string;
  galaxyId: GalaxyId;
  solarSystemIds: string[];
  starCount: number;
  evolutionVelocity: 'stable' | 'growing' | 'rapid';
  mapX: number;
  mapY: number;
  influentialStars: string[];
  emergingStars: string[];
  marketplaceLeaders: string[];
  opportunityGap?: string;
};

export type InnovationGalaxy = {
  id: GalaxyId;
  title: string;
  constellationIds: ConstellationId[];
  expansionRate: number;
  starCount: number;
};

export type CollaborationPathway = {
  id: string;
  founderA: string;
  founderB: string;
  strength: number;
  collaborationCount: number;
  glowing: boolean;
};

export type OpportunityRegion = {
  id: string;
  galaxyId: GalaxyId;
  constellationId?: ConstellationId;
  label: string;
  reason: string;
  darkness: number;
  suggestedFounderFit?: string;
};

export type FoundersStar = {
  founderId: string;
  founderName: string;
  magnitude: number;
  tier: StarInfluenceTier;
  orbitingAchievements: string[];
  planetarySystems: string[];
  companyWorlds: string[];
  growthRate: number;
};

export type AcademicModeView = {
  innovationId: string;
  title: string;
  originalInspiration: string;
  evolutionTimeline: string[];
  contributors: string[];
  forks: number;
  merges: number;
  businessImpact: string;
  marketplaceAdoption: string;
  knowledgeGraphSummary: string;
};

export type LivingHistorySnapshot = {
  id: string;
  eraLabel: string;
  at: string;
  starCount: number;
  headline: string;
};

export type MarketplaceConstellationContext = {
  innovationId: string;
  title: string;
  constellationTitle: string;
  lineageSummary: string;
  descendants: number;
  influenceTier: StarInfluenceTier;
  collaborators: string[];
  creativeEquity: number;
  marketplacePerformance: number;
  estimatedBusinessImpact: string;
};

export type InnovationUniverse = {
  title: string;
  galaxies: InnovationGalaxy[];
  constellations: InnovationConstellation[];
  solarSystems: SolarSystem[];
  stars: InnovationStar[];
  pathways: CollaborationPathway[];
  opportunities: OpportunityRegion[];
  foundersStar: FoundersStar;
  livingHistory: LivingHistorySnapshot[];
};

export type OrganizationInnovationConstellationsProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  universeScore: number;
  universe: InnovationUniverse;
  activeGalaxyId: GalaxyId;
  activeConstellationId: ConstellationId | null;
  academicViews: AcademicModeView[];
  marketplaceContexts: MarketplaceConstellationContext[];
  dockCosmicLine: string;
  syncedSources: string[];
  permanentKnowledgeUniverse: true;
};

export type InnovationConstellationsStore = {
  version: string;
  profiles: OrganizationInnovationConstellationsProfile[];
};

export type InnovationConstellationsDockAdvice = {
  response: string;
  concierge: string;
  universeScore?: number;
};
