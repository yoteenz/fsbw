import type { LoungeEngagementContentKey } from './loungeEngagementTypes';
import { engagementItemKey } from './loungeEngagementTypes';

const STORAGE_KEY = 'learnBrowseLocalHelpful_v1';

function readSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((v): v is string => typeof v === 'string' && v.length > 0));
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore quota / private mode
  }
}

export function isLearnBrowseLocallyHelpful(key: LoungeEngagementContentKey): boolean {
  return readSet().has(engagementItemKey(key));
}

export function toggleLearnBrowseLocalHelpful(key: LoungeEngagementContentKey): boolean {
  const set = readSet();
  const id = engagementItemKey(key);
  const next = !set.has(id);
  if (next) set.add(id);
  else set.delete(id);
  writeSet(set);
  return next;
}

export function clearLearnBrowseLocalHelpful(key: LoungeEngagementContentKey): void {
  const set = readSet();
  const id = engagementItemKey(key);
  if (!set.has(id)) return;
  set.delete(id);
  writeSet(set);
}

export function resolveLearnBrowseViewerHelpful(
  key: LoungeEngagementContentKey,
  summary?: { viewerHelpful?: boolean },
): boolean {
  if (typeof summary?.viewerHelpful === 'boolean') return summary.viewerHelpful;
  return isLearnBrowseLocallyHelpful(key);
}
