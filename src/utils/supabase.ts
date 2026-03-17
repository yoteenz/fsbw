/**
 * Supabase client for the frontend (auth + optional API token).
 * Only used when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
 * Auth is stored in localStorage so the session persists across refresh and browser close;
 * sign-out happens ONLY when the user explicitly clicks Sign Out.
 * When Supabase fires SIGNED_OUT (e.g. after token refresh failure), we restore app auth from backup so the user stays signed in.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ensureAuthRestoredFromBackup } from './adminAuth';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (client) return client;
  const url = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  const key = (import.meta as unknown as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: {
      storage: window.localStorage,
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
