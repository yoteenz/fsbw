/** Ecosystem Marketplace V1.0 — organizational intelligence exchange (Milestone 50). */

export type EcosystemMarketplaceWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type MarketplaceAssetCategoryId =
  | 'organizational-dna'
  | 'executive-teams'
  | 'departments'
  | 'playbooks'
  | 'templates'
  | 'automation-systems'
  | 'knowledge-assets'
  | 'creative-systems'
  | 'brand-systems'
  | 'marketing-systems'
  | 'sales-systems'
  | 'operations'
  | 'finance'
  | 'legal'
  | 'customer-support'
  | 'community'
  | 'creator-programs'
  | 'courses'
  | 'prompt-systems';

export type LicensingModel =
  | 'free'
  | 'paid'
  | 'subscription'
  | 'enterprise'
  | 'internal-only'
  | 'private-org'
  | 'invite-only'
  | 'community-edition';

export type VerificationBadgeType =
  | 'verified-playbook'
  | 'verified-automation'
  | 'verified-executive'
  | 'verified-organization'
  | 'verified-consultant'
  | 'verified-trainer'
  | 'verified-partner'
  | 'verified-enterprise';

export type InheritanceMode = 'preview' | 'simulation' | 'compatibility-check' | 'partial' | 'full' | 'custom';

export type MarketplaceAssetProfile = {
  id: string;
  workspaceId: EcosystemMarketplaceWorkspaceId;
  title: string;
  category: MarketplaceAssetCategoryId;
  creatorOrg: string;
  organization: string;
  description: string;
  version: string;
  rating: number;
  downloads: number;
  activeCompanies: number;
  performancePct: number;
  reviewCount: number;
  compatibilityPct: number;
  lastUpdated: string;
  inheritanceCompatible: boolean;
  knowledgeMaturityPct: number;
  licensing: LicensingModel;
  verified: boolean;
  verificationBadges: VerificationBadgeType[];
  featured: boolean;
};

export type InheritanceIntegration = {
  assetId: string;
  modes: InheritanceMode[];
  recommendedMode: InheritanceMode;
  compatibilityPct: number;
  reasoning: string;
  partialOptions: string[];
};

export type CompatibilitySimulation = {
  id: string;
  assetId: string;
  label: string;
  workflowConflicts: string[];
  executiveOverlap: string[];
  departmentOverlap: string[];
  dnaCompatibilityPct: number;
  knowledgeConflicts: string[];
  automationConflicts: string[];
  confidencePct: number;
  adjustments: string[];
  readyToInstall: boolean;
};

export type AssetEvolution = {
  assetId: string;
  versions: { version: string; date: string; summary: string }[];
  contributors: string[];
  knowledgeGrowthPct: number;
  performanceTrend: string;
  communityFeedback: string;
  adoptionCount: number;
  intelligenceRecommendation: string;
};

export type CommunityContribution = {
  id: string;
  contributorType: 'founder' | 'creator' | 'consultant' | 'agency' | 'enterprise';
  contributorName: string;
  assetTitle: string;
  status: 'submitted' | 'review' | 'verified' | 'published';
  reviewNotes: string;
};

export type MarketplaceCollaboration = {
  id: string;
  label: string;
  organizations: string[];
  sharedAssetType: string;
  history: string;
};

export type MarketplaceIntelligenceRec = {
  id: string;
  type: 'high-performing' | 'emerging-system' | 'workflow-improvement' | 'best-practice' | 'org-upgrade' | 'compatibility' | 'roi' | 'risk';
  assetId: string;
  label: string;
  confidencePct: number;
  expectedRoi: string;
  riskLevel: 'low' | 'medium' | 'high';
  rationale: string;
};

export type OrganizationalReputation = {
  orgId: string;
  orgName: string;
  qualityPct: number;
  innovationPct: number;
  communityContributionPct: number;
  supportPct: number;
  knowledgeSharingPct: number;
  collaborationPct: number;
  assetPerformancePct: number;
  reliabilityPct: number;
  trustPct: number;
  verified: boolean;
};

export type InstalledAsset = {
  id: string;
  assetId: string;
  title: string;
  installedAt: string;
  inheritanceMode: InheritanceMode;
  healthPct: number;
  lastSync: string;
};

export type IndustryCollection = {
  id: string;
  label: string;
  industry: string;
  assetIds: string[];
  description: string;
};

export type CrossCompanyLearning = {
  id: string;
  category: 'workflow' | 'approval' | 'campaign' | 'relationship' | 'operational';
  insight: string;
  anonymized: boolean;
  adoptionCount: number;
};

export type EcosystemMarketplaceStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: EcosystemMarketplaceWorkspaceId;
  dashboard: {
    summary: string;
    featuredAssets: number;
    verifiedOrgs: number;
    installedAssets: number;
    avgCompatibility: number;
    topContributors: number;
    marketplaceHealthPct: number;
  };
  marketplacePhilosophy: string[];
  categories: { id: MarketplaceAssetCategoryId; label: string }[];
  assets: MarketplaceAssetProfile[];
  inheritanceIntegrations: InheritanceIntegration[];
  compatibilitySimulations: CompatibilitySimulation[];
  assetEvolutions: AssetEvolution[];
  contributions: CommunityContribution[];
  collaborations: MarketplaceCollaboration[];
  intelligenceRecs: MarketplaceIntelligenceRec[];
  reputations: OrganizationalReputation[];
  installedAssets: InstalledAsset[];
  industryCollections: IndustryCollection[];
  crossCompanyLearnings: CrossCompanyLearning[];
  selectedAssetId: string | null;
};
