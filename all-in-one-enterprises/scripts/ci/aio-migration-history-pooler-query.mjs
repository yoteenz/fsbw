#!/usr/bin/env node
/**
 * Query remote migration history via canonical CI pooler connection.
 */
import { fileURLToPath } from 'node:url';
import { runPoolerSql } from './aio-ci-db.mjs';
import { parseRemoteVersionsFromSqlOutput } from './aio-migration-history-lib.mjs';

const QUERY =
  'select version from supabase_migrations.schema_migrations order by version;';

export function fetchRemoteVersionsViaPooler(options = {}) {
  const result = runPoolerSql(QUERY, options);
  if (!result.queryOk) {
    return {
      ok: false,
      error: 'psql pooler query failed',
      detail: result.stderr?.slice(0, 500) ?? '',
      versions: [],
      malformed: true,
    };
  }

  const parsed = parseRemoteVersionsFromSqlOutput(result.stdout);
  if (parsed.malformed && parsed.versions.length === 0) {
    return { ok: false, error: 'malformed pooler SQL output', versions: [], malformed: true };
  }

  return { ok: true, versions: parsed.versions, malformed: parsed.malformed };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = fetchRemoteVersionsViaPooler();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(result.ok ? 0 : 1);
}
