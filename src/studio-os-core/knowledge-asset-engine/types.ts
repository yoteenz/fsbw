/** Knowledge Asset Engine V1.0 — foundational object model for Studio OS (Milestone 51). */

export type KnowledgeAssetWorkspaceId = 'ndxbook' | 'frontal-slayer' | 'studio-os' | 'custom';

export type KnowledgeAssetTypeId =
  | 'page'
  | 'video'
  | 'script'
  | 'research'
  | 'article'
  | 'newsletter'
  | 'podcast'
  | 'ebook'
  | 'course'
  | 'presentation'
  | 'design-system'
  | 'workflow'
  | 'prompt'
  | 'automation'
  | 'playbook'
  | 'meeting'
  | 'simulation'
  | 'case-study'
  | 'lesson'
  | 'company-dna'
  | 'creative-dna';

export type KnowledgeAssetStatus = 'draft' | 'review' | 'approved' | 'published' | 'evergreen' | 'archived';

export type KnowledgeMaturityStage = 'draft' | 'validated' | 'institutional' | 'foundational' | 'timeless';

export type KnowledgeAssetProfile = {
  id: string;
  knowledgeAssetId: string;
  workspaceId: KnowledgeAssetWorkspaceId;
  title: string;
  description: string;
  assetType: KnowledgeAssetTypeId;
  owner: string;
  organization: string;
  origin: string;
  version: string;
  status: KnowledgeAssetStatus;
  maturityStage: KnowledgeMaturityStage;
  knowledgeMaturityPct: number;
  confidencePct: number;
  qualityScore: number;
  knowledgeScore: number;
  usageCount: number;
  contributors: string[];
  lastUpdated: string;
  futurePotential: string;
  distributionEngineId?: string;
  campaignId?: string;
};

export type DerivedAsset = {
  id: string;
  parentAssetId: string;
  format: string;
  title: string;
  status: KnowledgeAssetStatus;
  lastSynced: string;
};

export type SingleSourceOfTruth = {
  canonicalAssetId: string;
  canonicalTitle: string;
  derivedAssets: DerivedAsset[];
  syncRecommendation: string;
};

export type KnowledgeEvolution = {
  assetId: string;
  versions: { version: string; date: string; summary: string; contributor: string }[];
  feedback: string[];
  readerInsights: string[];
  performanceTrend: string;
  institutionalLearning: string[];
  accuracyImprovementPct: number;
};

export type KnowledgeLineageNode = {
  id: string;
  assetId: string;
  label: string;
  relation: 'origin' | 'parent' | 'child' | 'derived' | 'cross-company' | 'campaign' | 'strategy' | 'executive' | 'department' | 'community' | 'marketplace';
  targetLabel: string;
};

export type KnowledgeMaturityMetrics = {
  assetId: string;
  accuracyPct: number;
  adoptionPct: number;
  reusePct: number;
  longevityPct: number;
  readerValuePct: number;
  communityImpactPct: number;
  organizationalImportancePct: number;
  learningContributionPct: number;
  stage: KnowledgeMaturityStage;
};

export type KnowledgeRelationship = {
  id: string;
  assetId: string;
  type: 'strategy' | 'campaign' | 'executive' | 'department' | 'product' | 'company' | 'reader' | 'community' | 'course' | 'event' | 'simulation';
  targetId: string;
  targetLabel: string;
};

export type KnowledgeTransformation = {
  id: string;
  sourceAssetId: string;
  targetFormat: string;
  label: string;
  preservesSourceOfTruth: boolean;
  status: 'available' | 'recommended' | 'in-progress' | 'complete';
};

export type KnowledgeIntelligenceRec = {
  id: string;
  assetId: string;
  action: 'expand' | 'combine' | 'refresh' | 'archive' | 'republish' | 'teach' | 'license' | 'bundle' | 'monetize' | 'translate' | 'simplify' | 'deepen';
  label: string;
  confidencePct: number;
  rationale: string;
  expectedImpact: string;
};

export type KnowledgeRevenue = {
  assetId: string;
  totalRevenue: string;
  channels: { channel: string; amount: string }[];
  forecast: string;
  monetizationPotential: string;
};

export type AcademyPath = {
  id: string;
  title: string;
  type: 'course' | 'learning-path' | 'certification' | 'onboarding' | 'customer-ed' | 'creator-ed' | 'executive-ed' | 'community-ed';
  assetIds: string[];
  description: string;
  progressPct: number;
};

export type ExecutiveKnowledgeLink = {
  id: string;
  executiveRole: string;
  assetIds: string[];
  trainingFocus: string;
};

export type KnowledgeInheritancePackage = {
  id: string;
  industry: string;
  assetIds: string[];
  description: string;
  preservesEvolution: boolean;
};

export type KnowledgeHealth = {
  overallPct: number;
  connectedAssetsPct: number;
  orphanedAssets: number;
  staleAssets: number;
  avgMaturityPct: number;
  revenueGenerating: number;
};

export type KnowledgeAssetEngineStore = {
  version: string;
  lastUpdatedAt: string;
  activeWorkspaceId: KnowledgeAssetWorkspaceId;
  dashboard: {
    summary: string;
    totalAssets: number;
    canonicalSources: number;
    avgMaturityPct: number;
    derivedFormats: number;
    academyPaths: number;
    knowledgeHealthPct: number;
  };
  knowledgePhilosophy: string[];
  assetTypes: { id: KnowledgeAssetTypeId; label: string }[];
  maturityStages: { stage: KnowledgeMaturityStage; label: string; description: string }[];
  assets: KnowledgeAssetProfile[];
  singleSourceOfTruth: SingleSourceOfTruth[];
  evolutions: KnowledgeEvolution[];
  lineage: KnowledgeLineageNode[];
  maturityMetrics: KnowledgeMaturityMetrics[];
  relationships: KnowledgeRelationship[];
  transformations: KnowledgeTransformation[];
  intelligenceRecs: KnowledgeIntelligenceRec[];
  revenue: Record<string, KnowledgeRevenue>;
  academyPaths: AcademyPath[];
  executiveLinks: ExecutiveKnowledgeLink[];
  inheritancePackages: KnowledgeInheritancePackage[];
  health: KnowledgeHealth;
  selectedAssetId: string | null;
};
