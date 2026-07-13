import type { ImplementationTask, ImplementationPacket, SprintHistoryRecord } from '../schemas/implementation-task';
import { IMPLEMENTATION_ORCHESTRATOR_VERSION } from '../schemas/implementation-task';
import { CANONICAL_IMPLEMENTATION_TASKS } from '../registry/canonical-pipeline-tasks';
import { reconcileQueueStatuses } from '../engine/blocker-engine';
import { buildImplementationGraph } from '../dependency-graph/graph-engine';
import { buildQueueDashboard } from '../diagnostics/queue-diagnostics';
import { compileImplementationPacket } from '../execution/packet-compiler';
import { canAutoDispatch } from '../engine/execution-modes';
import type { QueueDashboard } from '../schemas/implementation-graph';

export const IMPLEMENTATION_STORE_VERSION = 'implementation-store.v1' as const;
const STORAGE_KEY = 'studioOsImplementationOrchestrator_v1';

export type ImplementationStore = {
  storeVersion: typeof IMPLEMENTATION_STORE_VERSION;
  orchestratorVersion: typeof IMPLEMENTATION_ORCHESTRATOR_VERSION;
  tasks: ImplementationTask[];
  sprintHistory: SprintHistoryRecord[];
  paused: boolean;
  lastReconciledAt: string;
};

let memoryStore: ImplementationStore | null = null;

function seedStore(): ImplementationStore {
  return {
    storeVersion: IMPLEMENTATION_STORE_VERSION,
    orchestratorVersion: IMPLEMENTATION_ORCHESTRATOR_VERSION,
    tasks: reconcileQueueStatuses(CANONICAL_IMPLEMENTATION_TASKS.map((t) => ({ ...t }))),
    sprintHistory: [],
    paused: false,
    lastReconciledAt: new Date().toISOString(),
  };
}

export function readImplementationStore(): ImplementationStore {
  if (memoryStore) return memoryStore;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ImplementationStore;
        memoryStore = {
          ...parsed,
          tasks: reconcileQueueStatuses(parsed.tasks),
          lastReconciledAt: new Date().toISOString(),
        };
        return memoryStore;
      }
    } catch {
      /* fall through to seed */
    }
  }
  memoryStore = seedStore();
  return memoryStore;
}

export function writeImplementationStore(store: ImplementationStore): void {
  memoryStore = store;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* memory-only fallback */
    }
  }
}

export function resetImplementationStoreForTests(): void {
  memoryStore = null;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export function reconcileImplementationQueue(): ImplementationStore {
  const store = readImplementationStore();
  const tasks = reconcileQueueStatuses(store.tasks);
  const next = { ...store, tasks, lastReconciledAt: new Date().toISOString() };
  writeImplementationStore(next);
  return next;
}

export function getImplementationTask(taskId: string): ImplementationTask | undefined {
  return readImplementationStore().tasks.find((t) => t.taskId === taskId);
}

export function listImplementationTasks(): ImplementationTask[] {
  return reconcileImplementationQueue().tasks;
}

export function approveImplementationTask(taskId: string): ImplementationTask | undefined {
  const store = readImplementationStore();
  const idx = store.tasks.findIndex((t) => t.taskId === taskId);
  if (idx < 0) return undefined;
  const task = store.tasks[idx]!;
  const updated: ImplementationTask = {
    ...task,
    founderApproved: true,
    status: task.status === 'FOUNDER_REVIEW' ? 'READY' : task.status,
    updatedDate: new Date().toISOString(),
    history: [
      ...task.history,
      { from: task.status, to: task.status === 'FOUNDER_REVIEW' ? 'READY' : task.status, at: new Date().toISOString(), reason: 'founder-approved' },
    ],
  };
  store.tasks[idx] = updated;
  writeImplementationStore(reconcileImplementationQueue());
  return getImplementationTask(taskId);
}

export function setImplementationPaused(paused: boolean): void {
  const store = readImplementationStore();
  writeImplementationStore({ ...store, paused });
}

export function isImplementationPaused(): boolean {
  return readImplementationStore().paused;
}

export function markTaskDeployed(taskId: string, commitSha: string): ImplementationTask | undefined {
  const store = readImplementationStore();
  const idx = store.tasks.findIndex((t) => t.taskId === taskId);
  if (idx < 0) return undefined;
  const task = store.tasks[idx]!;
  const updated: ImplementationTask = {
    ...task,
    status: 'DEPLOYED',
    currentCommit: commitSha,
    deployment: commitSha,
    updatedDate: new Date().toISOString(),
    history: [
      ...task.history,
      { from: task.status, to: 'DEPLOYED', at: new Date().toISOString(), reason: 'deployed', commitSha, deploymentSha: commitSha },
    ],
  };
  store.tasks[idx] = updated;
  writeImplementationStore(reconcileImplementationQueue());
  return getImplementationTask(taskId);
}

export function recordSprintHistory(record: SprintHistoryRecord): void {
  const store = readImplementationStore();
  writeImplementationStore({
    ...store,
    sprintHistory: [record, ...store.sprintHistory].slice(0, 48),
  });
}

export function getImplementationOrchestratorDashboard(): QueueDashboard {
  return buildQueueDashboard(listImplementationTasks());
}

export function getImplementationGraph() {
  return buildImplementationGraph(listImplementationTasks());
}

export function getReadyPackets(): ImplementationPacket[] {
  return listImplementationTasks()
    .filter((t) => t.status === 'READY')
    .map(compileImplementationPacket);
}

export function tryAutonomousDispatch(): { dispatched: string[]; skipped: string[] } {
  const store = readImplementationStore();
  if (store.paused) return { dispatched: [], skipped: store.tasks.map((t) => t.taskId) };

  const dispatched: string[] = [];
  const skipped: string[] = [];

  for (const task of store.tasks) {
    if (task.status !== 'READY') {
      skipped.push(task.taskId);
      continue;
    }
    if (!canAutoDispatch(task.executionMode, task.founderApprovalRequired, task.founderApproved)) {
      skipped.push(task.taskId);
      continue;
    }
    const idx = store.tasks.findIndex((t) => t.taskId === task.taskId);
    if (idx < 0) continue;
    store.tasks[idx] = {
      ...task,
      status: 'QUEUED',
      updatedDate: new Date().toISOString(),
      history: [...task.history, { from: 'READY', to: 'QUEUED', at: new Date().toISOString(), reason: 'autonomous-dispatch' }],
    };
    dispatched.push(task.taskId);
  }

  writeImplementationStore(store);
  return { dispatched, skipped };
}
