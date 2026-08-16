import type { QaDefect } from './qaTypes';

/** Truthful known issues — not fabricated green status */
export const KNOWN_DEFECTS: QaDefect[] = [
  {
    id: 'QA-001',
    title: 'Shared Vite host — not standalone application shell',
    severity: 'P2',
    domain: 'EXTRACTION',
    environment: 'DEBUG',
    stepsToReproduce: ['Review App.tsx lazy mount of AllInOneRouteHost'],
    expectedResult: 'Independent build entry for extraction',
    actualResult: 'AIO code-split chunk inside FS bundle',
    status: 'OPEN',
    introducedSprint: 1,
    extractionBlocker: true,
    productionBlocker: false,
    createdAt: '2026-08-16T00:00:00.000Z',
  },
  {
    id: 'QA-002',
    title: 'Live Supabase RLS matrix not executed',
    severity: 'P2',
    domain: 'DATA',
    environment: 'DEBUG',
    stepsToReproduce: ['Attempt RLS tests without dedicated AIO Supabase project'],
    expectedResult: 'Automated RLS tests against dedicated DB',
    actualResult: 'REQUIRES_PRODUCTION_ENVIRONMENT — demo authorizationGuard only',
    status: 'OPEN',
    introducedSprint: 20,
    extractionBlocker: false,
    productionBlocker: true,
    createdAt: '2026-08-16T00:00:00.000Z',
  },
  {
    id: 'QA-003',
    title: 'Portal notification settings placeholder',
    severity: 'P4',
    domain: 'PORTAL',
    route: '/all-in-one/portal/settings',
    environment: 'DEBUG',
    stepsToReproduce: ['Open Portal Settings'],
    expectedResult: 'Functional notification controls or hidden until ready',
    actualResult: '"Coming soon" note displayed',
    status: 'OPEN',
    introducedSprint: 12,
    extractionBlocker: false,
    productionBlocker: false,
    createdAt: '2026-08-16T00:00:00.000Z',
  },
  {
    id: 'QA-004',
    title: 'Road Ready Download Summary disabled',
    severity: 'P4',
    domain: 'ROAD_READY',
    route: '/all-in-one/portal/road-ready',
    environment: 'DEBUG',
    stepsToReproduce: ['Open Road Ready page', 'Observe Download Summary button'],
    expectedResult: 'Export or intentional hide',
    actualResult: 'Disabled button with Coming Soon title',
    status: 'OPEN',
    introducedSprint: 11,
    extractionBlocker: false,
    productionBlocker: false,
    createdAt: '2026-08-16T00:00:00.000Z',
  },
  {
    id: 'QA-005',
    title: 'Playwright E2E requires local server for full matrix',
    severity: 'P3',
    domain: 'SYSTEM',
    environment: 'CI',
    stepsToReproduce: ['Run e2e/all-in-one without E2E_LOCAL_SERVER=1'],
    expectedResult: 'Documented CI path for AIO E2E',
    actualResult: '15/15 smoke tests pass with E2E_BASE_URL=http://localhost:3001 (Chromium)',
    status: 'VERIFIED',
    introducedSprint: 21,
    extractionBlocker: false,
    productionBlocker: false,
    createdAt: '2026-08-16T00:00:00.000Z',
    verifiedAt: '2026-08-16T01:52:00.000Z',
  },
];

export function getKnownDefects(): QaDefect[] {
  return KNOWN_DEFECTS;
}

export function getOpenDefectsBySeverity(severity: QaDefect['severity']): QaDefect[] {
  return KNOWN_DEFECTS.filter(
    (d) => d.severity === severity && (d.status === 'OPEN' || d.status === 'TRIAGED' || d.status === 'IN_PROGRESS'),
  );
}
