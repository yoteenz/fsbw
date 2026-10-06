#!/usr/bin/env node
import assert from 'node:assert/strict';
import {
  extractMissingPermissions,
  extractHttpStatus,
  extractEndpoint,
  parseLinkAuthorizationDiagnostic,
  isAuthorizationLinkFailure,
} from './aio-link-permission-parser.mjs';
import { sanitizeLinkDebugOutput, scanSanitizedForLeaks } from './aio-link-debug-redaction.mjs';

const sample403 = `
HTTP 403 Forbidden
GET /v1/projects/nnnljnhtmseagotvgxxt/config/auth
{"message":"Forbidden","missing_permissions":["api_keys:read","project_settings:read"]}
Authorization: Bearer sbp_01234567890123456789012345678901234567890123456789012
`;

function testMultiPermissionParse() {
  const perms = extractMissingPermissions(sample403);
  assert.ok(perms.includes('api_keys:read'));
  assert.ok(perms.includes('project_settings:read'));
  console.log('OK: multi-permission parse');
}

function testHttpStatus() {
  assert.equal(extractHttpStatus(sample403), 403);
  console.log('OK: http status');
}

function testEndpoint() {
  const ep = extractEndpoint(sample403);
  assert.ok(ep?.includes('/v1/projects/'));
  console.log('OK: endpoint extract');
}

function testDiagnosticMapping() {
  const d = parseLinkAuthorizationDiagnostic(sample403);
  assert.equal(d.classification, 'AIO_SUPABASE_PAT_PERMISSION_MISSING');
  assert.equal(d.http_status, 403);
  assert.ok(d.ui_permissions.some((u) => u.includes('API Keys')));
  console.log('OK: diagnostic mapping');
}

function testSanitization() {
  const sanitized = sanitizeLinkDebugOutput(sample403);
  assert.ok(!sanitized.includes('sbp_01234567890123456789012345678901234567890123456789012'));
  assert.ok(sanitized.includes('[REDACTED]'));
  const scan = scanSanitizedForLeaks(sanitized, { knownPasswords: ['super-secret-db-pass'] });
  assert.equal(scan.pass, true);
  console.log('OK: sanitization + leak scan');
}

function testLeakScanFailsOnPassword() {
  const scan = scanSanitizedForLeaks('error detail super-secret-db-pass leaked', {
    knownPasswords: ['super-secret-db-pass'],
  });
  assert.equal(scan.pass, false);
  console.log('OK: leak scan catches password');
}

function testUnresolved() {
  const d = parseLinkAuthorizationDiagnostic('link failed for unknown reason');
  assert.equal(d.missing_permissions.length, 0);
  console.log('OK: unresolved without guess');
}

function testAuthFailureDetector() {
  assert.equal(isAuthorizationLinkFailure(sample403), true);
  console.log('OK: auth failure detector');
}

testMultiPermissionParse();
testHttpStatus();
testEndpoint();
testDiagnosticMapping();
testSanitization();
testLeakScanFailsOnPassword();
testUnresolved();
testAuthFailureDetector();

console.log('All aio-link-permission-parser tests passed.');
