import type { CareLesson } from '../../../content/education/types';

const STORAGE_KEY = 'lounge_care_progress_v1';

type CareProgressRow = {
  lessonId: string;
  progressSeconds: number;
  durationSeconds?: number;
  completed: boolean;
  lastWatchedAt: number;
};

function readAll(): Record<string, CareProgressRow> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CareProgressRow>) : {};
  } catch {
    return {};
  }
}

function writeAll(rows: Record<string, CareProgressRow>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    window.dispatchEvent(new Event('loungeCareProgressUpdated'));
  } catch {
    /* ignore */
  }
}

export function getCareProgress(lessonId: string): CareProgressRow | undefined {
  return readAll()[lessonId];
}

export function setCareWatchProgress(
  lessonId: string,
  progressSeconds: number,
  options?: { durationSeconds?: number; completed?: boolean }
): void {
  const rows = readAll();
  rows[lessonId] = {
    lessonId,
    progressSeconds: Math.max(0, progressSeconds),
    durationSeconds: options?.durationSeconds,
    completed: options?.completed ?? false,
    lastWatchedAt: Date.now(),
  };
  writeAll(rows);
}

export function markCareLessonCompleted(lessonId: string): void {
  const rows = readAll();
  const prev = rows[lessonId];
  rows[lessonId] = {
    lessonId,
    progressSeconds: prev?.progressSeconds ?? 0,
    durationSeconds: prev?.durationSeconds,
    completed: true,
    lastWatchedAt: Date.now(),
  };
  writeAll(rows);
}

export function getCareProgressMap(): Record<string, CareProgressRow> {
  return readAll();
}

export function careProgressPercent(lesson: CareLesson): number | undefined {
  const row = getCareProgress(lesson.id);
  if (!row?.durationSeconds || row.durationSeconds <= 0) return undefined;
  return Math.min(100, (row.progressSeconds / row.durationSeconds) * 100);
}
