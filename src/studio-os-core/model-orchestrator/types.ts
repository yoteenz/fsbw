import type {
  BENCHMARK_DIMENSIONS,
  FAILOVER_STEPS,
  LOCAL_OFFLINE_CAPABILITIES,
  ORCHESTRATOR_CRITERIA,
  ORCHESTRATOR_PROVIDERS,
  ROUTING_TASK_TYPES,
  SWAP_PROTECTED_FEATURES,
} from './constants';

export type OrchestratorProvider = (typeof ORCHESTRATOR_PROVIDERS)[number];
export type RoutingTaskType = (typeof ROUTING_TASK_TYPES)[number];
export type SwapProtectedFeature = (typeof SWAP_PROTECTED_FEATURES)[number];
export type FailoverStep = (typeof FAILOVER_STEPS)[number];
export type LocalOfflineCapability = (typeof LOCAL_OFFLINE_CAPABILITIES)[number];
export type BenchmarkDimension = (typeof BENCHMARK_DIMENSIONS)[number];
export type OrchestratorCriterion = (typeof ORCHESTRATOR_CRITERIA)[number];

export type TaskRouteDecision = {
  taskType: RoutingTaskType;
  taskLabel: string;
  assignedProvider: OrchestratorProvider;
  providerLabel: string;
  reason: string;
  founderVisible: false;
  costTier: 'low' | 'medium' | 'high';
  speedTier: 'fast' | 'balanced' | 'quality';
};

export type SwapProtectedStatus = {
  feature: SwapProtectedFeature;
  label: string;
  operationalAfterSwap: true;
  lastVerifiedAt: string;
  notes: string;
};

export type FailoverPlanStep = {
  step: FailoverStep;
  label: string;
  status: 'ready' | 'active' | 'standby';
  detail: string;
};

export type LocalOfflineProfile = {
  capability: LocalOfflineCapability;
  label: string;
  available: boolean;
  offlineModeSupported: boolean;
  detail: string;
};

export type ModelBenchmarkScore = {
  dimension: BenchmarkDimension;
  label: string;
  scorePct: number;
  insight: string;
  preferredProvider: OrchestratorProvider;
};

export type OrchestratorCriterionStatus = {
  criterion: OrchestratorCriterion;
  label: string;
  satisfied: boolean;
  detail: string;
};

export type OrchestratedRequest = {
  id: string;
  taskType: RoutingTaskType;
  query: string;
  providerUsed: OrchestratorProvider;
  failoverUsed: boolean;
  studioIntelligenceValidated: true;
  processedAt: string;
};

export type OrganizationModelOrchestratorProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  orchestratorScore: number;
  activeProvider: OrchestratorProvider;
  swapReady: true;
  failoverHealthPct: number;
  offlineCapable: boolean;
  taskRoutes: TaskRouteDecision[];
  swapProtectedFeatures: SwapProtectedStatus[];
  failoverPlan: FailoverPlanStep[];
  localOfflineCapabilities: LocalOfflineProfile[];
  benchmarkScores: ModelBenchmarkScore[];
  orchestratorCriteria: OrchestratorCriterionStatus[];
  recentRequests: OrchestratedRequest[];
  dockOrchestratorLine: string;
  aiSwapEngineLine: string;
  studioIntelligenceLinked: true;
  directVendorCallsBlocked: true;
  syncedSources: string[];
};

export type ModelOrchestratorStore = {
  version: string;
  profiles: OrganizationModelOrchestratorProfile[];
};

export type ModelOrchestratorDockAdvice = {
  response: string;
  concierge: string;
  orchestratorScore?: number;
  failoverHealthPct?: number;
};
