const KEY = 'adminClientMeetingsFocus';

export type AdminClientMeetingsFocusPayload = {
  id: string;
  date: string;
  tab: 'bookings' | 'consults';
};

export function storeAdminClientMeetingsFocus(payload: AdminClientMeetingsFocusPayload): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function readAdminClientMeetingsFocus(): AdminClientMeetingsFocusPayload | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as AdminClientMeetingsFocusPayload;
    if (!p || typeof p.id !== 'string' || typeof p.date !== 'string') return null;
    if (p.tab !== 'bookings' && p.tab !== 'consults') return null;
    return p;
  } catch {
    return null;
  }
}

export function clearAdminClientMeetingsFocus(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
