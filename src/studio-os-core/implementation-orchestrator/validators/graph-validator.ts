import type { ImplementationTask } from '../schemas/implementation-task';
import { analyzeGraphHealth } from '../dependency-graph/graph-engine';

export function validateImplementationTask(task: ImplementationTask): { ok: boolean; violations: string[] } {
  const violations: string[] = [];
  if (!task.taskId?.trim()) violations.push('missing-taskId');
  if (!task.title?.trim()) violations.push('missing-title');
  if (!task.description?.trim()) violations.push('missing-description');
  if (!task.implementationSpec?.trim()) violations.push('missing-implementationSpec');
  if (!task.acceptanceCriteria.length) violations.push('missing-acceptanceCriteria');
  if (!task.verificationCriteria.length) violations.push('missing-verificationCriteria');
  if (!task.requiredTests.length) violations.push('missing-requiredTests');
  if (!task.owner?.trim()) violations.push('missing-owner');
  if (!task.history.length) violations.push('missing-history');
  return { ok: violations.length === 0, violations };
}

export function validateImplementationRegistry(tasks: ImplementationTask[]): { ok: boolean; violations: string[] } {
  const violations: string[] = [];
  const health = analyzeGraphHealth(tasks);
  if (!health.ok) {
    violations.push(...health.issues.map((i) => `${i.code}:${i.message}`));
  }
  for (const task of tasks) {
    const result = validateImplementationTask(task);
    if (!result.ok) violations.push(`${task.taskId}:${result.violations.join(',')}`);
  }
  return { ok: violations.length === 0, violations };
}
