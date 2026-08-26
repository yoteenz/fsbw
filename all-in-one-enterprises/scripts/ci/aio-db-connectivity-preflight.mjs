#!/usr/bin/env node
/**
 * Database connectivity preflight for AIO CI (pooler only).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { runConnectivityPreflight, redactSecrets, AIO_CANONICAL_PROJECT_REF } from './aio-ci-db.mjs';

const RESULTS_PATH = process.env.AIO_CI_RESULTS_PATH ?? '.ci/aio-validation-results.json';

console.log('=== Database connectivity preflight ===');

const result = runConnectivityPreflight();

console.log(`DATABASE CONNECTION METHOD: ${result.connectionMethod}`);
console.log(`DATABASE CONNECTIVITY: ${result.connectivity}`);

if (result.error) {
  console.log(`DETAIL: ${redactSecrets(result.error)}`);
}

const data = existsSync(RESULTS_PATH)
  ? JSON.parse(readFileSync(RESULTS_PATH, 'utf8'))
  : { project: AIO_CANONICAL_PROJECT_REF };

data.databaseConnectivity = {
  method: result.connectionMethod,
  status: result.connectivity,
  queryOk: result.queryOk,
};

writeFileSync(RESULTS_PATH, `${JSON.stringify(data, null, 2)}\n`);

if (result.connectivity !== 'PASS') {
  console.error('FAIL: database connectivity preflight — aborting before SQL-heavy validation');
  process.exit(1);
}

console.log('Database connectivity preflight: PASS');
