/**
 * Formats birthday for display as "AUGUST 30, 1989".
 * Fallback order:
 * 1. birthday / birthDate string
 * 2. birthMonth + birthDay + birthYear → MONTH DD, YYYY
 * 3. birthMonth + birthDay → MONTH DD
 * 4. birthDay only → Day {day} (e.g. Day 15)
 * 5. Otherwise → —
 */
const MONTH_NAMES = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

function isValidMonthDayYear(month: number, day: number, year: number): boolean {
  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(year)) return false;
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 3000) return false;
  return true;
}

function toDisplay(month: number, day: number, year?: number): string {
  const idx = Math.max(0, Math.min(11, month - 1));
  const monthName = MONTH_NAMES[idx];
  if (year != null) return `${monthName} ${day}, ${year}`;
  return `${monthName} ${day}`;
}

function parseBirthdayString(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  // MM/DD/YYYY or MM-DD-YYYY
  const mdy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (mdy) {
    const month = Number(mdy[1]);
    const day = Number(mdy[2]);
    const year = Number(mdy[3]);
    if (isValidMonthDayYear(month, day, year)) return toDisplay(month, day, year);
  }

  // YYYY-MM-DD
  const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    if (isValidMonthDayYear(month, day, year)) return toDisplay(month, day, year);
  }

  // Compact MMDDYYYY (e.g. 08301989)
  const compact = s.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (compact) {
    const month = Number(compact[1]);
    const day = Number(compact[2]);
    const year = Number(compact[3]);
    if (isValidMonthDayYear(month, day, year)) return toDisplay(month, day, year);
  }

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return toDisplay(d.getMonth() + 1, d.getDate(), d.getFullYear());
  }
  return s.toUpperCase();
}

export function formatBirthday(client: { birthday?: string; birthDate?: string; birthMonth?: number; birthDay?: number; birthYear?: number } | null | undefined): string {
  if (!client) return '—';
  const b = client as { birthday?: string; birthDate?: string; birthMonth?: number; birthDay?: number; birthYear?: number };

  const primary = typeof b.birthday === 'string' ? parseBirthdayString(b.birthday) : null;
  if (primary) return primary;

  const legacy = typeof b.birthDate === 'string' ? parseBirthdayString(b.birthDate) : null;
  if (legacy) return legacy;

  if (b.birthMonth != null && b.birthDay != null && b.birthYear != null) {
    const month = Number(b.birthMonth);
    const day = Number(b.birthDay);
    const year = Number(b.birthYear);
    if (isValidMonthDayYear(month, day, year)) return toDisplay(month, day, year);
  }

  if (b.birthMonth != null && b.birthDay != null) {
    const month = Number(b.birthMonth);
    const day = Number(b.birthDay);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return toDisplay(month, day);
  }

  if (b.birthDay != null) {
    return `Day ${b.birthDay}`;
  }

  return '—';
}
