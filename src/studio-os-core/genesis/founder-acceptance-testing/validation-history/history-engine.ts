import { mutateFounderAcceptanceTestingStore, readFounderAcceptanceTestingStore } from '../persistence';
import type { FatValidationHistoryEntry } from '../types';

/** Validation History — audit trail of validation events */
export function listValidationHistory(systemId?: string): FatValidationHistoryEntry[] {
  const history = readFounderAcceptanceTestingStore().history;
  const sorted = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  if (!systemId) return sorted;
  return sorted.filter((e) => e.systemId === systemId);
}

export function appendValidationHistoryEntry(
  entry: Omit<FatValidationHistoryEntry, 'entryId' | 'timestamp'> & { timestamp?: string }
): FatValidationHistoryEntry {
  const full: FatValidationHistoryEntry = {
    ...entry,
    entryId: `fat-history-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  };

  mutateFounderAcceptanceTestingStore((store) => ({
    ...store,
    history: [...store.history, full],
  }));

  return full;
}

export function recentValidationActivity(limit = 20): FatValidationHistoryEntry[] {
  return listValidationHistory().slice(0, limit);
}
