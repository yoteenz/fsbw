import {
  SELF_HEALING_ENGINE_STORAGE_KEY,
  SELF_HEALING_ENGINE_VERSION,
  STUDIO_OS_SELF_HEALING_ENGINE_UPDATED,
} from './constants';
import { buildOrganizationSelfHealingEngineProfile } from './engine-profile-builder';
import { buildRepairFromApproval } from './repair-engine';
import type {
  HealingMode,
  HealingThresholds,
  OrganizationSelfHealingEngineProfile,
  SelfHealingEngineStore,
} from './types';

function emptyStore(): SelfHealingEngineStore {
  return { version: SELF_HEALING_ENGINE_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_SELF_HEALING_ENGINE_UPDATED));
  }
}

export function readSelfHealingEngineStore(): SelfHealingEngineStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(SELF_HEALING_ENGINE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as SelfHealingEngineStore;
    return { ...emptyStore(), ...parsed, version: SELF_HEALING_ENGINE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeSelfHealingEngineStore(store: SelfHealingEngineStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SELF_HEALING_ENGINE_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationSelfHealingEngineProfile(
  organizationId: string
): OrganizationSelfHealingEngineProfile | null {
  return readSelfHealingEngineStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationSelfHealingEngineProfile): OrganizationSelfHealingEngineProfile {
  const store = readSelfHealingEngineStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeSelfHealingEngineStore({ ...store, profiles: [...next, profile] });
  return profile;
}

function mergeSettings(
  built: OrganizationSelfHealingEngineProfile,
  existing: OrganizationSelfHealingEngineProfile | null
): OrganizationSelfHealingEngineProfile {
  if (!existing) return built;

  const dismissed = new Set(
    existing.issues.filter((i) => i.status === 'dismissed').map((i) => i.id)
  );
  const repairedIds = new Set(existing.repairs.map((r) => r.issueId));

  return {
    ...built,
    activeHealingMode: existing.activeHealingMode,
    healingThresholds: existing.healingThresholds,
    issues: built.issues.map((i) => {
      if (dismissed.has(i.id)) return { ...i, status: 'dismissed' as const };
      if (repairedIds.has(i.id)) return { ...i, status: 'repaired' as const };
      return i;
    }),
    repairs: existing.repairs,
    auditLog: [...built.auditLog, ...existing.auditLog.filter((e) => e.eventType === 'approved' || e.eventType === 'rolled-back')],
  };
}

export function syncSelfHealingEngineFromSources(organizationId: string): OrganizationSelfHealingEngineProfile {
  const existing = getOrganizationSelfHealingEngineProfile(organizationId);
  const built = mergeSettings(
    buildOrganizationSelfHealingEngineProfile(organizationId, {
      healingMode: existing?.activeHealingMode,
      thresholds: existing?.healingThresholds,
    }),
    existing
  );
  const profile = upsertProfile(built);
  void import('../decision-audit/store').then((m) => {
    m.syncDecisionAuditFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationSelfHealingEngineProfile(
  organizationId: string
): OrganizationSelfHealingEngineProfile {
  return syncSelfHealingEngineFromSources(organizationId);
}

export function refreshSelfHealingEngine(organizationId: string): OrganizationSelfHealingEngineProfile {
  return syncSelfHealingEngineFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationSelfHealingEngineProfile) => OrganizationSelfHealingEngineProfile
): OrganizationSelfHealingEngineProfile {
  const profile = ensureOrganizationSelfHealingEngineProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function setHealingMode(organizationId: string, mode: HealingMode): OrganizationSelfHealingEngineProfile {
  return updateHealingMode(organizationId, mode);
}

export function updateHealingMode(organizationId: string, mode: HealingMode): OrganizationSelfHealingEngineProfile {
  return withProfile(organizationId, (p) => {
    const rebuilt = buildOrganizationSelfHealingEngineProfile(organizationId, {
      healingMode: mode,
      thresholds: p.healingThresholds,
    });
    return { ...rebuilt, activeHealingMode: mode };
  });
}

export function updateHealingThresholds(
  organizationId: string,
  thresholds: Partial<HealingThresholds>
): OrganizationSelfHealingEngineProfile {
  return withProfile(organizationId, (p) => ({
    ...p,
    healingThresholds: { ...p.healingThresholds, ...thresholds },
  }));
}

export function approveRepair(organizationId: string, issueId: string): OrganizationSelfHealingEngineProfile {
  return withProfile(organizationId, (p) => {
    const issue = p.issues.find((i) => i.id === issueId);
    if (!issue) return p;
    const now = new Date().toISOString();
    const repair = buildRepairFromApproval(issue, p.activeHealingMode, now);
    const issues = p.issues.map((i) => (i.id === issueId ? { ...i, status: 'repaired' as const } : i));
    return {
      ...p,
      issues,
      repairs: [...p.repairs, repair],
      pendingApprovals: issues.filter((i) => i.status === 'pending-approval').length,
      autoRepairsToday: p.autoRepairsToday + 1,
      auditLog: [
        {
          id: `audit-approved-${issueId}-${Date.now()}`,
          timestamp: now,
          eventType: 'approved' as const,
          issueId,
          title: `Approved: ${issue.title}`,
          summary: repair.repairPerformed.slice(0, 100),
          confidencePct: repair.confidencePct,
          systemsAffected: repair.systemsAffected,
          rollbackAvailable: true,
        },
        ...p.auditLog,
      ],
    };
  });
}

export function dismissIssue(organizationId: string, issueId: string): OrganizationSelfHealingEngineProfile {
  return withProfile(organizationId, (p) => {
    const issues = p.issues.map((i) => (i.id === issueId ? { ...i, status: 'dismissed' as const } : i));
    return {
      ...p,
      issues,
      pendingApprovals: issues.filter((i) => i.status === 'pending-approval').length,
    };
  });
}

export function rollbackRepair(organizationId: string, repairId: string): OrganizationSelfHealingEngineProfile {
  return withProfile(organizationId, (p) => {
    const repair = p.repairs.find((r) => r.id === repairId);
    if (!repair) return p;
    const now = new Date().toISOString();
    const issues = p.issues.map((i) =>
      i.id === repair.issueId ? { ...i, status: 'detected' as const } : i
    );
    return {
      ...p,
      issues,
      repairs: p.repairs.filter((r) => r.id !== repairId),
      auditLog: [
        {
          id: `audit-rollback-${repairId}`,
          timestamp: now,
          eventType: 'rolled-back' as const,
          issueId: repair.issueId,
          title: `Rollback: ${repair.issueDetected.slice(0, 40)}…`,
          summary: repair.rollbackOption,
          confidencePct: repair.confidencePct,
          systemsAffected: repair.systemsAffected,
          rollbackAvailable: false,
        },
        ...p.auditLog,
      ],
    };
  });
}
