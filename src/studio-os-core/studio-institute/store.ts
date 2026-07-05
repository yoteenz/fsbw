import {
  STUDIO_INSTITUTE_STORAGE_KEY,
  STUDIO_INSTITUTE_VERSION,
  SI_INSTITUTE_MOTTO,
  SI_INSTITUTE_PHILOSOPHY,
} from './constants';
import type { StudioInstituteStore, StudioInstituteWorkspaceId } from './types';

function emptyStore(): StudioInstituteStore {
  return {
    version: STUDIO_INSTITUTE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: 'COMPANY',
    instituteMotto: SI_INSTITUTE_MOTTO,
    dashboard: {
      summary: 'STUDIO INSTITUTE V1.0 — permanent learning institution · organizational wisdom compounding.',
      activeLearners: 0,
      schoolsActive: 0,
      facultyMembers: 0,
      certificationsEarned: 0,
      knowledgeContributions: 0,
    },
    institutePhilosophy: [...SI_INSTITUTE_PHILOSOPHY],
    learningCommunities: [],
    schoolsOfExcellence: [],
    executiveFaculty: [],
    organizationFirstLessons: [],
    adaptiveLearningPaths: [],
    immersiveLearning: [],
    organizationalCertifications: [],
    knowledgeCompounding: [],
    instituteCampus: [],
    dailyLearning: [],
    ndxbookIntegration: [],
    futureOpportunities: [],
  };
}

export function readStudioInstituteStore(): StudioInstituteStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(STUDIO_INSTITUTE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as StudioInstituteStore;
    return { ...emptyStore(), ...parsed };
  } catch {
    return emptyStore();
  }
}

export function writeStudioInstituteStore(store: StudioInstituteStore): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    STUDIO_INSTITUTE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString() })
  );
}

export function bootstrapStudioInstituteStore(seed?: Partial<StudioInstituteStore>): void {
  const existing = readStudioInstituteStore();
  if (existing.schoolsOfExcellence.length > 0 && !seed) return;
  writeStudioInstituteStore({ ...emptyStore(), ...seed });
}

export function selectStudioInstituteWorkspace(id: StudioInstituteWorkspaceId): void {
  const store = readStudioInstituteStore();
  writeStudioInstituteStore({ ...store, activeWorkspaceId: id });
}
