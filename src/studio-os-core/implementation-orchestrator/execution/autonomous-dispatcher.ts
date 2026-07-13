import type { ImplementationTask } from '../schemas/implementation-task';
import { canAutoDispatch, requiresFounderApproval } from '../engine/execution-modes';
import { areBlockersResolved, areDependenciesSatisfied } from '../engine/blocker-engine';

export type FounderGateResult =
  | { ok: true; canDispatch: true }
  | { ok: false; code: 'FOUNDER_APPROVAL_REQUIRED' | 'MANUAL_EXECUTION_MODE'; message: string };

export function validateFounderGate(task: ImplementationTask): FounderGateResult {
  if (task.founderApprovalRequired && !task.founderApproved) {
    return {
      ok: false,
      code: 'FOUNDER_APPROVAL_REQUIRED',
      message: `${task.title} requires explicit founder approval before dispatch.`,
    };
  }
  if (task.executionMode === 'MANUAL' && requiresFounderApproval(task.category)) {
    return {
      ok: false,
      code: 'MANUAL_EXECUTION_MODE',
      message: `${task.category} tasks require manual founder dispatch.`,
    };
  }
  return { ok: true, canDispatch: true };
}

export type AutonomousDispatchResult = {
  taskId: string;
  dispatched: boolean;
  reason: string;
};

export function evaluateAutonomousDispatch(
  task: ImplementationTask,
  tasksById: Record<string, ImplementationTask>,
  queuePaused: boolean
): AutonomousDispatchResult {
  if (queuePaused) return { taskId: task.taskId, dispatched: false, reason: 'queue-paused' };
  if (task.status !== 'READY') return { taskId: task.taskId, dispatched: false, reason: `status-${task.status}` };
  if (!areBlockersResolved(task, tasksById)) return { taskId: task.taskId, dispatched: false, reason: 'blockers-unresolved' };
  if (!areDependenciesSatisfied(task, tasksById)) return { taskId: task.taskId, dispatched: false, reason: 'dependencies-unsatisfied' };
  if (!canAutoDispatch(task.executionMode, task.founderApprovalRequired, task.founderApproved)) {
    return { taskId: task.taskId, dispatched: false, reason: 'not-autonomous-or-founder-gate' };
  }
  const gate = validateFounderGate(task);
  if (!gate.ok) return { taskId: task.taskId, dispatched: false, reason: gate.code };
  return { taskId: task.taskId, dispatched: true, reason: 'autonomous-dispatch-approved' };
}
