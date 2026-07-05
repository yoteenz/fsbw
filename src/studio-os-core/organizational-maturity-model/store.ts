import {
  ORGANIZATIONAL_MATURITY_MODEL_STORAGE_KEY,
  ORGANIZATIONAL_MATURITY_MODEL_VERSION,
  OMM_MATURITY_PHILOSOPHY,
} from './constants';
import type {
  OrganizationalMaturityModelStore,
  OrganizationalMaturityModelWorkspaceId,
} from './types';

function emptyStore(): OrganizationalMaturityModelStore {
  return {
    version: ORGANIZATIONAL_MATURITY_MODEL_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: 'COMPANY',
    dashboard: {
      summary: 'ORGANIZATIONAL MATURITY MODEL V1.0 — master progression system · readiness before advancement.',
      maturityScorePct: 0,
      confidencePct: 0,
      currentStageLabel: 'IDEA',
      nextMilestone: 'VALIDATION',
      readinessPct: 0,
      autonomyLevel: 0,
      campusStage: 'FOUNDER STUDIO',
    },
    maturityPhilosophy: [...OMM_MATURITY_PHILOSOPHY],
    organizationalStages: [],
    maturityDimensions: [],
    adaptiveExperience: [],
    executiveReadiness: [],
    autonomyProgression: [],
    campusProgression: [],
    organizationalAssessments: [],
    growthRoadmap: {
      currentStage: 'IDEA',
      nextStage: 'VALIDATION',
      readinessPct: 0,
      remainingRequirements: [],
      recommendedPriorities: [],
      dependencies: [],
      futureExecutives: [],
    },
    companyOnboarding: [],
    oiMaturityIntegration: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readOrganizationalMaturityModelStore(): OrganizationalMaturityModelStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_MATURITY_MODEL_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalMaturityModelStore;
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalMaturityModelStore(store: OrganizationalMaturityModelStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    ORGANIZATIONAL_MATURITY_MODEL_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString() })
  );
}

export function bootstrapOrganizationalMaturityModelStore(
  seed?: Partial<OrganizationalMaturityModelStore>
): void {
  const existing = readOrganizationalMaturityModelStore();
  if (existing.organizationalStages.length > 0 && !seed) return;
  writeOrganizationalMaturityModelStore({ ...emptyStore(), ...seed });
}

export function selectOrganizationalMaturityModelWorkspace(
  id: OrganizationalMaturityModelWorkspaceId
): void {
  const store = readOrganizationalMaturityModelStore();
  writeOrganizationalMaturityModelStore({ ...store, activeWorkspaceId: id });
}
