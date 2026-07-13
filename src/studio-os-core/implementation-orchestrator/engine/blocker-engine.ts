import type { ImplementationTask, ImplementationStatus } from '../schemas/implementation-task';

export function areBlockersResolved(task: ImplementationTask, tasksById: Record<string, ImplementationTask>): boolean {
  return task.blockedBy.every((blockerId) => {
    const blocker = tasksById[blockerId];
    return blocker?.status === 'DEPLOYED' || blocker?.status === 'ARCHIVED';
  });
}

export function areDependenciesSatisfied(task: ImplementationTask, tasksById: Record<string, ImplementationTask>): boolean {
  return task.dependencies.every((depId) => {
    const dep = tasksById[depId];
    return dep?.status === 'DEPLOYED' || dep?.status === 'ARCHIVED';
  });
}

export function computeBlockedStatus(task: ImplementationTask, tasksById: Record<string, ImplementationTask>): ImplementationStatus {
  if (task.status === 'DEPLOYED' || task.status === 'ARCHIVED' || task.status === 'FAILED') {
    return task.status;
  }
  if (task.status === 'RUNNING' || task.status === 'TESTING' || task.status === 'DEPLOYING') {
    return task.status;
  }
  if (!areBlockersResolved(task, tasksById) || !areDependenciesSatisfied(task, tasksById)) {
    return 'BLOCKED';
  }
  if (task.founderApprovalRequired && !task.founderApproved && task.executionMode === 'MANUAL') {
    return 'FOUNDER_REVIEW';
  }
  return 'READY';
}

export function reconcileQueueStatuses(tasks: ImplementationTask[]): ImplementationTask[] {
  const byId = Object.fromEntries(tasks.map((t) => [t.taskId, t]));
  return tasks.map((task) => {
    const nextStatus = computeBlockedStatus(task, byId);
    if (nextStatus === task.status) return task;
    return {
      ...task,
      status: nextStatus,
      updatedDate: new Date().toISOString(),
      history: [
        ...task.history,
        {
          from: task.status,
          to: nextStatus,
          at: new Date().toISOString(),
          reason: nextStatus === 'READY' ? 'blockers-resolved' : nextStatus === 'BLOCKED' ? 'blockers-active' : 'reconciled',
        },
      ],
    };
  });
}

export function listRecentlyUnblocked(tasks: ImplementationTask[], sinceMs = 3600_000): ImplementationTask[] {
  const cutoff = Date.now() - sinceMs;
  return tasks.filter((t) =>
    t.history.some(
      (h) => h.to === 'READY' && h.from === 'BLOCKED' && new Date(h.at).getTime() >= cutoff
    )
  );
}

export function countDownstreamUnlocks(taskId: string, tasks: ImplementationTask[]): number {
  const visited = new Set<string>();
  const queue = tasks.filter((t) => t.blockedBy.includes(taskId) || t.dependencies.includes(taskId)).map((t) => t.taskId);
  let count = 0;
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    count += 1;
    for (const t of tasks) {
      if ((t.blockedBy.includes(id) || t.dependencies.includes(id)) && !visited.has(t.taskId)) {
        queue.push(t.taskId);
      }
    }
  }
  return count;
}
