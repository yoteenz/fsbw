import type {
  PROMPT_CATEGORIES,
  PROMPT_REGISTRY_PHILOSOPHY,
  PROMPT_STATUSES,
  PROMPT_TYPES,
  SUPPORTED_MODELS,
} from './constants';

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];
export type PromptType = (typeof PROMPT_TYPES)[number];
export type PromptStatus = (typeof PROMPT_STATUSES)[number];
export type SupportedModel = (typeof SUPPORTED_MODELS)[number];
export type PromptPhilosophyLine = (typeof PROMPT_REGISTRY_PHILOSOPHY)[number];

export type PromptEntry = {
  promptId: string;
  name: string;
  description: string;
  purpose: string;
  promptType: PromptType;
  category: PromptCategory;
  owner: string;
  organizationScope: string[];
  department: string;
  associatedFeature: string;
  version: string;
  status: PromptStatus;
  dependencies: string[];
  supportedModels: SupportedModel[];
  variables: string[];
  expectedOutput: string;
  fallbackPromptId?: string;
  documentation: string[];
  lastUpdated: string;
  registered: boolean;
  qualityScorePct: number;
  testCount: number;
};

export type PromptVersionRecord = {
  versionId: string;
  promptId: string;
  promptName: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
  status: 'approved' | 'draft' | 'archived' | 'pending-approval';
  contentPreview: string;
  approvedBy?: string;
  approvedAt?: string;
};

export type PromptTestResult = {
  testId: string;
  promptId: string;
  promptName: string;
  version: string;
  testedAt: string;
  responseQualityPct: number;
  consistencyPct: number;
  latencyMs: number;
  costUsd: number;
  tokenUsage: number;
  hallucinationRiskPct: number;
  trustCompliancePct: number;
  knowledgeCoveragePct: number;
  outputStructurePct: number;
  qualityScorePct: number;
  model: SupportedModel;
  passed: boolean;
};

export type PromptVersionComparison = {
  promptId: string;
  promptName: string;
  versionA: string;
  versionB: string;
  summary: string;
  qualityDeltaPct: number;
  latencyDeltaMs: number;
  tokenDelta: number;
};

export type PromptGovernanceFinding = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  promptId?: string;
  message: string;
  recommendation: string;
};

export type PromptHealthMetric = {
  id: string;
  label: string;
  scorePct: number;
  detail: string;
  status: 'healthy' | 'warning' | 'critical';
};

export type PromptImprovementRecommendation = {
  id: string;
  promptId?: string;
  title: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
};

export type OrganizationPromptRegistryProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  registryScore: number;
  totalPrompts: number;
  activeCount: number;
  draftCount: number;
  pendingApprovalCount: number;
  categoryCounts: Record<string, number>;
  prompts: PromptEntry[];
  versionHistory: PromptVersionRecord[];
  testResults: PromptTestResult[];
  versionComparisons: PromptVersionComparison[];
  recommendations: PromptImprovementRecommendation[];
  governanceFindings: PromptGovernanceFinding[];
  healthMetrics: PromptHealthMetric[];
  avgQualityScorePct: number;
  dockRegistryLine: string;
  firstClassPrompts: true;
  lastSyncedAt: string;
};

export type PromptRegistryStore = {
  version: string;
  profiles: OrganizationPromptRegistryProfile[];
};

export type PromptRegistryDockAdvice = {
  response: string;
  concierge: string;
  registryScore?: number;
};

export type PromptSearchHit = {
  entry: PromptEntry;
  score: number;
  matchReason: string;
};
