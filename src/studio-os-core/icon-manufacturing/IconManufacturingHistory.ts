export type IconManufacturingHistoryEventType =
  | 'uploaded'
  | 'calibrated'
  | 'exported'
  | 'qa'
  | 'certified'
  | 'published'
  | 'deprecated'
  | 'promoted'
  | 'review-approved'
  | 'review-rejected';

export type IconManufacturingHistoryEvent = {
  id: string;
  sheetId: string;
  type: IconManufacturingHistoryEventType;
  timestamp: string;
  actor: string;
  summary: string;
  details?: Record<string, unknown>;
};

const HISTORY_KEY = 'studio-world:icon-manufacturing-history';

export function loadManufacturingHistory(): IconManufacturingHistoryEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as IconManufacturingHistoryEvent[]) : [];
  } catch {
    return [];
  }
}

export function saveManufacturingHistory(events: IconManufacturingHistoryEvent[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(events.slice(-500)));
}

export function recordManufacturingEvent(
  event: Omit<IconManufacturingHistoryEvent, 'id' | 'timestamp'>,
): IconManufacturingHistoryEvent {
  const events = loadManufacturingHistory();
  const full: IconManufacturingHistoryEvent = {
    ...event,
    id: `mfg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  saveManufacturingHistory([full, ...events]);
  return full;
}

export function listManufacturingHistoryForSheet(sheetId: string): IconManufacturingHistoryEvent[] {
  return loadManufacturingHistory().filter((e) => e.sheetId === sheetId);
}
