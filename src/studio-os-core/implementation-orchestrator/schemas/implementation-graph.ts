import type { ImplementationTask } from './implementation-task';
import { IMPLEMENTATION_ORCHESTRATOR_VERSION } from './implementation-task';

export type ImplementationGraphEdge = {
  from: string;
  to: string;
  relationship: 'depends-on' | 'unlocks' | 'blocks';
};

export type ImplementationGraph = {
  graphVersion: typeof IMPLEMENTATION_ORCHESTRATOR_VERSION;
  graphRevision: number;
  nodes: string[];
  edges: ImplementationGraphEdge[];
};

export type GraphHealthIssue = {
  code: 'CYCLE' | 'ORPHAN' | 'DUPLICATE' | 'DEAD_END' | 'MISSING_DEPENDENCY';
  message: string;
  taskIds: string[];
};

export type GraphHealthReport = {
  ok: boolean;
  issues: GraphHealthIssue[];
  topologicalOrder: string[];
  orphanTasks: string[];
  deadEndTasks: string[];
};

export type CriticalPathResult = {
  longestChain: string[];
  chainLength: number;
  highestImpactTask: string;
  largestBlocker: string | null;
  recommendedNext: string | null;
  unlockImpact: Array<{ taskId: string; downstreamCount: number; message: string }>;
};

export type QueueDashboard = {
  ready: ImplementationTask[];
  blocked: ImplementationTask[];
  running: ImplementationTask[];
  testing: ImplementationTask[];
  waitingFounder: ImplementationTask[];
  completed: ImplementationTask[];
  nextRecommended: ImplementationTask | null;
  highestRisk: ImplementationTask | null;
  criticalPath: CriticalPathResult;
  departmentCoverage: number;
  queueHealth: GraphHealthReport;
  estimatedCompletionTasks: number;
};
