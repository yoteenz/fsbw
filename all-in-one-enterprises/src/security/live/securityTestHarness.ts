import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { SecurityTestIdentityId } from './liveSecurityConfig';
import { getLiveSupabaseConfig, identityJwt } from './liveSecurityConfig';

export type LiveQueryResult = {
  data: unknown[] | null;
  error: { message: string; code?: string } | null;
  count: number;
};

export function createLiveSupabaseClient(jwt?: string): SupabaseClient {
  const { url, anonKey } = getLiveSupabaseConfig();
  if (!url || !anonKey) {
    throw new Error('Live Supabase URL/anon key not configured');
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: jwt ? { headers: { Authorization: `Bearer ${jwt}` } } : undefined,
  });
}

export function runAs(identity: SecurityTestIdentityId): SupabaseClient {
  if (identity === 'ANON') return createLiveSupabaseClient();
  const jwt = identityJwt(identity);
  if (!jwt) {
    throw new Error(`BLOCKED_BY_MISSING_CI_SECRET:${identity}`);
  }
  return createLiveSupabaseClient(jwt);
}

export async function selectLimited(
  client: SupabaseClient,
  table: string,
  columns: string,
  limit = 5,
): Promise<LiveQueryResult> {
  const { data, error } = await client.from(table).select(columns).limit(limit);
  return {
    data: (data as unknown[] | null) ?? null,
    error: error ? { message: error.message, code: error.code } : null,
    count: data?.length ?? 0,
  };
}

export async function selectById(
  client: SupabaseClient,
  table: string,
  columns: string,
  idColumn: string,
  id: string,
): Promise<LiveQueryResult> {
  const { data, error } = await client.from(table).select(columns).eq(idColumn, id).maybeSingle();
  const row = data ? [data] : [];
  return {
    data: row as unknown[],
    error: error ? { message: error.message, code: error.code } : null,
    count: data ? 1 : 0,
  };
}

/** Expect deny: error OR zero rows (RLS silent empty). */
export function expectAccessDenied(result: LiveQueryResult): void {
  if (result.error) return;
  if (result.count === 0) return;
  throw new Error(`Expected deny but received ${result.count} row(s)`);
}

/** Expect allow: no error (empty allowed for scoped tables). */
export function expectAccessAllowed(result: LiveQueryResult): void {
  if (result.error) {
    throw new Error(`Expected allow but got error: ${result.error.message}`);
  }
}
