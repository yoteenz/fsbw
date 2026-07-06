import type {
  COMMUNITY_FEATURES,
  DISCOVERY_FILTERS,
  REPUTATION_DIMENSIONS,
  SHAREABLE_ASSET_TYPES,
} from './constants';

export type ShareableAssetType = (typeof SHAREABLE_ASSET_TYPES)[number];
export type DiscoveryFilter = (typeof DISCOVERY_FILTERS)[number];
export type ReputationDimension = (typeof REPUTATION_DIMENSIONS)[number];
export type CommunityFeature = (typeof COMMUNITY_FEATURES)[number];

export type AssetAttribution = {
  originalOrganization: string;
  founder: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  license: string;
  usageRights: string;
  downloads: number;
  reviews: number;
  adoptions: number;
  averageRating: number;
};

export type PublishableAsset = {
  id: string;
  type: ShareableAssetType;
  typeLabel: string;
  title: string;
  summary: string;
  published: boolean;
  permissionRequired: true;
  ipOwnershipRetained: true;
  attribution: AssetAttribution;
  discoveryTags: string[];
};

export type DiscoveredResource = {
  id: string;
  title: string;
  type: ShareableAssetType;
  typeLabel: string;
  organization: string;
  verified: boolean;
  rating: number;
  adoptions: number;
  filterMatch: DiscoveryFilter;
  summary: string;
  attribution: AssetAttribution;
};

export type ReputationProfile = {
  dimension: ReputationDimension;
  label: string;
  scorePct: number;
  insight: string;
};

export type CommunityHighlight = {
  id: string;
  feature: CommunityFeature;
  label: string;
  headline: string;
  detail: string;
  active: boolean;
};

export type OrganizationLegacyNetworkProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  founderName: string;
  updatedAt: string;
  networkMovementScore: number;
  publishableAssets: number;
  publishedAssets: number;
  discoveredResources: number;
  communityTrustPct: number;
  legacyScorePct: number;
  publishableAssetsList: PublishableAsset[];
  discoveredResourcesList: DiscoveredResource[];
  reputation: ReputationProfile[];
  communityHighlights: CommunityHighlight[];
  dockLegacyLine: string;
  permissionBasedEcosystem: true;
  notAMarketplace: true;
  syncedSources: string[];
};

export type LegacyNetworkStore = {
  version: string;
  profiles: OrganizationLegacyNetworkProfile[];
};

export type LegacyNetworkDockAdvice = {
  response: string;
  concierge: string;
  networkMovementScore?: number;
  legacyScorePct?: number;
};
