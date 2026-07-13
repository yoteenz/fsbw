import { describe, expect, it, beforeEach } from 'vitest';
import {
  OS_SCHEDULER_VERSION,
  JOB_CLASSES,
  JOB_PRIORITIES,
  CANONICAL_IMPLEMENTATION_TASKS,
  MUNICIPAL_JOBS,
  FOUNDER_AUTOMATION_JOBS,
  implementationTaskToJob,
  syncImplementationTasksToJobs,
  priorityToScore,
  compareJobPriority,
  sortJobsByPriority,
  validateJobDispatch,
  reconcileJobStatuses,
  evaluateCostGovernor,
  approveJobBudget,
  evaluateWorkforceDispatch,
  dispatchWorkersToJob,
  retryJob,
  pauseJob,
  recordJobLifecycle,
  countEventsByType,
  resetObservabilityLogForTests,
  runSchedulerDispatch,
  buildSchedulerDashboard,
  readOsSchedulerStore,
  resetOsSchedulerStoreForTests,
  writeOsSchedulerStore,
  reconcileOsScheduler,
  listOsJobs,
  approveOsJob,
  trySchedulerDispatch,
  recoverOsJob,
  getOsSchedulerDashboard,
  exportCommandCenterSchedulerSnapshot,
  getCommandCenterOperationalView,
  DEFAULT_SCHEDULER_BUDGET,
} from './index';

describe('Operating System Scheduler™ — Universal Job Model', () => {
  it('defines job classes and priorities', () => {
    expect(JOB_CLASSES.length).toBe(10);
    expect(JOB_PRIORITIES).toEqual(['CRITICAL', 'HIGH', 'NORMAL', 'LOW', 'BACKGROUND']);
  });

  it('converts implementation tasks to universal jobs', () => {
    const jobs = syncImplementationTasksToJobs(CANONICAL_IMPLEMENTATION_TASKS);
    expect(jobs.length).toBe(CANONICAL_IMPLEMENTATION_TASKS.length);
    for (const job of jobs) {
      expect(job.jobVersion).toBe(OS_SCHEDULER_VERSION);
      expect(job.jobId).toMatch(/^impl-/);
      expect(job.implementationTaskId).toBeTruthy();
      expect(job.resourceEstimate.budgetImpactUsd).toBeGreaterThan(0);
      expect(job.approvalRequirements.length).toBeGreaterThan(0);
      expect(job.retryPolicy.maxRetries).toBeGreaterThan(0);
      expect(job.auditHistory.length).toBeGreaterThan(0);
    }
  });

  it('persists jobs in scheduler store', () => {
    resetOsSchedulerStoreForTests();
    const store = readOsSchedulerStore();
    expect(store.schedulerVersion).toBe(OS_SCHEDULER_VERSION);
    expect(store.jobs.length).toBeGreaterThan(CANONICAL_IMPLEMENTATION_TASKS.length);
  });
});

describe('Operating System Scheduler™ — Job Classes Coexist', () => {
  beforeEach(() => {
    resetOsSchedulerStoreForTests();
    reconcileOsScheduler();
  });

  it('coexists implementation, municipal, and automation jobs', () => {
    const jobs = listOsJobs();
    const classes = new Set(jobs.map((j) => j.jobClass));
    expect(classes.has('implementation')).toBe(true);
    expect(classes.has('governance')).toBe(true);
    expect(classes.has('automation')).toBe(true);
    expect(jobs.some((j) => j.jobId.startsWith('muni-'))).toBe(true);
    expect(jobs.some((j) => j.jobId.startsWith('auto-'))).toBe(true);
    expect(MUNICIPAL_JOBS.length).toBeGreaterThan(5);
    expect(FOUNDER_AUTOMATION_JOBS.length).toBeGreaterThan(5);
  });
});

describe('Operating System Scheduler™ — Priority Engine', () => {
  it('orders jobs by priority score', () => {
    const jobs = [
      implementationTaskToJob({ ...CANONICAL_IMPLEMENTATION_TASKS[0]!, priority: 10 }),
      implementationTaskToJob({ ...CANONICAL_IMPLEMENTATION_TASKS[1]!, priority: 95 }),
    ];
    const sorted = sortJobsByPriority(jobs);
    expect(sorted[0]!.priority).toBe('CRITICAL');
    expect(compareJobPriority(jobs[1]!, jobs[0]!)).toBeLessThan(0);
    expect(priorityToScore('CRITICAL')).toBeGreaterThan(priorityToScore('BACKGROUND'));
  });
});

describe('Operating System Scheduler™ — Dependency & Approval Gates', () => {
  it('blocks dispatch when dependencies incomplete', () => {
    const jobs = reconcileJobStatuses([...MUNICIPAL_JOBS]);
    const permit = jobs.find((j) => j.jobId === 'muni-permit-review')!;
    const byId = Object.fromEntries(jobs.map((j) => [j.jobId, j]));
    const result = validateJobDispatch(permit, byId);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('BLOCKERS');
  });

  it('approvals prevent dispatch for expensive jobs', () => {
    const expensive = FOUNDER_AUTOMATION_JOBS.find((j) => j.jobId === 'auto-lighting-bake')!;
    const job = { ...expensive, status: 'READY' as const, approvalRequirements: expensive.approvalRequirements.map((a) =>
      a.type === 'budget' ? { ...a, required: true, satisfied: false } : a
    ) };
    const result = evaluateCostGovernor(job, [], DEFAULT_SCHEDULER_BUDGET);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('APPROVAL_REQUIRED');
  });

  it('budget approval unblocks expensive job', () => {
    const job = approveJobBudget({
      ...FOUNDER_AUTOMATION_JOBS[0]!,
      status: 'READY',
      approvalRequirements: [
        { type: 'budget', required: true, satisfied: false, label: 'Budget' },
      ],
    });
    expect(job.approvalRequirements[0]!.satisfied).toBe(true);
  });
});

describe('Operating System Scheduler™ — AI Workforce Dispatch', () => {
  it('scheduler assigns workers — workers do not self-dispatch', () => {
    const ready = listOsJobs().find((j) => j.status === 'READY' && j.jobClass === 'automation');
    expect(ready).toBeTruthy();
    const eval_ = evaluateWorkforceDispatch(ready!);
    expect(eval_.dispatched).toBe(true);
    expect(eval_.assignedWorkers.length).toBeGreaterThan(0);
    const dispatched = dispatchWorkersToJob(ready!);
    expect(dispatched.assignedWorkers.length).toBeGreaterThan(0);
    expect(dispatched.status).toBe('QUEUED');
  });

  it('runSchedulerDispatch queues ready automation jobs', () => {
    resetOsSchedulerStoreForTests();
    reconcileOsScheduler();
    const result = trySchedulerDispatch();
    expect(result.dispatched.length + result.skipped.length).toBeGreaterThan(0);
  });
});

describe('Operating System Scheduler™ — Failure Recovery', () => {
  it('retry logic functions', () => {
    const failed = { ...listOsJobs()[0]!, status: 'FAILED' as const, retryPolicy: { maxRetries: 3, backoffMs: 1000, escalationAfterRetries: 2, currentRetry: 0 } };
    const retried = retryJob(failed);
    expect(retried?.status).toBe('READY');
    expect(retried?.retryPolicy.currentRetry).toBe(1);
    const paused = pauseJob({ ...failed, status: 'RUNNING' });
    expect(paused.status).toBe('PAUSED');
  });

  it('recoverOsJob applies recovery actions', () => {
    resetOsSchedulerStoreForTests();
    reconcileOsScheduler();
    const store = readOsSchedulerStore();
    const idx = store.jobs.findIndex((j) => j.status === 'READY');
    if (idx >= 0) {
      store.jobs[idx] = { ...store.jobs[idx]!, status: 'FAILED' };
      writeOsSchedulerStore(store);
      const recovered = recoverOsJob(store.jobs[idx]!.jobId, 'retry');
      expect(recovered?.status).toBe('READY');
    }
  });
});

describe('Operating System Scheduler™ — Observability', () => {
  beforeEach(() => {
    resetObservabilityLogForTests();
  });

  it('records lifecycle events', () => {
    recordJobLifecycle('test-job', 'created', 'test');
    recordJobLifecycle('test-job', 'queued', 'test');
    expect(countEventsByType('created')).toBe(1);
    expect(countEventsByType('queued')).toBe(1);
  });
});

describe('Operating System Scheduler™ — Experience Lab & Command Center', () => {
  beforeEach(() => {
    resetOsSchedulerStoreForTests();
    reconcileOsScheduler();
  });

  it('scheduler dashboard displays all sections', () => {
    const dashboard = getOsSchedulerDashboard();
    expect(dashboard.running).toBeDefined();
    expect(dashboard.queued).toBeDefined();
    expect(dashboard.blocked).toBeDefined();
    expect(dashboard.failed).toBeDefined();
    expect(dashboard.completed).toBeDefined();
    expect(dashboard.upcoming).toBeDefined();
    expect(dashboard.critical).toBeDefined();
    expect(dashboard.resources.gpuUtilizationPct).toBeGreaterThanOrEqual(0);
    expect(dashboard.resources.budgetConsumedUsd).toBeGreaterThanOrEqual(0);
    expect(dashboard.estimatedCompletionJobs).toBeGreaterThan(0);
  });

  it('command center reflects runtime scheduler state', () => {
    const snap = exportCommandCenterSchedulerSnapshot();
    expect(snap.source).toBe('os-scheduler');
    expect(snap.healthScore).toBeGreaterThan(0);
    const ops = getCommandCenterOperationalView();
    expect(ops.schedulerVersion).toBe(OS_SCHEDULER_VERSION);
    expect(ops.runningCount).toBeGreaterThanOrEqual(0);
    expect(ops.capacityStatus).toMatch(/healthy|strained|critical/);
  });

  it('approveOsJob satisfies founder and budget gates', () => {
    const blocked = listOsJobs().find((j) => j.status === 'FOUNDER_REVIEW' || j.approvalRequirements.some((a) => a.required && !a.satisfied));
    if (blocked) {
      const approved = approveOsJob(blocked.jobId);
      expect(approved?.approvalRequirements.every((a) => !a.required || a.satisfied)).toBe(true);
    }
  });
});

describe('Operating System Scheduler™ — Resource & Budget Governor', () => {
  it('buildSchedulerDashboard computes resource snapshot', () => {
    const dashboard = buildSchedulerDashboard(listOsJobs());
    expect(dashboard.resources.queueDepth).toBeGreaterThanOrEqual(0);
    expect(dashboard.resources.workerAllocation).toBeDefined();
  });

  it('runSchedulerDispatch respects pause', () => {
    const jobs = listOsJobs();
    const { result } = runSchedulerDispatch(jobs, true);
    expect(result.dispatched).toEqual([]);
  });
});
