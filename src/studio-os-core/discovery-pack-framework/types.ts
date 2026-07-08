/**
 * Discovery Pack Framework™ — internal registry & release infrastructure.
 * ERA 2 — WORLD™ · Discovery Culture™ · Reserve discoveries · Reveal intentionally.
 *
 * Public API never exposes reserved/classified pack names or the full roadmap.
 */

/** Discovery States™ — full lifecycle recorded in the World Graph™ */
export type DiscoveryState =
  | 'conceived'
  | 'research'
  | 'prototype'
  | 'hidden'
  | 'rumored'
  | 'teased'
  | 'announced'
  | 'discovered'
  | 'integrated'
  | 'historical';

export type DiscoveryTier = 'standard' | 'legendary';

export type DiscoveryPackStatus =
  | 'reserved'
  | 'classified'
  | 'scheduled'
  | 'revealed'
  | 'released'
  | 'archived';

export type DiscoveryPackCategory =
  | 'district'
  | 'civilization'
  | 'intelligence'
  | 'world-mechanics'
  | 'creator'
  | 'experience';

export type DiscoveryPackUnlockMethod =
  | 'global-release'
  | 'civilization-event'
  | 'collaboration'
  | 'community-milestone'
  | 'innovation-milestone'
  | 'beta-pioneer'
  | 'historical-achievement'
  | 'classified';

export type DiscoveryPackReleaseEra =
  | 'ERA 2 — WORLD™'
  | 'ERA 3 — INTELLIGENCE™'
  | 'ERA 4 — CIVILIZATION™'
  | 'ERA 5 — LEGACY™';

export type DiscoveryPackIntegrations = {
  worldGraph: { nodeId: string; enabled: boolean };
  atlas: { expansionId: string | null; enabled: boolean };
  museum: { exhibitSlotId: string | null; hallOfDiscovery: boolean; enabled: boolean };
  marketplace: { listingCategory: string | null; enabled: boolean };
  knowledgeCore: { moduleId: string | null; enabled: boolean };
  rewards: { grantTypes: string[]; enabled: boolean };
};

/** Full internal registry entry — never surface reserved entries to founder UI */
export type DiscoveryPackRegistryEntry = {
  packId: string;
  internalCodename: string;
  /** Null until officially revealed — preserves discovery excitement */
  publicName: string | null;
  category: DiscoveryPackCategory;
  releaseEra: DiscoveryPackReleaseEra;
  status: DiscoveryPackStatus;
  /** Discovery States™ lifecycle — defaults from status when omitted */
  discoveryState?: DiscoveryState;
  /** Legendary discoveries unlock only through extraordinary achievements */
  tier?: DiscoveryTier;
  dependencies: string[];
  unlockMethod: DiscoveryPackUnlockMethod;
  linkedEventId?: string;
  /** World Lore™ anchor — internal until discovered */
  loreId?: string;
  integrations: DiscoveryPackIntegrations;
  documentationRef: string;
  canonicalHistory: string | null;
};

/** Public-safe framework snapshot — no secret pack names */
export type PublicDiscoveryFrameworkSnapshot = {
  frameworkVersion: string;
  computedAt: string;
  frontierSummary: string;
  releasedPackCount: number;
  revealedPackCount: number;
  reservedSlotCount: number;
  hallOfDiscoveryReady: boolean;
  categoryPillars: DiscoveryPackCategoryPillar[];
  /** Only packs with status released or revealed */
  publicReleases: PublicDiscoveryRelease[];
  integrationStatus: DiscoveryIntegrationStatus;
};

export type DiscoveryPackCategoryPillar = {
  category: DiscoveryPackCategory;
  label: string;
  description: string;
  reservedCount: number;
};

export type PublicDiscoveryRelease = {
  packId: string;
  publicName: string;
  category: DiscoveryPackCategory;
  status: 'revealed' | 'released';
  releaseEra: DiscoveryPackReleaseEra;
  revealedAt: string | null;
};

export type DiscoveryIntegrationStatus = {
  worldGraph: boolean;
  atlas: boolean;
  museum: boolean;
  marketplace: boolean;
  knowledgeCore: boolean;
  rewards: boolean;
};

/** Internal eligibility — count only, no pack identity exposed */
export type DiscoveryEligibilitySnapshot = {
  frontierSignalsActive: number;
  civilizationEventLinked: number;
  collaborationEligible: boolean;
};

/** Public-safe Discovery Culture™ — mythology, not roadmap */
export type PublicDiscoveryCultureSnapshot = {
  cultureVersion: string;
  computedAt: string;
  /** Current era only — never the full roadmap */
  eraSummary: string;
  curiosityPrompt: string;
  designPrinciple: string;
  /** Aggregate mystery signals — no pack identity */
  mysteryCount: number;
  rumoredFrontierCount: number;
  teasedFrontierCount: number;
  legendaryMysteryCount: number;
  hiddenActivationCount: number;
  /** "The world just got bigger" — when hidden discoveries activate */
  worldExpansionAmbient: string | null;
  /** World systems responding to a discovery event — aggregate labels only */
  worldResponsesActive: string[];
  civilizationMilestones: PublicMilestoneProgress[];
  approachingMilestoneCount: number;
  investigation: PublicInvestigationSnapshot;
  lorePulse: string;
  /** Orb Discovery Oracle line — exploration voice */
  discoveryOracleLine: string;
};

export type PublicMilestoneProgress = {
  id: string;
  publicLabel: string;
  publicDescription: string;
  progressPct: number;
  worldEvolutionHint: string;
  approaching: boolean;
};

export type PublicInvestigationSnapshot = {
  activeCount: number;
  advancingCount: number;
  primaryThread: {
    publicTitle: string;
    publicDescription: string;
    publicHint: string;
    communityProgressPct: number;
  } | null;
  ambientLine: string | null;
};

/** Known World™ — Atlas region taxonomy */
export type AtlasRegionKind =
  | 'known'
  | 'unknown'
  | 'uncharted'
  | 'restricted'
  | 'experimental'
  | 'historical'
  | 'future';

/** Unknown Frontier Lifecycle™ — World Graph origin story */
export type UnknownFrontierLifecycle =
  | 'unknown'
  | 'discovered'
  | 'explored'
  | 'integrated'
  | 'historic';

export type PublicAtlasRegionSummary = {
  knownCount: number;
  unknownCount: number;
  unchartedCount: number;
  restrictedCount: number;
  experimentalCount: number;
  historicalCount: number;
  futureCount: number;
  fogCoveragePct: number;
  totalRegions: number;
  chartedRegions: number;
};

export type PublicWorldFogSnapshot = {
  activeFogPct: number;
  explorationProgressPct: number;
  fogBeyondChartedTerritory: boolean;
  signalsBeyondFrontier: boolean;
  ambientQuestion: string;
  fogFraming: string;
};

export type PublicCommunityDiscovery = {
  id: string;
  publicLabel: string;
  publicDescription: string;
  progressPct: number;
  unlocked: boolean;
  foundersRequiredHint: string;
};

export type PublicUnknownMuseumExhibit = {
  id: string;
  publicTitle: string;
  discoveryStory: string;
  whyHidden: string;
  contributorFraming: string;
  worldChange: string;
  permanent: true;
};

/** Public-safe The Unknown™ — permanent mystery philosophy, never the full map */
export type PublicUnknownSnapshot = {
  unknownVersion: string;
  computedAt: string;
  philosophy: string;
  promise: string;
  atlasUnderstanding: string;
  designPrinciple: string;
  mapNeverComplete: boolean;
  regionSummary: PublicAtlasRegionSummary;
  worldFog: PublicWorldFogSnapshot;
  discoveryConditionsActive: number;
  approachingConditionCount: number;
  communityDiscoveries: PublicCommunityDiscovery[];
  primaryCommunityDiscovery: PublicCommunityDiscovery | null;
  museumExhibits: PublicUnknownMuseumExhibit[];
  museumAmbientLine: string | null;
  orbHint: string;
  discoveryLanguageLine: string;
};
