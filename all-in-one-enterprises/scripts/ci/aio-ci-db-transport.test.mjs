#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  buildSessionPoolerTemplate,
  assertCiTransportAllowed,
  CI_POOLER_PORT,
  CI_DATABASE_TRANSPORT,
} from './aio-ci-db-transport.mjs';
import { buildAioCiDatabaseUrl } from './aio-ci-db-url.mjs';
import { resolvePoolerUri, AIO_CANONICAL_PROJECT_REF } from './aio-ci-db.mjs';

function testSessionTemplate() {
  const t = buildSessionPoolerTemplate({ projectRef: AIO_CANONICAL_PROJECT_REF });
  assert.ok(t.includes('pooler.supabase.com'));
  assert.ok(t.includes(`:${CI_POOLER_PORT}/`));
  assert.ok(t.includes(`postgres.${AIO_CANONICAL_PROJECT_REF}`));
  assert.equal(assertCiTransportAllowed(t).ok, true);
  console.log('OK: session pooler template');
}

function testDirectHostGuard() {
  const bad = `postgresql://postgres.${AIO_CANONICAL_PROJECT_REF}:[YOUR-PASSWORD]@db.${AIO_CANONICAL_PROJECT_REF}.supabase.co:5432/postgres`;
  const g = assertCiTransportAllowed(bad);
  assert.equal(g.ok, false);
  assert.equal(g.code, 'AIO_SUPABASE_DIRECT_HOST_GUARD');
  console.log('OK: direct host guard');
}

function testTransactionPortGuard() {
  const bad = `postgresql://postgres.${AIO_CANONICAL_PROJECT_REF}:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres`;
  const g = assertCiTransportAllowed(bad);
  assert.equal(g.ok, false);
  assert.equal(g.code, 'AIO_SUPABASE_TRANSACTION_MODE_GUARD');
  console.log('OK: transaction port guard');
}

function testRawDbUrlNotFullyEncoded() {
  process.env.SUPABASE_DB_PASSWORD = 'unit-test-pass';
  const url = buildAioCiDatabaseUrl();
  assert.match(url, /^postgresql:\/\//);
  assert.ok(!url.includes('[YOUR-PASSWORD]'));
  delete process.env.SUPABASE_DB_PASSWORD;
  console.log('OK: raw db url (not full-uri encoded)');
}

function testResolvePoolerRejects6543() {
  const dir = mkdtempSync(join(tmpdir(), 'aio-transport-'));
  const poolerPath = join(dir, 'pooler-url');
  writeFileSync(
    poolerPath,
    `postgresql://postgres.${AIO_CANONICAL_PROJECT_REF}:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres`,
  );
  try {
    const r = resolvePoolerUri({ password: 'x', poolerPath, projectRef: AIO_CANONICAL_PROJECT_REF });
    assert.equal(r.ok, false);
    assert.equal(r.method, 'pooler-transaction');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log('OK: resolvePoolerUri rejects 6543');
}

assert.equal(CI_DATABASE_TRANSPORT, 'SUPAVISOR_SESSION');

testSessionTemplate();
testDirectHostGuard();
testTransactionPortGuard();
testRawDbUrlNotFullyEncoded();
testResolvePoolerRejects6543();

console.log('All aio-ci-db-transport tests passed.');
