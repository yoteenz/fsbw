import { readFirstEnsure } from '../sync/profile-cache';
import {
  INNOVATION_EXPEDITIONS_STORAGE_KEY,
  INNOVATION_EXPEDITIONS_VERSION,
  STUDIO_OS_INNOVATION_EXPEDITIONS_UPDATED,
} from './constants';
import { buildOrganizationInnovationExpeditionsProfile } from './expeditions-builder';
import { filterStopsForPath, getExpeditionById } from './expedition-catalog';
import { unlockExpeditionRewards } from './rewards-engine';
import type {
  ExpeditionPathLevel,
  InnovationExpeditionsStore,
  OrganizationInnovationExpeditionsProfile,
} from './types';

function emptyStore(): InnovationExpeditionsStore {
  return { version: INNOVATION_EXPEDITIONS_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_INNOVATION_EXPEDITIONS_UPDATED));
  }
}

export function readInnovationExpeditionsStore(): InnovationExpeditionsStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(INNOVATION_EXPEDITIONS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as InnovationExpeditionsStore;
    return { ...emptyStore(), ...parsed, version: INNOVATION_EXPEDITIONS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeInnovationExpeditionsStore(store: InnovationExpeditionsStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(INNOVATION_EXPEDITIONS_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationInnovationExpeditionsProfile(
  organizationId: string
): OrganizationInnovationExpeditionsProfile | null {
  return readInnovationExpeditionsStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function upsertProfile(
  profile: OrganizationInnovationExpeditionsProfile
): OrganizationInnovationExpeditionsProfile {
  const store = readInnovationExpeditionsStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeInnovationExpeditionsStore({ ...store, profiles: [...next, profile] });
  return profile;
}

export function syncInnovationExpeditionsFromSources(
  organizationId: string
): OrganizationInnovationExpeditionsProfile {
  return upsertProfile(buildOrganizationInnovationExpeditionsProfile(organizationId));
}

export function ensureOrganizationInnovationExpeditionsProfile(
  organizationId: string
): OrganizationInnovationExpeditionsProfile {
  return readFirstEnsure(
    organizationId,
    getOrganizationInnovationExpeditionsProfile,
    syncInnovationExpeditionsFromSources
  );
}

export function startExpedition(
  organizationId: string,
  expeditionId: string,
  pathLevel?: ExpeditionPathLevel
): OrganizationInnovationExpeditionsProfile | null {
  const profile = getOrganizationInnovationExpeditionsProfile(organizationId);
  if (!profile) return null;
  const expedition = getExpeditionById(profile.expeditions, expeditionId);
  if (!expedition) return null;
  const level = pathLevel ?? profile.activePathLevel;
  void filterStopsForPath(expedition, level);
  return upsertProfile({
    ...profile,
    activeExpeditionId: expeditionId,
    activeStopIndex: 0,
    activePathLevel: level,
    updatedAt: new Date().toISOString(),
  });
}

export function advanceExpeditionStop(
  organizationId: string
): OrganizationInnovationExpeditionsProfile | null {
  const profile = getOrganizationInnovationExpeditionsProfile(organizationId);
  if (!profile || !profile.activeExpeditionId) return null;
  const expedition = getExpeditionById(profile.expeditions, profile.activeExpeditionId);
  if (!expedition) return null;
  const stops = filterStopsForPath(expedition, profile.activePathLevel);
  const nextIndex = profile.activeStopIndex + 1;

  if (nextIndex >= stops.length) {
    const completedAt = new Date().toISOString();
    const newRewards = unlockExpeditionRewards(expedition, completedAt);
    const completedIds = profile.completedExpeditionIds.includes(expedition.id)
      ? profile.completedExpeditionIds
      : [...profile.completedExpeditionIds, expedition.id];
    return upsertProfile({
      ...profile,
      activeStopIndex: stops.length - 1,
      completedExpeditionIds: completedIds,
      unlockedRewards: [...profile.unlockedRewards, ...newRewards.filter((r) => !profile.unlockedRewards.some((u) => u.id === r.id))],
      expeditionScore: Math.min(99, profile.expeditionScore + 12),
      updatedAt: completedAt,
    });
  }

  return upsertProfile({
    ...profile,
    activeStopIndex: nextIndex,
    updatedAt: new Date().toISOString(),
  });
}

export function setExpeditionPathLevel(
  organizationId: string,
  pathLevel: ExpeditionPathLevel
): OrganizationInnovationExpeditionsProfile | null {
  const profile = getOrganizationInnovationExpeditionsProfile(organizationId);
  if (!profile) return null;
  return upsertProfile({
    ...profile,
    activePathLevel: pathLevel,
    activeStopIndex: 0,
    updatedAt: new Date().toISOString(),
  });
}
