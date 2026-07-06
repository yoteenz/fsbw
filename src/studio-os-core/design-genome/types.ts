import type { AUTO_TAGS, GENOME_SCOPES, PROMOTION_LEVELS } from './constants';
import type { ModuleTenantId } from '../workspace/tenant-ids';

export type PromotionLevelId = (typeof PROMOTION_LEVELS)[number]['id'];
export type DesignGenomeTag = (typeof AUTO_TAGS)[number] | string;
export type DesignGenomeScopeId = (typeof GENOME_SCOPES)[number]['id'];

export type DesignGenomeNavId =
  | 'genome-library'
  | 'promotions'
  | 'inheritance'
  | 'design-memory'
  | 'pre-build-review';

export type DesignAnalysis = {
  purpose: string;
  pageType: string;
  sectionType: string;
  informationHierarchy: string[];
  componentRelationships: string[];
  visualRhythm: string[];
  interactionStyle: string[];
  layoutPhilosophy: string;
  luxuryCharacteristics: string[];
  organizationalPurpose: string;
};

export type DesignReasoning = {
  summary: string;
  approvedBecause: string[];
  avoidReuse?: boolean;
};

export type CapturedStructure = {
  route: string;
  pageLabel: string;
  componentPath: string;
  structureSummary: string;
  typography: string[];
  spacingRhythm: string[];
  animationBehavior: string[];
  visualHierarchy: string[];
  interactionPatterns: string[];
  metadata: Record<string, string>;
};

export type DesignGenomeVersion = {
  versionNumber: number;
  promotedAt: string;
  founderPhrase: string;
  reasoning: DesignReasoning;
  analysis: DesignAnalysis;
  capture: CapturedStructure;
  status: 'current' | 'superseded' | 'deprecated';
};

export type DesignGenomeEntry = {
  id: string;
  organizationId: ModuleTenantId;
  genomeLabel: string;
  scope: DesignGenomeScopeId;
  level: PromotionLevelId;
  title: string;
  tags: DesignGenomeTag[];
  versions: DesignGenomeVersion[];
  referencedBy: string[];
  references: string[];
  searchKeywords: string[];
};

export type PendingPromotion = {
  id: string;
  founderPhrase: string;
  route: string;
  pageLabel: string;
  detectedLevel: PromotionLevelId;
  detectedScope: DesignGenomeScopeId;
  status: 'pending-capture' | 'captured' | 'rejected';
  createdAt: string;
};

export type DesignMemoryMatch = {
  entryId: string;
  title: string;
  relevanceScore: number;
  matchReason: string;
  recommendation: 'inherit' | 'evolve' | 'reference-only';
};

export type PreBuildReview = {
  id: string;
  problem: string;
  queriedAt: string;
  matches: DesignMemoryMatch[];
  recommendation: 'inherit' | 'evolve' | 'create-new';
  reasoning: string;
};

export type DesignGenomeStore = {
  version: string;
  lastUpdatedAt: string;
  organizationId: ModuleTenantId;
  organizationName: string;
  genomeLabel: string;
  philosophy: string[];
  preBuildQuestion: string;
  selectedEntryId: string | null;
  selectedReviewId: string | null;
  activeNavId: DesignGenomeNavId;
  memoryQuery: string;
  entries: DesignGenomeEntry[];
  pendingPromotions: PendingPromotion[];
  preBuildReviews: PreBuildReview[];
  dashboard: {
    summary: string;
    approvedPatterns: number;
    currentVersions: number;
    lineageLinks: number;
    pendingPromotions: number;
  };
};
