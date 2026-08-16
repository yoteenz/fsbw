import type {
  WorkflowCondition,
  WorkflowDependencyTemplate,
  WorkflowStepTemplate,
  WorkflowTemplateVersion,
} from './workflowTypes';

export interface TemplateValidationIssue {
  code: string;
  message: string;
  stepId?: string;
}

export function detectDependencyCycles(deps: WorkflowDependencyTemplate[]): string[] | null {
  const graph = new Map<string, string[]>();
  for (const d of deps) {
    if (!graph.has(d.fromStepId)) graph.set(d.fromStepId, []);
    graph.get(d.fromStepId)!.push(d.toStepId);
  }

  const visited = new Set<string>();
  const stack = new Set<string>();
  const cycleNodes: string[] = [];

  function dfs(node: string): boolean {
    if (stack.has(node)) {
      cycleNodes.push(node);
      return true;
    }
    if (visited.has(node)) return false;
    visited.add(node);
    stack.add(node);
    for (const next of graph.get(node) ?? []) {
      if (dfs(next)) return true;
    }
    stack.delete(node);
    return false;
  }

  for (const node of graph.keys()) {
    if (dfs(node)) return cycleNodes;
  }
  return null;
}

export function evaluateCondition(
  condition: WorkflowCondition,
  context: Record<string, unknown>,
): boolean {
  const val = context[condition.field];
  switch (condition.operator) {
    case 'eq':
      return val === condition.value;
    case 'neq':
      return val !== condition.value;
    case 'exists':
      return val !== undefined && val !== null && val !== '';
    case 'not_exists':
      return val === undefined || val === null || val === '';
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(String(val));
    default:
      return false;
  }
}

export function evaluateConditions(
  conditions: WorkflowCondition[] | undefined,
  context: Record<string, unknown>,
): boolean {
  if (!conditions?.length) return true;
  return conditions.every((c) => evaluateCondition(c, context));
}

export function validateTemplateVersion(version: WorkflowTemplateVersion): TemplateValidationIssue[] {
  const issues: TemplateValidationIssue[] = [];
  const stepIds = new Set(version.steps.map((s) => s.id));

  if (version.steps.length === 0) {
    issues.push({ code: 'NO_STEPS', message: 'Template must have at least one step.' });
  }

  const completionSteps = version.steps.filter((s) => s.stepType === 'completion');
  if (completionSteps.length === 0) {
    issues.push({ code: 'NO_COMPLETION', message: 'Template must have a completion step.' });
  }

  for (const dep of version.dependencies) {
    if (!stepIds.has(dep.fromStepId) || !stepIds.has(dep.toStepId)) {
      issues.push({
        code: 'ORPHAN_DEPENDENCY',
        message: `Dependency references missing step: ${dep.fromStepId} → ${dep.toStepId}`,
      });
    }
  }

  const cycle = detectDependencyCycles(version.dependencies);
  if (cycle) {
    issues.push({ code: 'CYCLE', message: `Dependency cycle detected involving ${cycle.join(' → ')}` });
  }

  for (const step of version.steps) {
    if (!version.phases.some((p) => p.id === step.phaseId)) {
      issues.push({ code: 'ORPHAN_PHASE', message: `Step ${step.id} references unknown phase ${step.phaseId}`, stepId: step.id });
    }
    if (step.completionMethod === 'automatic' && ['document_review', 'approval', 'internal_review'].includes(step.stepType)) {
      issues.push({
        code: 'PROTECTED_AUTO',
        message: `Step ${step.id} cannot use automatic completion for protected step type ${step.stepType}`,
        stepId: step.id,
      });
    }
  }

  return issues;
}

export function getReadySteps(
  steps: WorkflowStepTemplate[],
  deps: WorkflowDependencyTemplate[],
  completedStepIds: Set<string>,
  skippedStepIds: Set<string>,
  context: Record<string, unknown>,
): WorkflowStepTemplate[] {
  const done = new Set([...completedStepIds, ...skippedStepIds]);
  return steps.filter((step) => {
    if (done.has(step.id)) return false;
    const incoming = deps.filter((d) => d.toStepId === step.id);
    if (incoming.length === 0) return true;
    return incoming.every((dep) => {
      if (!done.has(dep.fromStepId)) return false;
      if (dep.kind === 'conditional' && dep.conditions) {
        return evaluateConditions(dep.conditions, context);
      }
      return true;
    });
  });
}
