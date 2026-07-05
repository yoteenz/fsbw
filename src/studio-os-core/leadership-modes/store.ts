import {
  LEADERSHIP_MODES_STORAGE_KEY,
  LEADERSHIP_MODES_VERSION,
  LM_LEADERSHIP_PHILOSOPHY,
} from './constants';
import type { LeadershipModesStore, LeadershipModesWorkspaceId } from './types';

function emptyStore(): LeadershipModesStore {
  return {
    version: LEADERSHIP_MODES_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: 'COMPANY',
    activeModeId: 'founder',
    recommendedModeId: 'founder',
    dashboard: {
      summary: 'LEADERSHIP MODES V1.0 — how do you want to lead today?',
      activeModeLabel: 'FOUNDER MODE',
      recommendedModeLabel: 'FOUNDER MODE',
      detectionConfidencePct: 0,
      transitionsToday: 0,
      briefingReady: false,
      campusAmbiance: 'CREATIVE ENERGY',
    },
    leadershipPhilosophy: [...LM_LEADERSHIP_PHILOSOPHY],
    leadershipModes: [],
    modeDetections: [],
    adaptiveInterface: [],
    chiefOfStaffBriefings: [],
    executiveBehaviors: [],
    oiModeIntegration: [],
    campusTransformations: [],
    leadershipTransitions: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readLeadershipModesStore(): LeadershipModesStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(LEADERSHIP_MODES_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as LeadershipModesStore;
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

export function writeLeadershipModesStore(store: LeadershipModesStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    LEADERSHIP_MODES_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString() })
  );
}

export function bootstrapLeadershipModesStore(seed?: Partial<LeadershipModesStore>): void {
  const existing = readLeadershipModesStore();
  if (existing.leadershipModes.length > 0 && !seed) return;
  writeLeadershipModesStore({ ...emptyStore(), ...seed });
}

export function selectLeadershipModesWorkspace(id: LeadershipModesWorkspaceId): void {
  const store = readLeadershipModesStore();
  writeLeadershipModesStore({ ...store, activeWorkspaceId: id });
}

export function selectLeadershipMode(modeId: LeadershipModesStore['activeModeId']): void {
  const store = readLeadershipModesStore();
  writeLeadershipModesStore({ ...store, activeModeId: modeId });
}
