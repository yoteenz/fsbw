import { buildNotification } from '../notifications/notificationEngine';
import {
  canCreateFreightInvoice,
  canEditSubmissionFinancials,
  canTransitionSubmissionStatus,
  detectAmountMismatch,
  evaluateLoadFactoringReadiness,
  findDuplicateSubmission,
  isPackageComplete,
} from '../factoring/factoringRules';
import type {
  FactoringIssueType,
  FactoringProfile,
  FactoringSubmissionStatus,
  FreightInvoice,
} from '../factoring/factoringTypes';
import type { Load } from '../dispatch/dispatchTypes';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import { aioPaths } from '../utils/paths';

function uid(): string {
  return crypto.randomUUID();
}

export function getOrganizationId(store: DemoStore = loadDemoStore()): string {
  return store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
}

export function getFactoringProfile(orgId: string, store: DemoStore = loadDemoStore()) {
  return store.factoringProfiles.find((p) => p.organizationId === orgId);
}

export function getFreightInvoices(orgId: string, store: DemoStore = loadDemoStore()) {
  return store.freightInvoices.filter((f) => f.organizationId === orgId);
}

export function getSubmissions(orgId?: string, store: DemoStore = loadDemoStore()) {
  return store.factoringSubmissions.filter((s) => !orgId || s.organizationId === orgId);
}

export function getSubmission(id: string, orgId?: string, store: DemoStore = loadDemoStore()) {
  const s = store.factoringSubmissions.find((x) => x.id === id);
  if (!s || (orgId && s.organizationId !== orgId)) return undefined;
  return s;
}

export function getReadyLoads(orgId: string, store: DemoStore = loadDemoStore()): {
  load: Load;
  readiness: ReturnType<typeof evaluateLoadFactoringReadiness>;
  freightInvoice?: FreightInvoice;
}[] {
  const loads = store.loads.filter((l) => l.organizationId === orgId && l.operationalStatus === 'complete');
  return loads.map((load) => {
    const freightInvoice = store.freightInvoices.find((f) => f.loadId === load.id);
    const readiness = evaluateLoadFactoringReadiness(load, freightInvoice);
    const hasActiveSub = store.factoringSubmissions.some(
      (s) => s.loadId === load.id && !['declined', 'cancelled', 'closed'].includes(s.status),
    );
    if (hasActiveSub && readiness.state === 'ready') {
      return { load, readiness: { ...readiness, state: 'submitted' as const }, freightInvoice };
    }
    return { load, readiness, freightInvoice };
  });
}

export function requestFactoringHelp(orgId: string): void {
  updateDemoStore((s) => {
    let profile = s.factoringProfiles.find((p) => p.organizationId === orgId);
    if (!profile) {
      profile = {
        id: uid(),
        organizationId: orgId,
        enrollmentStatus: 'interested',
        serviceMode: 'factoring_assistance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      s.factoringProfiles.push(profile);
    } else {
      profile.enrollmentStatus = profile.enrollmentStatus === 'not_enrolled' ? 'interested' : profile.enrollmentStatus;
      profile.updatedAt = new Date().toISOString();
    }
    s.activity.unshift({
      id: uid(),
      kind: 'FACTORING_ENROLLMENT_CREATED',
      title: 'Factoring assistance requested',
      clientId: orgId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function saveFactoringApplication(orgId: string, data: Partial<FactoringProfile>): void {
  updateDemoStore((s) => {
    const profile = s.factoringProfiles.find((p) => p.organizationId === orgId);
    if (!profile) return s;
    Object.assign(profile, data, {
      enrollmentStatus: 'application_started',
      updatedAt: new Date().toISOString(),
    });
    return s;
  });
}

function nextFreightInvoiceNumber(s: DemoStore): string {
  s.factoringCounters.freightInvoice += 1;
  return `HF-${new Date().getFullYear()}-${String(s.factoringCounters.freightInvoice).padStart(4, '0')}`;
}

export function createFreightInvoiceFromLoad(loadId: string, orgId: string, invoiceNumber?: string): FreightInvoice | undefined {
  let created!: FreightInvoice;
  updateDemoStore((s) => {
    const load = s.loads.find((l) => l.id === loadId && l.organizationId === orgId);
    if (!load || !canCreateFreightInvoice(load)) return s;
    if (s.freightInvoices.some((f) => f.loadId === loadId && f.status !== 'void')) return s;
    const id = uid();
    const inv: FreightInvoice = {
      id,
      organizationId: orgId,
      loadId,
      invoiceNumber: invoiceNumber ?? nextFreightInvoiceNumber(s),
      debtorName: load.brokerName,
      amountMinor: load.confirmedGrossMinor,
      currency: load.currency,
      invoiceDate: new Date().toISOString().slice(0, 10),
      status: 'issued',
      rateConfirmationDocumentId: load.rateConfirmationDocumentId,
      bolDocumentId: load.bolDocumentId,
      podDocumentId: load.podDocumentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    s.freightInvoices.push(inv);
    s.activity.unshift({
      id: uid(),
      kind: 'FREIGHT_INVOICE_CREATED',
      title: `Freight invoice ${inv.invoiceNumber} created`,
      clientId: orgId,
      createdAt: inv.createdAt,
      visibility: 'customer',
    });
    created = inv;
    return s;
  });
  return created;
}

export function createFactoringSubmission(
  loadId: string,
  freightInvoiceId: string,
  orgId: string,
  providerId: string,
  staffId?: string,
): { ok: true; submissionId: string } | { ok: false; reason: string } {
  const store = loadDemoStore();
  const load = store.loads.find((l) => l.id === loadId && l.organizationId === orgId);
  const inv = store.freightInvoices.find((f) => f.id === freightInvoiceId && f.organizationId === orgId);
  if (!load || !inv) return { ok: false, reason: 'Load or invoice not found' };
  const dup = findDuplicateSubmission(freightInvoiceId, store.factoringSubmissions);
  if (dup) return { ok: false, reason: 'duplicate' };
  if (!isPackageComplete(load, inv)) return { ok: false, reason: 'Package incomplete' };

  let submissionId = '';
  updateDemoStore((s) => {
    s.factoringCounters.submission += 1;
    const id = uid();
    submissionId = id;
    const sub = {
      id,
      organizationId: orgId,
      loadId,
      freightInvoiceId,
      providerId,
      status: 'ready' as const,
      submittedAmountMinor: inv.amountMinor,
      currency: inv.currency,
      assignedSpecialistStaffId: staffId ?? 'staff-6',
      packageDocumentIds: [load.rateConfirmationDocumentId, load.bolDocumentId, load.podDocumentId].filter(Boolean) as string[],
      timeline: [{
        id: uid(),
        submissionId: id,
        label: 'Submission package prepared',
        status: 'ready' as const,
        visibility: 'customer' as const,
        createdAt: new Date().toISOString(),
      }],
      createdByStaffId: staffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    s.factoringSubmissions.push(sub);
    if (detectAmountMismatch(load, inv)) {
      s.factoringIssues.push({
        id: uid(),
        organizationId: orgId,
        submissionId: id,
        loadId,
        type: 'invoice_amount_mismatch',
        status: 'under_review',
        summary: 'Freight invoice amount differs from confirmed load gross',
        customerActionRequired: false,
        createdAt: new Date().toISOString(),
      });
    }
    return s;
  });
  return { ok: true, submissionId };
}

export function submitToProvider(submissionId: string, _staffId: string, externalReference?: string): boolean {
  let ok = false;
  updateDemoStore((s) => {
    const sub = s.factoringSubmissions.find((x) => x.id === submissionId);
    if (!sub || !canTransitionSubmissionStatus(sub.status, 'submitted')) return s;
    sub.status = 'submitted';
    sub.submittedAt = new Date().toISOString();
    sub.externalReference = externalReference;
    sub.updatedAt = sub.submittedAt;
    sub.version += 1;
    sub.timeline.unshift({
      id: uid(),
      submissionId,
      label: 'Submitted to factoring provider (manual)',
      status: 'submitted',
      actor: 'specialist',
      visibility: 'customer',
      createdAt: sub.submittedAt,
    });
    s.notifications.unshift(
      buildNotification({
        organizationId: sub.organizationId,
        recipientType: 'customer',
        eventType: 'FACTORING_SUBMITTED',
        category: 'factoring',
        title: 'Factoring submission sent',
        body: 'Your package was submitted to the factoring provider for review.',
        link: aioPaths.portalFactoringSubmission(sub.id),
      }),
    );
    ok = true;
    return s;
  });
  return ok;
}

export function updateSubmissionStatus(
  submissionId: string,
  status: FactoringSubmissionStatus,
  _staffId: string,
  reported?: { advanceMinor?: number; reserveMinor?: number; feeMinor?: number },
): boolean {
  let ok = false;
  updateDemoStore((s) => {
    const sub = s.factoringSubmissions.find((x) => x.id === submissionId);
    if (!sub || !canTransitionSubmissionStatus(sub.status, status)) return s;
    if (!canEditSubmissionFinancials(sub) && status !== 'closed') return s;
    sub.status = status;
    sub.updatedAt = new Date().toISOString();
    sub.version += 1;
    if (status === 'approved') sub.approvedAt = sub.updatedAt;
    if (status === 'funded') {
      sub.fundedAt = sub.updatedAt;
      if (reported?.advanceMinor != null) sub.reportedAdvanceMinor = reported.advanceMinor;
      if (reported?.reserveMinor != null) sub.reportedReserveMinor = reported.reserveMinor;
      if (reported?.feeMinor != null) sub.reportedFeeMinor = reported.feeMinor;
    }
    sub.timeline.unshift({
      id: uid(),
      submissionId,
      label: status.replace(/_/g, ' '),
      status,
      actor: 'specialist',
      visibility: 'customer',
      createdAt: sub.updatedAt,
    });
    const eventMap: Partial<Record<FactoringSubmissionStatus, string>> = {
      approved: 'FACTORING_APPROVED',
      funded: 'FACTORING_FUNDED',
      additional_information_needed: 'FACTORING_ADDITIONAL_INFO_NEEDED',
      declined: 'FACTORING_DECLINED',
      funding_pending: 'FACTORING_FUNDING_PENDING',
    };
    const eventType = eventMap[status];
    if (eventType) {
      s.notifications.unshift(
        buildNotification({
          organizationId: sub.organizationId,
          recipientType: 'customer',
          eventType: eventType as import('../notifications/notificationTypes').NotificationEventType,
          category: 'factoring',
          title: `Factoring: ${status.replace(/_/g, ' ')}`,
          body: status === 'funded' ? 'Your factoring provider has reported funding for this submission.' : 'Status updated on your factoring submission.',
          link: aioPaths.portalFactoringSubmission(sub.id),
        }),
      );
    }
    ok = true;
    return s;
  });
  return ok;
}

export function createFactoringIssue(
  submissionId: string,
  type: FactoringIssueType,
  summary: string,
  customerActionRequired: boolean,
  staffId: string,
): void {
  updateDemoStore((s) => {
    const sub = s.factoringSubmissions.find((x) => x.id === submissionId);
    if (!sub) return s;
    s.factoringIssues.push({
      id: uid(),
      organizationId: sub.organizationId,
      submissionId,
      loadId: sub.loadId,
      type,
      status: customerActionRequired ? 'waiting_on_carrier' : 'under_review',
      summary,
      customerActionRequired,
      createdByStaffId: staffId,
      createdAt: new Date().toISOString(),
    });
    if (customerActionRequired && canTransitionSubmissionStatus(sub.status, 'additional_information_needed')) {
      sub.status = 'additional_information_needed';
      sub.updatedAt = new Date().toISOString();
      sub.version += 1;
      sub.timeline.unshift({
        id: uid(),
        submissionId,
        label: 'Additional information needed',
        status: 'additional_information_needed',
        actor: 'specialist',
        visibility: 'customer',
        createdAt: sub.updatedAt,
      });
    }
    s.notifications.unshift(
      buildNotification({
        organizationId: sub.organizationId,
        recipientType: 'customer',
        eventType: 'FACTORING_ADDITIONAL_INFO_NEEDED',
        category: 'factoring',
        title: 'Action needed — factoring',
        body: summary,
        link: aioPaths.portalFactoringSubmission(sub.id),
      }),
    );
    return s;
  });
}

export function getOfficeFactoringMetrics(store: DemoStore = loadDemoStore()) {
  const subs = store.factoringSubmissions;
  return {
    ready: store.loads.filter((l) => l.factoringHandoffStatus === 'ready').length,
    documentsNeeded: store.loads.filter((l) => l.operationalStatus === 'complete' && !l.podDocumentId).length,
    submitted: subs.filter((s) => s.status === 'submitted').length,
    providerReview: subs.filter((s) => ['provider_review', 'additional_information_needed'].includes(s.status)).length,
    fundingPending: subs.filter((s) => ['approved', 'funding_pending'].includes(s.status)).length,
    funded: subs.filter((s) => s.status === 'funded').length,
    issues: store.factoringIssues.filter((i) => i.status !== 'resolved').length,
  };
}

export function getCustomerFactoringMetrics(orgId: string, store: DemoStore = loadDemoStore()) {
  const subs = getSubmissions(orgId, store);
  const ready = getReadyLoads(orgId, store).filter((r) => r.readiness.state === 'ready' && !r.freightInvoice);
  return {
    readyToSubmit: ready.length,
    inReview: subs.filter((s) => ['submitted', 'provider_review', 'additional_information_needed'].includes(s.status)).length,
    fundingPending: subs.filter((s) => ['approved', 'funding_pending'].includes(s.status)).length,
    fundedPeriod: subs.filter((s) => s.status === 'funded').length,
    actionNeeded: store.factoringIssues.filter((i) => i.organizationId === orgId && i.customerActionRequired && i.status !== 'resolved').length,
  };
}
