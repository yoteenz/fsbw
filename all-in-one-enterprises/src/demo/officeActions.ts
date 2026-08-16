import { updateDemoStore } from './demoStore';
import type { DemoStore } from './demoTypes';
import type {
  OfficeWorkItem,
  OfficeWorkStatus,
  OfficeWaitingOn,
} from '../office-core/officeWorkTypes';
import { OFFICE_WORK_STATUS_LABELS as STATUS_LABELS } from '../office-core/officeWorkTypes';
import { buildNotification } from '../notifications/notificationEngine';

function uid(): string {
  return crypto.randomUUID();
}

export function assignWorkItem(
  workItemId: string,
  assignedUserId: string,
  assignedById: string,
  reason?: string,
  expectedVersion?: number,
): { ok: boolean; error?: string } {
  let result: { ok: boolean; error?: string } = { ok: false };
  updateDemoStore((store) => {
    const item = store.officeWorkItems?.find((w) => w.id === workItemId);
    if (!item) {
      result = { ok: false, error: 'Work item not found' };
      return store;
    }
    if (expectedVersion !== undefined && item.version !== expectedVersion) {
      result = { ok: false, error: 'Conflict — work item was updated by another user' };
      return store;
    }
    const prevAssignee = item.assignedUserId;
    const updated: OfficeWorkItem = {
      ...item,
      assignedUserId,
      status: item.status === 'new' ? 'assigned' : item.status,
      statusLabel: item.status === 'new' ? STATUS_LABELS.assigned : item.statusLabel,
      updatedAt: new Date().toISOString(),
      version: item.version + 1,
    };
    store.officeWorkItems = (store.officeWorkItems ?? []).map((w) => (w.id === workItemId ? updated : w));
    store.officeAssignmentHistory = [
      ...(store.officeAssignmentHistory ?? []),
      {
        id: uid(),
        workItemId,
        assignedUserId,
        assignedTeamId: item.assignedTeamId,
        assignedById,
        assignedAt: new Date().toISOString(),
        reassignedFromUserId: prevAssignee,
        reason,
      },
    ];
    store.activity.unshift({
      id: uid(),
      kind: 'TASK_CREATED',
      title: `Work assigned: ${item.title}`,
      clientId: item.organizationId,
      staffId: assignedById,
      createdAt: new Date().toISOString(),
      visibility: 'internal',
    });
    store.notifications.unshift(
      buildNotification({
        recipientType: 'staff',
        staffId: assignedUserId,
        eventType: 'OFFICE_WORK_ASSIGNED',
        category: 'operations',
        title: 'Work assigned to you',
        body: item.title,
        organizationId: item.organizationId,
        entityType: 'office_work_item',
        entityId: workItemId,
      }),
    );
    result = { ok: true };
    return store;
  });
  return result;
}

export function updateWorkItemStatus(
  workItemId: string,
  status: OfficeWorkStatus,
  waitingOn?: OfficeWaitingOn,
): void {
  updateDemoStore((store) => {
    store.officeWorkItems = (store.officeWorkItems ?? []).map((w) => {
      if (w.id !== workItemId) return w;
      return {
        ...w,
        status,
        statusLabel: STATUS_LABELS[status],
        waitingOn: waitingOn ?? w.waitingOn,
        updatedAt: new Date().toISOString(),
        completedAt: status === 'completed' || status === 'cancelled' ? new Date().toISOString() : w.completedAt,
        version: w.version + 1,
      };
    });
    return store;
  });
}

export function acceptHandoff(handoffId: string, acceptedById: string): void {
  updateDemoStore((store) => {
    store.officeHandoffs = (store.officeHandoffs ?? []).map((h) => {
      if (h.id !== handoffId) return h;
      return {
        ...h,
        status: 'accepted',
        acceptedById,
        acceptedAt: new Date().toISOString(),
      };
    });
    store.activity.unshift({
      id: uid(),
      kind: 'NOTE_ADDED',
      title: 'Handoff accepted',
      staffId: acceptedById,
      createdAt: new Date().toISOString(),
      visibility: 'internal',
    });
    return store;
  });
}

export function reviewApproval(
  approvalId: string,
  decision: 'approved' | 'rejected',
  reviewedById: string,
  decisionNote?: string,
): void {
  updateDemoStore((store) => {
    store.officeApprovals = (store.officeApprovals ?? []).map((a) => {
      if (a.id !== approvalId) return a;
      return {
        ...a,
        status: decision,
        reviewedById,
        reviewedAt: new Date().toISOString(),
        decisionNote,
      };
    });
    const approval = store.officeApprovals?.find((a) => a.id === approvalId);
    if (approval) {
      store.notifications.unshift(
        buildNotification({
          recipientType: 'staff',
          staffId: approval.requestedById,
          eventType: 'OFFICE_APPROVAL_DECISION',
          category: 'operations',
          title: `Approval ${decision}`,
          body: approval.title,
          organizationId: approval.organizationId,
          entityType: 'approval',
          entityId: approvalId,
        }),
      );
    }
    return store;
  });
}

export function acknowledgeEscalation(escalationId: string, ownerId: string): void {
  updateDemoStore((store) => {
    store.officeEscalations = (store.officeEscalations ?? []).map((e) => {
      if (e.id !== escalationId) return e;
      return { ...e, ownerId, acknowledgedAt: new Date().toISOString() };
    });
    return store;
  });
}

export function resolveEscalation(escalationId: string, resolution: string): void {
  updateDemoStore((store) => {
    store.officeEscalations = (store.officeEscalations ?? []).map((e) => {
      if (e.id !== escalationId) return e;
      return {
        ...e,
        resolution,
        resolvedAt: new Date().toISOString(),
      };
    });
    return store;
  });
}

export function createManualWorkTask(
  task: Omit<OfficeWorkItem, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'statusLabel'>,
): OfficeWorkItem {
  let created!: OfficeWorkItem;
  updateDemoStore((store) => {
    created = {
      ...task,
      id: uid(),
      statusLabel: STATUS_LABELS[task.status],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    store.officeWorkItems = [...(store.officeWorkItems ?? []), created];
    return store;
  });
  return created!;
}

export function addWorkComment(workItemId: string, authorId: string, body: string): void {
  updateDemoStore((store) => {
    store.officeWorkComments = [
      ...(store.officeWorkComments ?? []),
      { id: uid(), workItemId, authorId, body, createdAt: new Date().toISOString() },
    ];
    return store;
  });
}

export function setStaffCapacity(staffId: string, status: 'available' | 'busy' | 'out'): void {
  updateDemoStore((store) => {
    store.staff = store.staff.map((s) => (s.id === staffId ? { ...s, status } : s));
    return store;
  });
}

export function getOfficeAuditEvents(store: DemoStore) {
  return store.activity.filter((a) =>
    ['REQUEST_ASSIGNED', 'INSURANCE_POLICY_UPDATED', 'FACTORING_PROVIDER_CHANGED', 'PAYMENT_SUCCEEDED', 'REFUND_REQUESTED'].includes(a.kind),
  );
}
