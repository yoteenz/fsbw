import {
  ORGANIZATIONAL_GUARDIAN_STORAGE_KEY,
  ORGANIZATIONAL_GUARDIAN_VERSION,
  STUDIO_OS_ORGANIZATIONAL_GUARDIAN_UPDATED,
} from './constants';
import { buildOrganizationGuardianProfile } from './engine-profile-builder';
import type { GuardianAlertStatus, OrganizationGuardianProfile, OrganizationalGuardianStore } from './types';

function emptyStore(): OrganizationalGuardianStore {
  return { version: ORGANIZATIONAL_GUARDIAN_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_ORGANIZATIONAL_GUARDIAN_UPDATED));
  }
}

export function readOrganizationalGuardianStore(): OrganizationalGuardianStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_GUARDIAN_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalGuardianStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_GUARDIAN_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalGuardianStore(store: OrganizationalGuardianStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ORGANIZATIONAL_GUARDIAN_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationGuardianProfile(organizationId: string): OrganizationGuardianProfile | null {
  return readOrganizationalGuardianStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationGuardianProfile): OrganizationGuardianProfile {
  const store = readOrganizationalGuardianStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeOrganizationalGuardianStore({ ...store, profiles: [...next, profile] });
  return profile;
}

function mergeAlertStatuses(
  built: OrganizationGuardianProfile,
  existing: OrganizationGuardianProfile | null
): OrganizationGuardianProfile {
  if (!existing) return built;
  const statusMap = new Map(existing.alerts.map((a) => [a.id, a.status]));
  const alerts = built.alerts.map((a) => ({
    ...a,
    status: statusMap.get(a.id) ?? a.status,
  }));
  return {
    ...built,
    alerts,
    activeAlerts: alerts.filter((a) => a.status === 'active' || a.status === 'escalated').length,
    urgentAlerts: alerts.filter(
      (a) => (a.status === 'active' || a.status === 'escalated') && (a.severity === 'urgent' || a.severity === 'critical')
    ).length,
  };
}

export function syncOrganizationalGuardianFromSources(organizationId: string): OrganizationGuardianProfile {
  const existing = getOrganizationGuardianProfile(organizationId);
  const built = mergeAlertStatuses(buildOrganizationGuardianProfile(organizationId), existing);
  const profile = upsertProfile({
    ...built,
    selectedAlertId: existing?.selectedAlertId ?? built.selectedAlertId,
  });
  void import('../design-compliance-engine/store').then((m) => {
    m.syncDesignComplianceEngineFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationGuardianProfile(organizationId: string): OrganizationGuardianProfile {
  return syncOrganizationalGuardianFromSources(organizationId);
}

export function refreshOrganizationalGuardian(organizationId: string): OrganizationGuardianProfile {
  return syncOrganizationalGuardianFromSources(organizationId);
}

function withProfile(
  organizationId: string,
  update: (p: OrganizationGuardianProfile) => OrganizationGuardianProfile
): OrganizationGuardianProfile {
  const profile = ensureOrganizationGuardianProfile(organizationId);
  return upsertProfile(update({ ...profile, updatedAt: new Date().toISOString() }));
}

export function selectGuardianAlert(organizationId: string, alertId: string): OrganizationGuardianProfile {
  return withProfile(organizationId, (p) => ({ ...p, selectedAlertId: alertId }));
}

export function setGuardianAlertStatus(
  organizationId: string,
  alertId: string,
  status: GuardianAlertStatus
): OrganizationGuardianProfile {
  return withProfile(organizationId, (p) => {
    const alerts = p.alerts.map((a) => (a.id === alertId ? { ...a, status } : a));
    return {
      ...p,
      alerts,
      activeAlerts: alerts.filter((a) => a.status === 'active' || a.status === 'escalated').length,
      urgentAlerts: alerts.filter(
        (a) => (a.status === 'active' || a.status === 'escalated') && (a.severity === 'urgent' || a.severity === 'critical')
      ).length,
    };
  });
}

export function acknowledgeGuardianAlert(organizationId: string, alertId: string): OrganizationGuardianProfile {
  return setGuardianAlertStatus(organizationId, alertId, 'acknowledged');
}

export function escalateGuardianAlert(organizationId: string, alertId: string): OrganizationGuardianProfile {
  return setGuardianAlertStatus(organizationId, alertId, 'escalated');
}

export function dismissGuardianAlert(organizationId: string, alertId: string): OrganizationGuardianProfile {
  return setGuardianAlertStatus(organizationId, alertId, 'dismissed');
}

export function getSelectedAlert(profile: OrganizationGuardianProfile) {
  return profile.alerts.find((a) => a.id === profile.selectedAlertId) ?? profile.alerts[0] ?? null;
}
