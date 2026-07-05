import {
  ARRIVAL_EXPERIENCE_STORAGE_KEY,
  ARRIVAL_EXPERIENCE_VERSION,
  AE_ARRIVAL_PHILOSOPHY,
} from './constants';
import type { ArrivalExperienceStore, ArrivalExperienceWorkspaceId } from './types';

function emptyStore(): ArrivalExperienceStore {
  return {
    version: ARRIVAL_EXPERIENCE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: 'COMPANY',
    arrivalPhase: 'transition',
    dashboard: {
      summary: 'ARRIVAL EXPERIENCE V1.0 — welcome home · headquarters coming alive.',
      sequenceProgressPct: 0,
      executivesIntroduced: 0,
      tourStopsComplete: 0,
      arrivalComplete: false,
      headquartersLive: false,
    },
    arrivalPhilosophy: [...AE_ARRIVAL_PHILOSOPHY],
    arrivalSequence: [],
    chiefOfStaffWelcome: {
      headline: 'Welcome to your headquarters.',
      message: [],
      tone: 'Warm · confident · personal',
      closingNote: '',
    },
    executiveIntroductions: [],
    headquartersTour: [],
    organizationalReveal: [],
    environmentalStorytelling: [],
    firstExecutiveBriefing: {
      organizationalMaturity: '',
      currentPriorities: [],
      recommendedExecutives: [],
      recommendedArchitects: [],
      immediateOpportunities: [],
      organizationalStrengths: [],
      nextMilestone: '',
      todaysFocus: '',
    },
    arrivalMemory: {
      arrivalDate: '',
      organizationFirstDay: '',
      initialMaturity: '',
      firstExecutiveTeam: [],
      firstRoadmap: '',
      foundersFirstVision: '',
      preservedNote: '',
    },
    finalMessage: {
      headline: 'Welcome home.',
      message: '',
    },
    futureOpportunities: [],
  };
}

export function readArrivalExperienceStore(): ArrivalExperienceStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ARRIVAL_EXPERIENCE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ArrivalExperienceStore;
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

export function writeArrivalExperienceStore(store: ArrivalExperienceStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    ARRIVAL_EXPERIENCE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString() })
  );
}

export function bootstrapArrivalExperienceStore(seed?: Partial<ArrivalExperienceStore>): void {
  const existing = readArrivalExperienceStore();
  if (existing.arrivalSequence.length > 0 && !seed) return;
  writeArrivalExperienceStore({ ...emptyStore(), ...seed });
}

export function selectArrivalExperienceWorkspace(id: ArrivalExperienceWorkspaceId): void {
  const store = readArrivalExperienceStore();
  writeArrivalExperienceStore({ ...store, activeWorkspaceId: id });
}
