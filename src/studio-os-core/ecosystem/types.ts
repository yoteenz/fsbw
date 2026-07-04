/**
 * Studio OS Ecosystem v1.0 — business operating ecosystem for community-created assets.
 */

export type EcosystemCategory =
  | 'company-blueprint'
  | 'creative-dna'
  | 'company-dna'
  | 'writing-bible'
  | 'photography-bible'
  | 'asset-pack'
  | 'prompt-library'
  | 'automation-pack'
  | 'workflow-system'
  | 'campaign-template'
  | 'email-system'
  | 'landing-page-system'
  | 'sales-system'
  | 'executive-ai-team'
  | 'ai-director'
  | 'knowledge-graph-template'
  | 'interactive-manual'
  | 'onboarding-system'
  | 'industry-template'
  | 'dashboard-layout'
  | 'application';

export type PublishStage =
  | 'draft'
  | 'private-testing'
  | 'pilot'
  | 'review'
  | 'approved'
  | 'published'
  | 'updates'
  | 'retired';

export type LicenseModel = 'free' | 'paid' | 'subscription' | 'royalty' | 'enterprise' | 'seat-based' | 'workspace-based' | 'custom';

export type EcosystemAsset = {
  id: string;
  workspaceId: string;
  title: string;
  category: EcosystemCategory;
  creatorId: string;
  creatorName: string;
  stage: PublishStage;
  description: string;
  version: string;
  downloads: number;
  rating: number;
  reviewCount: number;
  favorites: number;
  pricing: string;
  licenseModel: LicenseModel;
  knowledgeGraphNodeId: string;
  featured: boolean;
  trending: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AssetDependency = {
  id: string;
  assetId: string;
  requiresModule: string;
  label: string;
  required: boolean;
};

export type EcosystemReviewCheck = {
  id: string;
  assetId: string;
  quality: 'pass' | 'pending' | 'fail';
  documentation: 'pass' | 'pending' | 'fail';
  compatibility: 'pass' | 'pending' | 'fail';
  dependencies: 'pass' | 'pending' | 'fail';
  security: 'pass' | 'pending' | 'fail';
  licensing: 'pass' | 'pending' | 'fail';
  versioning: 'pass' | 'pending' | 'fail';
  studioOsCompatibility: string;
};

export type InstallRecord = {
  id: string;
  workspaceId: string;
  assetId: string;
  assetTitle: string;
  version: string;
  installedAt: string;
  status: 'active' | 'rollback' | 'retired';
  backupCreated: boolean;
  dependenciesInstalled: string[];
  kgUpdated: boolean;
  memoryBibleUpdated: boolean;
};

export type AssetVersion = {
  id: string;
  assetId: string;
  version: string;
  type: 'major' | 'minor' | 'patch';
  releaseNotes: string;
  compatibilityMatrix: string;
  publishedAt: string;
};

export type EcosystemRecommendation = {
  id: string;
  workspaceId: string;
  assetId: string;
  assetTitle: string;
  score: number;
  explanation: string;
  signals: string[];
};

export type CreatorProfile = {
  id: string;
  displayName: string;
  verified: boolean;
  followers: number;
  assetsPublished: number;
  totalDownloads: number;
  reputation: number;
  badges: string[];
  featured: boolean;
};

export type EcosystemAnalytics = {
  totalDownloads: number;
  activeInstalls: number;
  retentionPct: number;
  avgRating: number;
  totalRevenue: number;
  subscriptionRevenue: number;
  renewalPct: number;
  updateAdoptionPct: number;
  supportRequests: number;
  satisfactionScore: number;
};

export type EnterpriseEcosystemLibrary = {
  id: string;
  organizationName: string;
  privateBlueprints: number;
  privateExecutives: number;
  privateAutomations: number;
  privateMarketplace: boolean;
};

export type HubFeaturedCard = {
  id: string;
  type: 'company' | 'blueprint' | 'executive' | 'creative-dna' | 'writing-bible' | 'automation' | 'integration' | 'consultant' | 'creator' | 'workspace' | 'enterprise';
  title: string;
  subtitle: string;
  assetId?: string;
};

export type EcosystemStore = {
  assets: EcosystemAsset[];
  dependencies: AssetDependency[];
  reviews: EcosystemReviewCheck[];
  installs: InstallRecord[];
  versions: AssetVersion[];
  recommendations: EcosystemRecommendation[];
  creators: CreatorProfile[];
  analytics: EcosystemAnalytics;
  enterpriseLibraries: EnterpriseEcosystemLibrary[];
  hubCards: HubFeaturedCard[];
  version: string;
};
