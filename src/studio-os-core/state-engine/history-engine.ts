import type { LifecycleState, StateHistoryRecord, StateObjectType } from './types';

export function buildStateHistoryRecords(organizationId: string): StateHistoryRecord[] {
  const suffix = organizationId.slice(0, 4).toUpperCase();
  const now = Date.now();
  return [
    {
      recordId: 'hist-001',
      objectType: 'projects',
      objectName: 'Q3 Marketing Campaign',
      previousState: 'review',
      currentState: 'approved',
      reason: 'Executive Council briefing complete',
      user: 'Chief Concierge',
      date: new Date(now - 7200000).toISOString(),
      approvalChain: 'Founder → Marketing Executive',
      comments: 'Approved for publish next week',
    },
    {
      recordId: 'hist-002',
      objectType: 'automation-workflows',
      objectName: 'Client Onboarding Workflow',
      previousState: 'active',
      currentState: 'failed',
      reason: 'Approval node timeout',
      user: 'System',
      date: new Date(now - 3600000).toISOString(),
      automationTrigger: 'workflow-execution-failed',
      comments: 'Retry scheduled — 3 failures today',
    },
    {
      recordId: 'hist-003',
      objectType: 'documents',
      objectName: `${suffix} Employee Handbook Section`,
      previousState: 'completed',
      currentState: 'archived',
      reason: 'Annual handbook refresh complete',
      user: 'Operations Concierge',
      date: new Date(now - 86400000).toISOString(),
      approvalChain: 'Operations → Founder',
      automationTrigger: 'legacy-vault-sync',
    },
    {
      recordId: 'hist-004',
      objectType: 'marketplace-listings',
      objectName: 'Fuel Tax Expert Profile',
      previousState: 'draft',
      currentState: 'review',
      reason: 'Submitted for marketplace verification',
      user: 'Marketing Concierge',
      date: new Date(now - 1800000).toISOString(),
      comments: 'Awaiting verified plugin tier review',
    },
    {
      recordId: 'hist-005',
      objectType: 'plugins',
      objectName: 'Marketing Dashboard Widget',
      previousState: 'active',
      currentState: 'paused',
      reason: 'Compatibility update pending',
      user: 'Admin',
      date: new Date(now - 5400000).toISOString(),
    },
  ];
}

export function computeHistoryCompletenessPct(): number {
  return 99;
}

export function countObjectsAwaitingApproval(records: StateHistoryRecord[]): number {
  return records.filter((r) => r.currentState === 'review' || r.currentState === 'waiting').length;
}

export function countPausedObjects(records: StateHistoryRecord[]): number {
  return records.filter((r) => r.currentState === 'paused').length;
}

export function countFailedToday(records: StateHistoryRecord[]): number {
  const today = new Date().toDateString();
  return records.filter(
    (r) => r.currentState === 'failed' && new Date(r.date).toDateString() === today
  ).length;
}

export function filterHistoryByState(
  records: StateHistoryRecord[],
  state: LifecycleState
): StateHistoryRecord[] {
  return records.filter((r) => r.currentState === state);
}

export function filterHistoryByObjectType(
  records: StateHistoryRecord[],
  objectType: StateObjectType
): StateHistoryRecord[] {
  return records.filter((r) => r.objectType === objectType);
}
