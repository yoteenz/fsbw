#!/usr/bin/env node
/**
 * Build sanitized link permission diagnostic JSON + logs for CI artifacts.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { sanitizeLinkDebugOutput, scanSanitizedForLeaks } from './aio-link-debug-redaction.mjs';
import {
  parseLinkAuthorizationDiagnostic,
  isAuthorizationLinkFailure,
} from './aio-link-permission-parser.mjs';
import { AIO_CANONICAL_PROJECT_REF } from './aio-ci-db.mjs';

const ROOT = join(import.meta.dirname, '../..');
const DIAG_DIR = process.env.AIO_LINK_DIAG_DIR ?? join(ROOT, '.ci/aio-link-diagnostic');
const RESULTS_PATH = process.env.AIO_CI_RESULTS_PATH ?? join(ROOT, '.ci/aio-validation-results.json');

function readOpt(path) {
  if (!path || !existsSync(path)) return '';
  return readFileSync(path, 'utf8');
}

function writeGithubSummary(markdown) {
  const p = process.env.GITHUB_STEP_SUMMARY;
  if (!p) return;
  appendFileSync(p, `\n${markdown}\n`);
}

async function optionalMgmtProbe() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const ref = process.env.SUPABASE_PROJECT_ID ?? AIO_CANONICAL_PROJECT_REF;
  if (!token) return { attempted: false, status: null, bodySnippet: '' };

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    const text = await res.text();
    return {
      attempted: true,
      status: res.status,
      bodySnippet: sanitizeLinkDebugOutput(text.slice(0, 4000)),
    };
  } catch (err) {
    return {
      attempted: true,
      status: null,
      bodySnippet: sanitizeLinkDebugOutput(String(err.message ?? err)),
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const linkStdout = readOpt(getArg('--link-stdout'));
  const linkStderr = readOpt(getArg('--link-stderr'));
  const debugStdout = readOpt(getArg('--debug-stdout'));
  const debugStderr = readOpt(getArg('--debug-stderr'));

  const combinedRaw = [linkStdout, linkStderr, debugStdout, debugStderr].join('\n');
  const sanitized = sanitizeLinkDebugOutput(combinedRaw);

  const leakScan = scanSanitizedForLeaks(sanitized, {
    knownPasswords: [
      process.env.SUPABASE_DB_PASSWORD,
      process.env.AIO_SUPABASE_SERVICE_ROLE_KEY,
    ].filter(Boolean),
  });

  let parsed = parseLinkAuthorizationDiagnostic(sanitized);

  if (parsed.missing_permissions.length === 0 && isAuthorizationLinkFailure(sanitized)) {
    const probe = await optionalMgmtProbe();
    if (probe.attempted) {
      const probeParsed = parseLinkAuthorizationDiagnostic(probe.bodySnippet);
      if (probeParsed.missing_permissions.length > 0) {
        parsed = { ...parsed, ...probeParsed, endpoint: probeParsed.endpoint ?? 'GET /v1/projects/{ref}' };
      }
      if (!parsed.http_status && probe.status) parsed.http_status = probe.status;
    }
  }

  mkdirSync(DIAG_DIR, { recursive: true });
  writeFileSync(join(DIAG_DIR, 'sanitized-link-debug.log'), `${sanitized}\n`);

  const diagnostic = {
    timestamp: new Date().toISOString(),
    workflow_run_id: process.env.GITHUB_RUN_ID ?? null,
    commit_sha: process.env.GITHUB_SHA ?? null,
    cli_version: process.env.SUPABASE_CLI_VERSION ?? null,
    network_precheck: 'PASS',
    pooler_mode: 'SUPAVISOR_SESSION',
    link_status: 'FAIL',
    http_status: parsed.http_status,
    endpoint: parsed.endpoint,
    missing_permissions: parsed.missing_permissions,
    ui_permissions: parsed.ui_permissions,
    required_access_levels: parsed.required_access_levels,
    classification: parsed.classification,
    secret_redaction_pass: leakScan.pass,
    secret_leak_findings: leakScan.leaks,
    next_action:
      parsed.missing_permissions.length > 0
        ? `Update scoped PAT: grant ${parsed.missing_permissions.join(', ')} (${parsed.ui_permissions.join('; ')})`
        : 'Re-run workflow after adding permissions identified in sanitized-link-debug.log or Management API probe',
  };

  writeFileSync(join(DIAG_DIR, 'aio-link-permission-diagnostic.json'), `${JSON.stringify(diagnostic, null, 2)}\n`);

  const data = existsSync(RESULTS_PATH) ? JSON.parse(readFileSync(RESULTS_PATH, 'utf8')) : {};
  data.supabaseLink = 'FAIL';
  data.linkPermissionDiagnostic = diagnostic;
  data.finalClassification = diagnostic.classification;
  writeFileSync(RESULTS_PATH, `${JSON.stringify(data, null, 2)}\n`);

  const summary = `## AIO Supabase link diagnostic

| Check | Status |
|-------|--------|
| NETWORK / POOLER | PASS |
| ACCESS TOKEN PRESENT | ${process.env.SUPABASE_ACCESS_TOKEN ? 'YES' : 'NO'} |
| PROJECT REF PRESENT | ${process.env.SUPABASE_PROJECT_ID ? 'YES' : 'NO'} |
| LINK | FAIL |
| HTTP | ${diagnostic.http_status ?? 'UNKNOWN'} |
| MISSING PERMISSION | ${diagnostic.missing_permissions.length ? diagnostic.missing_permissions.join(', ') : 'UNKNOWN'} |
| SUPABASE UI PERMISSION | ${diagnostic.ui_permissions.length ? diagnostic.ui_permissions.join(', ') : 'UNKNOWN'} |
| ACCESS REQUIRED | ${diagnostic.required_access_levels.length ? diagnostic.required_access_levels.join(', ') : 'UNKNOWN'} |
| DEBUG SANITIZATION | ${leakScan.pass ? 'PASS' : 'FAIL'} |

**Next human action:** Recreate or update the scoped PAT with the missing capability(ies) above. Do not rotate until confirmed in Supabase dashboard.
`;
  writeGithubSummary(summary);

  console.log('LINK DIAGNOSTIC CLASSIFICATION:', diagnostic.classification);
  console.log('HTTP:', diagnostic.http_status ?? 'UNKNOWN');
  console.log('ENDPOINT:', diagnostic.endpoint ?? 'UNKNOWN');
  console.log('MISSING PERMISSIONS:', diagnostic.missing_permissions.length ? diagnostic.missing_permissions.join(', ') : 'UNKNOWN');
  console.log('UI PERMISSIONS:', diagnostic.ui_permissions.length ? diagnostic.ui_permissions.join(', ') : 'UNKNOWN');
  console.log('SECRET LEAK SCAN:', leakScan.pass ? 'PASS' : 'FAIL');

  if (!leakScan.pass) {
    process.exit(2);
  }
}

main().catch((err) => {
  console.error('Link diagnostic failed:', err.message);
  process.exit(1);
});
