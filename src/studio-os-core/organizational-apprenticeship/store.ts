import {
  ORGANIZATIONAL_APPRENTICESHIP_STORAGE_KEY,
  ORGANIZATIONAL_APPRENTICESHIP_VERSION,
  OA_APPRENTICESHIP_PHILOSOPHY,
  OA_ORGANIZATIONAL_OATH,
} from './constants';
import type {
  OrganizationalApprenticeshipStore,
  OrganizationalApprenticeshipWorkspaceId,
} from './types';

function emptyStore(): OrganizationalApprenticeshipStore {
  return {
    version: ORGANIZATIONAL_APPRENTICESHIP_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: 'COMPANY',
    organizationalOath: [...OA_ORGANIZATIONAL_OATH],
    dashboard: {
      summary: 'ORGANIZATIONAL APPRENTICESHIP V1.0 — trust earned · stewardship through observation.',
      activeApprentices: 0,
      averageAlignmentPct: 0,
      averageLearningVelocity: '—',
      graduationReady: 0,
      organizationalConfidencePct: 0,
      futureLeadersIdentified: 0,
    },
    apprenticeshipPhilosophy: [...OA_APPRENTICESHIP_PHILOSOPHY],
    organizationalApprentices: [],
    founderCalibration: [],
    shadowingObservations: [],
    guidedLearning: [],
    practiceExercises: [],
    organizationalCalibration: [],
    trustProgressions: [],
    chiefOfStaffMentorship: [],
    learningLibrary: [],
    graduationRecommendations: [],
    founderDashboardHighlights: {
      recommendedMentorship: [],
      graduationReadiness: [],
      futureLeaders: [],
      recentImprovements: [],
    },
    futureOpportunities: [],
  };
}

export function readOrganizationalApprenticeshipStore(): OrganizationalApprenticeshipStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_APPRENTICESHIP_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalApprenticeshipStore;
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalApprenticeshipStore(store: OrganizationalApprenticeshipStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    ORGANIZATIONAL_APPRENTICESHIP_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString() })
  );
}

export function bootstrapOrganizationalApprenticeshipStore(
  seed?: Partial<OrganizationalApprenticeshipStore>
): void {
  const existing = readOrganizationalApprenticeshipStore();
  if (existing.organizationalApprentices.length > 0 && !seed) return;
  writeOrganizationalApprenticeshipStore({ ...emptyStore(), ...seed });
}

export function selectOrganizationalApprenticeshipWorkspace(
  id: OrganizationalApprenticeshipWorkspaceId
): void {
  const store = readOrganizationalApprenticeshipStore();
  writeOrganizationalApprenticeshipStore({ ...store, activeWorkspaceId: id });
}
