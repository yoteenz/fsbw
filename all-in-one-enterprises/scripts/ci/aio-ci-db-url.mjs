#!/usr/bin/env node
/**
 * Canonical raw PostgreSQL DSN for AIO CI (Supavisor session pooler).
 * Never percent-encode the full URI — password component only.
 */
import { randomBytes } from 'node:crypto';
import { appendFileSync } from 'node:fs';
import {
  resolvePoolerTemplate,
  assertCiTransportAllowed,
  CI_POOLER_PORT,
  CI_DATABASE_TRANSPORT,
  encodePasswordComponent,
} from './aio-ci-db-transport.mjs';
import { AIO_CANONICAL_PROJECT_REF, assertAioProjectRef } from './aio-ci-db.mjs';

export const DEFAULT_SSL_MODE = 'require';

export { encodePasswordComponent };

export function buildAioCiDatabaseUrl(options = {}) {
  const password = options.password ?? process.env.SUPABASE_DB_PASSWORD ?? '';
  const projectRef = options.projectRef ?? process.env.SUPABASE_PROJECT_ID ?? AIO_CANONICAL_PROJECT_REF;
  assertAioProjectRef(projectRef);

  if (!password) {
    throw new Error('AIO_CI_DB_AUTH_FAILURE: missing SUPABASE_DB_PASSWORD');
  }

  const { template } = resolvePoolerTemplate(options);
  const guard = assertCiTransportAllowed(template);
  if (!guard.ok) {
    throw new Error(`${guard.code}: ${guard.message}`);
  }

  let base = template.replace('[YOUR-PASSWORD]', encodePasswordComponent(password));
  if (!base.includes('sslmode=')) {
    base += base.includes('?') ? '&sslmode=require' : '?sslmode=require';
  }

  validateAioCiDatabaseUrl(base, { projectRef });
  return base;
}

export function validateAioCiDatabaseUrl(url, { projectRef = AIO_CANONICAL_PROJECT_REF } = {}) {
  const s = String(url ?? '').trim();
  if (!s) {
    throw new Error('AIO_CI_DB_URL_MALFORMED: empty');
  }
  if (/^postgres(?:ql)?%3A/i.test(s) || /^postgres%3A/i.test(s)) {
    throw new Error('AIO_CI_DB_URL_FULL_URI_PERCENT_ENCODED');
  }
  if (!/^postgres(?:ql)?:\/\//i.test(s)) {
    throw new Error('AIO_CI_DB_URL_MALFORMED: scheme must be postgresql:// or postgres://');
  }

  let parsed;
  try {
    parsed = new URL(s);
  } catch {
    throw new Error('AIO_CI_DB_URL_MALFORMED: URL parse failed');
  }

  if (/^db\.[a-z0-9]+\.supabase\.co$/i.test(parsed.hostname)) {
    throw new Error('AIO_CI_DIRECT_IPV6_HOST_FORBIDDEN');
  }
  const port = Number(parsed.port || CI_POOLER_PORT);
  if (port === 6543) {
    throw new Error('AIO_CI_TRANSACTION_POOLER_FORBIDDEN_FOR_SESSION_PATH');
  }
  if (port !== CI_POOLER_PORT) {
    throw new Error(`AIO_CI_DB_URL_MALFORMED: expected port ${CI_POOLER_PORT}`);
  }

  const expectedUser = `postgres.${projectRef}`;
  if (parsed.username !== expectedUser) {
    throw new Error(`AIO_CI_DB_URL_MALFORMED: username must be ${expectedUser}`);
  }
  if (!parsed.password) {
    throw new Error('AIO_CI_DB_URL_MALFORMED: missing password');
  }
  if (parsed.pathname.replace(/^\//, '') !== 'postgres') {
    throw new Error('AIO_CI_DB_URL_MALFORMED: database must be postgres');
  }

  const ssl = parsed.searchParams.get('sslmode');
  if (ssl && !['require', 'verify-full', 'verify-ca', 'prefer'].includes(ssl)) {
    throw new Error('AIO_CI_DB_SSL_FAILURE: unsupported sslmode');
  }

  return {
    scheme: parsed.protocol.replace(':', ''),
    host: parsed.hostname,
    port,
    database: 'postgres',
    username: parsed.username,
    sslmode: ssl ?? DEFAULT_SSL_MODE,
  };
}

export function sanitizeDatabaseUrlForLog(url) {
  try {
    const u = new URL(url);
    const user = u.username.includes('.') ? u.username.split('.')[0] + '.<ref>' : u.username;
    return `postgresql://${user}:***@${u.hostname}:${u.port || CI_POOLER_PORT}${u.pathname}${u.search}`;
  } catch {
    return 'postgresql://***:***@[invalid]';
  }
}

export function exportRawDbUrlToGithubEnv(options = {}) {
  const url = buildAioCiDatabaseUrl(options);
  const meta = validateAioCiDatabaseUrl(url, options);

  const gh = process.env.GITHUB_ENV;
  if (gh) {
    const delimiter = `EOF_AIO_CI_DB_URL_${randomBytes(8).toString('hex')}`;
    appendFileSync(gh, `AIO_CI_DB_URL<<${delimiter}\n${url}\n${delimiter}\n`);
    appendFileSync(gh, `AIO_CI_DATABASE_TRANSPORT=${CI_DATABASE_TRANSPORT}\n`);
    appendFileSync(gh, `AIO_CI_POOLER_PORT=${CI_POOLER_PORT}\n`);
  }

  console.log('AIO_CI_DB_URL validation: PASS');
  console.log('SANITIZED_DSN:', sanitizeDatabaseUrlForLog(url));
  console.log('SESSION_POOLER_HOST:', meta.host);
  console.log('SESSION_POOLER_USERNAME:', `postgres.<ref>`);
  console.log('SSL_MODE:', meta.sslmode);

  return url;
}

