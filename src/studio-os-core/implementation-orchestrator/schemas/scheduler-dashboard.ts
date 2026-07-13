import type { StudioOsJob, ResourceEstimate } from './os-job';
import type { GraphHealthReport } from './implementation-graph';

export type SchedulerResourceSnapshot = {
  gpuUtilizationPct: number;
  cpuUtilizationPct: number;
  budgetConsumedUsd: number;
  budgetRemainingUsd: number;
  queueDepth: number;
  workerAllocation: Record<string, number>;
};

export type SchedulerDashboard = {
  running: StudioOsJob[];
  queued: StudioOsJob[];
  blocked: StudioOsJob[];
  failed: StudioOsJob[];
  completed: StudioOsJob[];
  upcoming: StudioOsJob[];
  critical: StudioOsJob[];
  resources: SchedulerResourceSnapshot;
  estimatedCompletionJobs: number;
  queueHealth: GraphHealthReport;
  throughputPerHour: number;
  alerts: string[];
};

export type CommandCenterSchedulerSnapshot = {
  source: 'os-scheduler';
  schedulerVersion: string;
  dashboard: SchedulerDashboard;
  aggregateResources: ResourceEstimate;
  healthScore: number;
  capacityStatus: 'healthy' | 'strained' | 'critical';
};
