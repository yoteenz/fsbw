import { useCallback, useMemo, useState } from 'react';
import {
  LEGACY_FOUNDER_JOURNAL_DEFAULT,
  LEGACY_FOUNDER_PREDICTIONS_DEFAULT,
  LEGACY_LETTERS_DEFAULT,
  searchLegacyIndex,
  type FounderJournalEntry,
  type FounderPrediction,
  type FounderPredictionStatus,
  type LegacyLetter,
} from '../utils/adminStudioLegacySystemDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type LegacyStore = {
  journal?: FounderJournalEntry[];
  predictions?: Record<string, FounderPredictionStatus>;
  journalNotes?: Record<string, string>;
};

function readStore(): LegacyStore {
  return readStudioJson<LegacyStore>(ADMIN_STUDIO_STORAGE_KEYS.legacySystem) ?? {};
}

function writeStore(store: LegacyStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.legacySystem, store);
}

export function getFounderJournal(): FounderJournalEntry[] {
  const store = readStore();
  if (!store.journalNotes) return LEGACY_FOUNDER_JOURNAL_DEFAULT;
  return LEGACY_FOUNDER_JOURNAL_DEFAULT.map((e) => ({
    ...e,
    note: store.journalNotes![e.id] ?? e.note,
  }));
}

export function getFounderPredictions(): FounderPrediction[] {
  const store = readStore();
  const statusMap = store.predictions ?? {};
  return LEGACY_FOUNDER_PREDICTIONS_DEFAULT.map((p) => ({
    ...p,
    status: statusMap[p.id] ?? p.status,
  }));
}

export function getLegacyLetters(): LegacyLetter[] {
  return LEGACY_LETTERS_DEFAULT;
}

export function exportLegacySystemSnapshot() {
  return {
    journal: getFounderJournal(),
    predictions: getFounderPredictions(),
    letters: getLegacyLetters(),
    source: 'legacy-system-local' as const,
  };
}

export function useAdminStudioLegacySystem() {
  const [searchQuery, setSearchQuery] = useState('');
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const journal = useMemo(() => {
    void version;
    return getFounderJournal();
  }, [version]);

  const predictions = useMemo(() => {
    void version;
    return getFounderPredictions();
  }, [version]);

  const letters = useMemo(() => getLegacyLetters(), []);

  const searchResults = useMemo(() => searchLegacyIndex(searchQuery), [searchQuery]);

  const updateJournalNote = useCallback(
    (id: string, note: string) => {
      const store = readStore();
      store.journalNotes = { ...(store.journalNotes ?? {}), [id]: note };
      writeStore(store);
      bump();
    },
    [bump]
  );

  const setPredictionStatus = useCallback(
    (id: string, status: FounderPredictionStatus) => {
      const store = readStore();
      store.predictions = { ...(store.predictions ?? {}), [id]: status };
      writeStore(store);
      bump();
    },
    [bump]
  );

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    journal,
    predictions,
    letters,
    updateJournalNote,
    setPredictionStatus,
  };
}
