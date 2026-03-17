/**
 * Supabase client for the frontend (auth + optional API token).
 * Uses a custom storage that mirrors the auth session to a cookie so that when Safari (or any
 * browser) clears localStorage on app close, the session can be restored from the cookie — same
 * effective behavior as Chrome keeping localStorage. Sign-out happens ONLY when the user
 * explicitly clicks Sign Out. When Supabase fires SIGNED_OUT we restore app auth from backup.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ensureAuthRestoredFromBackup } from './adminAuth';

const SUPABASE_SESSION_COOKIE = 'baw_sb_session';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const MAX_SESSION_LENGTH = 3500; // stay under 4k cookie limit

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let c = name + '=' + encodeURIComponent(value) + '; path=/; max-age=' + COOKIE_MAX_AGE + '; SameSite=Lax';
    if (secure) c += '; Secure';
    document.cookie = c;
  } catch (_) {}
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let c = name + '=; path=/; max-age=0';
    if (secure) c += '; Secure';
    document.cookie = c;
  } catch (_) {}
}

/** Storage adapter that mirrors Supabase auth keys to a cookie so session survives when localStorage is cleared (e.g. Safari on app close). */
function createSupabaseStorage(): { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void } {
  const ls = typeof window !== 'undefined' ? window.localStorage : null;
  const isAuthKey = (k: string) => k.includes('auth') || /^sb-.*-auth-token$/i.test(k);

  return {
    getItem(key: string): string | null {
      if (!ls) return null;
      let val = ls.getItem(key);
      if (!val && isAuthKey(key)) {
        const fromCookie = getCookie(SUPABASE_SESSION_COOKIE);
        if (fromCookie) val = fromCookie;
      }
      return val;
    },
    setItem(key: string, value: string): void {
      if (!ls) return;
      ls.setItem(key, value);
      if (isAuthKey(key) && value && value.length <= MAX_SESSION_LENGTH) setCookie(SUPABASE_SESSION_COOKIE, value);
    },
    removeItem(key: string): void {
      if (!ls) return;
      ls.removeItem(key);
      if (isAuthKey(key)) clearCookie(SUPABASE_SESSION_COOKIE);
    },
  };
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (client) return client;
  const url = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  const key = (import.meta as unknown as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: {
      storage: createSupabaseStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') ensureAuthRestoredFromBackup();
  });
  return client;
}

export function isSupabaseConfigured(): boolean {
  return !!(
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL &&
    (import.meta as unknown as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY
  );
}
