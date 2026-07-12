import { resolveSupabaseProjectRef } from './production-target.js';

export type MigrationApplyResult = {
  ok: boolean;
  channel: 'postgres' | 'management-api' | 'none';
  error?: string;
  output?: string;
};

export async function executeApprovedMigrationSql(sql: string): Promise<MigrationApplyResult> {
  const dbUrl = process.env.SUPABASE_DB_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (dbUrl) {
    try {
      const pg = await import('pg');
      const client = new pg.default.Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      try {
        await client.query(sql);
        return { ok: true, channel: 'postgres', output: 'DDL applied via SUPABASE_DB_URL' };
      } finally {
        await client.end();
      }
    } catch (err) {
      return {
        ok: false,
        channel: 'postgres',
        error: err instanceof Error ? err.message : 'Postgres DDL apply failed',
      };
    }
  }

  const token = process.env.SUPABASE_MANAGEMENT_ACCESS_TOKEN?.trim();
  const projectRef = resolveSupabaseProjectRef();
  if (token && projectRef) {
    try {
      const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });
      const text = await res.text();
      if (!res.ok) {
        return { ok: false, channel: 'management-api', error: `Management API ${res.status}: ${text}` };
      }
      return { ok: true, channel: 'management-api', output: text };
    } catch (err) {
      return {
        ok: false,
        channel: 'management-api',
        error: err instanceof Error ? err.message : 'Management API apply failed',
      };
    }
  }

  return {
    ok: false,
    channel: 'none',
    error: 'No DDL channel configured (set SUPABASE_DB_URL or SUPABASE_MANAGEMENT_ACCESS_TOKEN)',
  };
}
