import type { DemoStore } from '../demo/demoTypes';
import type {
  OfficeWorkItem,
  OfficeWorkItemView,
  OfficeWorkStatus,
  OfficeWaitingOn,
} from './officeWorkTypes';
import { OFFICE_WORK_STATUS_LABELS, STALE_WORK_DAYS as STALE_DAYS } from './officeWorkTypes';
import { aioPaths } from '../utils/paths';

const ACTIVE_STATUSES: OfficeWorkStatus[] = [
  'new', 'assigned', 'in_progress', 'waiting_on_customer', 'waiting_externally',
  'waiting_internal', 'ready_for_review',
];

export function isActiveWorkStatus(status: OfficeWorkStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function isWorkOverdue(item: OfficeWorkItem, now = new Date()): boolean {
  if (!item.dueAt || !isActiveWorkStatus(item.status)) return false;
  return new Date(item.dueAt) < now;
}

export function workAgeDays(item: OfficeWorkItem, now = new Date()): number {
  const ms = now.getTime() - new Date(item.updatedAt).getTime();
  return Math.floor(ms / 86400000);
}

export function isStaleWork(item: OfficeWorkItem, now = new Date()): boolean {
  if (!isActiveWorkStatus(item.status)) return false;
  const threshold = item.staleAfterDays ?? STALE_DAYS;
  return workAgeDays(item, now) >= threshold;
}

export function workItemHref(item: OfficeWorkItem): string {
  switch (item.sourceDomain) {
    case 'service_request':
      return aioPaths.officeRequest(item.sourceEntityId);
    case 'document':
      return aioPaths.officeDocumentsReview;
    case 'renewal':
      return aioPaths.officeRenewals;
    case 'insurance':
      return aioPaths.officeInsuranceRequest(item.sourceEntityId);
    case 'dispatch':
      return aioPaths.officeLoad(item.sourceEntityId);
    case 'factoring':
      return aioPaths.officeFactoringSubmission(item.sourceEntityId);
    case 'brokerage':
      return aioPaths.officeBrokerageLoad(item.sourceEntityId);
    case 'quote':
      return aioPaths.officeQuote(item.sourceEntityId);
    case 'invoice':
      return aioPaths.officeInvoice(item.sourceEntityId);
    case 'message':
      return aioPaths.officeInbox;
    case 'road_ready':
      return aioPaths.officeClientRoadReady(item.organizationId);
    default:
      return aioPaths.officeWork;
  }
}

export function enrichWorkItem(item: OfficeWorkItem, store: DemoStore, now = new Date()): OfficeWorkItemView {
  const client = store.clients.find((c) => c.id === item.organizationId);
  const staff = item.assignedUserId
    ? store.staff.find((s) => s.id === item.assignedUserId)
    : undefined;
  return {
    ...item,
    organizationName: client?.companyName ?? item.organizationId,
    assignedStaffName: staff?.name,
    ageDays: workAgeDays(item, now),
    isOverdue: isWorkOverdue(item, now),
    isStale: isStaleWork(item, now),
    ctaHref: workItemHref(item),
  };
}

export function getWorkItemsForStaff(store: DemoStore, staffId: string): OfficeWorkItem[] {
  const items = store.officeWorkItems ?? [];
  return items.filter(
    (w) => w.assignedUserId === staffId && isActiveWorkStatus(w.status),
  );
}

export function getUnassignedWork(store: DemoStore): OfficeWorkItem[] {
  return (store.officeWorkItems ?? []).filter(
    (w) => !w.assignedUserId && isActiveWorkStatus(w.status),
  );
}

export function getWorkByWaitingOn(store: DemoStore, waitingOn: OfficeWaitingOn): OfficeWorkItem[] {
  return (store.officeWorkItems ?? []).filter(
    (w) => w.waitingOn === waitingOn && isActiveWorkStatus(w.status),
  );
}

export function getWorkByQueue(store: DemoStore, queueId: string): OfficeWorkItem[] {
  return (store.officeWorkItems ?? []).filter(
    (w) => w.queueId === queueId && isActiveWorkStatus(w.status),
  );
}

export function countQueue(store: DemoStore, queueId: string): number {
  return getWorkByQueue(store, queueId).length;
}

export function transitionWorkStatus(
  item: OfficeWorkItem,
  nextStatus: OfficeWorkStatus,
  waitingOn?: import('./officeWorkTypes').OfficeWaitingOn,
): OfficeWorkItem {
  const now = new Date().toISOString();
  return {
    ...item,
    status: nextStatus,
    statusLabel: OFFICE_WORK_STATUS_LABELS[nextStatus],
    waitingOn: waitingOn ?? item.waitingOn,
    updatedAt: now,
    completedAt: nextStatus === 'completed' || nextStatus === 'cancelled' ? now : item.completedAt,
    version: item.version + 1,
  };
}

export function filterDueToday(items: OfficeWorkItem[], now = new Date()): OfficeWorkItem[] {
  const today = now.toISOString().slice(0, 10);
  return items.filter(
    (w) => w.dueAt?.slice(0, 10) === today && isActiveWorkStatus(w.status),
  );
}

export function filterOverdue(items: OfficeWorkItem[], now = new Date()): OfficeWorkItem[] {
  return items.filter((w) => isWorkOverdue(w, now));
}

export function filterUpcoming(items: OfficeWorkItem[], now = new Date()): OfficeWorkItem[] {
  const today = now.toISOString().slice(0, 10);
  return items.filter((w) => {
    if (!w.dueAt || !isActiveWorkStatus(w.status)) return false;
    return w.dueAt.slice(0, 10) > today;
  });
}

export function deriveWorkFromCanonical(store: DemoStore): OfficeWorkItem[] {
  const seeded = store.officeWorkItems ?? [];
  if (seeded.length > 0) return seeded;
  return [];
}
