import { GOVERNANCE_STORAGE_KEY, GOVERNANCE_VERSION } from './constants';
import { averagePlatformTrust } from './trustEngine';
import type { GovernanceDashboardSnapshot, GovernanceStore } from './types';

function defaultEcosystemHealth(): GovernanceStore['ecosystemHealth'] {
  return {
    creatorSuccessPct: 0,
    businessSuccessPct: 0,
    marketplaceLiquidity: 0,
    customerSatisfaction: 0,
    retentionPct: 0,
    networkGrowthPct: 0,
    qualityIndex: 0,
    trustIndex: 0,
    collaborationIndex: 0,
    industryDiversity: 0,
    overallHealthScore: 0,
  };
}

function defaultDashboard(): GovernanceDashboardSnapshot {
  return {
    ecosystemHealthScore: 0,
    platformTrustScore: 0,
    verificationQueue: 0,
    moderationQueue: 0,
    qualityReviewQueue: 0,
    activeCertifications: 0,
    policyViolations: 0,
    openAppeals: 0,
    securityAlerts: 0,
    fraudFlags: 0,
    complianceScore: 0,
    platformHealthScore: 0,
    aiGovernanceRecords: 0,
    auditEventsToday: 0,
  };
}

function emptyStore(): GovernanceStore {
  return {
    trustScores: [],
    verificationRequests: [],
    qualityReviews: [],
    certifications: [],
    moderationCases: [],
    policies: [],
    appeals: [],
    fraudAlerts: [],
    reputations: [],
    ecosystemHealth: defaultEcosystemHealth(),
    aiGovernance: [],
    auditEvents: [],
    enterpriseRules: [],
    dashboard: defaultDashboard(),
    version: GOVERNANCE_VERSION,
  };
}

export function readGovernanceStore(): GovernanceStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(GOVERNANCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as GovernanceStore;
    return { ...emptyStore(), ...parsed, version: GOVERNANCE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeGovernanceStore(store: GovernanceStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(GOVERNANCE_STORAGE_KEY, JSON.stringify(store));
}

export function mergeGovernancePatch(patch: Partial<GovernanceStore>): void {
  const store = readGovernanceStore();
  writeGovernanceStore({ ...store, ...patch, version: GOVERNANCE_VERSION });
}

export function getGovernanceForWorkspace(workspaceId: string) {
  const store = readGovernanceStore();
  return {
    trustScores: store.trustScores.filter((t) => t.workspaceId === workspaceId),
    verificationRequests: store.verificationRequests.filter((v) => v.workspaceId === workspaceId),
    qualityReviews: store.qualityReviews.filter((q) => q.workspaceId === workspaceId),
    certifications: store.certifications.filter((c) => c.workspaceId === workspaceId),
    moderationCases: store.moderationCases.filter((m) => m.workspaceId === workspaceId),
    appeals: store.appeals.filter((a) => a.workspaceId === workspaceId),
    fraudAlerts: store.fraudAlerts.filter((f) => f.workspaceId === workspaceId),
    reputations: store.reputations.filter((r) => r.workspaceId === workspaceId),
    aiGovernance: store.aiGovernance.filter((a) => a.workspaceId === workspaceId),
    auditEvents: store.auditEvents.filter((a) => a.workspaceId === workspaceId),
    enterpriseRules: store.enterpriseRules.filter((e) => e.workspaceId === workspaceId),
    ecosystemHealth: store.ecosystemHealth,
    policies: store.policies,
    dashboard: store.dashboard,
  };
}

export function refreshGovernanceDashboard(workspaceId: string): void {
  const store = readGovernanceStore();
  const wsTrust = store.trustScores.filter((t) => t.workspaceId === workspaceId);
  const pendingVerification = store.verificationRequests.filter(
    (v) => v.workspaceId === workspaceId && v.status === 'pending'
  ).length;
  const openModeration = store.moderationCases.filter(
    (m) => m.workspaceId === workspaceId && m.status === 'open'
  ).length;
  const pendingQuality = store.qualityReviews.filter(
    (q) => q.workspaceId === workspaceId && q.documentation === 'pending'
  ).length;
  const activeCerts = store.certifications.filter(
    (c) => c.workspaceId === workspaceId && c.status === 'active'
  ).length;
  const violations = store.moderationCases.filter(
    (m) => m.workspaceId === workspaceId && m.status !== 'restored' && m.status !== 'open'
  ).length;
  const openAppeals = store.appeals.filter(
    (a) => a.workspaceId === workspaceId && (a.status === 'submitted' || a.status === 'under-review')
  ).length;
  const fraudFlags = store.fraudAlerts.filter(
    (f) => f.workspaceId === workspaceId && f.status !== 'dismissed'
  ).length;
  const aiRecords = store.aiGovernance.filter((a) => a.workspaceId === workspaceId).length;
  const today = new Date().toISOString().slice(0, 10);
  const auditToday = store.auditEvents.filter(
    (a) => a.workspaceId === workspaceId && a.timestamp.startsWith(today)
  ).length;

  const dashboard: GovernanceDashboardSnapshot = {
    ecosystemHealthScore: store.ecosystemHealth.overallHealthScore,
    platformTrustScore: averagePlatformTrust(wsTrust),
    verificationQueue: pendingVerification,
    moderationQueue: openModeration,
    qualityReviewQueue: pendingQuality,
    activeCertifications: activeCerts,
    policyViolations: violations,
    openAppeals,
    securityAlerts: fraudFlags,
    fraudFlags,
    complianceScore: store.ecosystemHealth.trustIndex,
    platformHealthScore: Math.round(
      (store.ecosystemHealth.overallHealthScore + averagePlatformTrust(wsTrust)) / 2
    ),
    aiGovernanceRecords: aiRecords,
    auditEventsToday: auditToday,
  };

  writeGovernanceStore({ ...store, dashboard });
}

export function bootstrapGovernanceStore(): GovernanceStore {
  return readGovernanceStore();
}
