const SAVED_KEY = 'loungeTvSavedPacks';
const PROGRESS_KEY = 'loungeTvWatchProgress';
const COMPLETED_KEY = 'loungeTvCompletedPacks';
const COMPLETED_AT_KEY = 'loungeTvCompletedAt';

export type LoungeTvWatchProgress = {
  packId: string;
  positionSec: number;
  updatedAt: number;
  /** 0–100 watch progress. */
  percent?: number;
  durationSec?: number;
  lastWatchedAt?: number;
  completedAt?: number;
};

function readJsonArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function writeJsonArray(key: string, ids: string[]): void {
  localStorage.setItem(key, JSON.stringify(ids));
}

export const LOUNGE_TV_LIBRARY_UPDATED_EVENT = 'loungeTvLibraryUpdated';

function dispatchLibraryUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LOUNGE_TV_LIBRARY_UPDATED_EVENT));
  }
}

export function getSavedPackIds(): string[] {
  return readJsonArray(SAVED_KEY);
}

export function isPackSaved(packId: string): boolean {
  return getSavedPackIds().includes(packId);
}

export function togglePackSaved(packId: string): boolean {
  const ids = getSavedPackIds();
  const next = ids.includes(packId) ? ids.filter((id) => id !== packId) : [...ids, packId];
  writeJsonArray(SAVED_KEY, next);
  dispatchLibraryUpdated();
  return next.includes(packId);
}

export function getWatchProgressMap(): Record<string, LoungeTvWatchProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LoungeTvWatchProgress>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getWatchProgress(packId: string): LoungeTvWatchProgress | undefined {
  return getWatchProgressMap()[packId];
}

export function getWatchProgressForPack(packId: string): LoungeTvWatchProgress | undefined {
  return getWatchProgress(packId);
}

export function getResumePositionSec(packId: string): number {
  const row = getWatchProgress(packId);
  if (!row || row.completedAt) return 0;
  if (row.percent != null && row.percent >= 95) return 0;
  return Math.max(0, row.positionSec ?? 0);
}

function computePercent(positionSec: number, durationSec: number | undefined): number | undefined {
  if (!durationSec || durationSec <= 0) return undefined;
  return Math.min(100, Math.round((positionSec / durationSec) * 100));
}

export function setWatchProgress(
  packId: string,
  positionSec: number,
  options?: { durationSec?: number; markComplete?: boolean }
): void {
  const map = getWatchProgressMap();
  const now = Date.now();
  const durationSec = options?.durationSec ?? map[packId]?.durationSec;
  const percent = computePercent(positionSec, durationSec);
  const completedAt =
    options?.markComplete || (percent != null && percent >= 95) ? now : map[packId]?.completedAt;

  map[packId] = {
    packId,
    positionSec,
    updatedAt: now,
    lastWatchedAt: now,
    durationSec,
    percent: completedAt ? 100 : percent,
    completedAt,
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  if (completedAt && !getCompletedPackIds().includes(packId)) {
    markPackCompleted(packId, completedAt);
  }
  dispatchLibraryUpdated();
}

export function getCompletedPackIds(): string[] {
  return readJsonArray(COMPLETED_KEY);
}

function readCompletedAtMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COMPLETED_AT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getCompletedAt(packId: string): number | undefined {
  return readCompletedAtMap()[packId];
}

export function markPackCompleted(packId: string, completedAt: number = Date.now()): void {
  const ids = getCompletedPackIds();
  if (!ids.includes(packId)) {
    writeJsonArray(COMPLETED_KEY, [...ids, packId]);
  }
  const atMap = readCompletedAtMap();
  atMap[packId] = completedAt;
  localStorage.setItem(COMPLETED_AT_KEY, JSON.stringify(atMap));
  const map = getWatchProgressMap();
  if (map[packId]) {
    map[packId] = { ...map[packId], percent: 100, completedAt, updatedAt: completedAt };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  }
  dispatchLibraryUpdated();
}

export function isPackCompleted(packId: string): boolean {
  return getCompletedPackIds().includes(packId);
}

export function isPackInContinueWatching(packId: string): boolean {
  if (isPackCompleted(packId)) return false;
  const row = getWatchProgress(packId);
  if (!row) return false;
  return (row.positionSec ?? 0) > 0 && (row.percent ?? 0) < 95;
}

export function getRecentlyUnlockedPackIds(
  unlocks: Array<{ contentId: string; unlockedAt: string }> | undefined,
  limit = 8
): string[] {
  if (!unlocks?.length) return [];
  return [...unlocks]
    .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))
    .slice(0, limit)
    .map((u) => u.contentId);
}
