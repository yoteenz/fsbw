/**
 * Hand off from admin client details → /admin/meetings with the same meeting selected
 * (edit booking / send quote) once the hub’s calendar range includes the row.
 */
export const ADMIN_MEETINGS_FOCUS_SESSION_KEY = 'adminMeetingsFocusFromClientDetails';

export type AdminMeetingsFocusSessionPayload = {
  meetingId: string;
  /** YYYY-MM-DD — used to move the hub calendar to the meeting’s month before merge lookup. */
  date: string;
  /** When set (client details → hub), hub opens this tab before focusing the row. */
  tab?: 'bookings' | 'consults';
};

export function storeAdminMeetingsFocusFromClientDetails(m: {
  id: string;
  date: string;
  tab?: 'bookings' | 'consults';
}): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: AdminMeetingsFocusSessionPayload = {
      meetingId: String(m.id || '').trim(),
      date: String(m.date || '').trim(),
      ...(m.tab === 'bookings' || m.tab === 'consults' ? { tab: m.tab } : {}),
    };
    if (!payload.meetingId || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) return;
    window.sessionStorage.setItem(ADMIN_MEETINGS_FOCUS_SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function readAdminMeetingsFocusFromClientDetails(): AdminMeetingsFocusSessionPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_MEETINGS_FOCUS_SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { meetingId?: unknown; date?: unknown; tab?: unknown };
    const meetingId = typeof p.meetingId === 'string' ? p.meetingId.trim() : '';
    const date = typeof p.date === 'string' ? p.date.trim() : '';
    if (!meetingId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const tabRaw = typeof p.tab === 'string' ? p.tab.trim().toLowerCase() : '';
    const tab = tabRaw === 'consults' ? 'consults' : tabRaw === 'bookings' ? 'bookings' : undefined;
    return tab ? { meetingId, date, tab } : { meetingId, date };
  } catch {
    return null;
  }
}

export function clearAdminMeetingsFocusFromClientDetails(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(ADMIN_MEETINGS_FOCUS_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
