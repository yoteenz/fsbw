/**
 * Dedicated All In One Supabase client — completely separate from Frontal Slayer.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { aioEnv, isBackendConfigured } from '../../config/env';

let client: SupabaseClient | null = null;

export function getAioSupabase(): SupabaseClient | null {
  if (!isBackendConfigured()) return null;
  if (!client) {
    client = createClient(aioEnv.supabaseUrl!, aioEnv.supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'aio-auth-token',
      },
    });
  }
  return client;
}

export function resetAioSupabaseClient(): void {
  client = null;
}
