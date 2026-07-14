export type IconManufacturingVersionEntry = {
  id: string;
  sheetId: string;
  revision: number;
  version: string;
  author: string;
  timestamp: string;
  notes: string;
  changes: string[];
  checksum?: string;
  exportPath?: string;
};

const VERSION_HISTORY_KEY = 'studio-world:icon-manufacturing-version-history';

export function loadVersionHistory(): IconManufacturingVersionEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(VERSION_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as IconManufacturingVersionEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveVersionHistory(entries: IconManufacturingVersionEntry[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(entries.slice(-200)));
}

export function appendVersionEntry(
  entry: Omit<IconManufacturingVersionEntry, 'id' | 'timestamp' | 'revision'>,
): IconManufacturingVersionEntry {
  const history = loadVersionHistory();
  const sheetEntries = history.filter((e) => e.sheetId === entry.sheetId);
  const revision = (sheetEntries[sheetEntries.length - 1]?.revision ?? 0) + 1;
  const full: IconManufacturingVersionEntry = {
    ...entry,
    id: `${entry.sheetId}-r${revision}-${Date.now()}`,
    revision,
    timestamp: new Date().toISOString(),
  };
  saveVersionHistory([...history, full]);
  return full;
}

export function listVersionsForSheet(sheetId: string): IconManufacturingVersionEntry[] {
  return loadVersionHistory()
    .filter((e) => e.sheetId === sheetId)
    .sort((a, b) => b.revision - a.revision);
}
