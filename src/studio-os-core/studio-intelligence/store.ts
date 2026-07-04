import { STUDIO_INTELLIGENCE_STORAGE_KEY, STUDIO_INTELLIGENCE_VERSION } from './constants';
import { computeOverallHealth } from './confidenceEngine';
import type { IntelligenceDashboardSnapshot, StudioIntelligenceStore } from './types';

function defaultDashboard(): IntelligenceDashboardSnapshot {
  return {
    briefingReady: false,
    priorityQueueCount: 0,
    businessHealthScore: 0,
    opportunityCount: 0,
    riskAlertCount: 0,
    activeRecommendations: 0,
    learningHighlights: 0,
    institutionalUpdates: 0,
    executiveSummaries: 0,
    crossWorkspaceInsights: 0,
  };
}

function emptyStore(): StudioIntelligenceStore {
  return {
    briefings: [],
    workspaceSignals: [],
    opportunities: [],
    risks: [],
    executiveSynthesis: [],
    crossWorkspaceInsights: [],
    institutionalLearnings: [],
    recommendations: [],
    businessHealth: null,
    decisionJournal: [],
    learningRecords: [],
    confidenceBreakdowns: [],
    dashboard: defaultDashboard(),
    version: STUDIO_INTELLIGENCE_VERSION,
  };
}

export function readStudioIntelligenceStore(): StudioIntelligenceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STUDIO_INTELLIGENCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StudioIntelligenceStore;
    return { ...emptyStore(), ...parsed, version: STUDIO_INTELLIGENCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeStudioIntelligenceStore(store: StudioIntelligenceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STUDIO_INTELLIGENCE_STORAGE_KEY, JSON.stringify(store));
}

export function mergeStudioIntelligencePatch(patch: Partial<StudioIntelligenceStore>): void {
  const store = readStudioIntelligenceStore();
  writeStudioIntelligenceStore({ ...store, ...patch, version: STUDIO_INTELLIGENCE_VERSION });
}

export function getIntelligenceForWorkspace(workspaceId: string) {
  const store = readStudioIntelligenceStore();
  return {
    briefings: store.briefings.filter((b) => b.workspaceId === workspaceId),
    workspaceSignals: store.workspaceSignals.filter((s) => s.workspaceId === workspaceId),
    opportunities: store.opportunities.filter((o) => o.workspaceId === workspaceId),
    risks: store.risks.filter((r) => r.workspaceId === workspaceId),
    executiveSynthesis: store.executiveSynthesis.filter((e) => e.workspaceId === workspaceId),
    institutionalLearnings: store.institutionalLearnings.filter((l) => l.workspaceId === workspaceId),
    recommendations: store.recommendations.filter((r) => r.workspaceId === workspaceId),
    businessHealth: store.businessHealth?.workspaceId === workspaceId ? store.businessHealth : null,
    decisionJournal: store.decisionJournal.filter((d) => d.workspaceId === workspaceId),
    learningRecords: store.learningRecords.filter((l) => l.workspaceId === workspaceId),
    crossWorkspaceInsights: store.crossWorkspaceInsights,
    confidenceBreakdowns: store.confidenceBreakdowns,
    dashboard: store.dashboard,
  };
}

export function refreshIntelligenceDashboard(workspaceId: string): void {
  const store = readStudioIntelligenceStore();
  const opps = store.opportunities.filter((o) => o.workspaceId === workspaceId);
  const risks = store.risks.filter((r) => r.workspaceId === workspaceId);
  const recs = store.recommendations.filter((r) => r.workspaceId === workspaceId);
  const health = store.businessHealth?.workspaceId === workspaceId ? store.businessHealth : null;
  const healthScore = health ? computeOverallHealth(health.categoryScores) : 0;
  const briefings = store.briefings.filter((b) => b.workspaceId === workspaceId);
  const learnings = store.institutionalLearnings.filter((l) => l.workspaceId === workspaceId && l.approvedByFounder);
  const learningRecords = store.learningRecords.filter((l) => l.workspaceId === workspaceId);
  const execSynth = store.executiveSynthesis.filter((e) => e.workspaceId === workspaceId);

  const dashboard: IntelligenceDashboardSnapshot = {
    briefingReady: briefings.length > 0,
    priorityQueueCount: opps.length + risks.filter((r) => r.severity === 'high' || r.severity === 'critical').length,
    businessHealthScore: healthScore,
    opportunityCount: opps.length,
    riskAlertCount: risks.length,
    activeRecommendations: recs.length,
    learningHighlights: learningRecords.length,
    institutionalUpdates: learnings.length,
    executiveSummaries: execSynth.length,
    crossWorkspaceInsights: store.crossWorkspaceInsights.length,
  };

  writeStudioIntelligenceStore({ ...store, dashboard });
}

export function bootstrapStudioIntelligenceStore(): StudioIntelligenceStore {
  return readStudioIntelligenceStore();
}
