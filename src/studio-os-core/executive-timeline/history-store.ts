import { readFirstEnsure } from '../sync/profile-cache';
import {
  EXECUTIVE_TIMELINE_HISTORY_STORAGE_KEY,
  EXECUTIVE_TIMELINE_HISTORY_VERSION,
  STUDIO_OS_EXECUTIVE_TIMELINE_HISTORY_UPDATED,
} from './history-constants';
import { buildOrganizationExecutiveHistoryProfile } from './history-builder';
import type { ExecutiveTimelineHistoryStore, OrganizationExecutiveHistoryProfile } from './history-types';

function emptyStore(): ExecutiveTimelineHistoryStore {
  return { version: EXECUTIVE_TIMELINE_HISTORY_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_EXECUTIVE_TIMELINE_HISTORY_UPDATED));
  }
}

export function readExecutiveTimelineHistoryStore(): ExecutiveTimelineHistoryStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXECUTIVE_TIMELINE_HISTORY_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExecutiveTimelineHistoryStore;
    return { ...emptyStore(), ...parsed, version: EXECUTIVE_TIMELINE_HISTORY_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeExecutiveTimelineHistoryStore(store: ExecutiveTimelineHistoryStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(EXECUTIVE_TIMELINE_HISTORY_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationExecutiveHistoryProfile(
  organizationId: string
): OrganizationExecutiveHistoryProfile | null {
  return (
    readExecutiveTimelineHistoryStore().profiles.find((p) => p.organizationId === organizationId) ?? null
  );
}

function upsertProfile(profile: OrganizationExecutiveHistoryProfile): OrganizationExecutiveHistoryProfile {
  const store = readExecutiveTimelineHistoryStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeExecutiveTimelineHistoryStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncExecutiveTimelineHistoryFromSources(
  organizationId: string
): OrganizationExecutiveHistoryProfile {
  const profile = upsertProfile(buildOrganizationExecutiveHistoryProfile(organizationId));
  return profile;
}

export function ensureOrganizationExecutiveHistoryProfile(organizationId: string): OrganizationExecutiveHistoryProfile {
  return readFirstEnsure(organizationId, getOrganizationExecutiveHistoryProfile, syncExecutiveTimelineHistoryFromSources);
}

export function refreshOrganizationExecutiveHistoryProfile(
  organizationId: string
): OrganizationExecutiveHistoryProfile {
  return syncExecutiveTimelineHistoryFromSources(organizationId);
}
