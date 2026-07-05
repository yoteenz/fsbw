import { CHIEF_OF_STAFF_STORAGE_KEY, CHIEF_OF_STAFF_VERSION } from './constants';
import type {
  ApprovalStatus,
  ChiefOfStaffStore,
  ExecutiveInboxItem,
  FounderDecisionRecord,
} from './types';

function emptyStore(): ChiefOfStaffStore {
  return {
    version: CHIEF_OF_STAFF_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    softApprovalThresholdPct: 82,
    dashboard: {
      executiveSummary: '',
      todayPriorities: [],
      itemsRequiringApproval: 0,
      itemsAutoApproved: 0,
      itemsRejected: 0,
      itemsReturnedRevision: 0,
      pendingRisks: 0,
      pendingOpportunities: 0,
      overallConfidencePct: 0,
      estimatedFounderReviewMins: 0,
      attentionProtectionNote: '',
    },
    morningBriefing: {
      businessHealthSummary: '',
      departmentSummaries: [],
      majorOpportunities: [],
      majorRisks: [],
      importantApprovals: [],
      todayPriorities: [],
      executiveRecommendations: [],
      studioIntelligenceSummary: '',
      estimatedFounderWorkloadMins: 0,
    },
    executiveInbox: [],
    executiveLeadership: [],
    departments: [],
    founderDecisions: [],
    coachingNotes: [],
    leadershipTimeline: [],
    crossWorkspaceInsights: [],
    studioIntelligenceAdvisories: [],
    executiveMemory: {
      visualTaste: [],
      writingStyle: [],
      decisionPatterns: [],
      qualityExpectations: [],
      brandPhilosophy: [],
      communicationPreferences: [],
      longTermVision: [],
      sources: [],
    },
    delegationByDepartment: {},
  };
}

export function readChiefOfStaffStore(): ChiefOfStaffStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(CHIEF_OF_STAFF_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ChiefOfStaffStore;
    return { ...emptyStore(), ...parsed, version: CHIEF_OF_STAFF_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeChiefOfStaffStore(store: ChiefOfStaffStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CHIEF_OF_STAFF_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CHIEF_OF_STAFF_VERSION })
  );
}

export function mergeChiefOfStaffPatch(patch: Partial<ChiefOfStaffStore>): void {
  writeChiefOfStaffStore({ ...readChiefOfStaffStore(), ...patch });
}

export function bootstrapChiefOfStaffStore(seed?: Partial<ChiefOfStaffStore>): void {
  const existing = readChiefOfStaffStore();
  if (existing.executiveInbox.length > 0) return;
  writeChiefOfStaffStore({ ...emptyStore(), ...seed });
}

function refreshDashboardCounts(store: ChiefOfStaffStore): ChiefOfStaffStore['dashboard'] {
  const inbox = store.executiveInbox;
  const escalated = inbox.filter((i) => i.status === 'escalated');
  const auto = inbox.filter((i) => i.status === 'auto-approved' || i.status === 'soft-approved');
  const rejected = inbox.filter((i) => i.status === 'founder-rejected');
  const returned = inbox.filter((i) => i.status === 'returned-revision');
  const pending = escalated.length;

  const avgConf =
    inbox.length > 0 ? Math.round(inbox.reduce((s, i) => s + i.confidencePct, 0) / inbox.length) : 0;

  return {
    ...store.dashboard,
    itemsRequiringApproval: pending,
    itemsAutoApproved: auto.length,
    itemsRejected: rejected.length,
    itemsReturnedRevision: returned.length,
    overallConfidencePct: avgConf,
    estimatedFounderReviewMins: Math.max(1, pending * 2),
    attentionProtectionNote: `${inbox.length} items processed · ${auto.length} automatically approved · ${pending} require founder review · est. ${Math.max(1, pending * 2)} min`,
  };
}

export function recordFounderDecision(
  itemId: string,
  action: FounderDecisionRecord['action'],
  reason?: string
): void {
  const store = readChiefOfStaffStore();
  const item = store.executiveInbox.find((i) => i.id === itemId);
  if (!item) return;

  const newStatus: ApprovalStatus =
    action === 'approved' ? 'founder-approved' : action === 'rejected' ? 'founder-rejected' : 'returned-revision';

  const updatedInbox = store.executiveInbox.map((i) =>
    i.id === itemId ? { ...i, status: newStatus } : i
  );

  const decision: FounderDecisionRecord = {
    id: `dec-${Date.now()}`,
    timestamp: new Date().toISOString(),
    itemId,
    action,
    reason,
    patternsLearned:
      action === 'approved'
        ? [`Approved ${item.category} at ${item.confidencePct}% confidence`, item.reasoning]
        : [`Rejected ${item.category}: ${reason ?? 'founder override'}`],
  };

  const timelineEvent = {
    id: `tl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'decision' as const,
    title: `FOUNDER ${action.toUpperCase()} · ${item.title}`,
    detail: reason ?? item.recommendedAction,
  };

  const next = {
    ...store,
    executiveInbox: updatedInbox,
    founderDecisions: [decision, ...store.founderDecisions].slice(0, 50),
    leadershipTimeline: [timelineEvent, ...store.leadershipTimeline].slice(0, 30),
  };

  writeChiefOfStaffStore({ ...next, dashboard: refreshDashboardCounts(next) });
}

export function setDelegationMode(departmentId: string, mode: ChiefOfStaffStore['delegationByDepartment'][string]): void {
  const store = readChiefOfStaffStore();
  const departments = store.departments.map((d) =>
    d.id === departmentId ? { ...d, autonomy: mode } : d
  );
  writeChiefOfStaffStore({
    ...store,
    departments,
    delegationByDepartment: { ...store.delegationByDepartment, [departmentId]: mode },
  });
}

export function evaluateInboxItem(item: ExecutiveInboxItem, thresholdPct: number): ApprovalStatus {
  if (item.decisionLevel === 1) return 'auto-approved';
  if (item.decisionLevel === 3) return item.confidencePct >= thresholdPct ? 'escalated' : 'escalated';
  if (item.confidencePct >= thresholdPct) return 'soft-approved';
  if (item.confidencePct >= thresholdPct - 15) return 'returned-revision';
  return 'returned-revision';
}

export function refreshChiefOfStaffDashboard(): void {
  const store = readChiefOfStaffStore();
  writeChiefOfStaffStore({ ...store, dashboard: refreshDashboardCounts(store) });
}
