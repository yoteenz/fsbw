import {
  EXECUTIVE_APPRENTICESHIP_FOUNDER_CALIBRATION_STORAGE_KEY,
  EXECUTIVE_APPRENTICESHIP_FOUNDER_CALIBRATION_VERSION,
  EAF_APPRENTICESHIP_PHILOSOPHY,
} from './constants';
import type {
  ExecutiveApprenticeshipStore,
  ExecutiveApprenticeshipWorkspaceId,
} from './types';

function emptyStore(): ExecutiveApprenticeshipStore {
  return {
    version: EXECUTIVE_APPRENTICESHIP_FOUNDER_CALIBRATION_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: 'COMPANY',
    dashboard: {
      summary: 'EXECUTIVE APPRENTICESHIP & FOUNDER CALIBRATION V1.0 — trust earned · never assumed.',
      organizationalConfidencePct: 0,
      executivesInApprenticeship: 0,
      averageAlignmentPct: 0,
      averageLearningVelocity: '—',
      softApprovalsActive: 0,
    },
    apprenticeshipPhilosophy: [...EAF_APPRENTICESHIP_PHILOSOPHY],
    founderCalibration: [],
    shadowingObservations: [],
    learningConversations: [],
    calibrationMeasurements: [],
    practiceReviews: [],
    trustProgressions: [],
    softApprovalExamples: [],
    chiefOfStaffMentorship: [],
    learningLibrary: [],
    executiveGraduations: [],
    founderDashboardHighlights: {
      executiveStrengths: [],
      recommendedAuthorityChanges: [],
      recentCalibrationImprovements: [],
    },
    futureOpportunities: [],
  };
}

export function readExecutiveApprenticeshipStore(): ExecutiveApprenticeshipStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(EXECUTIVE_APPRENTICESHIP_FOUNDER_CALIBRATION_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ExecutiveApprenticeshipStore;
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

export function writeExecutiveApprenticeshipStore(store: ExecutiveApprenticeshipStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    EXECUTIVE_APPRENTICESHIP_FOUNDER_CALIBRATION_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString() })
  );
}

export function bootstrapExecutiveApprenticeshipStore(
  seed?: Partial<ExecutiveApprenticeshipStore>
): void {
  const existing = readExecutiveApprenticeshipStore();
  if (existing.founderCalibration.length > 0 && !seed) return;
  writeExecutiveApprenticeshipStore({ ...emptyStore(), ...seed });
}

export function selectExecutiveApprenticeshipWorkspace(
  id: ExecutiveApprenticeshipWorkspaceId
): void {
  const store = readExecutiveApprenticeshipStore();
  writeExecutiveApprenticeshipStore({ ...store, activeWorkspaceId: id });
}
