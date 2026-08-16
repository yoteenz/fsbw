import type { ManagementDateRange, ManagementPeriodId } from './managementTypes';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function resolveManagementDateRange(
  periodId: ManagementPeriodId,
  now = new Date(),
  customStart?: string,
  customEnd?: string,
  comparePrevious = false,
): ManagementDateRange {
  let start: Date;
  let end: Date = endOfDay(now);
  let label: string;

  switch (periodId) {
    case 'today':
      start = startOfDay(now);
      label = 'Today';
      break;
    case 'week':
      start = startOfWeek(now);
      label = 'This Week';
      break;
    case 'month':
      start = startOfMonth(now);
      label = 'This Month';
      break;
    case 'quarter':
      start = startOfQuarter(now);
      label = 'This Quarter';
      break;
    case 'year':
      start = startOfYear(now);
      label = 'This Year';
      break;
    case 'custom':
      start = customStart ? startOfDay(new Date(customStart)) : startOfMonth(now);
      end = customEnd ? endOfDay(new Date(customEnd)) : endOfDay(now);
      label = 'Custom Range';
      break;
    default:
      start = startOfMonth(now);
      label = 'This Month';
  }

  const durationMs = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return {
    periodId,
    start: start.toISOString(),
    end: end.toISOString(),
    label,
    comparePrevious,
    previousStart: comparePrevious ? previousStart.toISOString() : undefined,
    previousEnd: comparePrevious ? previousEnd.toISOString() : undefined,
  };
}

export function isDateInRange(iso: string | undefined, range: ManagementDateRange): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= new Date(range.start).getTime() && t <= new Date(range.end).getTime();
}

export function formatComparison(current: number, previous: number | null): string {
  if (previous === null || previous === 0) {
    if (current === 0) return 'No prior data';
    return 'No prior data';
  }
  const pct = ((current - previous) / previous) * 100;
  if (!Number.isFinite(pct)) return 'No prior data';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}% vs prior period`;
}
