import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import { ORB_RECOMMENDATIONS_STORAGE_KEY, ORB_RECOMMENDATION_EVENT } from './constants';
import type { OrbBudgetBehavior, OrbFocusMode, OrbPersonalizationProfile } from './types';

type OrbPersonalizationStore = {
  version: string;
  profiles: Record<string, OrbPersonalizationProfile>;
};

const DEFAULT_PROFILE = (organizationId: string): OrbPersonalizationProfile => ({
  organizationId,
  focusMode: 'executive',
  preferredWorkHours: { start: 8, end: 18 },
  favoriteWorkspaces: ['Executive Atrium™', 'Creative Direction Studio™'],
  favoriteHeadquarters: ['Marketing Headquarters™'],
  mostVisitedRooms: {},
  mostUsedBlueprints: ['Story Table Blueprint™', 'Campaign Studio Blueprint™'],
  navigationHabits: [],
  budgetBehavior: 'balanced',
  creativePreferences: ['cinematic', 'luxury', 'discovery'],
  lastUpdatedAt: new Date().toISOString(),
  lastDailyBriefAt: null,
});

function readStore(): OrbPersonalizationStore {
  return readStudioOsJson<OrbPersonalizationStore>(ORB_RECOMMENDATIONS_STORAGE_KEY, () => ({
    version: '1',
    profiles: {},
  }));
}

function writeStore(store: OrbPersonalizationStore): void {
  writeStudioOsJson(ORB_RECOMMENDATIONS_STORAGE_KEY, store);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ORB_RECOMMENDATION_EVENT));
  }
}

export function readOrbPersonalization(organizationId: string): OrbPersonalizationProfile {
  const store = readStore();
  return store.profiles[organizationId] ?? DEFAULT_PROFILE(organizationId);
}

export function upsertOrbPersonalization(
  organizationId: string,
  patch: Partial<Omit<OrbPersonalizationProfile, 'organizationId'>>
): OrbPersonalizationProfile {
  const store = readStore();
  const current = store.profiles[organizationId] ?? DEFAULT_PROFILE(organizationId);
  const next: OrbPersonalizationProfile = {
    ...current,
    ...patch,
    organizationId,
    lastUpdatedAt: new Date().toISOString(),
  };
  store.profiles[organizationId] = next;
  writeStore(store);
  return next;
}

export function setOrbFocusMode(organizationId: string, focusMode: OrbFocusMode): OrbPersonalizationProfile {
  return upsertOrbPersonalization(organizationId, { focusMode });
}

export function recordOrbRoomVisit(organizationId: string, pathname: string, displayName?: string): void {
  const profile = readOrbPersonalization(organizationId);
  const key = displayName ?? pathname;
  const visits = { ...profile.mostVisitedRooms, [key]: (profile.mostVisitedRooms[key] ?? 0) + 1 };
  const habits = [...profile.navigationHabits, pathname].slice(-12);
  upsertOrbPersonalization(organizationId, { mostVisitedRooms: visits, navigationHabits: habits });
}

export function recordOrbBlueprintUse(organizationId: string, blueprintName: string): void {
  const profile = readOrbPersonalization(organizationId);
  const list = [blueprintName, ...profile.mostUsedBlueprints.filter((b) => b !== blueprintName)].slice(0, 8);
  upsertOrbPersonalization(organizationId, { mostUsedBlueprints: list });
}

export function setOrbBudgetBehavior(
  organizationId: string,
  budgetBehavior: OrbBudgetBehavior
): OrbPersonalizationProfile {
  return upsertOrbPersonalization(organizationId, { budgetBehavior });
}

export function markOrbDailyBriefSeen(organizationId: string): void {
  upsertOrbPersonalization(organizationId, { lastDailyBriefAt: new Date().toISOString() });
}

export function hasShownOrbDailyBriefThisSession(): boolean {
  if (typeof sessionStorage === 'undefined') return true;
  return sessionStorage.getItem('studioOrbDailyBriefSession_v1') === '1';
}

export function markOrbDailyBriefSessionShown(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('studioOrbDailyBriefSession_v1', '1');
  }
}
