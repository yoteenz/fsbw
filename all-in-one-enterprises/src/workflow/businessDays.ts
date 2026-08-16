/** Business-day utilities for workflow scheduling (demo configuration). */

const DEFAULT_HOLIDAYS = new Set([
  '2026-01-01',
  '2026-07-04',
  '2026-12-25',
]);

export function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

export function isBusinessDay(date: Date, holidays: Set<string> = DEFAULT_HOLIDAYS): boolean {
  const iso = date.toISOString().slice(0, 10);
  return !isWeekend(date) && !holidays.has(iso);
}

export function addBusinessDays(from: Date, days: number, holidays: Set<string> = DEFAULT_HOLIDAYS): Date {
  const result = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result, holidays)) remaining -= 1;
  }
  return result;
}

export function businessDaysBetween(start: Date, end: Date, holidays: Set<string> = DEFAULT_HOLIDAYS): number {
  let count = 0;
  const cursor = new Date(start);
  while (cursor < end) {
    cursor.setDate(cursor.getDate() + 1);
    if (isBusinessDay(cursor, holidays)) count += 1;
  }
  return count;
}

export function scheduleFollowUpBusinessDays(from: Date, businessDays: number): string {
  return addBusinessDays(from, businessDays).toISOString();
}
