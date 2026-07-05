import {
  SCREENING_ROOM_PHILOSOPHY,
  SCREENING_ROOM_STORAGE_KEY,
  SCREENING_ROOM_VERSION,
} from './constants';
import type {
  ComparisonFieldId,
  ConciergeReview,
  ScreeningReviewAction,
  ScreeningRoomStore,
} from './types';

function emptyStore(): ScreeningRoomStore {
  return {
    version: SCREENING_ROOM_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    companyName: 'COMPANY',
    selectedProductionId: null,
    currentVersionId: null,
    compareMode: false,
    compareVersionIds: [],
    compareField: 'thumbnail',
    playerPlaying: false,
    dashboard: {
      summary: 'SCREENING ROOM — luxury review theater · experience before publication.',
      awaitingReview: 0,
      approvedToday: 0,
      experimentsQueued: 0,
      avgConfidencePct: 0,
    },
    philosophy: [...SCREENING_ROOM_PHILOSOPHY],
    productions: [],
    conciergeReviews: [],
  };
}

function refreshDashboard(store: ScreeningRoomStore): ScreeningRoomStore['dashboard'] {
  const allVersions = store.productions.flatMap((p) => p.versions);
  const avg =
    allVersions.length === 0
      ? 0
      : Math.round(allVersions.reduce((s, v) => s + v.confidencePct, 0) / allVersions.length);
  return {
    ...store.dashboard,
    awaitingReview: store.productions.length,
    avgConfidencePct: avg,
  };
}

export function readScreeningRoomStore(): ScreeningRoomStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(SCREENING_ROOM_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ScreeningRoomStore;
    const merged = { ...emptyStore(), ...parsed };
    return { ...merged, dashboard: refreshDashboard(merged) };
  } catch {
    return emptyStore();
  }
}

export function writeScreeningRoomStore(store: ScreeningRoomStore): void {
  if (typeof window === 'undefined') return;
  const next = { ...store, dashboard: refreshDashboard(store), lastUpdatedAt: new Date().toISOString() };
  localStorage.setItem(SCREENING_ROOM_STORAGE_KEY, JSON.stringify(next));
}

export function bootstrapScreeningRoomStore(seed?: Partial<ScreeningRoomStore>): void {
  const existing = readScreeningRoomStore();
  if (existing.productions.length > 0 && !seed) return;
  const productions = seed?.productions ?? [];
  const first = productions[0];
  const currentVer = first?.versions.find((v) => v.isCurrent)?.id ?? first?.versions[0]?.id ?? null;
  writeScreeningRoomStore({
    ...emptyStore(),
    ...seed,
    selectedProductionId: seed?.selectedProductionId ?? first?.id ?? null,
    currentVersionId: seed?.currentVersionId ?? currentVer,
    philosophy: seed?.philosophy ?? [...SCREENING_ROOM_PHILOSOPHY],
  });
}

export function selectScreeningProduction(productionId: string): void {
  const store = readScreeningRoomStore();
  const prod = store.productions.find((p) => p.id === productionId);
  const currentVer = prod?.versions.find((v) => v.isCurrent)?.id ?? prod?.versions[0]?.id ?? null;
  writeScreeningRoomStore({
    ...store,
    selectedProductionId: productionId,
    currentVersionId: currentVer,
    compareVersionIds: currentVer ? [currentVer] : [],
  });
}

export function selectScreeningVersion(versionId: string): void {
  const store = readScreeningRoomStore();
  writeScreeningRoomStore({ ...store, currentVersionId: versionId });
}

export function setScreeningCompareMode(enabled: boolean): void {
  const store = readScreeningRoomStore();
  const current = store.currentVersionId;
  writeScreeningRoomStore({
    ...store,
    compareMode: enabled,
    compareVersionIds: enabled && current ? [current] : store.compareVersionIds,
  });
}

export function toggleScreeningCompareVersion(versionId: string): void {
  const store = readScreeningRoomStore();
  const ids = store.compareVersionIds.includes(versionId)
    ? store.compareVersionIds.filter((id) => id !== versionId)
    : [...store.compareVersionIds, versionId].slice(0, 4);
  writeScreeningRoomStore({ ...store, compareVersionIds: ids, compareMode: ids.length > 1 });
}

export function setScreeningCompareField(field: ComparisonFieldId): void {
  const store = readScreeningRoomStore();
  writeScreeningRoomStore({ ...store, compareField: field });
}

export function setScreeningPlayerPlaying(playing: boolean): void {
  const store = readScreeningRoomStore();
  writeScreeningRoomStore({ ...store, playerPlaying: playing });
}

export function recordScreeningAction(action: ScreeningReviewAction, note: string): void {
  const store = readScreeningRoomStore();
  writeScreeningRoomStore({
    ...store,
    lastAction: { action, at: new Date().toISOString(), note },
    dashboard: {
      ...store.dashboard,
      approvedToday: action === 'approve' ? store.dashboard.approvedToday + 1 : store.dashboard.approvedToday,
      experimentsQueued: action === 'experiment' ? store.dashboard.experimentsQueued + 1 : store.dashboard.experimentsQueued,
    },
  });
}

export function updateConciergeReviews(reviews: ConciergeReview[]): void {
  const store = readScreeningRoomStore();
  writeScreeningRoomStore({ ...store, conciergeReviews: reviews });
}
