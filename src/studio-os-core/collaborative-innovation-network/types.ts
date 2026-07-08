import type {
  CONTRIBUTION_DOMAINS,
  GENOME_LAYERS,
  JOINT_MARKETPLACE_ASSET_TYPES,
  PUBLICATION_VISIBILITY_OPTIONS,
} from './constants';

export type ContributionDomain = (typeof CONTRIBUTION_DOMAINS)[number];
export type PublicationVisibility = (typeof PUBLICATION_VISIBILITY_OPTIONS)[number];
export type JointMarketplaceAssetType = (typeof JOINT_MARKETPLACE_ASSET_TYPES)[number];
export type GenomeLayer = (typeof GENOME_LAYERS)[number];

export type FounderGenomeSnapshot = {
  founderId: string;
  founderName: string;
  organizationId: string;
  organizationName: string;
  layers: Partial<Record<GenomeLayer, string[]>>;
  primaryStrengths: string[];
};

export type CollaborationGenome = {
  id: string;
  sessionId: string;
  combinedStrengths: string[];
  layerSummary: string;
  founderSnapshots: FounderGenomeSnapshot[];
  createdAt: string;
  active: boolean;
};

export type LiveCollaboratorPresence = {
  id: string;
  founderId: string;
  founderName: string;
  role: string;
  organizationName: string;
  currentPath: string;
  currentRoomLabel: string;
  status: 'active' | 'observing' | 'idle';
  lastActiveAt: string;
  hasVoice: boolean;
  hasCursor: boolean;
  attributionLabel: string;
};

export type ContributionShare = {
  founderId: string;
  founderName: string;
  domain: ContributionDomain;
  domainLabel: string;
  percentage: number;
  evidence: string;
};

export type RoyaltySplit = {
  founderId: string;
  founderName: string;
  percentage: number;
  perpetual: boolean;
};

export type InnovationTimelineEvent = {
  id: string;
  label: string;
  at: string;
  actorName: string;
};

export type JointInnovationRecord = {
  id: string;
  innovationId: string;
  title: string;
  summary: string;
  assetType: JointMarketplaceAssetType;
  assetTypeLabel: string;
  visibility: PublicationVisibility;
  visibilityLabel: string;
  published: boolean;
  publishedAt: string | null;
  creators: string[];
  contributions: ContributionShare[];
  royaltySplits: RoyaltySplit[];
  timeline: InnovationTimelineEvent[];
  version: string;
  forks: number;
  merges: number;
  descendants: number;
  marketplacePerformanceScore: number;
  companiesUsing: number;
  impactScore: number;
  detectedAt: string;
};

export type SharedInnovationWorkspace = {
  id: string;
  title: string;
  path: string;
  pathLabel: string;
  collaboratorIds: string[];
  collaborationGenomeId: string;
  active: boolean;
  startedAt: string;
};

export type CollaboratorRecommendation = {
  id: string;
  founderName: string;
  organizationName: string;
  headline: string;
  rationale: string;
  complementScore: number;
  sharedInterests: string[];
  suggestedWorkspace: string;
  suggestedPath: string;
};

export type InnovationDistrictSummary = {
  activeSessions: number;
  liveCollaborators: number;
  jointInnovationsPublished: number;
  marketplaceRevenuePotential: number;
  recommendedCollaborators: number;
};

export type OrganizationCollaborativeInnovationNetworkProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  innovationNetworkScore: number;
  summary: InnovationDistrictSummary;
  founderGenome: FounderGenomeSnapshot;
  liveCollaborators: LiveCollaboratorPresence[];
  sharedWorkspaces: SharedInnovationWorkspace[];
  collaborationGenomes: CollaborationGenome[];
  jointInnovations: JointInnovationRecord[];
  recommendations: CollaboratorRecommendation[];
  dockCollaborationLine: string;
  syncedSources: string[];
  permanentCollaborativeInvention: true;
};

export type CollaborativeInnovationNetworkStore = {
  version: string;
  profiles: OrganizationCollaborativeInnovationNetworkProfile[];
};

export type CollaborativeInnovationNetworkDockAdvice = {
  response: string;
  concierge: string;
  innovationNetworkScore?: number;
  liveCollaborators?: number;
};
