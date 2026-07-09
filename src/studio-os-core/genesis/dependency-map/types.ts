import type {
  BuildPhase,
  BuildPriority,
  ImplementationRiskLevel,
  SystemImplementationStatus,
} from './constants';

/** Studio OS core system dependency record */
export type DependencySystemRecord = {
  systemId: string;
  name: string;
  purpose: string;
  status: SystemImplementationStatus;
  buildPhase: BuildPhase;
  buildOrder: number;
  priority: BuildPriority;
  upstreamDependencies: string[];
  downstreamDependents: string[];
  ownedData: string[];
  eventsEmitted: string[];
  eventsConsumed: string[];
  blockedBy: string[];
  implementationRisk: ImplementationRiskLevel;
  readinessScore: number;
  notes?: string;
  seededAt?: string;
  updatedAt?: string;
};

export type DependencyMapStore = {
  version: string;
  systems: DependencySystemRecord[];
  seededAt?: string;
  bootstrappedAt?: string;
  lastRecomputedAt?: string;
};

export type DependencyGraphEdge = {
  from: string;
  to: string;
};

export type DependencyGraphView = {
  nodes: string[];
  edges: DependencyGraphEdge[];
};

export type BuildOrderEntry = {
  systemId: string;
  name: string;
  buildOrder: number;
  buildPhase: BuildPhase;
  priority: BuildPriority;
  status: SystemImplementationStatus;
  readinessScore: number;
};

export type RiskViewEntry = {
  systemId: string;
  name: string;
  implementationRisk: ImplementationRiskLevel;
  blockedBy: string[];
  readinessScore: number;
  priority: BuildPriority;
};

export type BlockedSystemEntry = {
  systemId: string;
  name: string;
  blockedBy: string[];
  missingDependencies: string[];
  readinessScore: number;
};

export type ReadyToBuildEntry = {
  systemId: string;
  name: string;
  buildOrder: number;
  priority: BuildPriority;
  readinessScore: number;
};

export type CircularDependencyReport = {
  hasCycles: boolean;
  cycles: string[][];
};

export type MissingDependencyReport = {
  systemId: string;
  name: string;
  missingUpstream: string[];
  unknownUpstream: string[];
};

export type DependencyMapRegistryStats = {
  systemCount: number;
  implementedCount: number;
  inProgressCount: number;
  plannedCount: number;
  blockedCount: number;
  readyToBuildCount: number;
  circularCycleCount: number;
  missingDependencyCount: number;
  averageReadinessScore: number;
};

export type DependencyMapValidationReport = {
  valid: boolean;
  issues: { code: string; message: string; systemId?: string }[];
};

export type DependencyMapSeedInput = Omit<
  DependencySystemRecord,
  'downstreamDependents' | 'blockedBy' | 'readinessScore' | 'seededAt' | 'updatedAt'
>;
