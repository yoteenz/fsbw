#!/usr/bin/env node
/**
 * Unit tests for canonical AIO CI database connection + schema/RLS verification.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  resolvePoolerUri,
  runPoolerSql,
  runConnectivityPreflight,
  redactSecrets,
  assertAioProjectRef,
  AIO_CANONICAL_PROJECT_REF,
  FS_FORBIDDEN_PROJECT_REF,
} from './aio-ci-db.mjs';
import { verifySchemaAndRls, REQUIRED_TABLES, RLS_TABLES, SERVICE_ROLE_GRANT_TABLES } from './aio-verify-schema.mjs';

const POOLER_TEMPLATE = `postgresql://postgres.${AIO_CANONICAL_PROJECT_REF}:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

function withTempPooler(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'aio-ci-db-'));
  const poolerPath = join(dir, 'pooler-url');
  writeFileSync(poolerPath, POOLER_TEMPLATE);
  try {
    fn(poolerPath);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function testPoolerResolution() {
  withTempPooler((poolerPath) => {
    const ok = resolvePoolerUri({
      password: 'test-pass',
      poolerPath,
      projectRef: AIO_CANONICAL_PROJECT_REF,
    });
    assert.equal(ok.ok, true);
    assert.equal(ok.method, 'pooler');
    assert.ok(ok.uri.includes('pooler.supabase.com'));
    assert.ok(!ok.uri.includes('[YOUR-PASSWORD]'));
    assert.ok(!ok.uri.includes('db.'));
  });
  console.log('OK: pooler connection resolution');
}

function testDirectHostRejected() {
  const dir = mkdtempSync(join(tmpdir(), 'aio-ci-db-direct-'));
  const poolerPath = join(dir, 'pooler-url');
  writeFileSync(
    poolerPath,
    `postgresql://postgres:${AIO_CANONICAL_PROJECT_REF}@db.${AIO_CANONICAL_PROJECT_REF}.supabase.co:5432/postgres`,
  );
  try {
    const result = resolvePoolerUri({
      password: 'x',
      poolerPath,
      projectRef: AIO_CANONICAL_PROJECT_REF,
    });
    assert.equal(result.ok, false);
    assert.equal(result.method, 'direct-postgres');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log('OK: direct db host rejected');
}

function testForbiddenProject() {
  assert.throws(
    () => assertAioProjectRef(FS_FORBIDDEN_PROJECT_REF),
    /forbidden Frontal Slayer/,
  );
  console.log('OK: forbidden Frontal Slayer project');
}

function testSecretRedaction() {
  const raw =
    'postgresql://postgres:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres password=abc';
  const red = redactSecrets(raw);
  assert.ok(!red.includes('secret'));
  assert.ok(!red.includes('password=abc'));
  assert.ok(red.includes('[REDACTED]'));
  console.log('OK: secret redaction');
}

function testConnectivityFailure() {
  withTempPooler((poolerPath) => {
    const result = runConnectivityPreflight({
      password: 'bad',
      poolerPath,
      projectRef: AIO_CANONICAL_PROJECT_REF,
    });
    assert.equal(result.connectivity, 'FAIL');
    assert.equal(result.queryOk, false);
  });
  console.log('OK: connection failure fail-closed');
}

function testSchemaPresentPass() {
  const sqlResponses = new Map();
  for (const t of REQUIRED_TABLES) {
    sqlResponses.set(
      `select count(*)::text from information_schema.tables where table_schema='public' and table_name='${t}';`,
      { queryOk: true, stdout: '1\n' },
    );
  }
  for (const t of RLS_TABLES) {
    sqlResponses.set(
      `select case when c.relrowsecurity then 't' else 'f' end from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='${t}';`,
      { queryOk: true, stdout: 't\n' },
    );
  }
  for (const t of SERVICE_ROLE_GRANT_TABLES) {
    sqlResponses.set(
      `select case when has_table_privilege('service_role', 'public.${t}', 'INSERT') then 't' else 'f' end;`,
      { queryOk: true, stdout: 't\n' },
    );
  }

  const runSql = (q) => sqlResponses.get(q) ?? { queryOk: false, stdout: '', stderr: 'missing mock' };
  const result = verifySchemaAndRls({ runSql });
  assert.equal(result.schemaStatus, 'PASS');
  assert.equal(result.rlsStatus, 'PASS');
  assert.equal(result.exitCode, 0);
  console.log('OK: schema present + RLS enabled');
}

function testSchemaMissingFail() {
  const runSql = (q) => {
    if (q.includes('information_schema')) return { queryOk: true, stdout: '0\n' };
    if (q.includes('relrowsecurity')) return { queryOk: true, stdout: 't\n' };
    if (q.includes('has_table_privilege')) return { queryOk: true, stdout: 't\n' };
    return { queryOk: false, stdout: '', stderr: 'unexpected' };
  };
  const result = verifySchemaAndRls({ runSql });
  assert.equal(result.schemaStatus, 'FAIL');
  assert.ok(result.missing.length > 0);
  console.log('OK: required table missing => SCHEMA FAIL');
}

function testRlsDisabledFail() {
  const runSql = (q) => {
    if (q.includes('information_schema')) return { queryOk: true, stdout: '1\n' };
    if (q.includes('relrowsecurity')) return { queryOk: true, stdout: 'f\n' };
    if (q.includes('has_table_privilege')) return { queryOk: true, stdout: 't\n' };
    return { queryOk: false, stdout: '', stderr: 'unexpected' };
  };
  const result = verifySchemaAndRls({ runSql });
  assert.equal(result.rlsStatus, 'FAIL');
  assert.ok(result.rlsOff.length > 0);
  console.log('OK: required RLS disabled => RLS FAIL');
}

function testServiceRoleGrantMissingFail() {
  const runSql = (q) => {
    if (q.includes('information_schema')) return { queryOk: true, stdout: '1\n' };
    if (q.includes('relrowsecurity')) return { queryOk: true, stdout: 't\n' };
    if (q.includes('has_table_privilege')) return { queryOk: true, stdout: 'f\n' };
    return { queryOk: false, stdout: '', stderr: 'unexpected' };
  };
  const result = verifySchemaAndRls({ runSql });
  assert.equal(result.schemaStatus, 'FAIL');
  assert.ok(result.grantMissing.length > 0);
  console.log('OK: missing service_role INSERT grant => SCHEMA FAIL');
}

function testSqlQueryFailureUnknown() {
  const runSql = () => ({ queryOk: false, stdout: '', stderr: 'psql: connection refused' });
  const result = verifySchemaAndRls({ runSql });
  assert.equal(result.schemaStatus, 'UNKNOWN');
  assert.equal(result.rlsStatus, 'UNKNOWN');
  assert.notEqual(result.exitCode, 0);
  assert.deepEqual(result.missing, []);
  assert.deepEqual(result.rlsOff, []);
  console.log('OK: SQL query failure => UNKNOWN (never false PASS/FAIL)');
}

function testRunPoolerSqlResolutionFail() {
  const result = runPoolerSql('select 1;', { poolerPath: '/nonexistent/pooler-url' });
  assert.equal(result.queryOk, false);
  console.log('OK: runPoolerSql fails closed when pooler missing');
}

testPoolerResolution();
testDirectHostRejected();
testForbiddenProject();
testSecretRedaction();
testConnectivityFailure();
testSchemaPresentPass();
testSchemaMissingFail();
testRlsDisabledFail();
testServiceRoleGrantMissingFail();
testSqlQueryFailureUnknown();
testRunPoolerSqlResolutionFail();

console.log('All aio-ci-db + schema verification unit tests passed.');
