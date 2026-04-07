import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { getAdminMeetings } from '../utils/api';
import { isAdminEmail } from '../utils/adminAuth';
import { normalizeApiMeeting, type AdminMeeting } from '../utils/adminMeetingsMock';
import { isSupabaseConfigured } from '../utils/supabase';

/** Fire after server-side meeting create/update so all admin views refetch `/api/admin/meetings` in the same tab. */
export const ADMIN_MEETINGS_API_REFRESH_EVENT = 'adminMeetingsApiRefresh';

export function dispatchAdminMeetingsApiRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ADMIN_MEETINGS_API_REFRESH_EVENT));
}

function currentUserForAdminMeetings(): { email?: string } | null {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Normalized rows or [] (for dashboard init without duplicating hook fetch). */
export async function fetchAdminMeetingsApiNormalized(): Promise<AdminMeeting[]> {
  const currentUser = currentUserForAdminMeetings();
  if (!isSupabaseConfigured() || !currentUser?.email || !isAdminEmail(currentUser.email)) return [];
  try {
    const r = await getAdminMeetings();
    const rows = Array.isArray(r.meetings) ? r.meetings : [];
    return rows
      .map((row) => normalizeApiMeeting(row as Record<string, unknown>))
      .filter(Boolean) as AdminMeeting[];
  } catch {
    return [];
  }
}

/** Load normalized API meetings into state (no-op if not admin / Supabase off). */
export function refreshAdminMeetingsApiIntoState(setRows: Dispatch<SetStateAction<AdminMeeting[]>>): void {
  void fetchAdminMeetingsApiNormalized().then((norm) => {
    const u = currentUserForAdminMeetings();
    if (!isSupabaseConfigured() || !u?.email || !isAdminEmail(u.email)) return;
    setRows(norm);
  });
}

/**
 * Keeps Supabase/API meetings in sync across admin surfaces (meetings hub, client details, dashboard card):
 * initial fetch + refetch on window focus, storage, sign-in change, explicit dispatch, and `adminMeetingsUpdated` (local schedule writes).
 * @param skipInitial — set true when parent already awaited `fetchAdminMeetingsApiNormalized()` (e.g. dashboard bootstrap).
 */
export function useAdminMeetingsApiRefresh(
  setRows: Dispatch<SetStateAction<AdminMeeting[]>>,
  skipInitial = false
): void {
  useEffect(() => {
    if (!skipInitial) {
      refreshAdminMeetingsApiIntoState(setRows);
    }

    const run = () => refreshAdminMeetingsApiIntoState(setRows);

    window.addEventListener('focus', run);
    window.addEventListener('storage', run);
    window.addEventListener('signInStateChanged', run as EventListener);
    window.addEventListener(ADMIN_MEETINGS_API_REFRESH_EVENT, run);
    window.addEventListener('adminMeetingsUpdated', run);

    return () => {
      window.removeEventListener('focus', run);
      window.removeEventListener('storage', run);
      window.removeEventListener('signInStateChanged', run as EventListener);
      window.removeEventListener(ADMIN_MEETINGS_API_REFRESH_EVENT, run);
      window.removeEventListener('adminMeetingsUpdated', run);
    };
  }, [setRows]);
}
