import { EXPIRATION_THRESHOLDS_DAYS, PRIORITY_BY_DAYS } from './calendarConfig';
import type { CalendarEvent, CalendarPriority, DeadlineState, DeadlineType } from './calendarTypes';
import type { VaultDocument } from '../vault/vaultTypes';
import type { RenewalRecord } from '../renewals/renewalTypes';

export function daysUntil(dateStr: string, now = new Date()): number {
  const d = parseDateOnly(dateStr);
  if (!d) return NaN;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

export function parseDateOnly(dateStr: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function computeDeadlineState(dueDate: string, complete: boolean, now = new Date()): DeadlineState {
  if (complete) return 'completed';
  const days = daysUntil(dueDate, now);
  if (Number.isNaN(days)) return 'unknown';
  if (days < 0) return 'overdue';
  if (days === 0) return 'due_today';
  if (days <= EXPIRATION_THRESHOLDS_DAYS[EXPIRATION_THRESHOLDS_DAYS.length - 2]) return 'due_soon';
  return 'upcoming';
}

export function computeCalendarPriority(dueDate: string, complete: boolean): CalendarPriority {
  if (complete) return 'informational';
  const days = daysUntil(dueDate);
  if (Number.isNaN(days)) return 'informational';
  for (const row of PRIORITY_BY_DAYS) {
    if (days <= row.maxDays) return row.priority;
  }
  return 'informational';
}

export function eventFromDocument(doc: VaultDocument): CalendarEvent | null {
  if (!doc.expiresAt || !doc.isCurrent) return null;
  const state = computeDeadlineState(doc.expiresAt, doc.status === 'archived' || doc.status === 'expired');
  return {
    id: `cal-doc-${doc.id}`,
    organizationId: doc.organizationId,
    title: `${doc.title} expiration`,
    dueDate: doc.expiresAt.slice(0, 10),
    deadlineType: inferDeadlineType(doc),
    category: doc.category,
    state,
    priority: computeCalendarPriority(doc.expiresAt, false),
    source: doc.verificationStatus === 'verified' ? 'verified_document' : 'customer_entered',
    deadlineVerification: doc.verificationStatus === 'verified' ? 'staff_verified' : 'derived',
    documentId: doc.id,
    roadReadyItemId: doc.roadReadyItemId,
    serviceRequestId: doc.serviceRequestId,
    vehicleId: doc.relatedEntityType === 'vehicle' ? doc.relatedEntityId : doc.relatedVehicle,
    complete: false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function inferDeadlineType(doc: VaultDocument): DeadlineType {
  if (doc.category === 'insurance') return 'insurance_renewal';
  if (doc.category === 'registration') return 'registration_renewal';
  if (doc.category === 'permits') return 'permit_expiration';
  if (doc.category === 'tax_fuel') return doc.documentType.toLowerCase().includes('ifta') ? 'ifta_filing' : 'tax_filing';
  return 'document_expiration';
}

export function eventFromRenewal(renewal: RenewalRecord): CalendarEvent {
  const state = computeDeadlineState(renewal.expirationDate, renewal.status === 'completed' || renewal.status === 'declined');
  return {
    id: `cal-ren-${renewal.id}`,
    organizationId: renewal.organizationId,
    title: `${renewal.title} renewal`,
    dueDate: renewal.expirationDate,
    deadlineType: renewal.deadlineType,
    category: renewal.category,
    state,
    priority: computeCalendarPriority(renewal.expirationDate, renewal.status === 'completed'),
    source: 'renewal',
    deadlineVerification: 'derived',
    renewalId: renewal.id,
    vehicleId: renewal.vehicleId,
    serviceRequestId: renewal.serviceRequestId,
    documentId: renewal.currentDocumentId,
    complete: renewal.status === 'completed',
    createdAt: renewal.createdAt,
    updatedAt: renewal.updatedAt,
  };
}

export function mergeCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
  const map = new Map<string, CalendarEvent>();
  for (const e of events) {
    const key = e.documentId ? `doc:${e.documentId}` : e.renewalId ? `ren:${e.renewalId}` : e.id;
    if (!map.has(key)) map.set(key, e);
  }
  return [...map.values()].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function formatDaysRemaining(dueDate: string): string {
  const days = daysUntil(dueDate);
  if (Number.isNaN(days)) return 'Date needed';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
}
