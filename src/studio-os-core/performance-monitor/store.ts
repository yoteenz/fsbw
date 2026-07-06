import {
  PERFORMANCE_MONITOR_STORAGE_KEY,
  PERFORMANCE_MONITOR_VERSION,
  STUDIO_OS_PERFORMANCE_MONITOR_UPDATED,
} from './constants';
import { buildOrganizationPerformanceMonitorProfile } from './engine-profile-builder';
import type { OrganizationPerformanceMonitorProfile, PerformanceMonitorStore } from './types';

function emptyStore(): PerformanceMonitorStore {
  return { version: PERFORMANCE_MONITOR_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PERFORMANCE_MONITOR_UPDATED));
  }
}

export function readPerformanceMonitorStore(): PerformanceMonitorStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PERFORMANCE_MONITOR_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PerformanceMonitorStore;
    return { ...emptyStore(), ...parsed, version: PERFORMANCE_MONITOR_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writePerformanceMonitorStore(store: PerformanceMonitorStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PERFORMANCE_MONITOR_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationPerformanceMonitorProfile(
  organizationId: string
): OrganizationPerformanceMonitorProfile | null {
  return readPerformanceMonitorStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationPerformanceMonitorProfile): OrganizationPerformanceMonitorProfile {
  const store = readPerformanceMonitorStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writePerformanceMonitorStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncPerformanceMonitorFromSources(
  organizationId: string
): OrganizationPerformanceMonitorProfile {
  const existing = getOrganizationPerformanceMonitorProfile(organizationId);
  const built = buildOrganizationPerformanceMonitorProfile(organizationId);
  return upsertProfile({
    ...built,
    selectedModuleId: existing?.selectedModuleId ?? built.selectedModuleId,
  });
}

export function ensureOrganizationPerformanceMonitorProfile(
  organizationId: string
): OrganizationPerformanceMonitorProfile {
  return syncPerformanceMonitorFromSources(organizationId);
}

export function refreshPerformanceMonitor(organizationId: string): OrganizationPerformanceMonitorProfile {
  return syncPerformanceMonitorFromSources(organizationId);
}

export function selectPerformanceModule(organizationId: string, moduleId: string): OrganizationPerformanceMonitorProfile {
  const profile = ensureOrganizationPerformanceMonitorProfile(organizationId);
  return upsertProfile({ ...profile, selectedModuleId: moduleId, updatedAt: new Date().toISOString() });
}

export function getSelectedModuleReport(profile: OrganizationPerformanceMonitorProfile) {
  return profile.moduleReports.find((r) => r.moduleId === profile.selectedModuleId) ?? profile.moduleReports[0] ?? null;
}

export function getModuleBottlenecks(profile: OrganizationPerformanceMonitorProfile, moduleId: string) {
  return profile.bottlenecks.filter((b) => b.moduleId === moduleId);
}
