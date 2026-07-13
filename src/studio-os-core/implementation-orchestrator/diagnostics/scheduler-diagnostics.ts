import type { StudioOsJob } from '../schemas/os-job';
import type { SchedulerDashboard, SchedulerResourceSnapshot } from '../schemas/scheduler-dashboard';
import { DEFAULT_SCHEDULER_BUDGET } from '../schemas/os-job';
import { sortJobsByPriority } from '../scheduler/priority-engine';
import { aggregateResourceEstimates, computeUtilizationPct } from '../scheduler/resource-governor';
import { countWorkerAllocation } from '../scheduler/workforce-dispatcher';
import { analyzeGraphHealth } from '../dependency-graph/graph-engine';
import type { ImplementationTask } from '../schemas/implementation-task';

function jobToGraphNode(job: StudioOsJob): ImplementationTask {
  return {
    taskVersion: 'implementation-orchestrator.v1',
    taskId: job.jobId,
    title: job.title,
    description: job.description,
    category: 'pipeline',
    priority: job.priorityScore,
    status: job.status === 'COMPLETED' ? 'DEPLOYED' : job.status === 'PAUSED' ? 'RUNNING' : (job.status as ImplementationTask['status']),
    createdDate: job.createdDate,
    updatedDate: job.updatedDate,
    blockedBy: job.blockedBy,
    unlocks: [],
    dependencies: job.dependencies,
    implementationSpec: job.description,
    acceptanceCriteria: [],
    verificationCriteria: [],
    requiredTests: [],
    estimatedEffort: job.estimatedDuration,
    estimatedCost: job.estimatedCost,
    executionMode: 'ASSISTED',
    owner: job.owner,
    founderApprovalRequired: job.approvalRequirements.some((a) => a.type === 'founder' && a.required),
    founderApproved: job.approvalRequirements.find((a) => a.type === 'founder')?.satisfied,
    history: [],
  };
}

export function buildSchedulerDashboard(jobs: StudioOsJob[]): SchedulerDashboard {
  const sorted = sortJobsByPriority(jobs);
  const running = sorted.filter((j) => j.status === 'RUNNING');
  const queued = sorted.filter((j) => j.status === 'QUEUED');
  const blocked = sorted.filter((j) => j.status === 'BLOCKED');
  const failed = sorted.filter((j) => j.status === 'FAILED');
  const completed = sorted.filter((j) => j.status === 'COMPLETED' || j.status === 'ARCHIVED');
  const upcoming = sorted.filter((j) => j.status === 'BACKLOG' || j.status === 'PLANNING');
  const critical = sorted.filter((j) => j.priority === 'CRITICAL' || (j.priority === 'HIGH' && j.status !== 'COMPLETED'));

  const activeEstimates = [...running, ...queued].map((j) => j.resourceEstimate);
  const active = aggregateResourceEstimates(activeEstimates);
  const config = DEFAULT_SCHEDULER_BUDGET;

  const resources: SchedulerResourceSnapshot = {
    gpuUtilizationPct: computeUtilizationPct(active.gpuUnits, config.gpuCapacityUnits),
    cpuUtilizationPct: computeUtilizationPct(active.cpuUnits, config.cpuCapacityUnits),
    budgetConsumedUsd: Math.round(active.budgetImpactUsd * 100) / 100,
    budgetRemainingUsd: Math.max(0, config.dailyBudgetUsd - active.budgetImpactUsd),
    queueDepth: queued.length + running.length,
    workerAllocation: countWorkerAllocation(jobs),
  };

  const graphTasks = jobs.map(jobToGraphNode);
  const health = analyzeGraphHealth(graphTasks);

  const alerts: string[] = [];
  if (resources.gpuUtilizationPct > 85) alerts.push('GPU utilization above 85%');
  if (resources.budgetConsumedUsd > config.dailyBudgetUsd * 0.8) alerts.push('Budget consumption above 80%');
  if (blocked.length > 5) alerts.push(`${blocked.length} jobs blocked — review dependencies`);
  if (failed.length) alerts.push(`${failed.length} failed jobs require recovery`);

  const completedRecently = completed.filter((j) => {
    const last = j.auditHistory[j.auditHistory.length - 1];
    return last && Date.now() - new Date(last.at).getTime() < 3600_000;
  });

  return {
    running,
    queued,
    blocked,
    failed,
    completed,
    upcoming,
    critical,
    resources,
    estimatedCompletionJobs: jobs.filter((j) => j.status !== 'COMPLETED' && j.status !== 'ARCHIVED' && j.status !== 'CANCELLED').length,
    queueHealth: health,
    throughputPerHour: completedRecently.length,
    alerts,
  };
}
