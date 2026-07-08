/**
 * ARTICLE-D09 — Hero Objects™ & Contextual Orb™
 *
 * Hero Objects are collectible navigation artifacts, not software icons.
 */

export type HeroObjectEditionType =
  | 'standard'
  | 'founder'
  | 'golden'
  | 'anniversary'
  | 'community-event'
  | 'achievement-unlock'
  | 'limited-time-civilization';

export type HeroObjectSurface =
  | 'orb'
  | 'atlas'
  | 'studio-foundry'
  | 'asset-registry'
  | 'marketplace'
  | 'museum'
  | 'innovation-hall'
  | 'knowledge-core'
  | 'production-board'
  | 'achievements'
  | 'expeditions';

export type HeroObjectSilhouetteFamily =
  | 'orbital-globe'
  | 'architectural-table'
  | 'vertical-wall'
  | 'foundry-crucible'
  | 'vault-door'
  | 'theater-marquee'
  | 'holographic-constellation'
  | 'mechanical-bay'
  | 'material-tower'
  | 'archive-scroll'
  | 'pavilion-arch'
  | 'performance-monolith';

export type HeroObjectMotionProfile = {
  ambientMotion: string;
  internalEnergy: string;
  materialBehavior: string;
  lightRefraction: string;
  environmentalReflection: string;
  personality: string;
};

export type HeroObjectEdition = {
  editionType: HeroObjectEditionType;
  displayName: string;
  materialOverride?: string;
  unlockCondition: string;
  scarcity: 'common' | 'earned' | 'rare' | 'limited' | 'legendary';
};

export type HeroObjectHistoryEvent = {
  date: string;
  title: string;
  note: string;
};

export type ContextualOrbPlacement = {
  contextId: string;
  contextLabel: string;
  relevanceRank: number;
  reason: string;
};

export type HeroObjectDefinition = {
  id: string;
  displayName: string;
  destinationId: string;
  destinationLabel: string;
  destinationRouteId?: string;
  destinationPath?: string;
  summary: string;
  silhouetteFamily: HeroObjectSilhouetteFamily;
  silhouetteLaw: string;
  material: string;
  creator: 'Studio Foundry™';
  dateIntroduced: string;
  version: string;
  assetRegistryId: string;
  worldGraphSlug: string;
  foundryProductLine: string;
  surfaces: HeroObjectSurface[];
  motion: HeroObjectMotionProfile;
  editions: HeroObjectEdition[];
  usageHistory: HeroObjectHistoryEvent[];
  evolutionTimeline: HeroObjectHistoryEvent[];
  contextualOrbPlacements: ContextualOrbPlacement[];
  tags: string[];
};

export type ContextualOrbToolbelt = {
  contextId: string;
  contextLabel: string;
  heroObjectIds: string[];
};
