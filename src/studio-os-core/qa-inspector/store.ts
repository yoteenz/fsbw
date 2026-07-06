import { QA_INSPECTOR_STORAGE_KEY, QA_INSPECTOR_VERSION, STUDIO_OS_QA_INSPECTOR_UPDATED } from './constants';
import { buildOrganizationQaInspectorProfile } from './engine-profile-builder';
import type { InspectorFindingStatus, OrganizationQaInspectorProfile, QaInspectorStore } from './types';

function emptyStore(): QaInspectorStore {
  return { version: QA_INSPECTOR_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_QA_INSPECTOR_UPDATED));
  }
}

export function readQaInspectorStore(): QaInspectorStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(QA_INSPECTOR_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as QaInspectorStore;
    return { ...emptyStore(), ...parsed, version: QA_INSPECTOR_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeQaInspectorStore(store: QaInspectorStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(QA_INSPECTOR_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationQaInspectorProfile(organizationId: string): OrganizationQaInspectorProfile | null {
  return readQaInspectorStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationQaInspectorProfile): OrganizationQaInspectorProfile {
  const store = readQaInspectorStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeQaInspectorStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild inspector findings and audit runs from QA Headquarters + platform sources */
export function syncQaInspectorFromSources(organizationId: string): OrganizationQaInspectorProfile {
  const profile = upsertProfile(buildOrganizationQaInspectorProfile(organizationId));
  void import('../qa-simulation-engine/store').then((m) => {
    m.syncQaSimulationEngineFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationQaInspectorProfile(organizationId: string): OrganizationQaInspectorProfile {
  return syncQaInspectorFromSources(organizationId);
}

export function updateFindingStatus(
  organizationId: string,
  findingId: string,
  status: InspectorFindingStatus
): OrganizationQaInspectorProfile | null {
  const existing = getOrganizationQaInspectorProfile(organizationId);
  if (!existing) return null;

  const findings = existing.findings.map((f) => (f.id === findingId ? { ...f, status } : f));
  return upsertProfile({
    ...existing,
    findings,
    openFindings: findings.filter((f) => f.status === 'open' || f.status === 'acknowledged').length,
    updatedAt: new Date().toISOString(),
  });
}

export function runFullInspectorAudit(organizationId: string): OrganizationQaInspectorProfile {
  return syncQaInspectorFromSources(organizationId);
}
