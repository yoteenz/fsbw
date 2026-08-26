#!/usr/bin/env node
/**
 * Unit tests for AIO migration history check (fail-closed semantics).
 */
import assert from 'node:assert/strict';
import {
  parseRemoteVersionsFromCliOutput,
  parseRemoteVersionsFromSqlOutput,
  compareHistories,
  evaluateHistoryCheck,
} from './aio-migration-history-lib.mjs';

const CANONICAL = [
  '20260815100000',
  '20260815110000',
  '20260815120000',
  '20260815130000',
  '20260815140000',
  '20260815150000',
  '20260815160000',
  '20260815170000',
  '20260816170000',
  '20260817180000',
  '20260817190000',
  '20260817200000',
  '20260819120000',
  '20260819140000',
  '20260819150000',
  '20260826200000',
];

function cliTable(remoteVersions) {
  const header = '   Local          | Remote         | Time (UTC)';
  const sep = '  ────────────────┼────────────────┼────────────';
  const rows = remoteVersions.map(
    (v) => `   ${v} | ${v} | 2026-08-15 10:00:00`,
  );
  return ['Connecting to remote database...', header, sep, ...rows].join('\n');
}

function testCaseA_match() {
  const parsed = parseRemoteVersionsFromCliOutput(cliTable(CANONICAL));
  assert.deepEqual(parsed.versions, CANONICAL);
  assert.equal(parsed.malformed, false);

  const result = evaluateHistoryCheck({
    localVersions: CANONICAL,
    remoteVersions: parsed.versions,
    remoteQueryOk: true,
    malformed: false,
    remoteMethod: 'supabase-cli',
  });

  assert.equal(result.remoteQueryStatus, 'PASS');
  assert.equal(result.historyStatus, 'MATCH');
  assert.equal(result.remoteCount, 16);
  assert.equal(result.exitCode, 0);
  console.log('OK: case A — local 16 / remote 16 exact match');
}

function testCaseB_mismatch() {
  const remote = CANONICAL.slice(0, 15);
  const parsed = parseRemoteVersionsFromCliOutput(cliTable(remote));
  const result = evaluateHistoryCheck({
    localVersions: CANONICAL,
    remoteVersions: parsed.versions,
    remoteQueryOk: true,
    malformed: false,
    remoteMethod: 'supabase-cli',
  });

  assert.equal(result.remoteQueryStatus, 'PASS');
  assert.equal(result.historyStatus, 'MISMATCH');
  assert.ok(result.localOnly.includes('20260826200000'));
  assert.notEqual(result.exitCode, 0);
  console.log('OK: case B — actual remote mismatch');
}

function testCaseC_connectionFailure() {
  const result = evaluateHistoryCheck({
    localVersions: CANONICAL,
    remoteVersions: [],
    remoteQueryOk: false,
    remoteMethod: 'supabase-cli',
  });

  assert.equal(result.remoteQueryStatus, 'FAIL');
  assert.equal(result.connectionStatus, 'FAIL');
  assert.equal(result.historyStatus, 'UNKNOWN');
  assert.equal(result.remoteCount, null);
  assert.notEqual(result.exitCode, 0);
  assert.deepEqual(result.remoteOnly, []);
  assert.deepEqual(result.localOnly, []);
  console.log('OK: case C — remote connection/query failure (not zero remote)');
}

function testCaseD_malformedOutput() {
  const parsed = parseRemoteVersionsFromCliOutput('garbage line\nnot a table\n');
  assert.equal(parsed.malformed, true);
  assert.deepEqual(parsed.versions, []);

  const result = evaluateHistoryCheck({
    localVersions: CANONICAL,
    remoteVersions: parsed.versions,
    remoteQueryOk: true,
    malformed: parsed.malformed,
    remoteMethod: 'supabase-cli',
  });

  assert.equal(result.remoteQueryStatus, 'FAIL');
  assert.equal(result.historyStatus, 'UNKNOWN');
  assert.equal(result.remoteCount, null);
  assert.notEqual(result.exitCode, 0);
  console.log('OK: case D — malformed remote output fails closed');
}

function testSqlParser() {
  const sql = CANONICAL.join('\n');
  const parsed = parseRemoteVersionsFromSqlOutput(sql);
  assert.deepEqual(parsed.versions, CANONICAL);
  assert.equal(parsed.malformed, false);

  const bad = parseRemoteVersionsFromSqlOutput('psql: error: connection refused\n');
  assert.equal(bad.malformed, true);
  assert.deepEqual(bad.versions, []);
  console.log('OK: SQL output parser');
}

function testCompareHistories() {
  const cmp = compareHistories(CANONICAL, CANONICAL);
  assert.equal(cmp.historyStatus, 'MATCH');
  const cmp2 = compareHistories(CANONICAL, ['99999999999999']);
  assert.equal(cmp2.historyStatus, 'MISMATCH');
  console.log('OK: compareHistories');
}

testCaseA_match();
testCaseB_mismatch();
testCaseC_connectionFailure();
testCaseD_malformedOutput();
testSqlParser();
testCompareHistories();

console.log('All aio-migration-history-check unit tests passed.');
