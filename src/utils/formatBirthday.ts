/**
 * Formats birthday for display as "AUGUST 30, 1989".
 * Fallback order:
 * 1. birthDate (full string) – used as-is
 * 2. birthMonth + birthDay + birthYear → MONTH DD, YYYY
 * 3. birthMonth + birthDay → MONTH DD
 * 4. birthDay only → Day {day} (e.g. Day 15)
 * 5. Otherwise → —
 */
const MONTH_NAMES = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

export function formatBirthday(client: { birthDate?: string; birthMonth?: number; birthDay?: number; birthYear?: number } | null | undefined): string {
  if (!client) return '—';
  const b = client as { birthDate?: string; birthMonth?: number; birthDay?: number; birthYear?: number };

  if (b.birthDate != null && typeof b.birthDate === 'string' && b.birthDate.trim() !== '') {
    const s = b.birthDate.trim();
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const month = MONTH_NAMES[d.getMonth()];
      const day = d.getDate();
      const year = d.getFullYear();
      return `${month} ${day}, ${year}`;
    }
    return s.toUpperCase();
  }

  if (b.birthMonth != null && b.birthDay != null && b.birthYear != null) {
    const idx = Math.max(0, Math.min(11, Number(b.birthMonth) - 1));
    const month = MONTH_NAMES[idx];
    const day = Number(b.birthDay);
    const year = Number(b.birthYear);
    return `${month} ${day}, ${year}`;
  }

  if (b.birthMonth != null && b.birthDay != null) {
    const idx = Math.max(0, Math.min(11, Number(b.birthMonth) - 1));
    const month = MONTH_NAMES[idx];
    const day = Number(b.birthDay);
    return `${month} ${day}`;
  }

  if (b.birthDay != null) {
    return `Day ${b.birthDay}`;
  }

  return '—';
}
