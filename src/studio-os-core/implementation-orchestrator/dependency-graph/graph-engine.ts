import type { ImplementationTask } from '../schemas/implementation-task';
import type {
  CriticalPathResult,
  GraphHealthIssue,
  GraphHealthReport,
  ImplementationGraph,
  ImplementationGraphEdge,
} from '../schemas/implementation-graph';
import { IMPLEMENTATION_ORCHESTRATOR_VERSION } from '../schemas/implementation-task';
import { countDownstreamUnlocks } from '../engine/blocker-engine';

function buildEdges(tasks: ImplementationTask[]): ImplementationGraphEdge[] {
  const edges: ImplementationGraphEdge[] = [];
  const seen = new Set<string>();
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      const key = `${dep}->${task.taskId}`;
      if (!seen.has(key)) {
        edges.push({ from: dep, to: task.taskId, relationship: 'depends-on' });
        seen.add(key);
      }
    }
    for (const unlock of task.unlocks) {
      const key = `${task.taskId}->${unlock}`;
      if (!seen.has(key)) {
        edges.push({ from: task.taskId, to: unlock, relationship: 'unlocks' });
        seen.add(key);
      }
    }
    for (const blocker of task.blockedBy) {
      const key = `block:${blocker}->${task.taskId}`;
      if (!seen.has(key)) {
        edges.push({ from: blocker, to: task.taskId, relationship: 'blocks' });
        seen.add(key);
      }
    }
  }
  return edges;
}

export function buildImplementationGraph(tasks: ImplementationTask[]): ImplementationGraph {
  return {
    graphVersion: IMPLEMENTATION_ORCHESTRATOR_VERSION,
    graphRevision: 1,
    nodes: tasks.map((t) => t.taskId),
    edges: buildEdges(tasks),
  };
}

export function topologicalSort(tasks: ImplementationTask[]): string[] {
  const graph = buildImplementationGraph(tasks);
  const inDegree = new Map<string, number>();
  for (const node of graph.nodes) inDegree.set(node, 0);
  for (const edge of graph.edges) {
    if (edge.relationship === 'depends-on') {
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    }
  }
  const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([id]) => id);
  const order: string[] = [];
  const dependents = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (edge.relationship === 'depends-on') {
      const list = dependents.get(edge.from) ?? [];
      list.push(edge.to);
      dependents.set(edge.from, list);
    }
  }
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of dependents.get(id) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }
  return order.length === graph.nodes.length ? order : [];
}

export function detectCycles(tasks: ImplementationTask[]): GraphHealthIssue[] {
  const graph = buildImplementationGraph(tasks);
  const adj = new Map<string, string[]>();
  for (const edge of graph.edges) {
    if (edge.relationship === 'depends-on') {
      const list = adj.get(edge.from) ?? [];
      list.push(edge.to);
      adj.set(edge.from, list);
    }
  }
  const visited = new Set<string>();
  const stack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(node: string, path: string[]): void {
    if (stack.has(node)) {
      const idx = path.indexOf(node);
      if (idx >= 0) cycles.push(path.slice(idx));
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    for (const next of adj.get(node) ?? []) dfs(next, [...path, next]);
    stack.delete(node);
  }

  for (const node of graph.nodes) dfs(node, [node]);

  return cycles.map((cycle) => ({
    code: 'CYCLE' as const,
    message: `Dependency cycle: ${cycle.join(' → ')}`,
    taskIds: cycle,
  }));
}

export function detectOrphans(tasks: ImplementationTask[]): string[] {
  const graph = buildImplementationGraph(tasks);
  const connected = new Set<string>();
  for (const edge of graph.edges) {
    connected.add(edge.from);
    connected.add(edge.to);
  }
  return graph.nodes.filter((n) => {
    const task = tasks.find((t) => t.taskId === n);
    if (task?.dependencies.length === 0 && task.unlocks.length === 0 && task.blockedBy.length === 0) {
      return false;
    }
    return !connected.has(n);
  });
}

export function detectDuplicates(tasks: ImplementationTask[]): GraphHealthIssue[] {
  const ids = tasks.map((t) => t.taskId);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (!dupes.length) return [];
  return [{ code: 'DUPLICATE', message: `Duplicate task ids: ${[...new Set(dupes)].join(', ')}`, taskIds: [...new Set(dupes)] }];
}

export function detectDeadEnds(tasks: ImplementationTask[]): string[] {
  return tasks
    .filter((t) => t.status === 'BACKLOG' || t.status === 'PLANNING')
    .filter((t) => t.unlocks.length === 0 && t.dependencies.length === 0 && t.blockedBy.length === 0)
    .map((t) => t.taskId);
}

export function analyzeGraphHealth(tasks: ImplementationTask[]): GraphHealthReport {
  const issues: GraphHealthIssue[] = [
    ...detectCycles(tasks),
    ...detectDuplicates(tasks),
  ];
  const orphans = detectOrphans(tasks);
  if (orphans.length) {
    issues.push({ code: 'ORPHAN', message: `Orphan tasks: ${orphans.join(', ')}`, taskIds: orphans });
  }
  const deadEnds = detectDeadEnds(tasks);
  if (deadEnds.length) {
    issues.push({ code: 'DEAD_END', message: `Dead-end tasks: ${deadEnds.join(', ')}`, taskIds: deadEnds });
  }
  for (const task of tasks) {
    for (const dep of [...task.dependencies, ...task.blockedBy, ...task.unlocks]) {
      if (!tasks.some((t) => t.taskId === dep)) {
        issues.push({
          code: 'MISSING_DEPENDENCY',
          message: `Task ${task.taskId} references missing task ${dep}`,
          taskIds: [task.taskId, dep],
        });
      }
    }
  }
  return {
    ok: issues.length === 0,
    issues,
    topologicalOrder: topologicalSort(tasks),
    orphanTasks: orphans,
    deadEndTasks: deadEnds,
  };
}

export function computeCriticalPath(tasks: ImplementationTask[]): CriticalPathResult {
  const byId = Object.fromEntries(tasks.map((t) => [t.taskId, t]));
  const memo = new Map<string, string[]>();

  function longestFrom(taskId: string, visiting = new Set<string>()): string[] {
    if (memo.has(taskId)) return memo.get(taskId)!;
    if (visiting.has(taskId)) return [taskId];
    visiting.add(taskId);
    const task = byId[taskId];
    if (!task) return [taskId];
    const deps = task.dependencies.length ? task.dependencies : task.blockedBy;
    if (!deps.length) {
      memo.set(taskId, [taskId]);
      return [taskId];
    }
    let best: string[] = [taskId];
    for (const dep of deps) {
      const chain = [...longestFrom(dep, visiting), taskId];
      if (chain.length > best.length) best = chain;
    }
    memo.set(taskId, best);
    return best;
  }

  let longestChain: string[] = [];
  for (const task of tasks) {
    const chain = longestFrom(task.taskId);
    if (chain.length > longestChain.length) longestChain = chain;
  }

  const blocked = tasks.filter((t) => t.status === 'BLOCKED');
  const largestBlocker = blocked
    .map((t) => ({ id: t.taskId, impact: countDownstreamUnlocks(t.taskId, tasks) }))
    .sort((a, b) => b.impact - a.impact)[0];

  const ready = tasks.filter((t) => t.status === 'READY').sort((a, b) => b.priority - a.priority);
  const unlockImpact = tasks
    .map((t) => ({
      taskId: t.taskId,
      downstreamCount: countDownstreamUnlocks(t.taskId, tasks),
      message:
        countDownstreamUnlocks(t.taskId, tasks) > 0
          ? `Fixing ${t.title} unlocks ${countDownstreamUnlocks(t.taskId, tasks)} downstream implementations.`
          : `${t.title} has no downstream unlocks.`,
    }))
    .filter((u) => u.downstreamCount > 0)
    .sort((a, b) => b.downstreamCount - a.downstreamCount);

  return {
    longestChain,
    chainLength: longestChain.length,
    highestImpactTask: unlockImpact[0]?.taskId ?? longestChain[longestChain.length - 1] ?? '',
    largestBlocker: largestBlocker?.id ?? null,
    recommendedNext: ready[0]?.taskId ?? null,
    unlockImpact,
  };
}

export function formatImplementationChain(taskIds: string[], tasks: ImplementationTask[]): string {
  const byId = Object.fromEntries(tasks.map((t) => [t.taskId, t.title]));
  return taskIds.map((id) => byId[id] ?? id).join(' → ');
}
