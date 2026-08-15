import type { DemoStore } from '../demo/demoTypes';
import type { OfficeWorkItem } from '../office-core/officeWorkTypes';
import { OFFICE_WORK_STATUS_LABELS } from '../office-core/officeWorkTypes';
import type {
  WorkflowInstance,
  WorkflowStepInstance,
  WorkflowStepTemplate,
} from './workflowTypes';
import { createDomainEvent, processEventThroughAutomation, type DomainEvent } from './domainEvents';
import { recalculateWorkflow } from './workflowEngine';
import { evaluateConditions } from './workflowValidation';
import { scheduleFollowUpBusinessDays } from './businessDays';

function uid(): string {
  return crypto.randomUUID();
}

export function getTemplateVersion(store: DemoStore, versionId: string) {
  return store.workflowTemplateVersions?.find((v) => v.id === versionId);
}

export function getPublishedVersionForTemplate(store: DemoStore, templateId: string) {
  const template = store.workflowTemplates?.find((t) => t.id === templateId);
  if (!template?.currentPublishedVersionId) return undefined;
  return getTemplateVersion(store, template.currentPublishedVersionId);
}

export function buildWorkflowContext(store: DemoStore, organizationId: string, serviceRequestId?: string): Record<string, unknown> {
  const orgId = organizationId;
  const docs = store.documents.filter((d) => (d.organizationId ?? d.clientId) === orgId);
  const verifiedTypes = docs.filter((d) => d.verificationStatus === 'verified').map((d) => d.documentType ?? d.category ?? d.id);
  const request = serviceRequestId ? store.requests.find((r) => r.id === serviceRequestId) : undefined;
  const paid = request?.billingStatus === 'paid' || request?.billingStatus === 'awaiting_quote_acceptance';
  return {
    organizationId: orgId,
    hasVerifiedDocument: (type: string) => verifiedTypes.includes(type),
    verifiedDocumentTypes: verifiedTypes,
    billingStatus: request?.billingStatus ?? 'none',
    paymentConfirmed: paid,
    entityExists: docs.some((d) => d.documentType === 'articles_of_organization' && d.verificationStatus === 'verified') ? 'true' : 'false',
  };
}

export function createWorkflowInstanceFromRequest(
  store: DemoStore,
  serviceRequestId: string,
  templateId: string,
  createdById?: string,
): DemoStore {
  const request = store.requests.find((r) => r.id === serviceRequestId);
  if (!request) return store;

  const existing = store.workflowInstances?.find((w) => w.serviceRequestId === serviceRequestId && w.status !== 'cancelled');
  if (existing) return store;

  const version = getPublishedVersionForTemplate(store, templateId);
  if (!version || version.status !== 'published') return store;

  const instanceId = uid();
  const now = new Date().toISOString();

  const stepInstances: WorkflowStepInstance[] = version.steps.map((step) => ({
    id: uid(),
    workflowInstanceId: instanceId,
    stepTemplateId: step.id,
    phaseId: step.phaseId,
    status: 'pending',
    waitingOn: 'none',
    version: 1,
  }));

  const instance: WorkflowInstance = {
    id: instanceId,
    templateVersionId: version.id,
    templateId,
    organizationId: request.clientId,
    serviceRequestId,
    status: 'not_started',
    progress: 0,
    startedAt: now,
    createdById,
    version: 1,
    isDemo: true,
  };

  const context = buildWorkflowContext(store, request.clientId, serviceRequestId);
  const recalc = recalculateWorkflow(instance, stepInstances, version, context);

  store.workflowInstances = [...(store.workflowInstances ?? []), recalc.instance];
  store.workflowStepInstances = [...(store.workflowStepInstances ?? []), ...recalc.steps];

  const event = createDomainEvent({
    type: 'WORKFLOW_STARTED',
    organizationId: request.clientId,
    workflowInstanceId: instanceId,
    serviceRequestId,
    actorType: 'system',
    dedupeKey: `workflow-started:${instanceId}`,
  });
  return processEventThroughAutomation(store, event);
}

export function activateStepWorkItems(
  store: DemoStore,
  instance: WorkflowInstance,
): DemoStore {
  const version = getTemplateVersion(store, instance.templateVersionId);
  if (!version) return store;

  const steps = (store.workflowStepInstances ?? []).filter((s) => s.workflowInstanceId === instance.id);
  const client = store.clients.find((c) => c.id === instance.organizationId);

  for (const si of steps.filter((s) => s.status === 'active')) {
    if (si.officeWorkItemId) continue;
    const tmpl = version.steps.find((s) => s.id === si.stepTemplateId);
    if (!tmpl) continue;

    const skipCtx = buildWorkflowContext(store, instance.organizationId, instance.serviceRequestId);
    if (tmpl.skipConditions && evaluateConditions(tmpl.skipConditions, skipCtx)) {
      si.status = 'skipped';
      si.skipReason = 'Condition satisfied — step skipped';
      si.completedAt = new Date().toISOString();
      continue;
    }

    if (['staff_action', 'document_review', 'internal_review', 'approval'].includes(tmpl.stepType)) {
      const workItem = createWorkItemForStep(store, instance, si, tmpl, client?.companyName);
      store.officeWorkItems = [...(store.officeWorkItems ?? []), workItem];
      si.officeWorkItemId = workItem.id;
    }

    if (tmpl.stepType === 'document_request') {
      si.status = 'waiting_on_customer';
      si.waitingOn = 'customer';
    }
    if (tmpl.stepType === 'external_wait') {
      si.status = 'waiting_external';
      si.waitingOn = 'external';
    }
    if (tmpl.stepType === 'payment') {
      const ctx = buildWorkflowContext(store, instance.organizationId, instance.serviceRequestId);
      if (!ctx.paymentConfirmed) {
        si.status = 'waiting_on_customer';
        si.waitingOn = 'customer';
      }
    }
  }

  store.workflowStepInstances = (store.workflowStepInstances ?? []).map((s) => {
    const updated = steps.find((x) => x.id === s.id);
    return updated ?? s;
  });

  return store;
}

function createWorkItemForStep(
  _store: DemoStore,
  instance: WorkflowInstance,
  stepInstance: WorkflowStepInstance,
  tmpl: WorkflowStepTemplate,
  orgName?: string,
): OfficeWorkItem {
  const now = new Date().toISOString();
  return {
    id: uid(),
    sourceDomain: 'service_request',
    sourceEntityType: 'workflow_step',
    sourceEntityId: stepInstance.id,
    organizationId: instance.organizationId,
    title: tmpl.name,
    description: `Workflow: ${orgName ?? instance.organizationId} — ${tmpl.customerLabel}`,
    workType: tmpl.stepType === 'document_review' ? 'document_review' : 'review',
    division: 'permitting_compliance',
    priority: 'normal',
    status: 'assigned',
    statusLabel: OFFICE_WORK_STATUS_LABELS.assigned,
    assignedTeamId: tmpl.responsibleTeamId,
    waitingOn: tmpl.stepType === 'document_review' ? 'all_in_one' : 'none',
    dueAt: tmpl.dueBusinessDays ? scheduleFollowUpBusinessDays(new Date(), tmpl.dueBusinessDays) : undefined,
    createdAt: now,
    updatedAt: now,
    version: 1,
    isDemo: true,
  };
}

export function completeWorkflowStep(
  store: DemoStore,
  stepInstanceId: string,
  actorType: DomainEvent['actorType'],
  actorId?: string,
  reason?: string,
): DemoStore {
  const step = store.workflowStepInstances?.find((s) => s.id === stepInstanceId);
  if (!step || step.status === 'completed') return store;

  const instance = store.workflowInstances?.find((w) => w.id === step.workflowInstanceId);
  if (!instance) return store;

  const version = getTemplateVersion(store, instance.templateVersionId);
  if (!version) return store;

  const tmpl = version.steps.find((s) => s.id === step.stepTemplateId);
  if (!tmpl) return store;

  if (['document_review', 'approval', 'internal_review'].includes(tmpl.stepType) && actorType !== 'staff') {
    return store;
  }

  const now = new Date().toISOString();
  step.status = 'completed';
  step.completedAt = now;
  step.waitingOn = 'none';
  step.version += 1;

  store.workflowStepInstances = (store.workflowStepInstances ?? []).map((s) => (s.id === stepInstanceId ? step : s));

  if (step.officeWorkItemId) {
    store.officeWorkItems = (store.officeWorkItems ?? []).map((w) =>
      w.id === step.officeWorkItemId
        ? { ...w, status: 'completed', statusLabel: OFFICE_WORK_STATUS_LABELS.completed, completedAt: now, version: w.version + 1 }
        : w,
    );
  }

  const context = buildWorkflowContext(store, instance.organizationId, instance.serviceRequestId);
  const recalc = recalculateWorkflow(instance, store.workflowStepInstances!.filter((s) => s.workflowInstanceId === instance.id), version, context);
  store.workflowInstances = (store.workflowInstances ?? []).map((w) => (w.id === instance.id ? recalc.instance : w));
  store.workflowStepInstances = [
    ...(store.workflowStepInstances ?? []).filter((s) => s.workflowInstanceId !== instance.id),
    ...recalc.steps,
  ];

  store = activateStepWorkItems(store, recalc.instance);

  const event = createDomainEvent({
    type: 'STEP_COMPLETED',
    organizationId: instance.organizationId,
    workflowInstanceId: instance.id,
    stepInstanceId: step.id,
    serviceRequestId: instance.serviceRequestId,
    actorType,
    actorId,
    dedupeKey: `step-completed:${stepInstanceId}`,
    payload: { reason },
  });

  return processEventThroughAutomation(store, event);
}

export function handleDocumentReceivedForWorkflow(
  store: DemoStore,
  organizationId: string,
  documentId: string,
): DemoStore {
  const instances = (store.workflowInstances ?? []).filter(
    (w) => w.organizationId === organizationId && !['completed', 'cancelled'].includes(w.status),
  );

  for (const instance of instances) {
    const waitingSteps = (store.workflowStepInstances ?? []).filter(
      (s) => s.workflowInstanceId === instance.id && s.status === 'waiting_on_customer',
    );
    for (const step of waitingSteps) {
      const version = getTemplateVersion(store, instance.templateVersionId);
      const tmpl = version?.steps.find((s) => s.id === step.stepTemplateId);
      if (tmpl?.stepType === 'document_request') {
        step.status = 'ready_for_review';
        step.waitingOn = 'none';
        store.workflowStepInstances = (store.workflowStepInstances ?? []).map((s) => (s.id === step.id ? step : s));
        store = activateStepWorkItems(store, instance);
      }
    }
  }

  const event = createDomainEvent({
    type: 'DOCUMENT_RECEIVED',
    organizationId,
    documentId,
    actorType: 'customer',
    dedupeKey: `document-received:${documentId}`,
  });

  return processEventThroughAutomation(store, event);
}

export function pauseWorkflow(store: DemoStore, instanceId: string, reason: string): DemoStore {
  store.workflowInstances = (store.workflowInstances ?? []).map((w) =>
    w.id === instanceId ? { ...w, status: 'paused', pausedAt: new Date().toISOString(), pauseReason: reason, version: w.version + 1 } : w,
  );
  return store;
}

export function resumeWorkflow(store: DemoStore, instanceId: string): DemoStore {
  const instance = store.workflowInstances?.find((w) => w.id === instanceId);
  if (!instance) return store;
  const version = getTemplateVersion(store, instance.templateVersionId);
  if (!version) return store;
  const steps = (store.workflowStepInstances ?? []).filter((s) => s.workflowInstanceId === instanceId);
  const context = buildWorkflowContext(store, instance.organizationId, instance.serviceRequestId);
  const recalc = recalculateWorkflow({ ...instance, pausedAt: undefined, pauseReason: undefined }, steps, version, context);
  store.workflowInstances = (store.workflowInstances ?? []).map((w) => (w.id === instanceId ? recalc.instance : w));
  return store;
}

export function getCustomerWorkflowActions(store: DemoStore, organizationId: string) {
  const instances = (store.workflowInstances ?? []).filter(
    (w) => w.organizationId === organizationId && ['active', 'waiting_on_customer', 'blocked'].includes(w.status),
  );
  const actions: { title: string; description: string; ctaLabel: string; ctaHref: string; dedupeKey: string; priority: 'urgent' | 'high' | 'normal' }[] = [];

  for (const inst of instances) {
    const version = getTemplateVersion(store, inst.templateVersionId);
    const steps = (store.workflowStepInstances ?? []).filter((s) => s.workflowInstanceId === inst.id);
    for (const si of steps.filter((s) => s.status === 'waiting_on_customer' || (s.status === 'active' && s.waitingOn === 'customer'))) {
      const tmpl = version?.steps.find((s) => s.id === si.stepTemplateId);
      if (!tmpl || tmpl.visibility === 'internal_only') continue;
      actions.push({
        title: tmpl.customerLabel,
        description: `Service workflow — ${tmpl.name}`,
        ctaLabel: tmpl.stepType === 'document_request' ? 'UPLOAD DOCUMENT' : 'VIEW SERVICE',
        ctaHref: inst.serviceRequestId ? `/debug/all-in-one/portal/requests/${inst.serviceRequestId}` : '/debug/all-in-one/portal/requests',
        dedupeKey: `workflow-customer-action:${si.id}`,
        priority: tmpl.stepType === 'payment' ? 'high' : 'normal',
      });
    }
  }
  return actions;
}

export function getWorkflowHealthCounts(store: DemoStore) {
  const instances = store.workflowInstances ?? [];
  return {
    active: instances.filter((w) => w.status === 'active').length,
    blocked: instances.filter((w) => w.status === 'blocked').length,
    waitingCustomer: instances.filter((w) => w.status === 'waiting_on_customer').length,
    waitingExternal: instances.filter((w) => w.status === 'waiting_external').length,
    overdueInternal: 0,
    automationExceptions: (store.automationExceptions ?? []).filter((e) => !e.resolvedAt).length,
    completed: instances.filter((w) => w.status === 'completed').length,
  };
}
