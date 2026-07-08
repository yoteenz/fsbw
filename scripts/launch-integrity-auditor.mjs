#!/usr/bin/env node
/**
 * Launch Integrity Auditor™ — Frontal Slayer pre-launch verification
 * Usage: node scripts/launch-integrity-auditor.mjs [--skip-build] [--write-report]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import {
  EXPECTED_REDIRECTS,
  LAUNCH_ACCOUNT_ROUTES,
  LAUNCH_ADMIN_ROUTES,
  LAUNCH_BRAND_ROUTES,
  LAUNCH_CRITICAL_ROUTES,
  REQUIRED_PUBLIC_ASSETS,
  RESOLVED_E2E_FIXES,
  COMMERCE_INTEGRATION_CHECKS,
  FIXES_APPLIED,
} from './launch-integrity-auditor/config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const APP_TSX = path.join(ROOT, 'src/App.tsx');
const OUT_DIR = path.join(ROOT, 'audits/launch-integrity');
const REPORT_JSON = path.join(OUT_DIR, 'report.json');
const REPORT_MD = path.join(OUT_DIR, 'report.md');

const skipBuild = process.argv.includes('--skip-build');
let issueSeq = 0;

/** @typedef {import('./launch-integrity-auditor/types.ts').AuditIssue} AuditIssue */

/** @returns {AuditIssue} */
function issue(partial) {
  issueSeq += 1;
  return {
    id: `LIA-${String(issueSeq).padStart(4, '0')}`,
    resolution_status: 'open',
    regression_risk: 'low',
    design_risk: 'none',
    ...partial,
  };
}

function extractBalancedRouteBlock(src, openTag) {
  const startIdx = src.indexOf(openTag);
  if (startIdx === -1) return null;
  const contentStart = src.indexOf('>', startIdx) + 1;
  let depth = 1;
  let i = contentStart;
  while (i < src.length && depth > 0) {
    const nextOpen = src.indexOf('<Route', i);
    const nextClose = src.indexOf('</Route>', i);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      const tagEnd = src.indexOf('>', nextOpen);
      if (tagEnd !== -1 && src[tagEnd - 1] === '/') {
        i = tagEnd + 1;
      } else {
        depth += 1;
        i = nextOpen + 6;
      }
    } else {
      depth -= 1;
      i = nextClose + 8;
    }
  }
  if (depth !== 0) return null;
  return src.slice(contentStart, i - 8);
}

function readAppRoutes() {
  const src = fs.readFileSync(APP_TSX, 'utf8');
  const routes = new Set();

  // Full-path routes: path="/foo/bar"
  const fullRe = /path=["'](\/[^"']*)["']/g;
  let m;
  while ((m = fullRe.exec(src))) routes.add(m[1]);

  // Nested admin routes under <Route path="/admin"> (depth-balanced — block is ~1300 lines)
  const adminBlock = extractBalancedRouteBlock(src, '<Route path="/admin"');
  if (adminBlock) {
    const relRe = /path=["']([^"']+)["']/g;
    while ((m = relRe.exec(adminBlock))) {
      const seg = m[1];
      if (seg.startsWith('/')) routes.add(seg);
      else routes.add(`/admin/${seg}`);
    }
  }

  return [...routes];
}

function readLazyImports() {
  const src = fs.readFileSync(APP_TSX, 'utf8');
  const imports = [];
  const re = /import\(['"](\.\/[^'"]+)['"]\)/g;
  let m;
  while ((m = re.exec(src))) imports.push(m[1]);
  return imports;
}

function resolveImportToFile(importPath) {
  const base = path.join(ROOT, 'src', importPath.replace(/^\.\//, ''));
  const candidates = [
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, 'page.tsx'),
    path.join(base, 'index.tsx'),
  ];
  return candidates.find((c) => fs.existsSync(c)) ?? null;
}

function routePatternMatches(routePattern, concretePath) {
  const normalized = concretePath.replace(/\/$/, '') || '/';
  if (routePattern === normalized) return true;
  if (!routePattern.includes(':') && !routePattern.includes('*')) return false;
  const regex = new RegExp(
    `^${routePattern
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:[^/]+/g, '[^/]+')
      .replace(/\\\*/g, '.*')}$`
  );
  return regex.test(normalized);
}

function routeMatchesManifest(routePath, manifest) {
  if (manifest.includes(routePath)) return true;
  const normalized = routePath.replace(/\/$/, '') || '/';
  return manifest.some((r) => routePatternMatches(r, normalized));
}

function runCmd(cmd, args, label) {
  const res = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  return {
    label,
    ok: res.status === 0,
    status: res.status ?? 1,
    stdout: res.stdout ?? '',
    stderr: res.stderr ?? '',
  };
}

function scoreReport(issues, routesTested) {
  let score = 100;
  for (const i of issues.filter((x) => x.resolution_status === 'open' && x.status !== 'pass')) {
    if (i.severity === 'critical') score -= 15;
    else if (i.severity === 'high') score -= 8;
    else if (i.severity === 'medium') score -= 3;
    else score -= 1;
  }
  if (routesTested < 20) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function envConfigured(envKeys, requireAll = false) {
  const hits = envKeys.map((k) => Boolean(process.env[k]?.trim()));
  return requireAll ? hits.every(Boolean) : hits.some(Boolean);
}

function isStaticIntegrityIssue(i) {
  return i.issue_type !== 'commerce_integration';
}

function renderMarkdown(report) {
  const lines = [
    '# Launch Integrity Auditor™ — Frontal Slayer',
    '',
    `**Generated:** ${report.generated_at}`,
    '',
    '> **Important:** **Static integrity** = routes/build/TS only. **Launch readiness** includes commerce/payment env blockers. A passing `/checkout` route does **not** mean Stripe is wired or payments work.',
    '',
    `**Static integrity score:** ${report.static_integrity_score}/100`,
    `**Launch readiness score:** ${report.launch_readiness_score}/100`,
    `**Deployment status:** ${report.deployment_status}`,
    `**Commerce launch:** ${report.commerce_launch_status}`,
    '',
    '## Summary',
    '',
    `| Metric | Count |`,
    `|--------|------:|`,
    `| Routes tested | ${report.summary.routes_tested} |`,
    `| Passed | ${report.summary.routes_passed} |`,
    `| Failed | ${report.summary.routes_failed} |`,
    `| Warnings | ${report.summary.routes_warn} |`,
    `| Manual review | ${report.summary.routes_manual} |`,
    `| Critical open | ${report.summary.critical_open} |`,
    `| High open | ${report.summary.high_open} |`,
    `| Fixed this run | ${report.summary.fixed_in_run} |`,
    `| Commerce blockers open | ${report.summary.commerce_blockers_open} |`,
    '',
    '## Build checks',
    '',
    `- TypeScript: **${report.checks.typescript.status}** — ${report.checks.typescript.detail}`,
    `- Production build: **${report.checks.production_build.status}** — ${report.checks.production_build.detail}`,
    `- Lazy imports: **${report.checks.lazy_imports.status}**`,
    `- Public assets: **${report.checks.public_assets.status}**`,
    `- API routes: **${report.checks.api_routes.count}** files`,
    '',
    '## Commerce integration (env)',
    '',
  ];

  for (const c of report.checks.commerce_integration) {
    lines.push(`- ${c.label}: **${c.status}** — ${c.detail}`);
  }

  lines.push(
    '',
    '## Issues',
    '',
    '| Route | Status | Severity | Type | What broke | Location | Resolution |',
    '|-------|--------|----------|------|------------|----------|------------|',
  );

  for (const i of report.issues) {
    lines.push(
      `| ${i.route_tested} | ${i.status} | ${i.severity} | ${i.issue_type} | ${i.what_broke.replace(/\|/g, '/')} | ${i.file_component_location} | ${i.resolution_status} |`
    );
  }

  if (report.fixes_applied?.length) {
    lines.push('', '## Fixes applied this sprint', '');
    for (const f of report.fixes_applied) {
      lines.push(`- **${f.route}** — ${f.issue} → \`${f.fix}\` (\`${f.file}\`)`);
    }
  }

  const openFails = report.issues.filter((i) => i.status === 'fail' && i.resolution_status === 'open');
  if (openFails.length) {
    lines.push('', '## Remaining open issues', '');
    for (const i of openFails) {
      lines.push(`- [${i.severity}] ${i.route_tested}: ${i.what_broke}`);
    }
  }

  if (report.routes_still_needing_manual_review.length) {
    lines.push('', '## Manual review still needed', '');
    for (const r of report.routes_still_needing_manual_review) lines.push(`- ${r}`);
  }

  return lines.join('\n');
}

function main() {
  /** @type {AuditIssue[]} */
  const issues = [];
  const routesTested = new Set();
  const manualReview = [];

  const appRoutes = readAppRoutes();
  const allManifestRoutes = [
    ...LAUNCH_CRITICAL_ROUTES,
    ...LAUNCH_ACCOUNT_ROUTES,
    ...LAUNCH_ADMIN_ROUTES,
    ...LAUNCH_BRAND_ROUTES,
  ];

  for (const { path: routePath, label } of allManifestRoutes) {
    routesTested.add(routePath);
    const ok = routeMatchesManifest(routePath, appRoutes);
    if (ok) {
      issues.push(
        issue({
          route_tested: routePath,
          status: 'pass',
          issue_type: 'route_registry',
          severity: 'low',
          what_broke: 'None',
          likely_cause: 'Route registered in App.tsx',
          recommended_fix: 'None',
          file_component_location: 'src/App.tsx',
          fix_priority: 0,
          resolution_status: 'open',
        })
      );
    } else {
      issues.push(
        issue({
          route_tested: routePath,
          status: 'fail',
          issue_type: 'broken_route',
          severity: routePath.startsWith('/admin') ? 'high' : 'critical',
          what_broke: `${label} (${routePath}) not registered in router`,
          likely_cause: 'Missing Route definition or redirect',
          recommended_fix: `Add Route or Navigate redirect for ${routePath}`,
          file_component_location: 'src/App.tsx',
          fix_priority: 1,
          regression_risk: 'low',
          design_risk: 'none',
        })
      );
    }
  }

  for (const { path: routePath, expectTarget } of EXPECTED_REDIRECTS) {
    routesTested.add(routePath);
    const hasDirect = appRoutes.includes(routePath);
    const hasNavigate = fs.readFileSync(APP_TSX, 'utf8').includes(`to="${expectTarget}"`);
    if (!hasDirect && !hasNavigate) {
      issues.push(
        issue({
          route_tested: routePath,
          status: 'fail',
          issue_type: 'missing_redirect',
          severity: 'high',
          what_broke: `Legacy path ${routePath} has no route or redirect`,
          likely_cause: 'Bookmarks and e2e tests still use legacy path',
          recommended_fix: `Add <Navigate to="${expectTarget}" replace /> for ${routePath}`,
          file_component_location: 'src/App.tsx',
          fix_priority: 2,
        })
      );
    } else if (hasNavigate || hasDirect) {
      issues.push(
        issue({
          route_tested: routePath,
          status: 'pass',
          issue_type: 'legacy_redirect',
          severity: 'low',
          what_broke: 'None',
          likely_cause: 'Redirect or route present',
          recommended_fix: 'None',
          file_component_location: 'src/App.tsx',
          fix_priority: 0,
          resolution_status: hasNavigate && !hasDirect ? 'fixed' : 'open',
        })
      );
    }
  }

  for (const { e2ePath, fix } of RESOLVED_E2E_FIXES) {
    issues.push(
      issue({
        route_tested: e2ePath,
        status: 'pass',
        issue_type: 'e2e_route_drift',
        severity: 'low',
        what_broke: 'None (resolved)',
        likely_cause: fix,
        recommended_fix: 'None',
        file_component_location: 'e2e/helpers/routes.ts',
        fix_priority: 0,
        resolution_status: 'fixed',
      })
    );
  }

  const lazyImports = readLazyImports();
  const missingLazy = [];
  for (const imp of lazyImports) {
    if (!resolveImportToFile(imp)) missingLazy.push(imp);
  }
  if (missingLazy.length) {
    issues.push(
      issue({
        route_tested: '(lazy imports)',
        status: 'fail',
        issue_type: 'missing_page_module',
        severity: 'critical',
        what_broke: `${missingLazy.length} lazy import(s) do not resolve`,
        likely_cause: 'Deleted or renamed page without updating App.tsx',
        recommended_fix: 'Restore page module or fix import path',
        file_component_location: `src/App.tsx — ${missingLazy.slice(0, 3).join(', ')}`,
        fix_priority: 1,
        regression_risk: 'high',
      })
    );
  }

  const missingAssets = REQUIRED_PUBLIC_ASSETS.filter((a) => !fs.existsSync(path.join(ROOT, a)));
  if (missingAssets.length) {
    issues.push(
      issue({
        route_tested: '(assets)',
        status: 'fail',
        issue_type: 'missing_asset',
        severity: 'high',
        what_broke: `Missing required public assets: ${missingAssets.join(', ')}`,
        likely_cause: 'Asset not committed or wrong path',
        recommended_fix: 'Restore assets under public/',
        file_component_location: missingAssets.join(', '),
        fix_priority: 2,
      })
    );
  }

  const apiFiles = [];
  function walkApi(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walkApi(p);
      else if (ent.name.endsWith('.ts')) apiFiles.push(p);
    }
  }
  walkApi(path.join(ROOT, 'api'));

  const tsc = runCmd('npx', ['tsc', '--noEmit'], 'typescript');
  const tscStatus = tsc.ok ? 'pass' : 'fail';
  if (!tsc.ok) {
    issues.push(
      issue({
        route_tested: '(build)',
        status: 'fail',
        issue_type: 'typescript_error',
        severity: 'critical',
        what_broke: 'tsc --noEmit failed',
        likely_cause: tsc.stderr.slice(0, 400) || 'Type errors',
        recommended_fix: 'Fix TypeScript errors',
        file_component_location: 'project-wide',
        fix_priority: 1,
        regression_risk: 'medium',
      })
    );
  }

  let buildStatus = 'skip';
  let buildDetail = 'Skipped (--skip-build)';
  if (!skipBuild) {
    const build = runCmd('npm', ['run', 'build'], 'production_build');
    buildStatus = build.ok ? 'pass' : 'fail';
    buildDetail = build.ok ? 'vite build succeeded' : (build.stderr || build.stdout).slice(-500);
    if (!build.ok) {
      issues.push(
        issue({
          route_tested: '(build)',
          status: 'fail',
          issue_type: 'build_error',
          severity: 'critical',
          what_broke: 'npm run build failed',
          likely_cause: buildDetail,
          recommended_fix: 'Fix build errors before deploy',
          file_component_location: 'project-wide',
          fix_priority: 1,
        })
      );
    }
  }

  manualReview.push(
    'End-to-end product checkout: bag → checkout → Stripe PaymentIntent → webhook → order in account',
    'Membership upgrade checkout: /checkout/upgrade → Stripe session → webhook → rewards profile',
    'Booking checkout + final balance autopay (saved default payment method)',
    'Gift card checkout flow',
    'Admin sync-profile with production credentials',
    'Build-a-Wig FAL live preview (founder-only)',
    'Lounge TV ticket purchase end-to-end on device',
    'Studio OS CDS Scene Stack generation with FAL_KEY',
    'Desktop preview routes (/desktop/*) — secondary phase per CORE',
    'Full admin studio module smoke (200+ routes)',
    'Accessibility audit (WCAG) — manual + axe',
    'SEO meta per page — manual content review'
  );

  const commerceIntegrationChecks = [];
  for (const check of COMMERCE_INTEGRATION_CHECKS) {
    const ok = envConfigured(check.envKeys, check.requireAll);
    commerceIntegrationChecks.push({
      id: check.id,
      label: check.label,
      status: ok ? 'configured' : 'missing',
      detail: ok ? 'Present in process.env for this audit run' : `Missing — blocks: ${check.blocks}`,
    });
    issues.push(
      issue({
        route_tested: `(commerce) ${check.label}`,
        status: ok ? 'pass' : 'warn',
        issue_type: 'commerce_integration',
        severity: 'critical',
        what_broke: ok
          ? 'None'
          : `${check.label} not configured — ${check.blocks}`,
        likely_cause: ok
          ? 'Env var present when auditor ran'
          : 'Stripe/payment wiring incomplete in Vercel env (or local .env)',
        recommended_fix: ok
          ? 'Verify live payment submit in staging before public launch'
          : `Set ${check.label} in Vercel → Environment Variables; see ${check.doc}`,
        file_component_location: check.doc,
        fix_priority: 1,
        regression_risk: 'high',
        resolution_status: ok ? 'open' : 'open',
      })
    );
  }

  const staticIssues = issues.filter(isStaticIntegrityIssue);
  const staticIntegrityScore = scoreReport(staticIssues, routesTested.size);
  const launchReadinessScore = scoreReport(issues, routesTested.size);

  const openIssues = issues.filter((i) => i.status === 'fail' && i.resolution_status === 'open');
  const commerceBlockersOpen = issues.filter(
    (i) =>
      i.issue_type === 'commerce_integration' &&
      i.resolution_status === 'open' &&
      i.status !== 'pass'
  ).length;
  const criticalOpen = openIssues.filter((i) => i.severity === 'critical').length;
  const commerceCriticalOpen = issues.filter(
    (i) =>
      i.issue_type === 'commerce_integration' &&
      i.severity === 'critical' &&
      i.resolution_status === 'open' &&
      i.status !== 'pass'
  ).length;
  const highOpen = openIssues.filter((i) => i.severity === 'high').length;
  const mediumOpen = issues.filter((i) => i.severity === 'medium' && i.resolution_status === 'open').length;
  const lowOpen = issues.filter((i) => i.severity === 'low' && i.resolution_status === 'open').length;

  const fixedInRun = FIXES_APPLIED.length;

  const report = {
    auditor: 'Launch Integrity Auditor™',
    product: 'Frontal Slayer / Build-a-Wig',
    generated_at: new Date().toISOString(),
    static_integrity_score: staticIntegrityScore,
    launch_readiness_score: launchReadinessScore,
    commerce_launch_status:
      commerceCriticalOpen > 0 ? 'blocked' : commerceBlockersOpen > 0 ? 'incomplete' : 'env-configured',
    deployment_status:
      criticalOpen > 0 || tscStatus === 'fail' || buildStatus === 'fail'
        ? 'fail'
        : commerceCriticalOpen > 0 || highOpen > 0
          ? 'warn'
          : 'pass',
    summary: {
      routes_tested: routesTested.size,
      routes_passed: issues.filter((i) => i.status === 'pass').length,
      routes_failed: issues.filter((i) => i.status === 'fail').length,
      routes_warn: issues.filter((i) => i.status === 'warn').length,
      routes_manual: manualReview.length,
      critical_open: criticalOpen,
      high_open: highOpen,
      medium_open: mediumOpen,
      low_open: lowOpen,
      fixed_in_run: fixedInRun,
      commerce_blockers_open: commerceBlockersOpen,
    },
    checks: {
      typescript: { status: tscStatus, detail: tsc.ok ? 'tsc --noEmit clean' : (tsc.stderr || '').slice(0, 300) },
      production_build: { status: buildStatus, detail: buildDetail },
      lazy_imports: { status: missingLazy.length ? 'fail' : 'pass', missing: missingLazy },
      public_assets: { status: missingAssets.length ? 'fail' : 'pass', missing: missingAssets },
      api_routes: { status: 'pass', count: apiFiles.length },
      commerce_integration: commerceIntegrationChecks,
    },
    fixes_applied: FIXES_APPLIED,
    issues,
    routes_still_needing_manual_review: manualReview,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
  fs.writeFileSync(REPORT_MD, renderMarkdown(report));

  console.log(
    `Launch Integrity Auditor™ — static ${report.static_integrity_score}/100 · launch ${report.launch_readiness_score}/100 · commerce ${report.commerce_launch_status}`
  );
  console.log(`Report: ${REPORT_MD}`);
  console.log(`Critical open: ${criticalOpen} · High open: ${highOpen} · Failed checks: ${report.summary.routes_failed}`);

  process.exit(criticalOpen > 0 ? 1 : 0);
}

main();
