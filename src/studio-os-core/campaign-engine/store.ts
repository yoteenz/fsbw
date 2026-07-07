import { CAMPAIGN_HIERARCHY_CHAIN, CAMPAIGN_ENGINE_STORAGE_KEY, CAMPAIGN_ENGINE_VERSION } from './constants';
import {
  deriveApprovalStatus,
  derivePublishingStatus,
  migrateCampaignDeliverable,
  nextWorkflowStatus,
} from './deliverableUtils';
import type {
  CampaignDeliverable,
  CampaignEngineStore,
  CampaignWorkspaceId,
  CampaignWorkspaceTab,
} from './types';

const LEGACY_STORAGE_KEY = 'studioOsCampaignEngine_v1';

export type DeliverableWorkflowAction =
  | 'submit-review'
  | 'approve'
  | 'request-revision'
  | 'reject'
  | 'schedule'
  | 'publish'
  | 'learn';

function emptyStore(): CampaignEngineStore {
  return {
    version: CAMPAIGN_ENGINE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    dashboard: {
      summary: '',
      activeCampaigns: 0,
      deliverablesInProduction: 0,
      avgHealthPct: 0,
      totalBudgetAllocated: '$0',
      experimentsRunning: 0,
    },
    hierarchyLevels: CAMPAIGN_HIERARCHY_CHAIN,
    campaigns: [],
    deliverables: [],
    departmentCoordination: [],
    creatorRecommendations: [],
    experiments: [],
    analytics: {},
    healthScores: {},
    intelligence: {},
    simulations: {},
    retrospectives: [],
    calendar: [],
    inheritanceOptions: [],
    playbooks: [],
    builderStep: 0,
    selectedCampaignId: null,
    workspaceTab: 'overview',
    selectedDeliverableId: null,
    autoPublishEnabled: false,
  };
}

function migrateStore(parsed: Partial<CampaignEngineStore>): CampaignEngineStore {
  const base = { ...emptyStore(), ...parsed, version: CAMPAIGN_ENGINE_VERSION };
  return {
    ...base,
    deliverables: (parsed.deliverables ?? []).map((d) => migrateCampaignDeliverable(d)),
    workspaceTab: parsed.workspaceTab ?? 'overview',
    selectedDeliverableId: parsed.selectedDeliverableId ?? null,
    autoPublishEnabled: parsed.autoPublishEnabled ?? false,
  };
}

function readRawStore(): CampaignEngineStore | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    let raw = localStorage.getItem(CAMPAIGN_ENGINE_STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (!raw) return null;
    return migrateStore(JSON.parse(raw) as Partial<CampaignEngineStore>);
  } catch {
    return null;
  }
}

function refreshDashboard(store: CampaignEngineStore): CampaignEngineStore['dashboard'] {
  const active = store.campaigns.filter((c) => c.status === 'active' || c.status === 'planning');
  const inProduction = store.deliverables.filter(
    (d) => d.workflowStatus === 'draft' || d.workflowStatus === 'review'
  ).length;
  const healthVals = Object.values(store.healthScores);
  const avgHealth =
    healthVals.length > 0 ? Math.round(healthVals.reduce((s, h) => s + h.overallPct, 0) / healthVals.length) : 0;
  const experimentsRunning = store.experiments.filter((e) => e.status === 'running').length;

  return {
    ...store.dashboard,
    activeCampaigns: active.length,
    deliverablesInProduction: inProduction,
    avgHealthPct: avgHealth,
    experimentsRunning,
  };
}

export function readCampaignEngineStore(): CampaignEngineStore {
  const parsed = readRawStore();
  if (!parsed) return emptyStore();
  return { ...parsed, dashboard: refreshDashboard(parsed) };
}

export function writeCampaignEngineStore(store: CampaignEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    CAMPAIGN_ENGINE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: CAMPAIGN_ENGINE_VERSION })
  );
}

export function mergeCampaignEngineDeliverables(extra: CampaignDeliverable[]): void {
  const store = readCampaignEngineStore();
  const existingIds = new Set(store.deliverables.map((d) => d.id));
  const merged = [...store.deliverables];
  for (const del of extra) {
    if (!existingIds.has(del.id)) {
      merged.push(migrateCampaignDeliverable(del));
    }
  }
  writeCampaignEngineStore({
    ...store,
    deliverables: merged,
    dashboard: refreshDashboard({ ...store, deliverables: merged }),
  });
}

export function bootstrapCampaignEngineStore(seed?: Partial<CampaignEngineStore>): void {
  const existing = readRawStore();
  if (existing && existing.campaigns.length > 0) {
    if (seed?.deliverables?.length) {
      mergeCampaignEngineDeliverables(seed.deliverables.map((d) => migrateCampaignDeliverable(d)));
    }
    return;
  }
  const merged = migrateStore({ ...emptyStore(), ...seed });
  writeCampaignEngineStore({ ...merged, dashboard: refreshDashboard(merged) });
}

export function selectCampaignEngineWorkspace(id: CampaignWorkspaceId): void {
  const store = readCampaignEngineStore();
  const first = store.campaigns.find((c) => c.workspaceId === id);
  writeCampaignEngineStore({
    ...store,
    activeWorkspaceId: id,
    selectedCampaignId: first?.id ?? null,
    workspaceTab: 'overview',
    selectedDeliverableId: null,
  });
}

export function selectCampaignEngineCampaign(id: string | null): void {
  const store = readCampaignEngineStore();
  writeCampaignEngineStore({
    ...store,
    selectedCampaignId: id,
    workspaceTab: 'overview',
    selectedDeliverableId: null,
  });
}

export function selectCampaignEngineWorkspaceTab(tab: CampaignWorkspaceTab): void {
  const store = readCampaignEngineStore();
  writeCampaignEngineStore({ ...store, workspaceTab: tab });
}

export function selectCampaignEngineDeliverable(id: string | null): void {
  const store = readCampaignEngineStore();
  writeCampaignEngineStore({ ...store, selectedDeliverableId: id });
}

export function openCampaignDeliverablesTab(campaignId: string): void {
  const store = readCampaignEngineStore();
  writeCampaignEngineStore({
    ...store,
    selectedCampaignId: campaignId,
    workspaceTab: 'deliverables',
    selectedDeliverableId: null,
  });
}

export function setCampaignBuilderStep(step: number): void {
  const store = readCampaignEngineStore();
  writeCampaignEngineStore({ ...store, builderStep: Math.max(0, Math.min(11, step)) });
}

export function refreshCampaignEngineDashboard(): void {
  const store = readCampaignEngineStore();
  writeCampaignEngineStore({ ...store, dashboard: refreshDashboard(store) });
}

function patchDeliverable(
  store: CampaignEngineStore,
  deliverableId: string,
  patch: Partial<CampaignDeliverable>
): CampaignEngineStore {
  const now = new Date().toISOString();
  const deliverables = store.deliverables.map((d) =>
    d.id === deliverableId ? migrateCampaignDeliverable({ ...d, ...patch, updatedAt: now }) : d
  );
  return { ...store, deliverables, dashboard: refreshDashboard({ ...store, deliverables }) };
}

export function applyDeliverableWorkflowAction(
  deliverableId: string,
  action: DeliverableWorkflowAction,
  actor = 'Chief of Staff'
): void {
  const store = readCampaignEngineStore();
  const del = store.deliverables.find((d) => d.id === deliverableId);
  if (!del) return;

  if (action === 'publish' && !store.autoPublishEnabled && del.workflowStatus !== 'approved' && del.workflowStatus !== 'scheduled') {
    return;
  }

  const workflowStatus = nextWorkflowStatus(del.workflowStatus, action);
  const now = new Date().toISOString();
  const timeline = [...(del.approvalTimeline ?? [])];

  const actionLabels: Record<DeliverableWorkflowAction, string> = {
    'submit-review': 'Submitted for review',
    approve: 'Approved',
    'request-revision': 'Revision requested',
    reject: 'Rejected',
    schedule: 'Scheduled for publishing',
    publish: 'Published',
    learn: 'Moved to learning',
  };
  timeline.push({ at: now, actor, action: actionLabels[action] });

  let approvalStatus = deriveApprovalStatus(workflowStatus);
  if (action === 'request-revision') approvalStatus = 'revision-requested';
  if (action === 'reject') approvalStatus = 'rejected';
  if (action === 'approve') approvalStatus = 'approved';

  const publishingStatus = derivePublishingStatus(workflowStatus);
  const patch: Partial<CampaignDeliverable> = {
    workflowStatus,
    approvalStatus,
    publishingStatus,
    approvalTimeline: timeline,
  };

  if (action === 'schedule') {
    patch.scheduledAt = del.scheduledAt ?? now;
  }
  if (action === 'publish') {
    patch.publishedAt = now;
    patch.knowledgeAssetId = del.knowledgeAssetId ?? `ka-${deliverableId}`;
  }
  if (action === 'learn') {
    patch.learningMetrics = del.learningMetrics ?? {
      engagement: '8.1%',
      reach: '22K',
      saves: '340',
      clicks: '1,940',
      comments: '48',
      completion: '71%',
      platformPerformance: 'Strong on ndxbook + Instagram',
      topicPerformance: 'Authority topics outperforming',
      formatPerformance: 'Fact-forward pages leading',
    };
    patch.studioIntelligenceNotes = [
      ...(del.studioIntelligenceNotes ?? []),
      'Studio Intelligence™ logged performance signals for future campaign recommendations.',
    ];
  }

  writeCampaignEngineStore(patchDeliverable(store, deliverableId, patch));
}
