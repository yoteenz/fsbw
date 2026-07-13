import { describe, expect, it, beforeEach } from 'vitest';
import {
  CANONICAL_IMPLEMENTATION_TASKS,
  CANONICAL_PIPELINE_TASK_IDS,
  IMPLEMENTATION_ORCHESTRATOR_VERSION,
  reconcileQueueStatuses,
  areBlockersResolved,
  countDownstreamUnlocks,
  buildImplementationGraph,
  topologicalSort,
  detectCycles,
  analyzeGraphHealth,
  computeCriticalPath,
  formatImplementationChain,
  buildQueueDashboard,
  compileImplementationPacket,
  validateImplementationRegistry,
  evaluateAutonomousDispatch,
  validateFounderGate,
  canAutoDispatch,
  requiresFounderApproval,
  readImplementationStore,
  resetImplementationStoreForTests,
  reconcileImplementationQueue,
  listImplementationTasks,
  approveImplementationTask,
  getReadyPackets,
  tryAutonomousDispatch,
  setImplementationPaused,
  markTaskDeployed,
  getImplementationOrchestratorDashboard,
} from './index';

describe('Implementation Orchestrator™ — Registry', () => {
  it('seeds canonical pipeline tasks with full records', () => {
    expect(CANONICAL_PIPELINE_TASK_IDS.length).toBeGreaterThan(10);
    for (const task of CANONICAL_IMPLEMENTATION_TASKS) {
      expect(task.taskVersion).toBe(IMPLEMENTATION_ORCHESTRATOR_VERSION);
      expect(task.taskId.length).toBeGreaterThan(3);
      expect(task.title.length).toBeGreaterThan(3);
      expect(task.description.length).toBeGreaterThan(10);
      expect(task.acceptanceCriteria.length).toBeGreaterThan(0);
      expect(task.verificationCriteria.length).toBeGreaterThan(0);
      expect(task.requiredTests.length).toBeGreaterThan(0);
      expect(task.history.length).toBeGreaterThan(0);
      expect(task.implementationSpec.length).toBeGreaterThan(10);
    }
  });

  it('registry validation passes for canonical tasks', () => {
    const result = validateImplementationRegistry(CANONICAL_IMPLEMENTATION_TASKS);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });
});

describe('Dependency Graph Engine™', () => {
  it('builds live graph with nodes and edges', () => {
    const graph = buildImplementationGraph(CANONICAL_IMPLEMENTATION_TASKS);
    expect(graph.nodes.length).toBe(CANONICAL_IMPLEMENTATION_TASKS.length);
    expect(graph.edges.length).toBeGreaterThan(CANONICAL_IMPLEMENTATION_TASKS.length);
  });

  it('topological sort resolves dependency order', () => {
    const order = topologicalSort(CANONICAL_IMPLEMENTATION_TASKS);
    expect(order.length).toBe(CANONICAL_IMPLEMENTATION_TASKS.length);
    const dnaIdx = order.indexOf('architectural-dna-registry');
    const founderIdx = order.indexOf('canonical-founder-render');
    expect(dnaIdx).toBeLessThan(founderIdx);
  });

  it('detects no cycles in canonical pipeline', () => {
    const cycles = detectCycles(CANONICAL_IMPLEMENTATION_TASKS);
    expect(cycles).toEqual([]);
  });

  it('graph health analysis passes', () => {
    const health = analyzeGraphHealth(CANONICAL_IMPLEMENTATION_TASKS);
    expect(health.ok).toBe(true);
    expect(health.topologicalOrder.length).toBe(CANONICAL_IMPLEMENTATION_TASKS.length);
  });

  it('formats implementation chain for display', () => {
    const chain = formatImplementationChain(
      ['department-identity-isolation', 'architectural-dna-registry', 'golden-prompt-registry'],
      CANONICAL_IMPLEMENTATION_TASKS
    );
    expect(chain).toContain('Department Identity');
    expect(chain).toContain('→');
  });
});

describe('Blocker Engine™', () => {
  it('blocked tasks become READY when blockers deploy', () => {
    const tasks = CANONICAL_IMPLEMENTATION_TASKS.map((t) => ({ ...t }));
    const cds = tasks.find((t) => t.taskId === 'cds-manufacturing')!;
    cds.status = 'BLOCKED';
    cds.blockedBy = ['canonical-founder-render'];

    const founder = tasks.find((t) => t.taskId === 'canonical-founder-render')!;
    founder.status = 'DEPLOYED';

    const reconciled = reconcileQueueStatuses(tasks);
    const cdsAfter = reconciled.find((t) => t.taskId === 'cds-manufacturing')!;
    expect(['READY', 'FOUNDER_REVIEW']).toContain(cdsAfter.status);
  });

  it('counts downstream unlock impact', () => {
    const impact = countDownstreamUnlocks('cds-manufacturing', CANONICAL_IMPLEMENTATION_TASKS);
    expect(impact).toBeGreaterThan(0);
  });

  it('areBlockersResolved checks deployed status', () => {
    const byId = Object.fromEntries(CANONICAL_IMPLEMENTATION_TASKS.map((t) => [t.taskId, t]));
    const construction = byId['construction-mode-pipeline']!;
    expect(areBlockersResolved(construction, byId)).toBe(false);
  });
});

describe('Critical Path Analysis™', () => {
  it('computes longest dependency chain', () => {
    const path = computeCriticalPath(CANONICAL_IMPLEMENTATION_TASKS);
    expect(path.chainLength).toBeGreaterThan(3);
    expect(path.longestChain.length).toBe(path.chainLength);
    expect(path.recommendedNext).toBeTruthy();
  });

  it('reports unlock impact message', () => {
    const path = computeCriticalPath(CANONICAL_IMPLEMENTATION_TASKS);
    const withImpact = path.unlockImpact.find((u) => u.downstreamCount > 0);
    expect(withImpact?.message).toContain('unlocks');
  });
});

describe('Execution Modes & Founder Gates™', () => {
  it('architecture requires MANUAL execution and founder approval', () => {
    const arch = CANONICAL_IMPLEMENTATION_TASKS.find((t) => t.category === 'architecture')!;
    expect(arch.executionMode).toBe('MANUAL');
    expect(requiresFounderApproval('architecture')).toBe(true);
  });

  it('documentation defaults to AUTONOMOUS', () => {
    expect(canAutoDispatch('AUTONOMOUS', false, undefined)).toBe(true);
    expect(canAutoDispatch('MANUAL', false, true)).toBe(false);
  });

  it('founder gate blocks manual architecture dispatch', () => {
    const cds = CANONICAL_IMPLEMENTATION_TASKS.find((t) => t.taskId === 'cds-manufacturing')!;
    const gate = validateFounderGate({ ...cds, founderApproved: false });
    expect(gate.ok).toBe(false);
  });

  it('autonomous dispatch skips manual founder-gated tasks', () => {
    const cds = CANONICAL_IMPLEMENTATION_TASKS.find((t) => t.taskId === 'cds-manufacturing')!;
    const byId = Object.fromEntries(CANONICAL_IMPLEMENTATION_TASKS.map((t) => [t.taskId, { ...t, status: 'READY' as const }]));
    const result = evaluateAutonomousDispatch({ ...cds, status: 'READY', founderApproved: false }, byId, false);
    expect(result.dispatched).toBe(false);
  });
});

describe('Implementation Packets™', () => {
  it('READY tasks compile execution packets', () => {
    const ready = reconcileQueueStatuses(CANONICAL_IMPLEMENTATION_TASKS.map((t) => ({ ...t }))).filter(
      (t) => t.status === 'READY'
    );
    expect(ready.length).toBeGreaterThan(0);
    for (const task of ready) {
      const packet = compileImplementationPacket(task);
      expect(packet.taskId).toBe(task.taskId);
      expect(packet.purpose).toBe(task.description);
      expect(packet.acceptanceCriteria.length).toBeGreaterThan(0);
      expect(packet.tests.length).toBeGreaterThan(0);
      expect(packet.implementationSpec.length).toBeGreaterThan(10);
    }
  });
});

describe('Implementation Store & Queue™', () => {
  beforeEach(() => {
    resetImplementationStoreForTests();
  });

  it('tasks persist in store', () => {
    const store = readImplementationStore();
    expect(store.tasks.length).toBe(CANONICAL_IMPLEMENTATION_TASKS.length);
    expect(store.orchestratorVersion).toBe(IMPLEMENTATION_ORCHESTRATOR_VERSION);
  });

  it('reconcile updates blocked and ready statuses', () => {
    const store = reconcileImplementationQueue();
    const blocked = store.tasks.filter((t) => t.status === 'BLOCKED');
    const ready = store.tasks.filter((t) => t.status === 'READY');
    expect(blocked.length).toBeGreaterThan(0);
    expect(ready.length).toBeGreaterThan(0);
  });

  it('founder approval moves task toward dispatch', () => {
    reconcileImplementationQueue();
    const cds = listImplementationTasks().find((t) => t.taskId === 'cds-manufacturing');
    if (cds?.status === 'FOUNDER_REVIEW' || cds?.founderApprovalRequired) {
      const approved = approveImplementationTask('cds-manufacturing');
      expect(approved?.founderApproved).toBe(true);
    }
  });

  it('mark deployed unlocks downstream tasks', () => {
    reconcileImplementationQueue();
    markTaskDeployed('cds-manufacturing', 'test-commit-sha');
    const store = reconcileImplementationQueue();
    const construction = store.tasks.find((t) => t.taskId === 'construction-mode-pipeline');
    expect(construction?.status).not.toBe('BLOCKED');
  });

  it('autonomous dispatch respects pause and execution mode', () => {
    reconcileImplementationQueue();
    setImplementationPaused(true);
    expect(tryAutonomousDispatch().dispatched).toEqual([]);
    setImplementationPaused(false);
    const result = tryAutonomousDispatch();
    expect(result.skipped.length).toBeGreaterThan(0);
  });

  it('ready packets generate from store', () => {
    reconcileImplementationQueue();
    const packets = getReadyPackets();
    expect(packets.length).toBeGreaterThan(0);
  });
});

describe('Queue Dashboard & Diagnostics™', () => {
  beforeEach(() => {
    resetImplementationStoreForTests();
    reconcileImplementationQueue();
  });

  it('dashboard displays queue health sections', () => {
    const dashboard = getImplementationOrchestratorDashboard();
    expect(dashboard.ready.length + dashboard.blocked.length + dashboard.completed.length).toBeGreaterThan(0);
    expect(dashboard.criticalPath.chainLength).toBeGreaterThan(0);
    expect(dashboard.queueHealth.ok).toBe(true);
    expect(dashboard.departmentCoverage).toBeGreaterThan(0);
  });

  it('buildQueueDashboard identifies next recommended sprint', () => {
    const dashboard = buildQueueDashboard(listImplementationTasks());
    if (dashboard.ready.length) {
      expect(dashboard.nextRecommended?.taskId).toBe(dashboard.ready[0]?.taskId);
    }
  });
});
