import { AI_RED_TEAM_STORAGE_KEY, AI_RED_TEAM_VERSION, STUDIO_OS_AI_RED_TEAM_UPDATED } from './constants';
import { buildOrganizationAiRedTeamProfile } from './engine-profile-builder';
import type { OrganizationAiRedTeamProfile, AiRedTeamStore, RedTeamFindingStatus } from './types';

function emptyStore(): AiRedTeamStore {
  return { version: AI_RED_TEAM_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_AI_RED_TEAM_UPDATED));
  }
}

export function readAiRedTeamStore(): AiRedTeamStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(AI_RED_TEAM_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as AiRedTeamStore;
    return { ...emptyStore(), ...parsed, version: AI_RED_TEAM_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeAiRedTeamStore(store: AiRedTeamStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(AI_RED_TEAM_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationAiRedTeamProfile(organizationId: string): OrganizationAiRedTeamProfile | null {
  return readAiRedTeamStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(profile: OrganizationAiRedTeamProfile): OrganizationAiRedTeamProfile {
  const store = readAiRedTeamStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeAiRedTeamStore({ ...store, profiles: [...next, profile] });
  return profile;
}

/** Rebuild red team findings and challenges from QA layer + platform sources */
export function syncAiRedTeamFromSources(organizationId: string): OrganizationAiRedTeamProfile {
  return upsertProfile(buildOrganizationAiRedTeamProfile(organizationId));
}

export function ensureOrganizationAiRedTeamProfile(organizationId: string): OrganizationAiRedTeamProfile {
  return syncAiRedTeamFromSources(organizationId);
}

export function updateRedTeamFindingStatus(
  organizationId: string,
  findingId: string,
  status: RedTeamFindingStatus
): OrganizationAiRedTeamProfile | null {
  const existing = getOrganizationAiRedTeamProfile(organizationId);
  if (!existing) return null;

  const findings = existing.findings.map((f) => (f.id === findingId ? { ...f, status } : f));
  return upsertProfile({
    ...existing,
    findings,
    openFindings: findings.filter((f) => f.status === 'open' || f.status === 'acknowledged').length,
    updatedAt: new Date().toISOString(),
  });
}

export function runRedTeamChallenge(organizationId: string, _query: string): OrganizationAiRedTeamProfile {
  return syncAiRedTeamFromSources(organizationId);
}

export function runFullRedTeamStressTest(organizationId: string): OrganizationAiRedTeamProfile {
  return syncAiRedTeamFromSources(organizationId);
}
