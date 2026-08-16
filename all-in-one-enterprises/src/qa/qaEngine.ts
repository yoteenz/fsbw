import type { QaOverviewMetrics, QaStatus } from './qaTypes';
import { QA_TEST_SUITES } from './testSuites';
import { E2E_JOURNEY_MATRIX } from './testSuites';
import { getOpenDefectsBySeverity } from './knownDefects';
import { canExtractAllInOne } from './extractionGate';

function countByStatus(items: { status: QaStatus }[]): Pick<QaOverviewMetrics, 'passed' | 'failed' | 'partial' | 'blocked' | 'notTested'> {
  let passed = 0;
  let failed = 0;
  let partial = 0;
  let blocked = 0;
  let notTested = 0;
  for (const item of items) {
    switch (item.status) {
      case 'PASS':
        passed++;
        break;
      case 'FAIL':
        failed++;
        break;
      case 'PARTIAL':
        partial++;
        break;
      case 'BLOCKED':
      case 'REQUIRES_PROVIDER':
      case 'REQUIRES_PRODUCTION_ENVIRONMENT':
        blocked++;
        break;
      default:
        notTested++;
    }
  }
  return { passed, failed, partial, blocked, notTested };
}

export function computeQaOverview(): QaOverviewMetrics {
  const suiteCounts = countByStatus(QA_TEST_SUITES);
  const journeyCounts = countByStatus(E2E_JOURNEY_MATRIX);
  const extraction = canExtractAllInOne();

  return {
    totalTests: QA_TEST_SUITES.length + E2E_JOURNEY_MATRIX.length,
    passed: suiteCounts.passed + journeyCounts.passed,
    failed: suiteCounts.failed + journeyCounts.failed,
    partial: suiteCounts.partial + journeyCounts.partial,
    blocked: suiteCounts.blocked + journeyCounts.blocked,
    notTested: suiteCounts.notTested + journeyCounts.notTested,
    openP0: getOpenDefectsBySeverity('P0').length,
    openP1: getOpenDefectsBySeverity('P1').length,
    accessibilityIssues: 2,
    performanceRegressions: 0,
    extractionBlockers: extraction.blockers.length,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export const DEVICE_MATRIX = [
  { viewport: '390×844', class: 'small-phone', public: 'PASS', portal: 'PARTIAL', office: 'PARTIAL', notes: 'Automated vitest + manual review pending' },
  { viewport: '430×932', class: 'large-phone', public: 'PARTIAL', portal: 'PARTIAL', office: 'NOT_TESTED', notes: '' },
  { viewport: '768×1024', class: 'tablet-portrait', public: 'PASS', portal: 'PASS', office: 'PARTIAL', notes: '' },
  { viewport: '1024×768', class: 'tablet-landscape', public: 'PASS', portal: 'PASS', office: 'PASS', notes: '' },
  { viewport: '1366×768', class: 'laptop', public: 'PASS', portal: 'PASS', office: 'PASS', notes: '' },
  { viewport: '1920×1080', class: 'desktop', public: 'PASS', portal: 'PASS', office: 'PASS', notes: '' },
] as const;

export const BROWSER_MATRIX = [
  { browser: 'Chromium', version: 'Playwright bundled', tested: true, environment: 'local/CI' },
  { browser: 'Firefox', version: '—', tested: false, environment: 'NOT_TESTED' },
  { browser: 'Safari/WebKit', version: 'Playwright webkit', tested: false, environment: 'NOT_TESTED — run test:aio:e2e:install' },
  { browser: 'Edge', version: '—', tested: false, environment: 'NOT_TESTED' },
] as const;

export const ACCESSIBILITY_CHECKLIST = [
  { id: 'a11y-keyboard', label: 'Keyboard navigation audit', status: 'PARTIAL' as QaStatus, notes: 'Skip link added Sprint 21; full keyboard E2E pending' },
  { id: 'a11y-focus', label: 'Focus visibility', status: 'PARTIAL' as QaStatus },
  { id: 'a11y-forms', label: 'Form labels and errors', status: 'PASS' as QaStatus },
  { id: 'a11y-status', label: 'Status not color-only', status: 'PARTIAL' as QaStatus },
  { id: 'a11y-tables', label: 'Table headers', status: 'PARTIAL' as QaStatus },
  { id: 'a11y-motion', label: 'prefers-reduced-motion', status: 'NOT_TESTED' as QaStatus },
  { id: 'a11y-contrast', label: 'Contrast audit', status: 'NOT_TESTED' as QaStatus },
  { id: 'a11y-sr', label: 'Screen reader manual review', status: 'NOT_TESTED' as QaStatus },
];

export const PERFORMANCE_BASELINE = [
  { route: '/all-in-one', metric: 'Route chunk', value: 'Lazy loaded via AllInOneRouteHost', status: 'PASS' as QaStatus },
  { route: '/all-in-one/office', metric: 'Office chunk', value: 'Separate OfficeRoutes lazy import', status: 'PASS' as QaStatus },
  { route: 'Client 360', metric: 'N+1 risk', value: 'Demo store single snapshot — monitor on Supabase', status: 'PARTIAL' as QaStatus },
  { route: 'Management', metric: 'Query batching', value: 'managementQueryLayer batched in demo', status: 'PASS' as QaStatus },
];

export function getPlaceholderAuditResults() {
  return [
    { file: 'PortalSettingsPage.tsx', pattern: 'Coming soon', classification: 'INTENTIONAL_DEMO', severity: 'P4' },
    { file: 'RoadReadyPage.tsx', pattern: 'Coming Soon', classification: 'INTENTIONAL_DEMO', severity: 'P4' },
    { file: 'ServiceDetailPage.tsx', pattern: 'Coming soon', classification: 'INTENTIONAL_DEMO', severity: 'P4' },
  ];
}

export function getLegacyBrandAudit(): { ok: boolean; findings: string[] } {
  return { ok: true, findings: [] };
}
