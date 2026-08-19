#!/usr/bin/env node
/**
 * Master AIO production readiness orchestrator.
 * Reuses existing tests; does NOT duplicate aio-supabase-production-validate.yml migrations.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const RESULTS_PATH = process.env.AIO_READINESS_RESULTS_PATH ?? join(ROOT, '.ci/aio-production-readiness.json');
const REGISTRY_PATH = join(ROOT, 'tests/readiness/domain-registry.json');
const INVENTORY_PATH = join(ROOT, 'tests/readiness/platform-inventory.json');

const TEST_SCOPE = process.env.TEST_SCOPE ?? 'full-platform';
const DOMAIN_SELECT = process.env.DOMAIN_SELECT ?? 'all';
const VALIDATION_ENV = process.env.VALIDATION_ENV ?? 'qa-staging';
const QA_RUN_ID = process.env.QA_RUN_ID ?? `qa-${Date.now()}`;

const AIO_REF = 'nnnljnhtmseagotvgxxt';
const FS_REF = 'hyycomvcaqxxvyrfupes';

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', env: { ...process.env, QA_RUN_ID }, ...opts });
  return { ok: r.status === 0, code: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function mergeDomainStatus(map, id, label, status, detail, blocker = null) {
  map[id] = {
    id,
    label,
    status,
    detail: detail ?? null,
    blocker: blocker ?? (status === 'FAIL' || status === 'BLOCKED' ? 'P1' : null),
  };
}

const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8'));
const inventory = JSON.parse(readFileSync(INVENTORY_PATH, 'utf8'));

const results = {
  runId: QA_RUN_ID,
  timestamp: new Date().toISOString(),
  commit: process.env.GITHUB_SHA ?? 'local',
  testScope: TEST_SCOPE,
  domainSelect: DOMAIN_SELECT,
  validationEnv: VALIDATION_ENV,
  projectRef: AIO_REF,
  projectGuard: 'PASS',
  domains: {},
  crossCutting: {},
  blockers: { P0: 0, P1: 0, P2: 0, P3: 0 },
  finalReadiness: 'NOT READY TO DEPLOY — BLOCKERS REMAIN',
  externalDependencies: [],
  placeholderAudit: null,
};

mkdirSync(join(ROOT, '.ci'), { recursive: true });

const projectId = process.env.SUPABASE_PROJECT_ID ?? '';
if (projectId === FS_REF) {
  results.projectGuard = 'FAIL';
  mergeDomainStatus(results.domains, '_guard', 'PROJECT GUARD', 'FAIL', 'Forbidden FS project');
} else if (projectId && projectId !== AIO_REF) {
  results.projectGuard = 'FAIL';
  mergeDomainStatus(results.domains, '_guard', 'PROJECT GUARD', 'FAIL', 'Wrong SUPABASE_PROJECT_ID');
} else {
  results.projectGuard = 'PASS';
}

function domainInScope(domainId, def) {
  if (TEST_SCOPE === 'domain-select' && DOMAIN_SELECT !== 'all') {
    return domainId === DOMAIN_SELECT;
  }
  if (TEST_SCOPE === 'security-only') {
    return def.scopeGroups?.includes('security-only');
  }
  if (TEST_SCOPE === 'responsive-only') {
    return domainId.startsWith('responsive-');
  }
  if (TEST_SCOPE === 'core-operations') {
    return def.scopeGroups?.includes('core-operations') || def.scopeGroups?.includes('full-platform');
  }
  return true;
}

function runDomainTests(domainId, def) {
  const files = [...(def.readinessTests ?? []), ...(def.reuseTests ?? [])];
  if (!files.length) return true;
  const vt = run('npm', ['run', 'test', '--', ...files]);
  return vt.ok;
}

for (const [domainId, def] of Object.entries(registry.domains)) {
  if (!domainInScope(domainId, def)) continue;
  if (def.command) continue;
  if (def.script) continue;

  if (domainId === 'rls') {
    const hasLive = Boolean(process.env.AIO_STAGING_SUPABASE_URL || process.env.VITE_AIO_SUPABASE_URL);
    const hasJwt = Boolean(process.env.AIO_RLS_TEST_STAFF_JWT);
    if (!hasLive) {
      mergeDomainStatus(results.domains, domainId, def.label, 'BLOCKED', 'Missing live Supabase credentials');
      continue;
    }
    const ok = runDomainTests(domainId, def);
    mergeDomainStatus(results.domains, domainId, def.label, hasJwt && ok ? 'PASS' : hasJwt ? 'FAIL' : 'BLOCKED', hasJwt ? null : 'Missing AIO_RLS_TEST_* JWT secrets');
    continue;
  }

  if (domainId === 'storage') {
    const hasLive = Boolean(process.env.AIO_STAGING_SUPABASE_URL || process.env.VITE_AIO_SUPABASE_URL);
    if (!hasLive) {
      mergeDomainStatus(results.domains, domainId, def.label, 'BLOCKED', 'Missing live Supabase credentials');
      continue;
    }
    mergeDomainStatus(results.domains, domainId, def.label, runDomainTests(domainId, def) ? 'PASS' : 'FAIL');
    continue;
  }

  if (def.readinessTests || def.reuseTests) {
    mergeDomainStatus(results.domains, domainId, def.label, runDomainTests(domainId, def) ? 'PASS' : 'FAIL');
  }
}

if (TEST_SCOPE !== 'responsive-only') {
  const iso = run('bash', ['scripts/check-isolation.sh']);
  mergeDomainStatus(results.crossCutting, 'fs-isolation', 'FRONTAL SLAYER ISOLATION', iso.ok ? 'PASS' : 'FAIL');
}

if (TEST_SCOPE === 'full-platform') {
  const audit = run('node', ['scripts/readiness/audit-placeholders.mjs']);
  try {
    results.placeholderAudit = JSON.parse(audit.stdout);
  } catch {
    results.placeholderAudit = { error: 'parse_failed' };
  }
}

async function runResponsiveGroups() {
  if (!(TEST_SCOPE === 'full-platform' || TEST_SCOPE === 'responsive-only')) return;

  const preview = spawn('npm', ['run', 'preview', '--', '--port', '4173', '--host', '127.0.0.1'], {
    cwd: ROOT,
    detached: true,
    stdio: 'ignore',
  });
  preview.unref();
  await new Promise((r) => setTimeout(r, 5000));

  for (const group of ['mobile', 'tablet', 'desktop', 'ultrawide']) {
    if (TEST_SCOPE === 'responsive-only' && DOMAIN_SELECT !== 'all' && DOMAIN_SELECT !== group && DOMAIN_SELECT !== `responsive-${group}`) {
      continue;
    }
    const rr = run('node', ['scripts/readiness/run-responsive-qa.mjs'], {
      env: { ...process.env, RESPONSIVE_GROUP: group, READINESS_PREVIEW_URL: 'http://127.0.0.1:4173/' },
    });
    mergeDomainStatus(results.domains, `responsive-${group}`, group.toUpperCase(), rr.ok ? 'PASS' : 'FAIL');
  }
}

await runResponsiveGroups();

if (TEST_SCOPE === 'full-platform' || TEST_SCOPE === 'core-operations') {
  const e2e = run('npx', ['playwright', 'test'], { env: { ...process.env, E2E_LOCAL_SERVER: '1' } });
  mergeDomainStatus(results.crossCutting, 'e2e-smoke', 'E2E SMOKE', e2e.ok ? 'PASS' : 'FAIL');
}

if (TEST_SCOPE !== 'responsive-only') {
  const build = run('npm', ['run', 'build'], {
    env: {
      ...process.env,
      VITE_AIO_DATA_MODE: 'supabase',
      VITE_AIO_SUPABASE_URL: `https://${AIO_REF}.supabase.co`,
      VITE_AIO_SUPABASE_ANON_KEY: 'build-placeholder',
    },
  });
  mergeDomainStatus(results.domains, 'production-build', 'PRODUCTION BUILD', build.ok ? 'PASS' : 'FAIL');
}

results.externalDependencies = inventory.domains
  .filter((d) => d.classification.includes('PARTIAL') || /manual|partner|external/i.test(d.notes ?? ''))
  .map((d) => ({ domain: d.id, label: d.label, status: d.classification, notes: d.notes }));

for (const d of Object.values(results.domains)) {
  if (d.status === 'FAIL' || d.status === 'BLOCKED') results.blockers.P1 += 1;
}
if (results.projectGuard === 'FAIL') results.blockers.P0 += 1;

const anyBlocker = results.blockers.P0 > 0 || results.blockers.P1 > 0;
if (!anyBlocker) {
  const allPass = Object.values(results.domains).every((d) => d.status === 'PASS');
  results.finalReadiness = allPass ? 'READY TO DEPLOY' : 'READY TO DEPLOY WITH NON-BLOCKING DEFERRED ENHANCEMENTS';
} else {
  results.finalReadiness = 'NOT READY TO DEPLOY — BLOCKERS REMAIN';
}

writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
console.log(`Readiness results → ${RESULTS_PATH}`);
console.log(`FINAL: ${results.finalReadiness}`);
process.exit(anyBlocker ? 1 : 0);
