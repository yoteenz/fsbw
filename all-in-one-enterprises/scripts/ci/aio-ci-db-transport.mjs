#!/usr/bin/env node
/**
 * CI database transport contract — Supavisor session mode (port 5432), IPv4 pooler.
 * Never logs passwords or full connection URIs.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { AIO_CANONICAL_PROJECT_REF, DEFAULT_POOLER_URL_PATH, assertAioProjectRef } from './aio-ci-db.mjs';

export const CI_DATABASE_TRANSPORT = 'SUPAVISOR_SESSION';
export const CI_POOLER_PORT = 5432;
export const CI_TRANSACTION_POOLER_PORT = 6543;

const DIRECT_DB_HOST_RE = /db\.[a-z0-9]+\.supabase\.co/i;

/** Default shared pooler host for AIO project region (us-west-2). Override via secret. */
export function defaultPoolerHost() {
  return (
    process.env.AIO_SUPABASE_POOLER_HOST?.trim() ||
    process.env.SUPABASE_POOLER_HOST?.trim() ||
    'aws-0-us-west-2.pooler.supabase.com'
  );
}

export function buildSessionPoolerTemplate({
  projectRef = process.env.SUPABASE_PROJECT_ID ?? AIO_CANONICAL_PROJECT_REF,
  host = defaultPoolerHost(),
  port = CI_POOLER_PORT,
} = {}) {
  assertAioProjectRef(projectRef);
  if (port !== CI_POOLER_PORT) {
    throw new Error(`AIO_CI_SESSION_PORT_GUARD: expected ${CI_POOLER_PORT}, got ${port}`);
  }
  if (DIRECT_DB_HOST_RE.test(host)) {
    throw new Error('AIO_SUPABASE_DIRECT_HOST_GUARD: CI must not use db.<ref>.supabase.co');
  }
  return `postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@${host}:${port}/postgres`;
}

export function parsePoolerTemplateMeta(template) {
  try {
    const url = new URL(template.replace('[YOUR-PASSWORD]', 'placeholder'));
    return {
      host: url.hostname,
      port: Number(url.port || CI_POOLER_PORT),
      database: url.pathname.replace(/^\//, '') || 'postgres',
      usernamePrefix: url.username.split('.')[0] ?? 'postgres',
      userIncludesProjectRef: url.username.includes('.'),
    };
  } catch {
    return { host: '', port: 0, database: 'postgres', usernamePrefix: 'postgres', userIncludesProjectRef: false };
  }
}

/** Fail if CI target is direct IPv6 host or transaction pooler port. */
export function assertCiTransportAllowed(templateOrUri) {
  const text = String(templateOrUri ?? '');
  if (DIRECT_DB_HOST_RE.test(text)) {
    return { ok: false, code: 'AIO_SUPABASE_DIRECT_HOST_GUARD', message: 'direct db host forbidden in CI' };
  }
  const meta = parsePoolerTemplateMeta(text);
  if (meta.port === CI_TRANSACTION_POOLER_PORT) {
    return {
      ok: false,
      code: 'AIO_SUPABASE_TRANSACTION_MODE_GUARD',
      message: `transaction pooler port ${CI_TRANSACTION_POOLER_PORT} forbidden for session-sensitive CI`,
    };
  }
  if (meta.port && meta.port !== CI_POOLER_PORT) {
    return { ok: false, code: 'AIO_SUPABASE_POOLER_PORT_GUARD', message: `expected port ${CI_POOLER_PORT}` };
  }
  if (!text.includes('pooler.supabase.com') && !text.includes('pooler.supabase.co')) {
    return { ok: false, code: 'AIO_SUPABASE_POOLER_HOST_GUARD', message: 'host is not a Supabase pooler' };
  }
  return { ok: true, code: 'OK', message: 'SUPAVISOR_SESSION', meta };
}

/**
 * Resolve pooler template: full URL secret > existing pooler-url > derived session template.
 */
export function resolvePoolerTemplate({
  poolerPath = DEFAULT_POOLER_URL_PATH,
  projectRef = process.env.SUPABASE_PROJECT_ID ?? AIO_CANONICAL_PROJECT_REF,
} = {}) {
  const full = process.env.AIO_SUPABASE_POOLER_URL?.trim() || process.env.SUPABASE_POOLER_URL?.trim();
  if (full) {
    const normalized = full.includes('[YOUR-PASSWORD]')
      ? full
      : full.replace(/:[^:@/]+@/, ':[YOUR-PASSWORD]@');
    return { template: normalized, source: 'secret_url' };
  }
  if (existsSync(poolerPath)) {
    const existing = readFileSync(poolerPath, 'utf8').trim();
    if (existing) return { template: existing, source: 'pooler_url_file' };
  }
  return { template: buildSessionPoolerTemplate({ projectRef }), source: 'derived_region_host' };
}

/** Write canonical session pooler template for psql + CLI (before or after link). */
export function ensurePoolerUrlFile(options = {}) {
  const poolerPath = options.poolerPath ?? DEFAULT_POOLER_URL_PATH;
  const { template, source } = resolvePoolerTemplate(options);
  const guard = assertCiTransportAllowed(template);
  if (!guard.ok) {
    throw new Error(`${guard.code}: ${guard.message}`);
  }
  mkdirSync(dirname(poolerPath), { recursive: true });
  writeFileSync(poolerPath, `${template}\n`);
  return { poolerPath, source, meta: guard.meta };
}

export function getPercentEncodedPoolerDbUrl(options = {}) {
  const password = options.password ?? process.env.SUPABASE_DB_PASSWORD ?? '';
  if (!password) {
    throw new Error('AIO_SUPABASE_DB_AUTH_FAILURE: missing SUPABASE_DB_PASSWORD');
  }
  const { template } = resolvePoolerTemplate(options);
  const guard = assertCiTransportAllowed(template);
  if (!guard.ok) {
    throw new Error(`${guard.code}: ${guard.message}`);
  }
  const uri = template.replace('[YOUR-PASSWORD]', encodeURIComponent(password));
  return encodeURIComponent(uri);
}

export function exportEncodedDbUrlToGithubEnv() {
  const encoded = getPercentEncodedPoolerDbUrl();
  const gh = process.env.GITHUB_ENV;
  if (gh) {
    appendFileSync(gh, `AIO_CI_DB_URL=${encoded}\n`);
    appendFileSync(gh, `AIO_CI_DATABASE_TRANSPORT=${CI_DATABASE_TRANSPORT}\n`);
    appendFileSync(gh, `AIO_CI_POOLER_PORT=${CI_POOLER_PORT}\n`);
  }
  return encoded;
}
