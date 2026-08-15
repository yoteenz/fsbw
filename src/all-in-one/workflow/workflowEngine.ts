import type { DemoStore } from '../demo/demoTypes';
import type {
  WorkflowInstance,
  WorkflowStepInstance,
  WorkflowStepTemplate,
  WorkflowTemplateVersion,
} from './workflowTypes';
import { WORKFLOW_INSTANCE_STATUS_LABELS } from './workflowTypes';
import { getReadySteps } from './workflowValidation';

export function computeWeightedProgress(
  steps: WorkflowStepInstance[],
  templates: WorkflowStepTemplate[],
): number {
  const weightMap = new Map(templates.map((s) => [s.id, s.weight || 1]));
  let total = 0;
  let earned = 0;
  for (const t of templates) {
    const w = weightMap.get(t.id) ?? 1;
    total += w;
    const inst = steps.find((s) => s.stepTemplateId === t.id);
    if (inst && (inst.status === 'completed' || inst.status === 'skipped')) earned += w;
  }
  return total > 0 ? Math.round((earned / total) * 100) : 0;
}

export function deriveInstanceStatus(
  stepInstances: WorkflowStepInstance[],
  paused?: boolean,
): WorkflowInstance['status'] {
  if (paused) return 'paused';
  if (stepInstances.every((s) => s.status === 'completed' || s.status === 'skipped' || s.status === 'cancelled')) {
    const completion = stepInstances.find((s) => s.status === 'completed');
    if (completion) return 'completed';
  }
  if (stepInstances.some((s) => s.status === 'waiting_on_customer')) return 'waiting_on_customer';
  if (stepInstances.some((s) => s.status === 'waiting_external')) return 'waiting_external';
  if (stepInstances.some((s) => s.status === 'waiting_internal' || s.status === 'ready_for_review')) {
    return stepInstances.some((s) => s.status === 'ready_for_review') ? 'ready_for_review' : 'waiting_internal';
  }
  if (stepInstances.some((s) => s.status === 'blocked')) return 'blocked';
  if (stepInstances.some((s) => s.status === 'active')) return 'active';
  return 'not_started';
}

export function recalculateWorkflow(
  instance: WorkflowInstance,
  stepInstances: WorkflowStepInstance[],
  version: WorkflowTemplateVersion,
  context: Record<string, unknown>,
): { instance: WorkflowInstance; steps: WorkflowStepInstance[] } {
  const completed = new Set(stepInstances.filter((s) => s.status === 'completed').map((s) => s.stepTemplateId));
  const skipped = new Set(stepInstances.filter((s) => s.status === 'skipped').map((s) => s.stepTemplateId));
  const readyTemplates = getReadySteps(version.steps, version.dependencies, completed, skipped, context);

  const now = new Date().toISOString();
  const updatedSteps = stepInstances.map((si) => {
    const tmpl = version.steps.find((s) => s.id === si.stepTemplateId);
    if (!tmpl) return si;
    if (si.status === 'completed' || si.status === 'skipped' || si.status === 'cancelled') return si;

    const isReady = readyTemplates.some((r) => r.id === si.stepTemplateId);
    if (isReady && si.status === 'pending') {
      return {
        ...si,
        status: 'active' as const,
        startedAt: si.startedAt ?? now,
        version: si.version + 1,
      };
    }
    return si;
  });

  const activePhase = version.phases.find((p) =>
    updatedSteps.some(
      (s) => s.phaseId === p.id && !['completed', 'skipped', 'cancelled'].includes(s.status),
    ),
  );

  const progress = computeWeightedProgress(updatedSteps, version.steps);
  const status = deriveInstanceStatus(updatedSteps, !!instance.pausedAt);

  return {
    instance: {
      ...instance,
      status,
      progress,
      currentPhaseId: activePhase?.id ?? instance.currentPhaseId,
      completedAt: status === 'completed' ? now : instance.completedAt,
      version: instance.version + 1,
    },
    steps: updatedSteps,
  };
}

export function getWorkflowSummary(store: DemoStore, instanceId: string) {
  const instance = store.workflowInstances?.find((w) => w.id === instanceId);
  if (!instance) return null;
  const version = store.workflowTemplateVersions?.find((v) => v.id === instance.templateVersionId);
  const template = store.workflowTemplates?.find((t) => t.id === instance.templateId);
  const steps = (store.workflowStepInstances ?? []).filter((s) => s.workflowInstanceId === instanceId);
  const client = store.clients.find((c) => c.id === instance.organizationId);
  return { instance, version, template, steps, client };
}

export function explainStepActivation(
  stepTemplate: WorkflowStepTemplate,
  trigger: string,
): string {
  return `Step "${stepTemplate.name}" activated because ${trigger}.`;
}

export function customerPhaseLabel(phaseName: string): string {
  return phaseName;
}

export function instanceStatusLabel(status: WorkflowInstance['status']): string {
  return WORKFLOW_INSTANCE_STATUS_LABELS[status] ?? status;
}
