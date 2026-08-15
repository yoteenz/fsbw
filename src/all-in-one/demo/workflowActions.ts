import type { DemoStore } from './demoTypes';
import { updateDemoStore } from './demoStore';
import {
  completeWorkflowStep,
  createWorkflowInstanceFromRequest,
  getCustomerWorkflowActions,
  getWorkflowHealthCounts,
  handleDocumentReceivedForWorkflow,
  pauseWorkflow,
  resumeWorkflow,
  getTemplateVersion,
} from '../workflow/workflowOrchestrator';
import { getWorkflowSummary, instanceStatusLabel } from '../workflow/workflowEngine';
import { processEventThroughAutomation, createDomainEvent } from '../workflow/domainEvents';
import { validateTemplateVersion } from '../workflow/workflowValidation';
import type { WorkflowInstanceStatus } from '../workflow/workflowTypes';
import { resolveTemplateIdForService } from './workflowSeed';

export function getWorkflowInstances(store: DemoStore = updateDemoStore((s) => s)) {
  return store.workflowInstances ?? [];
}

export function getWorkflowForRequest(requestId: string, store?: DemoStore) {
  const s = store ?? updateDemoStore((x) => x);
  return s.workflowInstances?.find((w) => w.serviceRequestId === requestId);
}

export function getWorkflowDetail(instanceId: string, store?: DemoStore) {
  const s = store ?? updateDemoStore((x) => x);
  return getWorkflowSummary(s, instanceId);
}

export function getJourneyForOrg(organizationId: string, store?: DemoStore) {
  const s = store ?? updateDemoStore((x) => x);
  return (s.serviceJourneys ?? []).filter((j) => j.organizationId === organizationId);
}

export function startWorkflowForRequest(requestId: string, serviceSlug?: string): DemoStore {
  return updateDemoStore((s) => {
    const req = s.requests.find((r) => r.id === requestId);
    if (!req) return s;
    const slug = serviceSlug ?? req.services[0]?.slug ?? '';
    const templateId = resolveTemplateIdForService(slug);
    if (!templateId) return s;
    return createWorkflowInstanceFromRequest(s, requestId, templateId, s.officeStaffId);
  });
}

export function completeWorkflowStepAction(stepInstanceId: string, staffId?: string): void {
  updateDemoStore((s) => completeWorkflowStep(s, stepInstanceId, 'staff', staffId));
}

export function recordExternalSubmission(instanceId: string, referenceNumber?: string): void {
  updateDemoStore((s) => {
    const instance = s.workflowInstances?.find((w) => w.id === instanceId);
    if (!instance) return s;
    const steps = (s.workflowStepInstances ?? []).filter((si) => si.workflowInstanceId === instanceId);
    const submitStep = steps.find((si) => {
      const version = getTemplateVersion(s, instance.templateVersionId);
      const tmpl = version?.steps.find((st) => st.id === si.stepTemplateId);
      return tmpl?.stepType === 'external_submission' && si.status === 'active';
    });
    if (submitStep) {
      s = completeWorkflowStep(s, submitStep.id, 'staff', s.officeStaffId);
    }
    const event = createDomainEvent({
      type: 'EXTERNAL_SUBMISSION_RECORDED',
      organizationId: instance.organizationId,
      workflowInstanceId: instanceId,
      actorType: 'staff',
      actorId: s.officeStaffId,
      dedupeKey: `external-submission:${instanceId}:${referenceNumber ?? 'demo'}`,
      payload: { referenceNumber },
    });
    return processEventThroughAutomation(s, event);
  });
}

export function confirmPaymentForWorkflow(requestId: string): void {
  updateDemoStore((s) => {
    const req = s.requests.find((r) => r.id === requestId);
    if (req) req.billingStatus = 'paid';
    const event = createDomainEvent({
      type: 'PAYMENT_CONFIRMED',
      organizationId: req?.clientId,
      serviceRequestId: requestId,
      actorType: 'system',
      dedupeKey: `payment-confirmed:${requestId}`,
    });
    s = processEventThroughAutomation(s, event);
    const instance = s.workflowInstances?.find((w) => w.serviceRequestId === requestId);
    if (instance) {
      const version = getTemplateVersion(s, instance.templateVersionId);
      if (version) {
        const steps = (s.workflowStepInstances ?? []).filter((si) => si.workflowInstanceId === instance.id);
        for (const si of steps.filter((x) => x.status === 'waiting_on_customer')) {
          const tmpl = version.steps.find((st) => st.id === si.stepTemplateId);
          if (tmpl?.stepType === 'payment') {
            s = completeWorkflowStep(s, si.id, 'system');
          }
        }
      }
    }
    return s;
  });
}

export function pauseWorkflowAction(instanceId: string, reason: string): void {
  updateDemoStore((s) => pauseWorkflow(s, instanceId, reason));
}

export function resumeWorkflowAction(instanceId: string): void {
  updateDemoStore((s) => resumeWorkflow(s, instanceId));
}

export function skipOptionalWorkflowStep(stepInstanceId: string, reason: string, staffId?: string): boolean {
  let ok = false;
  updateDemoStore((s) => {
    const step = s.workflowStepInstances?.find((x) => x.id === stepInstanceId);
    if (!step) return s;
    const instance = s.workflowInstances?.find((w) => w.id === step.workflowInstanceId);
    const version = instance ? getTemplateVersion(s, instance.templateVersionId) : undefined;
    const tmpl = version?.steps.find((st) => st.id === step.stepTemplateId);
    if (!tmpl || tmpl.completionMethod === 'staff_verified' && ['document_review', 'approval'].includes(tmpl.stepType)) {
      return s;
    }
    step.status = 'skipped';
    step.skipReason = reason;
    step.completedAt = new Date().toISOString();
    s.workflowStepInstances = (s.workflowStepInstances ?? []).map((x) => (x.id === stepInstanceId ? step : x));
    s.workflowEvents = [
      ...(s.workflowEvents ?? []),
      {
        id: crypto.randomUUID(),
        workflowInstanceId: step.workflowInstanceId,
        stepInstanceId: step.id,
        eventType: 'STEP_COMPLETED',
        actorType: 'staff',
        actorId: staffId,
        reason: `Skipped: ${reason}`,
        createdAt: new Date().toISOString(),
      },
    ];
    ok = true;
    return s;
  });
  return ok;
}

export function resolveAutomationException(exceptionId: string, staffId?: string): void {
  updateDemoStore((s) => {
    s.automationExceptions = (s.automationExceptions ?? []).map((e) =>
      e.id === exceptionId ? { ...e, resolvedAt: new Date().toISOString(), resolvedById: staffId } : e,
    );
    return s;
  });
}

export function toggleAutomationRule(ruleId: string, enabled: boolean): void {
  updateDemoStore((s) => {
    s.automationRules = (s.automationRules ?? []).map((r) => (r.id === ruleId ? { ...r, enabled } : r));
    return s;
  });
}

export function toggleWorkflowKillSwitch(disabled: boolean): void {
  updateDemoStore((s) => {
    s.workflowKillSwitch = {
      ...(s.workflowKillSwitch ?? { disabledRuleIds: [], disabledTemplateAutomationIds: [] }),
      allNonEssentialDisabled: disabled,
    };
    return s;
  });
}

export function validateWorkflowTemplate(versionId: string) {
  const store = updateDemoStore((s) => s);
  const version = store.workflowTemplateVersions?.find((v) => v.id === versionId);
  if (!version) return { valid: false, issues: [{ code: 'NOT_FOUND', message: 'Version not found' }] };
  const issues = validateTemplateVersion(version);
  return { valid: issues.length === 0, issues };
}

export function listWorkflowsByStatus(status?: WorkflowInstanceStatus) {
  const store = updateDemoStore((s) => s);
  const instances = store.workflowInstances ?? [];
  if (!status) return instances;
  return instances.filter((w) => w.status === status);
}

export function getWorkflowHealth() {
  const store = updateDemoStore((s) => s);
  return getWorkflowHealthCounts(store);
}

export function getPortalWorkflowActions(organizationId: string) {
  const store = updateDemoStore((s) => s);
  return getCustomerWorkflowActions(store, organizationId);
}

export function onDocumentReceivedForWorkflow(organizationId: string, documentId: string): void {
  updateDemoStore((s) => handleDocumentReceivedForWorkflow(s, organizationId, documentId));
}

export function getServiceTrackerView(requestId: string) {
  const store = updateDemoStore((s) => s);
  const request = store.requests.find((r) => r.id === requestId);
  const workflow = getWorkflowForRequest(requestId, store);
  if (!request) return null;
  if (!workflow) {
    return {
      request,
      hasWorkflow: false as const,
    };
  }
  const detail = getWorkflowSummary(store, workflow.id);
  if (!detail?.version) return { request, hasWorkflow: false as const };

  const phases = detail.version.phases
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((phase) => {
      const phaseSteps = detail.steps.filter((s) => s.phaseId === phase.id);
      const tmplSteps = detail.version!.steps.filter((s) => s.phaseId === phase.id);
      const allDone = phaseSteps.every((s) => ['completed', 'skipped'].includes(s.status));
      const anyActive = phaseSteps.some((s) => !['completed', 'skipped', 'cancelled', 'pending'].includes(s.status));
      const status = allDone ? 'complete' : anyActive ? 'current' : 'upcoming';
      return { ...phase, status, steps: tmplSteps.map((t) => {
        const si = phaseSteps.find((x) => x.stepTemplateId === t.id);
        return { template: t, instance: si };
      }) };
    });

  const customerAction = getCustomerWorkflowActions(store, request.clientId).find((a) =>
    a.ctaHref.includes(requestId),
  );

  return {
    request,
    hasWorkflow: true as const,
    workflow: detail.instance,
    template: detail.template,
    version: detail.version,
    phases,
    statusLabel: instanceStatusLabel(detail.instance.status),
    progress: detail.instance.progress,
    customerAction,
  };
}
