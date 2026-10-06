import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getAioSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
  const key = process.env.AIO_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function getAioSupabaseAnonUrl(): { url: string; anonKey: string } | null {
  const url = process.env.AIO_STAGING_SUPABASE_URL ?? process.env.VITE_AIO_SUPABASE_URL;
  const anonKey = process.env.AIO_STAGING_SUPABASE_ANON_KEY ?? process.env.VITE_AIO_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}
