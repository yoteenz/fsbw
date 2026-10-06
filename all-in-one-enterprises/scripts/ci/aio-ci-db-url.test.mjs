#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  buildAioCiDatabaseUrl,
  validateAioCiDatabaseUrl,
  sanitizeDatabaseUrlForLog,
  encodePasswordComponent,
} from './aio-ci-db-url.mjs';
import { AIO_CANONICAL_PROJECT_REF } from './aio-ci-db.mjs';

const HOST = 'aws-0-us-west-2.pooler.supabase.com';

function testRawScheme() {
  process.env.SUPABASE_DB_PASSWORD = 'simple-pass';
  const url = buildAioCiDatabaseUrl({
    password: 'simple-pass',
    projectRef: AIO_CANONICAL_PROJECT_REF,
  });
  assert.match(url, /^postgresql:\/\//);
  assert.ok(!url.startsWith('postgresql%3A'));
  delete process.env.SUPABASE_DB_PASSWORD;
  console.log('OK: raw postgresql:// scheme');
}

function testPasswordReservedChars() {
  const pw = 'abc@123:xyz/?#&=+';
  const enc = encodePasswordComponent(pw);
  assert.ok(enc.includes('%40'));
  assert.ok(enc.includes('%3A'));
  assert.equal(encodePasswordComponent(enc), enc);
  const url = `postgresql://postgres.${AIO_CANONICAL_PROJECT_REF}:${enc}@${HOST}:5432/postgres?sslmode=require`;
  validateAioCiDatabaseUrl(url, { projectRef: AIO_CANONICAL_PROJECT_REF });
  console.log('OK: password component encoding');
}

function testFullUriEncodingRejected() {
  assert.throws(
    () => validateAioCiDatabaseUrl(`postgresql%3A%2F%2Fpostgres.${AIO_CANONICAL_PROJECT_REF}:x@${HOST}:5432/postgres`),
    /AIO_CI_DB_URL_FULL_URI_PERCENT_ENCODED/,
  );
  console.log('OK: full URI percent encoding rejected');
}

function testDirectHostRejected() {
  const url = `postgresql://postgres.${AIO_CANONICAL_PROJECT_REF}:x@db.${AIO_CANONICAL_PROJECT_REF}.supabase.co:5432/postgres?sslmode=require`;
  assert.throws(() => validateAioCiDatabaseUrl(url), /AIO_CI_DIRECT_IPV6_HOST_FORBIDDEN/);
  console.log('OK: direct host rejected');
}

function testTransactionPortRejected() {
  const url = `postgresql://postgres.${AIO_CANONICAL_PROJECT_REF}:x@${HOST}:6543/postgres?sslmode=require`;
  assert.throws(() => validateAioCiDatabaseUrl(url), /AIO_CI_TRANSACTION_POOLER_FORBIDDEN/);
  console.log('OK: port 6543 rejected');
}

function testSanitizedLog() {
  const url = `postgresql://postgres.${AIO_CANONICAL_PROJECT_REF}:secret@${HOST}:5432/postgres?sslmode=require`;
  const s = sanitizeDatabaseUrlForLog(url);
  assert.ok(!s.includes('secret'));
  assert.ok(s.includes('***'));
  console.log('OK: sanitized log');
}

testRawScheme();
testPasswordReservedChars();
testFullUriEncodingRejected();
testDirectHostRejected();
testTransactionPortRejected();
testSanitizedLog();

console.log('All aio-ci-db-url tests passed.');
