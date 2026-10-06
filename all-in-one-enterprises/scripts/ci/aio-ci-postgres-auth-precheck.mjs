#!/usr/bin/env node
/**
 * Postgres auth handshake precheck using raw AIO_CI_DB_URL.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { validateAioCiDatabaseUrl, sanitizeDatabaseUrlForLog } from './aio-ci-db-url.mjs';
import { redactSecrets } from './aio-ci-db.mjs';
import { AIO_CANONICAL_PROJECT_REF } from './aio-ci-db.mjs';

const RESULTS_PATH = process.env.AIO_CI_RESULTS_PATH ?? '.ci/aio-validation-results.json';

function record(status, classification, detail) {
  const data = existsSync(RESULTS_PATH) ? JSON.parse(readFileSync(RESULTS_PATH, 'utf8')) : { project: AIO_CANONICAL_PROJECT_REF };
  data.postgresAuthPrecheck = { status, classification, detail };
  data.databaseConnectivity = data.databaseConnectivity ?? {};
  if (status === 'PASS') {
    data.databaseConnectivity.status = data.databaseConnectivity.status ?? 'PASS';
  }
  writeFileSync(RESULTS_PATH, `${JSON.stringify(data, null, 2)}\n`);
}

function main() {
  const url = process.env.AIO_CI_DB_URL?.trim();
  if (!url) {
    console.error('FAIL: AIO_CI_DB_URL_MALFORMED — not set');
    record('FAIL', 'AIO_CI_DB_URL_MALFORMED', 'missing env');
    process.exit(1);
  }

  try {
    validateAioCiDatabaseUrl(url);
  } catch (err) {
    console.error(`FAIL: ${err.message}`);
    record('FAIL', err.message.split(':')[0], err.message);
    process.exit(1);
  }

  console.log('=== Postgres auth precheck ===');
  console.log('SANITIZED_DSN:', sanitizeDatabaseUrlForLog(url));

  try {
    const out = execFileSync('psql', [url, '-v', 'ON_ERROR_STOP=1', '-Atc', 'select 1;'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (out.trim() !== '1') {
      throw new Error('unexpected probe result');
    }
    console.log('POSTGRES AUTH PRECHECK: PASS');
    record('PASS', 'OK', 'select 1');
  } catch (err) {
    const stderr = redactSecrets(err.stderr?.toString?.() ?? String(err.message ?? err));
    let classification = 'AIO_CI_DB_UNKNOWN_CONNECTION_FAILURE';
    if (/password authentication failed/i.test(stderr)) classification = 'AIO_CI_DB_AUTH_FAILURE';
    else if (/SSL/i.test(stderr)) classification = 'AIO_CI_DB_SSL_FAILURE';
    else if (/does not exist/i.test(stderr)) classification = 'AIO_CI_DB_DATABASE_NOT_FOUND';
    console.error(`FAIL: ${classification}`);
    console.error(`DETAIL: ${stderr.slice(0, 500)}`);
    record('FAIL', classification, stderr.slice(0, 500));
    process.exit(1);
  }
}

main();
