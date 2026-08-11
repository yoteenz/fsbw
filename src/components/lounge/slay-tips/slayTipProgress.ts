import type { SlayTip } from '../../../content/education/types';

const STORAGE_KEY = 'lounge_slay_tip_progress_v1';

type SlayTipProgressRow = {
  tipId: string;
  /** @deprecated Legacy page index — retained for migration reads only. */
  pageIndex: number;
  completed: boolean;
  lastReadAt: number;
};

function readAll(): Record<string, SlayTipProgressRow> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SlayTipProgressRow>) : {};
  } catch {
    return {};
  }
}

function writeAll(rows: Record<string, SlayTipProgressRow>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    window.dispatchEvent(new Event('loungeSlayTipProgressUpdated'));
  } catch {
    /* ignore */
  }
}

export function getSlayTipProgress(tipId: string): SlayTipProgressRow | undefined {
  return readAll()[tipId];
}

/** @deprecated Slideshow page tracking — no longer written by the viewer. */
export function setSlayTipPageIndex(tipId: string, pageIndex: number, totalPages: number): void {
  const rows = readAll();
  rows[tipId] = {
    tipId,
    pageIndex: Math.max(0, Math.min(pageIndex, Math.max(0, totalPages - 1))),
    completed: pageIndex >= totalPages - 1,
    lastReadAt: Date.now(),
  };
  writeAll(rows);
}

/** @deprecated Prefer {@link markSlayTipArticleCompleted}. */
export function markSlayTipCompleted(tipId: string, totalPages: number): void {
  setSlayTipPageIndex(tipId, Math.max(0, totalPages - 1), totalPages);
  const rows = readAll();
  if (rows[tipId]) rows[tipId].completed = true;
  writeAll(rows);
}

/**
 * Article read completion — fires once when the editorial end marker enters view.
 * Does not duplicate if already completed.
 */
export function markSlayTipArticleCompleted(tipId: string): void {
  const rows = readAll();
  const existing = rows[tipId];
  if (existing?.completed) return;
  rows[tipId] = {
    tipId,
    pageIndex: existing?.pageIndex ?? 0,
    completed: true,
    lastReadAt: Date.now(),
  };
  writeAll(rows);
}

export function getSlayTipProgressMap(): Record<string, SlayTipProgressRow> {
  return readAll();
}

export function slayTipProgressLabel(tip: SlayTip): string | undefined {
  const row = getSlayTipProgress(tip.id);
  if (!row) return undefined;
  if (row.completed) return 'COMPLETED';
  return undefined;
}
