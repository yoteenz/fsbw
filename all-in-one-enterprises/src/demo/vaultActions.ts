import { eventFromDocument, eventFromRenewal, mergeCalendarEvents } from '../calendar/calendarService';
import type { CalendarEvent } from '../calendar/calendarTypes';
import { computeDeadlineState } from '../calendar/calendarService';
import { buildNotification, shouldCreateNotification } from '../notifications/notificationEngine';
import { runExpirationEvaluator } from '../notifications/notificationScheduler';
import type { AioNotification } from '../notifications/notificationTypes';
import { findRenewalDefinition } from '../renewals/renewalConfig';
import { buildRenewalFromDocument, renewalDedupeKey } from '../renewals/renewalService';
import type { RenewalRecord } from '../renewals/renewalTypes';
import { submitServiceRequest } from './demoActions';
import type { ServicePlanItem } from '../repositories/servicePlanRepository';
import { storeVaultFile } from '../vault/vaultStorage';
import type { VaultUploadInput } from '../vault/vaultTypes';
import type { RejectionReason, VaultDocument } from '../vault/vaultTypes';
import { REJECTION_REASONS } from '../vault/vaultConfig';
import { loadDemoStore, updateDemoStore } from './demoStore';
import type { Deadline, DemoStore } from './demoTypes';
import { aioPaths } from '../utils/paths';

function uid(): string {
  return crypto.randomUUID();
}

export function getOrganizationId(store: DemoStore = loadDemoStore()): string {
  return store.portalClientId ?? store.clients[0]?.id ?? 'client-a';
}

export function getVaultDocuments(orgId: string, store: DemoStore = loadDemoStore()): VaultDocument[] {
  return store.documents.filter((d) => d.organizationId === orgId && d.visibility === 'customer');
}

export function getVaultDocument(id: string, store: DemoStore = loadDemoStore()): VaultDocument | undefined {
  return store.documents.find((d) => d.id === id);
}

export function getRenewals(orgId: string, store: DemoStore = loadDemoStore()): RenewalRecord[] {
  return store.renewals.filter((r) => r.organizationId === orgId);
}

export function getCalendarEvents(orgId?: string, store: DemoStore = loadDemoStore()): CalendarEvent[] {
  const docs = store.documents.filter((d) => (!orgId || d.organizationId === orgId) && d.isCurrent);
  const renewals = store.renewals.filter((r) => !orgId || r.organizationId === orgId);
  const fromDocs = docs.map(eventFromDocument).filter(Boolean) as CalendarEvent[];
  const fromRen = renewals.map(eventFromRenewal);
  const fromDl = store.deadlines
    .filter((d) => !orgId || d.clientId === orgId)
    .map(deadlineToEvent);
  return mergeCalendarEvents([...fromDocs, ...fromRen, ...fromDl]);
}

function deadlineToEvent(d: Deadline): CalendarEvent {
  const state = computeDeadlineState(d.dueDate, d.complete);
  return {
    id: `cal-dl-${d.id}`,
    organizationId: d.organizationId ?? d.clientId,
    title: d.label,
    dueDate: d.dueDate,
    deadlineType: d.deadlineType ?? 'other',
    category: d.category,
    state,
    priority: state === 'overdue' ? 'critical' : state === 'due_soon' ? 'urgent' : 'upcoming',
    source: (d.source as CalendarEvent['source']) ?? 'staff_entered',
    deadlineVerification: d.deadlineVerification ?? 'derived',
    documentId: d.documentId,
    roadReadyItemId: d.roadReadyItemId,
    renewalId: d.renewalId,
    serviceRequestId: d.requestId,
    vehicleId: d.vehicleId,
    complete: d.complete,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function uploadVaultDocument(input: VaultUploadInput): Promise<{ document?: VaultDocument; error?: string }> {
  const result = await storeVaultFile(input);
  if (result.error || !result.document) return { error: result.error ?? 'Upload failed' };

  updateDemoStore((s) => {
    s.documents.push(result.document);
    if (input.roadReadyItemId) {
      const item = s.roadReadyItems.find((i) => i.id === input.roadReadyItemId);
      if (item) {
        item.documentId = result.document.id;
        item.verificationStatus = 'pending_review';
      }
    }
    s.activity.unshift({
      id: uid(),
      kind: 'DOCUMENT_UPLOADED',
      title: `Document uploaded — ${result.document.title}`,
      clientId: input.organizationId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    const staffNotif = buildNotification({
      recipientType: 'staff',
      staffId: 'staff-2',
      eventType: 'DOCUMENT_UPLOADED',
      category: 'documents',
      title: `New document — ${result.document.title}`,
      body: 'Awaiting staff review.',
      entityType: 'document',
      entityId: result.document.id,
      link: aioPaths.officeDocuments,
    });
    s.notifications.unshift(staffNotif);
    syncDeadlineForDocument(s, result.document);
    return s;
  });

  runExpirationEvaluation();
  return { document: result.document };
}

function syncDeadlineForDocument(s: DemoStore, doc: VaultDocument): void {
  if (!doc.expiresAt) return;
  const exists = s.deadlines.some((d) => d.documentId === doc.id && !d.complete);
  if (exists) return;
  s.deadlines.push({
    id: uid(),
    label: `${doc.title} expiration`,
    clientId: doc.organizationId,
    organizationId: doc.organizationId,
    documentId: doc.id,
    dueDate: doc.expiresAt.slice(0, 10),
    severity: 'upcoming',
    category: doc.category,
    complete: false,
    source: 'verified_document',
    deadlineType: doc.category === 'insurance' ? 'insurance_renewal' : 'document_expiration',
    deadlineVerification: doc.verificationStatus === 'verified' ? 'staff_verified' : 'derived',
  });
}

export function verifyVaultDocument(documentId: string, staffId: string, _staffName?: string): void {
  updateDemoStore((s) => {
    const doc = s.documents.find((d) => d.id === documentId);
    if (!doc) return s;
    doc.status = 'verified';
    doc.verificationStatus = 'verified';
    doc.verifiedAt = new Date().toISOString();
    doc.verifiedByStaffId = staffId;
    doc.updatedAt = new Date().toISOString();

    if (doc.roadReadyItemId) {
      const item = s.roadReadyItems.find((i) => i.id === doc.roadReadyItemId);
      if (item) {
        item.status = 'completed';
        item.verificationStatus = 'verified';
        item.verifiedAt = new Date().toISOString();
        item.verifiedByStaffId = staffId;
        item.source = 'document_verified';
      }
    } else if (doc.category === 'insurance') {
      const item = s.roadReadyItems.find(
        (i) => i.organizationId === doc.organizationId && i.requirementKey === 'commercial_insurance',
      );
      if (item) {
        item.status = 'completed';
        item.verificationStatus = 'verified';
        item.verifiedAt = new Date().toISOString();
        item.verifiedByStaffId = staffId;
        item.source = 'document_verified';
      }
    }

    syncDeadlineForDocument(s, doc);
    const renewal = buildRenewalFromDocument(doc);
    if (renewal && !s.renewals.some((r) => renewalDedupeKey(r) === renewalDedupeKey(renewal))) {
      s.renewals.push(renewal);
    }

    const customerNotif = buildNotification({
      organizationId: doc.organizationId,
      recipientType: 'customer',
      eventType: 'DOCUMENT_VERIFIED',
      category: 'documents',
      title: `${doc.title} verified`,
      body: 'All In One has verified your document.',
      entityType: 'document',
      entityId: doc.id,
      link: aioPaths.portalVaultDocument(doc.id),
    });
    s.notifications.unshift(customerNotif);

    s.activity.unshift({
      id: uid(),
      kind: 'DOCUMENT_VERIFIED',
      title: `${doc.title} verified by All In One`,
      clientId: doc.organizationId,
      staffId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function rejectVaultDocument(
  documentId: string,
  staffId: string,
  reason: RejectionReason,
  customerMessage?: string,
): void {
  updateDemoStore((s) => {
    const doc = s.documents.find((d) => d.id === documentId);
    if (!doc) return s;
    doc.status = 'rejected';
    doc.verificationStatus = 'rejected';
    doc.rejectionReason = reason;
    doc.rejectionMessage = customerMessage ?? REJECTION_REASONS.find((r) => r.id === reason)?.customerMessage;
    doc.updatedAt = new Date().toISOString();

    if (doc.roadReadyItemId) {
      const item = s.roadReadyItems.find((i) => i.id === doc.roadReadyItemId);
      if (item) {
        item.status = 'action_needed';
        item.verificationStatus = 'pending_review';
      }
    }

    s.notifications.unshift(
      buildNotification({
        organizationId: doc.organizationId,
        recipientType: 'customer',
        eventType: 'DOCUMENT_REJECTED',
        category: 'documents',
        title: `Document needs replacement — ${doc.title}`,
        body: doc.rejectionMessage ?? 'Please upload a corrected document.',
        entityType: 'document',
        entityId: doc.id,
        link: aioPaths.portalVaultDocument(doc.id),
      }),
    );

    s.activity.unshift({
      id: uid(),
      kind: 'DOCUMENT_REJECTED',
      title: `Document rejected — ${doc.title}`,
      clientId: doc.organizationId,
      staffId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function supersedeDocument(oldId: string, newDoc: VaultDocument): void {
  updateDemoStore((s) => {
    const old = s.documents.find((d) => d.id === oldId);
    if (old) {
      old.isCurrent = false;
      old.status = 'archived';
      old.supersededByDocumentId = newDoc.id;
      old.updatedAt = new Date().toISOString();
      s.deadlines.filter((d) => d.documentId === oldId).forEach((d) => { d.complete = true; });
    }
    newDoc.supersedesDocumentId = oldId;
    newDoc.isCurrent = true;
    s.documents.push(newDoc);
    syncDeadlineForDocument(s, newDoc);
    s.activity.unshift({
      id: uid(),
      kind: 'DOCUMENT_SUPERSEDED',
      title: 'Document superseded with new upload',
      clientId: newDoc.organizationId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function startRenewalWithAio(renewalId: string, orgId: string): string {
  const store = loadDemoStore();
  const renewal = store.renewals.find((r) => r.id === renewalId && r.organizationId === orgId);
  if (!renewal) throw new Error('Renewal not found');

  const def = findRenewalDefinition(renewal.renewalType);
  const planItem: ServicePlanItem = {
    slug: def?.serviceSlug ?? 'permitting',
    title: renewal.title,
    division: renewal.category === 'insurance' ? 'insurance' : 'permitting',
    addedAt: new Date().toISOString(),
    reason: `Renewal assistance for ${renewal.title}`,
    fromRoadmap: true,
  };

  const req = submitServiceRequest({
    services: [planItem],
    intake: store.intake,
    roadmap: store.roadmap,
    notes: `Renewal request: ${renewal.title}. Expiration: ${renewal.expirationDate}`,
  });

  updateDemoStore((s) => {
    const r = s.renewals.find((x) => x.id === renewalId);
    if (r) {
      r.status = 'in_progress';
      r.serviceRequestId = req.id;
      r.updatedAt = new Date().toISOString();
    }
    s.notifications.unshift(
      buildNotification({
        recipientType: 'staff',
        staffId: 'staff-2',
        eventType: 'RENEWAL_STARTED',
        category: 'renewals',
        title: `Renewal started — ${renewal.title}`,
        body: req.requestNumber,
        entityType: 'renewal',
        entityId: renewalId,
        link: aioPaths.officeRenewals,
      }),
    );
    return s;
  });

  return req.id;
}

export function markRenewalSelfManaged(renewalId: string, orgId: string): void {
  updateDemoStore((s) => {
    const r = s.renewals.find((x) => x.id === renewalId && x.organizationId === orgId);
    if (r) {
      r.status = 'self_managed';
      r.selfManaged = true;
      r.updatedAt = new Date().toISOString();
    }
    return s;
  });
}

export function completeRenewal(renewalId: string, newDocumentId: string): void {
  updateDemoStore((s) => {
    const r = s.renewals.find((x) => x.id === renewalId);
    if (!r) return s;
    r.status = 'completed';
    r.currentDocumentId = newDocumentId;
    r.completedAt = new Date().toISOString();
    r.updatedAt = new Date().toISOString();
    s.deadlines.filter((d) => d.renewalId === renewalId || d.documentId === r.currentDocumentId).forEach((d) => {
      d.complete = true;
    });
    s.notifications.unshift(
      buildNotification({
        organizationId: r.organizationId,
        recipientType: 'customer',
        eventType: 'RENEWAL_COMPLETED',
        category: 'renewals',
        title: `${r.title} completed`,
        body: 'Your renewal has been recorded.',
        entityType: 'renewal',
        entityId: renewalId,
        link: aioPaths.portalRenewals,
      }),
    );
    s.activity.unshift({
      id: uid(),
      kind: 'RENEWAL_COMPLETED',
      title: `Renewal completed — ${r.title}`,
      clientId: r.organizationId,
      createdAt: new Date().toISOString(),
      visibility: 'customer',
    });
    return s;
  });
}

export function getPortalNotifications(orgId: string, store: DemoStore = loadDemoStore()): AioNotification[] {
  return store.notifications.filter((n) => n.recipientType === 'customer' && n.organizationId === orgId && !n.archived);
}

export function getOfficeNotifications(store: DemoStore = loadDemoStore()): AioNotification[] {
  return store.notifications.filter((n) => n.recipientType === 'staff' && !n.archived);
}

export function markNotificationRead(id: string): void {
  updateDemoStore((s) => {
    const n = s.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    return s;
  });
}

export function markAllNotificationsRead(orgId: string): void {
  updateDemoStore((s) => {
    s.notifications.forEach((n) => {
      if (n.organizationId === orgId && n.recipientType === 'customer') n.read = true;
    });
    return s;
  });
}

export function runExpirationEvaluation(): void {
  updateDemoStore((s) => {
    const created = runExpirationEvaluator(s.documents, s.renewals, s.notifications);
    for (const n of created) {
      if (!n.dedupeKey || shouldCreateNotification(s.notifications, n.dedupeKey)) {
        s.notifications.unshift(n);
      }
    }
    s.expirationEvaluatorLastRun = new Date().toISOString();
    return s;
  });
}

export function searchVaultDocuments(orgId: string, query: string, filters?: {
  status?: string;
  category?: string;
}, store: DemoStore = loadDemoStore()): VaultDocument[] {
  let docs = getVaultDocuments(orgId, store);
  const q = query.trim().toLowerCase();
  if (q) {
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.documentType.toLowerCase().includes(q) ||
        d.category.includes(q),
    );
  }
  if (filters?.status) docs = docs.filter((d) => d.status === filters.status);
  if (filters?.category) docs = docs.filter((d) => d.category === filters.category);
  return docs;
}
