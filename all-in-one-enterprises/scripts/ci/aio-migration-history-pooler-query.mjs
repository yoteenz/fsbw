#!/usr/bin/env node
/**
 * Query remote migration history via Supabase pooler (CI-compatible fallback).
 * Reads pooler URL written by `supabase link`; never logs credentials.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseRemoteVersionsFromSqlOutput } from './aio-migration-history-lib.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const POOLER_URL_PATH = join(ROOT, 'supabase/.temp/pooler-url');

const QUERY =
  'select version from supabase_migrations.schema_migrations order by version;';

function buildPoolerUri(poolerTemplate, password) {
  const encoded = encodeURIComponent(password);
  return poolerTemplate.replace('[YOUR-PASSWORD]', encoded);
}

export function fetchRemoteVersionsViaPooler({ poolerPath = POOLER_URL_PATH, password } = {}) {
  if (!password) {
    return { ok: false, error: 'missing password', versions: [], malformed: true };
  }
  if (!existsSync(poolerPath)) {
    return { ok: false, error: 'pooler-url not found', versions: [], malformed: true };
  }

  const template = readFileSync(poolerPath, 'utf8').trim();
  if (!template.includes('pooler.supabase.com') && !template.includes('pooler.supabase.co')) {
    return { ok: false, error: 'invalid pooler template host', versions: [], malformed: true };
  }

  const uri = buildPoolerUri(template, password);
  let stdout = '';
  let stderr = '';
  try {
    stdout = execFileSync(
      'psql',
      [uri, '-tAc', QUERY],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
  } catch (err) {
    stderr = err.stderr?.toString?.() ?? String(err.message ?? err);
    return { ok: false, error: 'psql pooler query failed', detail: stderr.slice(0, 500), versions: [], malformed: true };
  }

  const parsed = parseRemoteVersionsFromSqlOutput(stdout);
  if (parsed.malformed && parsed.versions.length === 0) {
    return { ok: false, error: 'malformed pooler SQL output', versions: [], malformed: true };
  }

  return { ok: true, versions: parsed.versions, malformed: parsed.malformed };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const password = process.env.SUPABASE_DB_PASSWORD ?? '';
  const result = fetchRemoteVersionsViaPooler({ password });
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exit(result.ok ? 0 : 1);
}
