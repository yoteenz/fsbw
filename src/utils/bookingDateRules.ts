/**
 * Booking calendar minimum lead times (local dates, salon closed weekends).
 * - **Two calendar months** from today for new installs and consult **WIG + INSTALL** (e.g. Apr 1 → earliest Jun 1).
 * - **Seven days** from today for re-installs.
 */

function parseIsoYmdLocal(iso: string): { y: number; m: number; d: number } | null {
  const t = iso.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const [ys, ms, ds] = t.split('-');
  const y = parseInt(ys, 10);
  const m = parseInt(ms, 10) - 1;
  const d = parseInt(ds, 10);
  const check = new Date(y, m, d);
  if (check.getFullYear() !== y || check.getMonth() !== m || check.getDate() !== d) return null;
  return { y, m, d };
}

export type BookingCalendarMinLead = 'two_calendar_months' | 'seven_days';

/** First local calendar day the user may select (inclusive), at local midnight. */
export function bookingMinSelectableLocalDate(lead: BookingCalendarMinLead): Date {
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (lead === 'seven_days') {
    const t = new Date(startToday);
    t.setDate(t.getDate() + 7);
    return t;
  }
  const t = new Date(startToday);
  t.setMonth(t.getMonth() + 2);
  return t;
}

/** Disables weekends and any date strictly before the minimum lead date. */
export function createBookingDateDisabledFn(lead: BookingCalendarMinLead): (isoYmd: string) => boolean {
  return (isoYmd: string) => {
    const parsed = parseIsoYmdLocal(isoYmd);
    if (!parsed) return true;
    const date = new Date(parsed.y, parsed.m, parsed.d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return true;
    const min = bookingMinSelectableLocalDate(lead);
    return date < min;
  };
}
