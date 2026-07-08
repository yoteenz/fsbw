import type {
  CONTRIBUTION_TIMELINE_DOMAINS,
  FORK_ACTIONS,
  INNOVATION_ASSET_KINDS,
  LINEAGE_RELATION_TYPES,
} from './constants';

export type LineageRelationType = (typeof LINEAGE_RELATION_TYPES)[number];
export type ContributionTimelineDomain = (typeof CONTRIBUTION_TIMELINE_DOMAINS)[number];
export type ForkAction = (typeof FORK_ACTIONS)[number];
export type InnovationAssetKind = (typeof INNOVATION_ASSET_KINDS)[number];

export type LineageGraphNode = {
  id: string;
  innovationId: string;
  title: string;
  assetKind: InnovationAssetKind;
  assetKindLabel: string;
  published: boolean;
  marketplaceBestseller: boolean;
  companiesUsing: number;
};

export type LineageGraphEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationType: LineageRelationType;
  relationLabel: string;
  actorName?: string;
  at: string;
};

export type InnovationGraph = {
  rootNodeId: string;
  nodes: LineageGraphNode[];
  edges: LineageGraphEdge[];
};

export type LineageTimelineStep = {
  id: string;
  label: string;
  detail: string;
  at: string;
  kind: 'origin' | 'inspiration' | 'fork' | 'merge' | 'enhancement' | 'publish' | 'adoption' | 'milestone';
};

export type ContributionTimelineEntry = {
  id: string;
  founderId: string;
  founderName: string;
  domain: ContributionTimelineDomain;
  domainLabel: string;
  contribution: string;
  at: string;
  permanent: true;
};

export type IntellectualEquityMetrics = {
  originalContributions: number;
  derivativeWorks: number;
  forks: number;
  successfulMerges: number;
  marketplaceRevenueUsd: number;
  reuseCount: number;
  companiesUsing: number;
  influenceScore: number;
  innovationReach: number;
  creativeEquity: number;
};

export type MarketplaceInventionListing = {
  innovationId: string;
  title: string;
  innovationStory: string;
  evolutionTimeline: LineageTimelineStep[];
  contributors: string[];
  lineageTreeSummary: string;
  marketplacePerformanceScore: number;
  companiesUsing: number;
  estimatedTimeSavedHours: number;
  creativeBudgetSavedUsd: number;
  founderReviews: string[];
  innovationImpactScore: number;
  potentialFutureForks: string[];
};

export type ForkRecord = {
  id: string;
  parentInnovationId: string;
  childInnovationId: string;
  action: ForkAction;
  actionLabel: string;
  actorName: string;
  at: string;
  lineagePreserved: true;
};

export type FounderInnovationLegacy = {
  founderId: string;
  founderName: string;
  creativeEquity: number;
  innovationScore: number;
  marketplaceInfluence: number;
  companiesHelped: number;
  ideasAdopted: number;
  successfulCollaborations: number;
  knowledgeShared: number;
  breakthroughsCreated: number;
  topDomains: string[];
};

export type LineageGalleryExhibit = {
  id: string;
  title: string;
  originalVision: string;
  majorForks: string[];
  collaborators: string[];
  marketplaceSuccess: string;
  companiesUsing: number;
  currentEvolution: string;
  graph: InnovationGraph;
  timeline: LineageTimelineStep[];
  equity: IntellectualEquityMetrics;
};

export type LineageDiscoveryOpportunity = {
  id: string;
  headline: string;
  rationale: string;
  complementScore: number;
  suggestedAction: string;
};

export type OrganizationInnovationLineageProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  lineageScore: number;
  graphs: InnovationGraph[];
  galleryExhibits: LineageGalleryExhibit[];
  founderLegacy: FounderInnovationLegacy;
  marketplaceInventions: MarketplaceInventionListing[];
  forkRecords: ForkRecord[];
  discoveryOpportunities: LineageDiscoveryOpportunity[];
  dockLineageLine: string;
  syncedSources: string[];
  permanentInnovationLineage: true;
};

export type InnovationLineageStore = {
  version: string;
  profiles: OrganizationInnovationLineageProfile[];
};

export type InnovationLineageDockAdvice = {
  response: string;
  concierge: string;
  lineageScore?: number;
  influenceScore?: number;
};
