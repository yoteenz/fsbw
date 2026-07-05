/** Organizational Inheritance V1.0 — inherit organizational genetics across companies (Milestone 42). */

export type InheritanceSourceId =
  | 'scratch'
  | 'frontal-slayer'
  | 'ndxbook'
  | 'vxd'
  | 'ai-media'
  | 'custom'
  | 'multi';

export type InheritableGeneticId =
  | 'company-dna'
  | 'creative-dna'
  | 'writing-dna'
  | 'leadership-dna'
  | 'operational-dna'
  | 'department-playbooks'
  | 'approval-workflows'
  | 'quality-standards'
  | 'executive-structures'
  | 'automation-systems'
  | 'knowledge-graph'
  | 'memory-bible'
  | 'studio-intelligence-models'
  | 'simulation-history'
  | 'talent-structures'
  | 'marketplace-configurations';

export type InheritanceCategoryId =
  | 'leadership'
  | 'creative'
  | 'operations'
  | 'marketing'
  | 'finance'
  | 'content'
  | 'engineering'
  | 'legal'
  | 'support'
  | 'automation'
  | 'knowledge'
  | 'brand'
  | 'culture';

export type InheritanceCategoryAction = 'inherit' | 'skip' | 'customize' | 'combine';

export type InheritanceSource = {
  id: InheritanceSourceId;
  label: string;
  description: string;
  companyType: string;
  availableGenetics: InheritableGeneticId[];
  maturityPct: number;
};

export type InheritanceCategoryConfig = {
  id: InheritanceCategoryId;
  label: string;
  genetics: InheritableGeneticId[];
  action: InheritanceCategoryAction;
  sourceId: InheritanceSourceId | null;
  notes: string;
};

export type GeneticBlendItem = {
  geneticId: InheritableGeneticId;
  sourceId: InheritanceSourceId;
  sourceLabel: string;
  blendWeightPct: number;
};

export type GeneticConflict = {
  id: string;
  geneticId: InheritableGeneticId;
  sources: string[];
  severity: 'low' | 'medium' | 'high';
  resolution: string;
};

export type GeneticBlendPlan = {
  id: string;
  label: string;
  items: GeneticBlendItem[];
  conflicts: GeneticConflict[];
  mergeStrategy: string;
};

export type InheritanceSimulatorResult = {
  organizationalCompatibilityPct: number;
  workflowConflicts: string[];
  departmentOverlap: string[];
  approvalConflicts: string[];
  leadershipConsistencyPct: number;
  brandCompatibilityPct: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidencePct: number;
  recommendedAdjustments: string[];
  readyToActivate: boolean;
};

export type InstitutionalLibraryItem = {
  id: string;
  title: string;
  type:
    | 'company-template'
    | 'department-playbook'
    | 'executive-playbook'
    | 'creative-system'
    | 'marketing-system'
    | 'sales-system'
    | 'automation-system'
    | 'knowledge-system'
    | 'organizational-genetics';
  sourceId: InheritanceSourceId;
  version: string;
  description: string;
  tags: string[];
  searchable: boolean;
};

export type DepartmentInheritancePackage = {
  id: string;
  departmentName: string;
  sourceId: InheritanceSourceId;
  knowledge: string[];
  playbooks: string[];
  qualityStandards: string[];
  approvalWorkflows: string[];
  bestPractices: string[];
  adaptToIdentity: string;
};

export type ExecutiveInheritancePackage = {
  id: string;
  executiveRole: string;
  sourceId: InheritanceSourceId;
  leadershipExperience: string[];
  organizationalMemory: string[];
  decisionFrameworks: string[];
  departmentHistory: string[];
  bestPractices: string[];
  historicalPerformancePct: number;
  cosRecommended: boolean;
};

export type KnowledgeAncestryRecord = {
  id: string;
  systemLabel: string;
  geneticId: InheritableGeneticId;
  originSourceId: InheritanceSourceId;
  originLabel: string;
  originDetail: string;
  inheritedAt: string;
  editable: boolean;
};

export type OrgTimelineEvent = {
  id: string;
  at: string;
  type: 'inheritance' | 'evolution' | 'divergence' | 'knowledge-growth' | 'executive-maturity';
  title: string;
  detail: string;
  companyId: string;
};

export type InheritanceRecommendation = {
  id: string;
  targetCompanyType: string;
  recommendation: string;
  genetics: InheritableGeneticId[];
  sourceId: InheritanceSourceId;
  confidencePct: number;
  rationale: string;
};

export type OrganizationalEvolutionRecord = {
  id: string;
  companyId: string;
  at: string;
  type: 'decision' | 'workflow' | 'genetic' | 'lesson' | 'institutional-knowledge';
  title: string;
  detail: string;
  inheritedFrom: InheritanceSourceId | null;
};

export type CrossCompanyLearningOffer = {
  id: string;
  sourceCompanyId: InheritanceSourceId;
  title: string;
  improvement: string;
  visibility: 'private' | 'reusable';
  availableToOthers: boolean;
};

/** Marketplace architecture prepared — not implemented in V1.0. */
export type MarketplacePreparedCapability = {
  id: string;
  assetType: string;
  description: string;
  status: 'architecture-only';
  futureActions: ('share' | 'license' | 'sell' | 'purchase')[];
};

export type InheritanceWizardDraft = {
  targetCompanyName: string;
  primarySourceId: InheritanceSourceId;
  secondarySourceIds: InheritanceSourceId[];
  categoryConfigs: InheritanceCategoryConfig[];
  blendPlanId: string | null;
  simulatorPassed: boolean;
};

export type OrganizationalInheritanceStore = {
  version: string;
  lastUpdatedAt: string;
  dashboard: {
    summary: string;
    libraryItemCount: number;
    activeBlends: number;
    companiesWithInheritance: number;
    reusableAssets: number;
    avgConfidencePct: number;
    evolutionEvents: number;
  };
  sources: InheritanceSource[];
  categoryConfigs: InheritanceCategoryConfig[];
  blendPlans: GeneticBlendPlan[];
  simulator: InheritanceSimulatorResult;
  library: InstitutionalLibraryItem[];
  departmentPackages: DepartmentInheritancePackage[];
  executivePackages: ExecutiveInheritancePackage[];
  ancestry: KnowledgeAncestryRecord[];
  timeline: OrgTimelineEvent[];
  recommendations: InheritanceRecommendation[];
  evolution: OrganizationalEvolutionRecord[];
  crossCompanyLearning: CrossCompanyLearningOffer[];
  marketplacePrepared: MarketplacePreparedCapability[];
  wizardDraft: InheritanceWizardDraft;
  selectedLibraryItemId: string | null;
  selectedBlendPlanId: string | null;
};
