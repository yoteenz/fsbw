const SAVED_KEY = 'loungeTvSavedPacks';
const PROGRESS_KEY = 'loungeTvWatchProgress';
const COMPLETED_KEY = 'loungeTvCompletedPacks';

export type LoungeTvWatchProgress = {
  packId: string;
  positionSec: number;
  updatedAt: number;
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

export function setWatchProgress(packId: string, positionSec: number): void {
  const map = getWatchProgressMap();
  map[packId] = { packId, positionSec, updatedAt: Date.now() };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  dispatchLibraryUpdated();
}

export function getCompletedPackIds(): string[] {
  return readJsonArray(COMPLETED_KEY);
}

export function markPackCompleted(packId: string): void {
  const ids = getCompletedPackIds();
  if (!ids.includes(packId)) {
    writeJsonArray(COMPLETED_KEY, [...ids, packId]);
    dispatchLibraryUpdated();
  }
}

export function isPackCompleted(packId: string): boolean {
  return getCompletedPackIds().includes(packId);
}
