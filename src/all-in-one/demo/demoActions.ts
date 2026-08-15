import type { IntakeAnswers } from '../intake/intakeTypes';
import type { RoadmapResult } from '../roadmap/roadmapTypes';
import type { ServicePlanItem } from '../repositories/servicePlanRepository';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type {
  ActivityKind,
  Client,
  DemoStore,
  DocumentMetadata,
  Message,
  RequestStatus,
  ServiceRequest,
  Task,
  Visibility,
} from './demoTypes';
import { computePriority } from '../office/priorityEngine';
import { buildCustomerTimeline, getWorkflowForDivision, statusLabelForStep } from '../office/workflows/workflowEngine';
import { buildNotification } from '../notifications/notificationEngine';
import { updateLoadOperationalStatus } from './dispatchActions';
import type { LoadOperationalStatus } from '../dispatch/dispatchTypes';

function uid(): string {
  return crypto.randomUUID();
}

function logActivity(
  store: DemoStore,
  kind: ActivityKind,
  title: string,
  opts: { clientId?: string; requestId?: string; staffId?: string; detail?: string; visibility?: Visibility },
): void {
  store.activity.unshift({
    id: uid(),
    kind,
    title,
    detail: opts.detail,
    clientId: opts.clientId,
    requestId: opts.requestId,
    staffId: opts.staffId,
    createdAt: new Date().toISOString(),
    visibility: opts.visibility ?? 'internal',
  });
}

export function getStore(): DemoStore {
  return loadDemoStore();
}

export function saveIntake(intake: IntakeAnswers): void {
  updateDemoStore((s) => {
    s.intake = intake;
    return s;
  });
}

export function saveRoadmap(roadmap: RoadmapResult): void {
  updateDemoStore((s) => {
    s.roadmap = roadmap;
    logActivity(s, 'ROADMAP_GENERATED', 'Roadmap generated', { visibility: 'customer' });
    return s;
  });
}

export function saveServicePlan(plan: ServicePlanItem[]): void {
  updateDemoStore((s) => {
    s.servicePlan = plan;
    return s;
  });
}

export function addToServicePlan(item: ServicePlanItem): void {
  updateDemoStore((s) => {
    if (!s.servicePlan.some((p) => p.slug === item.slug)) s.servicePlan.push(item);
    return s;
  });
}

export function removeFromServicePlan(slug: string): void {
  updateDemoStore((s) => {
    s.servicePlan = s.servicePlan.filter((p) => p.slug !== slug);
    return s;
  });
}

function findOrCreateClientFromIntake(s: DemoStore, intake: IntakeAnswers): Client {
  const email = intake.contact?.email?.toLowerCase();
  const existing = email ? s.clients.find((c) => c.contactEmail.toLowerCase() === email) : undefined;
  if (existing) return existing;

  const client: Client = {
    id: uid(),
    companyName: intake.business?.name || intake.shipper?.companyName || 'New Demo Client',
    contactName: intake.contact?.name || intake.shipper?.contactName || 'Contact',
    contactEmail: intake.contact?.email || 'demo@example.com',
    contactPhone: intake.contact?.phone,
    clientType: intake.goal === 'move_freight' ? 'shipper' : intake.business?.operationType === 'fleet' ? 'fleet' : 'owner_operator',
    primaryState: intake.business?.operatingState || 'TX',
    accountStatus: 'pending',
    roadmapProgress: s.roadmap?.complianceProgress ?? 0,
    customerSince: new Date().toISOString().slice(0, 10),
    services: [],
    activeRequestCount: 0,
    documentsNeededCount: 0,
    lastActivityAt: new Date().toISOString(),
  };
  s.clients.unshift(client);
  s.portalClientId = client.id;
  return client;
}

export function submitServiceRequest(payload: {
  services: ServicePlanItem[];
  intake: IntakeAnswers;
  roadmap: RoadmapResult | null;
  notes?: string;
}): ServiceRequest {
  return updateDemoStore((s) => {
    const client = findOrCreateClientFromIntake(s, payload.intake);
    s.requestCounter += 1;
    const requestNumber = `AIO-DEMO-${String(s.requestCounter).padStart(4, '0')}`;
    const division = payload.services[0]?.division ?? 'permitting';
    const wf = getWorkflowForDivision(division);
    const step = wf.steps[0];

    const request: ServiceRequest = {
      id: uid(),
      requestNumber,
      clientId: client.id,
      services: payload.services.map((p) => ({ slug: p.slug, title: p.title, division: p.division })),
      division,
      status: step.id as RequestStatus,
      statusLabel: statusLabelForStep(step.id),
      workflowStep: step.id,
      priority: computePriority({ status: step.id, createdAt: new Date().toISOString() }),
      createdAt: new Date().toISOString(),
      nextStep: step.customerLabel,
      businessName: client.companyName,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      customerNotes: payload.notes,
      roadmapSummary: payload.roadmap
        ? `${payload.roadmap.complianceProgress}% setup progress`
        : undefined,
      timeline: buildCustomerTimeline(division, step.id),
      documentIds: [],
      relatedRoadmapItems: payload.roadmap?.items.filter((i) => i.status === 'recommended').map((i) => i.title),
      taskIds: [],
      isDemo: true,
    };

    s.requests.unshift(request);
    client.activeRequestCount += 1;
    client.lastActivityAt = new Date().toISOString();
    client.services = [...new Set([...client.services, ...payload.services.map((p) => p.title)])];
    s.portalClientId = client.id;

    logActivity(s, 'REQUEST_CREATED', `Service request ${requestNumber} submitted`, {
      clientId: client.id,
      requestId: request.id,
      visibility: 'customer',
    });
    s.notifications.unshift(
      buildNotification({
        recipientType: 'staff',
        staffId: 'staff-2',
        eventType: 'SERVICE_REQUEST_STATUS_CHANGED',
        category: 'operations',
        title: `New service request — ${client.companyName}`,
        body: requestNumber,
        link: `/all-in-one/office/requests/${request.id}`,
      }),
    );

    return s;
  }).requests[0];
}

export function updateRequestStatus(requestId: string, workflowStep: string, staffId?: string): ServiceRequest | undefined {
  return updateDemoStore((s) => {
    const req = s.requests.find((r) => r.id === requestId);
    if (!req) return s;
    req.workflowStep = workflowStep;
    req.status = workflowStep as RequestStatus;
    req.statusLabel = statusLabelForStep(workflowStep);
    req.nextStep = getWorkflowForDivision(req.division).steps.find((st) => st.id === workflowStep)?.customerLabel ?? req.nextStep;
    req.timeline = buildCustomerTimeline(req.division, workflowStep);
    req.priority = computePriority({ status: workflowStep, targetDate: req.targetDate, createdAt: req.createdAt });
    logActivity(s, 'REQUEST_STATUS_CHANGED', `${req.requestNumber} → ${req.statusLabel}`, {
      clientId: req.clientId,
      requestId: req.id,
      staffId,
      visibility: 'customer',
    });
    return s;
  }).requests.find((r) => r.id === requestId);
}

export function assignRequest(requestId: string, staffId: string): void {
  updateDemoStore((s) => {
    const req = s.requests.find((r) => r.id === requestId);
    if (!req) return s;
    req.assignedStaffId = staffId;
    const client = s.clients.find((c) => c.id === req.clientId);
    if (client) client.assignedStaffId = staffId;
    const staff = s.staff.find((st) => st.id === staffId);
    logActivity(s, 'REQUEST_ASSIGNED', `Assigned to ${staff?.name ?? 'staff'}`, {
      clientId: req.clientId,
      requestId,
      staffId,
    });
    return s;
  });
}

export function requestDocuments(
  requestId: string,
  docNames: string[],
  message?: string,
  staffId?: string,
): void {
  updateDemoStore((s) => {
    const req = s.requests.find((r) => r.id === requestId);
    if (!req) return s;

    for (const name of docNames) {
      const doc: DocumentMetadata = {
        id: uid(),
        organizationId: req.clientId,
        name,
        title: name,
        category: 'business',
        documentType: name,
        clientId: req.clientId,
        serviceRequestId: requestId,
        status: 'requested',
        verificationStatus: 'unverified',
        visibility: 'customer',
        isCurrent: true,
        requestedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      s.documents.push(doc);
      req.documentIds.push(doc.id);
    }

    const client = s.clients.find((c) => c.id === req.clientId);
    if (client) client.documentsNeededCount += docNames.length;

    if (req.workflowStep === 'new_request' || req.workflowStep === 'information_needed') {
      req.workflowStep = 'documents_needed';
      req.status = 'documents_needed';
      req.statusLabel = statusLabelForStep('documents_needed');
      req.nextStep = 'Additional documents requested';
      req.timeline = buildCustomerTimeline(req.division, 'documents_needed');
    }

    if (message) {
      const staff = s.staff.find((st) => st.id === staffId);
      s.messages.push({
        id: uid(),
        clientId: req.clientId,
        requestId,
        from: 'staff',
        authorName: staff?.name ?? 'All In One Staff',
        body: message,
        createdAt: new Date().toISOString(),
        visibility: 'customer',
        read: false,
      });
      logActivity(s, 'MESSAGE_SENT', 'Document request message sent', { clientId: req.clientId, requestId, staffId });
    }

    logActivity(s, 'DOCUMENT_REQUESTED', `Documents requested: ${docNames.join(', ')}`, {
      clientId: req.clientId,
      requestId,
      staffId,
      visibility: 'customer',
    });
    return s;
  });
}

export function markDocumentReceived(docId: string, staffId?: string): void {
  updateDemoStore((s) => {
    const doc = s.documents.find((d) => d.id === docId);
    if (!doc) return s;
    doc.status = 'uploaded';
    doc.verificationStatus = 'pending_review';
    doc.uploadedAt = new Date().toISOString();
    logActivity(s, 'DOCUMENT_RECEIVED', `${doc.title ?? doc.name} received`, {
      clientId: doc.organizationId ?? doc.clientId,
      requestId: doc.serviceRequestId,
      staffId,
      visibility: 'customer',
    });
    return s;
  });
}

export function markDocumentAccepted(docId: string, staffId?: string): void {
  updateDemoStore((s) => {
    const doc = s.documents.find((d) => d.id === docId);
    if (!doc) return s;
    doc.status = 'verified';
    doc.verificationStatus = 'verified';
    doc.verifiedAt = new Date().toISOString();
    doc.verifiedByStaffId = staffId;
    const client = s.clients.find((c) => c.id === (doc.organizationId ?? doc.clientId));
    if (client && client.documentsNeededCount > 0) client.documentsNeededCount -= 1;
    return s;
  });
}

export function simulateCustomerUpload(docId: string): void {
  markDocumentReceived(docId);
}

export function addInternalNote(clientId: string, body: string, authorId: string, requestId?: string): void {
  updateDemoStore((s) => {
    const staff = s.staff.find((st) => st.id === authorId);
    s.notes.unshift({
      id: uid(),
      clientId,
      requestId,
      authorId,
      authorInitials: staff?.initials ?? 'ST',
      body,
      createdAt: new Date().toISOString(),
      visibility: 'internal',
    });
    logActivity(s, 'NOTE_ADDED', 'Internal note added', { clientId, requestId, staffId: authorId });
    return s;
  });
}

export function sendCustomerMessage(requestId: string, body: string, from: 'staff' | 'customer', authorName: string): void {
  updateDemoStore((s) => {
    const req = s.requests.find((r) => r.id === requestId);
    if (!req) return s;
    s.messages.push({
      id: uid(),
      clientId: req.clientId,
      requestId,
      from,
      authorName,
      body,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
      read: from === 'staff',
    });
    logActivity(s, 'MESSAGE_SENT', 'Message sent', {
      clientId: req.clientId,
      requestId,
      visibility: 'customer',
    });
    return s;
  });
}

export function createTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
  const created = updateDemoStore((s) => {
    const t: Task = { ...task, id: uid(), createdAt: new Date().toISOString() };
    s.tasks.unshift(t);
    if (t.requestId) {
      const req = s.requests.find((r) => r.id === t.requestId);
      if (req) req.taskIds.push(t.id);
    }
    logActivity(s, 'TASK_CREATED', `Task: ${t.title}`, { clientId: t.clientId, requestId: t.requestId, staffId: t.assignedStaffId });
    return s;
  });
  return created.tasks[0];
}

export function completeTask(taskId: string): void {
  updateDemoStore((s) => {
    const t = s.tasks.find((x) => x.id === taskId);
    if (!t) return s;
    t.status = 'complete';
    logActivity(s, 'TASK_COMPLETED', `Task completed: ${t.title}`, { clientId: t.clientId, requestId: t.requestId, staffId: t.assignedStaffId });
    return s;
  });
}

export function updateLoadStatus(loadId: string, status: LoadOperationalStatus): void {
  updateLoadOperationalStatus(loadId, status);
}

export function sendLoadToFactoring(loadId: string): void {
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId);
    if (!load || load.factoringHandoffStatus !== 'ready') return s;
    const profile = s.factoringProfiles.find((p) => p.organizationId === load.organizationId);
    const providerId = profile?.providerId ?? 'fp-demo-partner';
    let inv = s.freightInvoices.find((f) => f.loadId === loadId && f.status !== 'void');
    if (!inv) {
      inv = {
        id: uid(),
        organizationId: load.organizationId,
        loadId,
        invoiceNumber: `HF-${new Date().getFullYear()}-${String(++s.factoringCounters.freightInvoice).padStart(4, '0')}`,
        debtorName: load.brokerName,
        amountMinor: load.confirmedGrossMinor,
        currency: load.currency,
        invoiceDate: new Date().toISOString().slice(0, 10),
        status: 'issued',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };
      s.freightInvoices.push(inv);
    }
    const dup = s.factoringSubmissions.find(
      (sub) => sub.freightInvoiceId === inv!.id && !['declined', 'cancelled', 'closed'].includes(sub.status),
    );
    if (dup) return s;
    s.factoringSubmissions.unshift({
      id: uid(),
      organizationId: load.organizationId,
      loadId,
      freightInvoiceId: inv.id,
      providerId,
      status: 'submitted',
      submittedAmountMinor: inv.amountMinor,
      currency: inv.currency,
      assignedSpecialistStaffId: 'staff-6',
      packageDocumentIds: [load.rateConfirmationDocumentId, load.bolDocumentId, load.podDocumentId].filter(Boolean) as string[],
      submittedAt: new Date().toISOString(),
      timeline: [{ id: uid(), submissionId: '', label: 'Sent to factoring review', status: 'submitted', visibility: 'customer', createdAt: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    });
    load.factoringHandoffStatus = 'submitted_future';
    logActivity(s, 'FACTORING_SUBMITTED', 'Sent to factoring review', { clientId: load.organizationId, visibility: 'customer' });
    return s;
  });
}

export function updateFactoringStatus(id: string, status: import('../factoring/factoringTypes').FactoringSubmissionStatus): void {
  updateDemoStore((s) => {
    const f = s.factoringSubmissions.find((x) => x.id === id);
    if (!f) return s;
    f.status = status;
    f.updatedAt = new Date().toISOString();
    logActivity(s, 'FACTORING_STATUS_CHANGED', `Factoring → ${status.replace(/_/g, ' ')}`, { clientId: f.organizationId, visibility: 'customer' });
    return s;
  });
}

export function updateBrokerageQuoteStatus(id: string, status: DemoStore['brokerageQuotes'][0]['status']): void {
  updateDemoStore((s) => {
    const q = s.brokerageQuotes.find((x) => x.id === id);
    if (!q) return s;
    q.status = status;
    logActivity(s, 'BROKERAGE_STATUS_CHANGED', `Quote → ${status}`, { clientId: q.clientId, visibility: 'customer' });
    return s;
  });
}

export function getOfficeMetrics(): import('./demoTypes').OfficeMetrics {
  const s = loadDemoStore();
  const weekEnd = Date.now() + 7 * 86400000;
  return {
    newRequests: s.requests.filter((r) => r.status === 'new_request').length,
    inProgress: s.requests.filter((r) => ['in_progress', 'under_review', 'submitted'].includes(r.status)).length,
    waitingOnClient: s.requests.filter((r) => ['documents_needed', 'information_needed'].includes(r.status)).length,
    deadlinesThisWeek: s.deadlines.filter((d) => !d.complete && new Date(d.dueDate).getTime() <= weekEnd).length,
    documentsNeeded: s.documents.filter((d) => d.status === 'requested').length,
    activeDispatchLoads: s.loads.filter((l) => !['complete', 'cancelled'].includes(l.operationalStatus)).length,
    factoringReviews: s.factoringSubmissions.filter((f) => !['funded', 'closed', 'declined', 'cancelled'].includes(f.status)).length,
    brokerageQuotes: s.brokerageQuotes.filter((q) => !['closed', 'booked'].includes(q.status)).length,
  };
}

export function getClientDocuments(clientId: string, visibility?: Visibility): DocumentMetadata[] {
  const s = loadDemoStore();
  return s.documents.filter((d) => (d.organizationId ?? d.clientId) === clientId && (!visibility || d.visibility === visibility));
}

export function getClientMessages(clientId: string, requestId?: string): Message[] {
  const s = loadDemoStore();
  return s.messages.filter(
    (m) => m.clientId === clientId && m.visibility === 'customer' && (!requestId || m.requestId === requestId),
  );
}

export function getPortalRequests(clientId?: string): ServiceRequest[] {
  const s = loadDemoStore();
  const id = clientId ?? s.portalClientId;
  if (!id) return s.requests;
  return s.requests.filter((r) => r.clientId === id);
}

export function getStaffWorkload(staffId: string): number {
  const s = loadDemoStore();
  return s.requests.filter((r) => r.assignedStaffId === staffId && r.status !== 'completed').length
    + s.tasks.filter((t) => t.assignedStaffId === staffId && t.status !== 'complete').length;
}
