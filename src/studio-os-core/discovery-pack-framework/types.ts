/**
 * Discovery Pack Framework™ — internal registry & release infrastructure.
 * ERA 2 — WORLD™ · Reserve discoveries · Reveal intentionally.
 *
 * Public API never exposes reserved/classified pack names.
 */

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
  dependencies: string[];
  unlockMethod: DiscoveryPackUnlockMethod;
  linkedEventId?: string;
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
