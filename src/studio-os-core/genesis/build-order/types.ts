import type {
  BuildOrderArchitecturalPhase,
  BuildOrderPriority,
  BuildOrderStatus,
  ComplexityLevel,
  ReadinessLevel,
  RiskLevel,
  ValueLevel,
} from './constants';

/** Build Order system record — full planning matrix from STUDIO_OS_BUILD_ORDER.md */
export type BuildOrderSystemRecord = {
  systemId: string;
  officialName: string;
  purpose: string;
  architecturalPhase: BuildOrderArchitecturalPhase;
  priority: BuildOrderPriority;
  topologicalOrder: number;
  dependencies: string[];
  dependents: string[];
  blockedBy: string[];
  blocks: string[];
  complexity: ComplexityLevel;
  businessValue: ValueLevel;
  platformValue: ValueLevel;
  estimatedBuildTime: string;
  architecturalReadiness: ReadinessLevel;
  implementationReadiness: ReadinessLevel;
  rewriteRisk: RiskLevel;
  technicalDebtRisk: RiskLevel;
  currentStatus: BuildOrderStatus;
  notes?: string;
  seededAt?: string;
  updatedAt?: string;
};

export type BuildOrderStore = {
  version: string;
  systems: BuildOrderSystemRecord[];
  seededAt?: string;
  bootstrappedAt?: string;
  lastRecomputedAt?: string;
};

export type BuildOrderSeedInput = Omit<
  BuildOrderSystemRecord,
  'dependents' | 'blockedBy' | 'seededAt' | 'updatedAt'
>;

export type BuildOrderRegistryEntry = {
  systemId: string;
  officialName: string;
  topologicalOrder: number;
  architecturalPhase: BuildOrderArchitecturalPhase;
  priority: BuildOrderPriority;
  currentStatus: BuildOrderStatus;
  architecturalReadiness: ReadinessLevel;
  implementationReadiness: ReadinessLevel;
};

export type BuildPhaseView = {
  phase: BuildOrderArchitecturalPhase;
  label: string;
  goal: string;
  systems: BuildOrderRegistryEntry[];
};

export type DependencyResolution = {
  systemId: string;
  officialName: string;
  dependencies: string[];
  dependents: string[];
  blockedBy: string[];
  blocks: string[];
  resolved: boolean;
};

export type CriticalPathEntry = {
  systemId: string;
  officialName: string;
  position: number;
  currentStatus: BuildOrderStatus;
  isComplete: boolean;
  isNext: boolean;
};

export type CriticalPathView = {
  path: CriticalPathEntry[];
  completedCount: number;
  nextSystemId: string | null;
  totalLength: number;
};

export type ParallelTrack = {
  trackId: string;
  label: string;
  canProceedAfter: string[];
  systemIds: string[];
  readySystemIds: string[];
  blockedSystemIds: string[];
};

export type ParallelWorkView = {
  tracks: ParallelTrack[];
  readyTrackCount: number;
};

export type ReadinessScoreEntry = {
  systemId: string;
  officialName: string;
  score: number;
  level: ReadinessLevel;
  blockedBy: string[];
};

export type ArchitecturalReadinessView = {
  systems: ReadinessScoreEntry[];
  averageScore: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
};

export type ImplementationReadinessView = {
  systems: ReadinessScoreEntry[];
  averageScore: number;
  readyToBuildCount: number;
  shippedCount: number;
};

export type BlockedSystemView = {
  systemId: string;
  officialName: string;
  blockedBy: string[];
  blocks: string[];
  missingDependencies: string[];
  topologicalOrder: number;
};

export type ReadyToBuildView = {
  systemId: string;
  officialName: string;
  topologicalOrder: number;
  priority: BuildOrderPriority;
  implementationScore: number;
  businessValue: ValueLevel;
  platformValue: ValueLevel;
};

export type RoadmapEntry = {
  systemId: string;
  officialName: string;
  topologicalOrder: number;
  architecturalPhase: BuildOrderArchitecturalPhase;
  currentStatus: BuildOrderStatus;
  priority: BuildOrderPriority;
  blockedBy: string[];
};

export type CurrentSprintView = {
  cycle: number;
  primaryBuild: string;
  secondaryParallel: string[];
  exitCondition: string;
  primarySystemId: string | null;
  isPrimaryReady: boolean;
};

export type RewriteRiskEntry = {
  riskId: string;
  label: string;
  trigger: string;
  prevention: string;
  affectedSystemIds: string[];
  severity: RiskLevel;
};

export type TechnicalDebtEntry = {
  debtId: string;
  label: string;
  consequence: string;
  governanceRule: string;
  affectedSystemIds: string[];
  severity: RiskLevel;
};

export type BuildOrderPlatformStats = {
  systemCount: number;
  implementedCount: number;
  inProgressCount: number;
  plannedCount: number;
  blockedCount: number;
  readyToBuildCount: number;
  optimalNextSystemId: string | null;
  criticalPathProgress: number;
  averageImplementationReadiness: number;
};

export type BuildOrderValidationReport = {
  valid: boolean;
  issues: { code: string; message: string; systemId?: string }[];
};

export type BuildOrderCircularDependencyReport = {
  hasCycles: boolean;
  cycles: string[][];
};
