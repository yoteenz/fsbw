import { FOUNDERS_PROMISE_STORAGE_KEY, FOUNDERS_PROMISE_VERSION, PROMISE_PHILOSOPHY } from './constants';
import type { FoundersPromiseStore, FoundersPromiseWorkspaceId } from './types';

function emptyStore(): FoundersPromiseStore {
  return {
    version: FOUNDERS_PROMISE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      currentVersion: 1,
      totalVersions: 1,
      alignmentScorePct: 0,
      executivesAligned: 0,
      reflectionMomentsPending: 0,
      archiveEntries: 0,
      privacy: 'organization',
    },
    promisePhilosophy: [...PROMISE_PHILOSOPHY],
    reflectiveQuestions: [],
    currentPromise: { text: '', version: 1, lastRevised: '', format: 'text' },
    originalPromise: { text: '', date: '', preserved: false },
    promiseVersions: [],
    livingEvolution: [],
    organizationalAlignment: [],
    executiveAlignment: [],
    reflectionMoments: [],
    promiseArchive: [],
    legacyInheritance: [],
    campusInstallation: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readFoundersPromiseStore(): FoundersPromiseStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(FOUNDERS_PROMISE_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as FoundersPromiseStore;
    return { ...emptyStore(), ...parsed, version: FOUNDERS_PROMISE_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeFoundersPromiseStore(store: FoundersPromiseStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    FOUNDERS_PROMISE_STORAGE_KEY,
    JSON.stringify({ ...store, lastUpdatedAt: new Date().toISOString(), version: FOUNDERS_PROMISE_VERSION })
  );
}

export function bootstrapFoundersPromiseStore(seed?: Partial<FoundersPromiseStore>): void {
  const existing = readFoundersPromiseStore();
  if (existing.currentPromise.text.length > 0) return;
  writeFoundersPromiseStore({ ...emptyStore(), ...seed });
}

export function selectFoundersPromiseWorkspace(id: FoundersPromiseWorkspaceId): void {
  const store = readFoundersPromiseStore();
  writeFoundersPromiseStore({ ...store, activeWorkspaceId: id });
}
