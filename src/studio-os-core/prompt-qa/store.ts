import {
  PROMPT_QA_STORAGE_KEY,
  PROMPT_QA_VERSION,
  STUDIO_OS_PROMPT_QA_UPDATED,
} from './constants';
import { buildOrganizationPromptQaProfile } from './engine-profile-builder';
import type { OrganizationPromptQaProfile, PromptQaStore } from './types';

function emptyStore(): PromptQaStore {
  return { version: PROMPT_QA_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PROMPT_QA_UPDATED));
  }
}

export function readPromptQaStore(): PromptQaStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PROMPT_QA_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as PromptQaStore;
    return { ...emptyStore(), ...parsed, version: PROMPT_QA_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writePromptQaStore(store: PromptQaStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PROMPT_QA_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationPromptQaProfile(organizationId: string): OrganizationPromptQaProfile | null {
  return readPromptQaStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationPromptQaProfile): OrganizationPromptQaProfile {
  const store = readPromptQaStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writePromptQaStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncPromptQaFromSources(organizationId: string): OrganizationPromptQaProfile {
  const existing = getOrganizationPromptQaProfile(organizationId);
  const built = buildOrganizationPromptQaProfile(organizationId);
  const profile = upsertProfile({
    ...built,
    selectedPromptId: existing?.selectedPromptId ?? built.selectedPromptId,
  });
  void import('../experience-qa/store').then((m) => {
    m.syncExperienceQaFromSources(organizationId);
  });
  return profile;
}

export function ensureOrganizationPromptQaProfile(organizationId: string): OrganizationPromptQaProfile {
  return syncPromptQaFromSources(organizationId);
}

export function refreshPromptQa(organizationId: string): OrganizationPromptQaProfile {
  return syncPromptQaFromSources(organizationId);
}

export function selectPromptAudit(organizationId: string, promptId: string): OrganizationPromptQaProfile {
  const profile = ensureOrganizationPromptQaProfile(organizationId);
  return upsertProfile({ ...profile, selectedPromptId: promptId, updatedAt: new Date().toISOString() });
}

export function getSelectedAuditReport(profile: OrganizationPromptQaProfile) {
  return profile.auditReports.find((r) => r.promptId === profile.selectedPromptId) ?? profile.auditReports[0] ?? null;
}

export function getPromptFindings(profile: OrganizationPromptQaProfile, promptId: string) {
  return profile.findings.filter((f) => f.promptId === promptId);
}

export function getPromptVersions(profile: OrganizationPromptQaProfile, promptId: string) {
  return profile.versionHistory.filter((v) => v.promptId === promptId);
}
