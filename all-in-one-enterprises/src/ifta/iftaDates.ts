/** Quarter calendar for IFTA — period, due date (last day of the month after the quarter), labels. UTC throughout. */

export type IftaQuarterNumber = 1 | 2 | 3 | 4;

export interface IftaPeriod {
  year: number;
  quarter: IftaQuarterNumber;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
}

const DAY_MS = 86_400_000;

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function lastDayOfMonth(year: number, monthIndex: number): Date {
  return new Date(Date.UTC(year, monthIndex + 1, 0));
}

export function quarterPeriod(year: number, quarter: IftaQuarterNumber): IftaPeriod {
  const startMonth = (quarter - 1) * 3;
  const start = new Date(Date.UTC(year, startMonth, 1));
  const end = lastDayOfMonth(year, startMonth + 2);
  const due = lastDayOfMonth(year, startMonth + 3);
  return { year, quarter, periodStart: iso(start), periodEnd: iso(end), dueDate: iso(due) };
}

/** The quarter most recently ended relative to `now` — the one being filed. */
export function lastEndedQuarter(now: Date): { year: number; quarter: IftaQuarterNumber } {
  const current = Math.floor(now.getUTCMonth() / 3) + 1;
  if (current === 1) return { year: now.getUTCFullYear() - 1, quarter: 4 };
  return { year: now.getUTCFullYear(), quarter: (current - 1) as IftaQuarterNumber };
}

export function nextQuarter(year: number, quarter: IftaQuarterNumber): { year: number; quarter: IftaQuarterNumber } {
  return quarter === 4 ? { year: year + 1, quarter: 1 } : { year, quarter: (quarter + 1) as IftaQuarterNumber };
}

export function previousQuarter(year: number, quarter: IftaQuarterNumber): { year: number; quarter: IftaQuarterNumber } {
  return quarter === 1 ? { year: year - 1, quarter: 4 } : { year, quarter: (quarter - 1) as IftaQuarterNumber };
}

export function quarterLabel(q: { year: number; quarter: number }): string {
  return `Q${q.quarter} ${q.year}`;
}

export function quarterKey(q: { year: number; quarter: number }): string {
  return `${q.year}-Q${q.quarter}`;
}

export function parseIsoDate(value: string): Date {
  return new Date(`${value.slice(0, 10)}T00:00:00Z`);
}

export function addDays(value: string, days: number): string {
  return iso(new Date(parseIsoDate(value).getTime() + days * DAY_MS));
}

export function daysInPeriod(period: { periodStart: string; periodEnd: string }): number {
  return Math.round((parseIsoDate(period.periodEnd).getTime() - parseIsoDate(period.periodStart).getTime()) / DAY_MS) + 1;
}

/** Whole days from `now` to the due date (negative once past due). */
export function daysUntil(dueDate: string, now: Date): number {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((parseIsoDate(dueDate).getTime() - today) / DAY_MS);
}

export function formatShortDate(value: string): string {
  return parseIsoDate(value).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
}

export function formatLongDate(value: string): string {
  return parseIsoDate(value).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function monthsOfQuarter(period: { year: number; quarter: number }): { key: string; label: string }[] {
  const startMonth = (period.quarter - 1) * 3;
  return [0, 1, 2].map((i) => {
    const d = new Date(Date.UTC(period.year, startMonth + i, 1));
    return { key: iso(d).slice(0, 7), label: d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' }) };
  });
}
