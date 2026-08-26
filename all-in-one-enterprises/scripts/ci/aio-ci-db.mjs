#!/usr/bin/env node
/**
 * Canonical CI database connection for AIO Supabase production validation.
 * Uses Supabase pooler URL from `supabase link` — never direct db.<ref>.supabase.co.
 * Never logs passwords, tokens, or full connection URIs.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const AIO_CANONICAL_PROJECT_REF = 'nnnljnhtmseagotvgxxt';
export const FS_FORBIDDEN_PROJECT_REF = 'hyycomvcaqxxvyrfupes';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const AIO_ROOT = join(__dirname, '../..');
export const DEFAULT_POOLER_URL_PATH = join(AIO_ROOT, 'supabase/.temp/pooler-url');

const DIRECT_DB_HOST_RE = /db\.[a-z0-9]+\.supabase\.co/i;
const SECRET_REDACT_RE =
  /(postgresql:\/\/[^@\s]+@|postgres:\/\/[^@\s]+@|password[=:\s]+[^\s]+|Bearer\s+[^\s]+|service_role[^\s]*|SUPABASE_ACCESS_TOKEN[^\s]*)/gi;

/** Redact credential-like substrings for safe logging. */
export function redactSecrets(text) {
  if (typeof text !== 'string') return String(text ?? '');
  return text.replace(SECRET_REDACT_RE, '[REDACTED]');
}

export function assertAioProjectRef(projectRef = process.env.SUPABASE_PROJECT_ID) {
  if (!projectRef) {
    throw new Error('SUPABASE_PROJECT_ID is empty');
  }
  if (projectRef === FS_FORBIDDEN_PROJECT_REF) {
    throw new Error(`forbidden Frontal Slayer project ref: ${FS_FORBIDDEN_PROJECT_REF}`);
  }
  if (projectRef !== AIO_CANONICAL_PROJECT_REF) {
    throw new Error(
      `project ref must be ${AIO_CANONICAL_PROJECT_REF} (got ${projectRef.length} char ref)`,
    );
  }
  return projectRef;
}

/**
 * Resolve CI-compatible pooler URI from post-link template. Rejects direct db hosts.
 */
export function resolvePoolerUri({
  password = process.env.SUPABASE_DB_PASSWORD ?? '',
  poolerPath = DEFAULT_POOLER_URL_PATH,
  projectRef = process.env.SUPABASE_PROJECT_ID ?? AIO_CANONICAL_PROJECT_REF,
} = {}) {
  assertAioProjectRef(projectRef);

  if (!password) {
    return { ok: false, method: 'none', error: 'missing SUPABASE_DB_PASSWORD', uri: null };
  }
  if (!existsSync(poolerPath)) {
    return {
      ok: false,
      method: 'none',
      error: 'pooler-url not found — run supabase link first',
      uri: null,
    };
  }

  const template = readFileSync(poolerPath, 'utf8').trim();
  if (!template) {
    return { ok: false, method: 'none', error: 'pooler-url is empty', uri: null };
  }

  if (DIRECT_DB_HOST_RE.test(template)) {
    return {
      ok: false,
      method: 'direct-postgres',
      error: 'pooler-url points at direct db host (CI incompatible)',
      uri: null,
    };
  }

  const isPooler =
    template.includes('pooler.supabase.com') || template.includes('pooler.supabase.co');
  if (!isPooler) {
    return { ok: false, method: 'other', error: 'pooler-url host is not a Supabase pooler', uri: null };
  }

  if (
    !template.includes(projectRef) &&
    !template.includes(`postgres.${projectRef}`) &&
    !template.includes(`reference=${projectRef}`)
  ) {
    return {
      ok: false,
      method: 'pooler',
      error: 'pooler-url project ref does not match canonical AIO project',
      uri: null,
    };
  }

  const encoded = encodeURIComponent(password);
  const uri = template.replace('[YOUR-PASSWORD]', encoded);

  return { ok: true, method: 'pooler', error: null, uri };
}

/**
 * Run a single SQL statement via psql against the pooler URI.
 * Fail-closed: query errors return ok:false — never empty success.
 */
export function runPoolerSql(query, options = {}) {
  const resolved = resolvePoolerUri(options);
  if (!resolved.ok || !resolved.uri) {
    return {
      ok: false,
      queryOk: false,
      stdout: '',
      stderr: resolved.error ?? 'pooler resolution failed',
      method: resolved.method,
    };
  }

  try {
    const stdout = execFileSync('psql', [resolved.uri, '-tAc', query], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {
      ok: true,
      queryOk: true,
      stdout: stdout ?? '',
      stderr: '',
      method: resolved.method,
    };
  } catch (err) {
    const stderr = redactSecrets(err.stderr?.toString?.() ?? String(err.message ?? err));
    return {
      ok: false,
      queryOk: false,
      stdout: '',
      stderr,
      method: resolved.method,
    };
  }
}

/** Connectivity preflight — proves pooler SQL works from CI. */
export function runConnectivityPreflight(options = {}) {
  const resolved = resolvePoolerUri(options);
  if (!resolved.ok) {
    return {
      connectivity: 'FAIL',
      connectionMethod: resolved.method === 'direct-postgres' ? 'DIRECT_POSTGRES' : 'POOLER',
      queryOk: false,
      error: resolved.error,
    };
  }

  const probe = runPoolerSql('select 1 as ok;', { ...options, password: options.password });
  if (!probe.queryOk) {
    return {
      connectivity: 'FAIL',
      connectionMethod: 'POOLER',
      queryOk: false,
      error: redactSecrets(probe.stderr || 'select 1 failed'),
    };
  }

  const val = probe.stdout.trim();
  if (val !== '1') {
    return {
      connectivity: 'FAIL',
      connectionMethod: 'POOLER',
      queryOk: false,
      error: 'unexpected preflight probe result',
    };
  }

  return {
    connectivity: 'PASS',
    connectionMethod: 'POOLER',
    queryOk: true,
    error: null,
  };
}

/** Parse psql tabular output lines (one value per line). */
export function parsePsqlLines(stdout) {
  if (typeof stdout !== 'string') return { values: [], queryFailed: true };
  const values = [];
  let queryFailed = false;
  for (const raw of stdout.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/^psql:/i.test(line) || /^error:/i.test(line)) {
      queryFailed = true;
      continue;
    }
    values.push(line);
  }
  return { values, queryFailed };
}
