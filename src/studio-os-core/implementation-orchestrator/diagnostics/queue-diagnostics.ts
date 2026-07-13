import type { ImplementationTask } from '../schemas/implementation-task';
import type { QueueDashboard } from '../schemas/implementation-graph';
import { analyzeGraphHealth, computeCriticalPath } from '../dependency-graph/graph-engine';

export function buildQueueDashboard(tasks: ImplementationTask[]): QueueDashboard {
  const criticalPath = computeCriticalPath(tasks);
  const health = analyzeGraphHealth(tasks);
  const deployed = tasks.filter((t) => t.category === 'pipeline' || t.category === 'architecture' || t.category === 'governance');
  const departmentCoverage = deployed.length
    ? Math.round((deployed.filter((t) => t.status === 'DEPLOYED').length / deployed.length) * 100)
    : 0;

  const ready = tasks.filter((t) => t.status === 'READY').sort((a, b) => b.priority - a.priority);
  const blocked = tasks.filter((t) => t.status === 'BLOCKED').sort((a, b) => b.priority - a.priority);
  const running = tasks.filter((t) => t.status === 'RUNNING' || t.status === 'QUEUED');
  const testing = tasks.filter((t) => t.status === 'TESTING' || t.status === 'VERIFICATION');
  const waitingFounder = tasks.filter((t) => t.status === 'FOUNDER_REVIEW' || (t.founderApprovalRequired && !t.founderApproved && t.status === 'READY'));
  const completed = tasks.filter((t) => t.status === 'DEPLOYED' || t.status === 'ARCHIVED');

  const nextRecommended = ready[0] ?? null;
  const highestRisk = [...blocked, ...tasks.filter((t) => t.status === 'FAILED')]
    .sort((a, b) => b.priority - a.priority)[0] ?? null;

  return {
    ready,
    blocked,
    running,
    testing,
    waitingFounder,
    completed,
    nextRecommended,
    highestRisk,
    criticalPath,
    departmentCoverage,
    queueHealth: health,
    estimatedCompletionTasks: tasks.filter((t) => t.status !== 'DEPLOYED' && t.status !== 'ARCHIVED').length,
  };
}
