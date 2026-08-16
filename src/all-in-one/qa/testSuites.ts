import type { QaJourneyEntry, QaTestSuiteEntry } from './qaTypes';

/** Catalog of test suites — status updated by qaEngine from vitest file presence */
export const QA_TEST_SUITES: QaTestSuiteEntry[] = [
  { id: 'unit-billing', name: 'Billing calculator', layer: 'unit', domain: 'BILLING', status: 'PASS', testFile: 'billing/billingCalculator.test.ts' },
  { id: 'unit-dispatch', name: 'Dispatch calculations', layer: 'unit', domain: 'DISPATCH', status: 'PASS', testFile: 'dispatch/dispatchCalculations.test.ts' },
  { id: 'unit-brokerage', name: 'Brokerage calculations', layer: 'unit', domain: 'BROKERAGE', status: 'PASS', testFile: 'brokerage/brokerageCalculations.test.ts' },
  { id: 'unit-factoring', name: 'Factoring rules', layer: 'unit', domain: 'FACTORING', status: 'PASS', testFile: 'factoring/factoringRules.test.ts' },
  { id: 'unit-insurance', name: 'Insurance calculations', layer: 'unit', domain: 'INSURANCE', status: 'PASS', testFile: 'insurance/insuranceCalculations.test.ts' },
  { id: 'domain-workflow', name: 'Workflow engine', layer: 'domain', domain: 'WORKFLOW', status: 'PASS', testFile: 'workflow/workflow.test.ts' },
  { id: 'domain-crm', name: 'CRM conversion', layer: 'domain', domain: 'CRM', status: 'PASS', testFile: 'crm/crm.test.ts' },
  { id: 'domain-communications', name: 'Communications', layer: 'domain', domain: 'COMMUNICATIONS', status: 'PASS', testFile: 'communications/communications.test.ts' },
  { id: 'domain-management', name: 'Management metrics', layer: 'domain', domain: 'MANAGEMENT', status: 'PASS', testFile: 'management/management.test.ts' },
  { id: 'domain-integrations', name: 'Integration contracts', layer: 'integration', domain: 'INTEGRATIONS', status: 'PASS', testFile: 'integrations/integrations.test.ts' },
  { id: 'security', name: 'Security + IDOR', layer: 'security', domain: 'SECURITY', status: 'PASS', testFile: 'security/security.test.ts' },
  { id: 'data', name: 'Data layer + FS isolation', layer: 'repository', domain: 'DATA', status: 'PASS', testFile: 'data/data.test.ts' },
  { id: 'portal-ccc', name: 'Client Command Center', layer: 'domain', domain: 'CUSTOMER', status: 'PASS', testFile: 'portal/clientCommandCenter.test.ts' },
  { id: 'office-ccc', name: 'Office Command Center', layer: 'domain', domain: 'OFFICE', status: 'PASS', testFile: 'office-core/officeCommandCenter.test.ts' },
  { id: 'qa-core', name: 'QA harness + extraction', layer: 'domain', domain: 'SYSTEM', status: 'PASS', testFile: 'qa/qa.test.ts' },
  { id: 'qa-cross-domain', name: 'Cross-domain consistency', layer: 'domain', domain: 'SYSTEM', status: 'PASS', testFile: 'qa/crossDomain.test.ts' },
  { id: 'rls-supabase', name: 'Supabase RLS live matrix', layer: 'rls', domain: 'DATA', status: 'REQUIRES_PRODUCTION_ENVIRONMENT', notes: 'Dedicated AIO Supabase not connected in debug' },
  { id: 'e2e-playwright', name: 'Playwright critical paths', layer: 'e2e', domain: 'SYSTEM', status: 'PASS', testFile: 'e2e/all-in-one/', notes: '15 smoke tests — Chromium via npm run test:aio:e2e' },
  { id: 'a11y-automated', name: 'Automated accessibility scan', layer: 'accessibility', domain: 'ACCESSIBILITY', status: 'PARTIAL', notes: 'Manual keyboard/SR review required per WCAG benchmark' },
  { id: 'perf-lighthouse', name: 'Lighthouse performance', layer: 'performance', domain: 'PERFORMANCE', status: 'NOT_TESTED', notes: 'Not fabricated — measure in Performance Command Center' },
];

export const E2E_JOURNEY_MATRIX: QaJourneyEntry[] = [
  { id: 'j1', title: 'Prospect to Customer', persona: 'Anonymous → Customer A', routes: ['/all-in-one', '/all-in-one/get-started', '/all-in-one/portal'], domains: ['PUBLIC', 'ROAD_READY', 'PORTAL'], expectedResult: 'Demo onboarding → portal with persisted state', automated: true, status: 'PARTIAL' },
  { id: 'j2', title: 'Lead to Sale', persona: 'CRM Staff', routes: ['/all-in-one/office/crm'], domains: ['CRM', 'BILLING', 'WORKFLOW'], expectedResult: 'Lead converts without duplicate customer', automated: false, status: 'PASS' },
  { id: 'j3', title: 'Permitting Service', persona: 'Customer + Staff', routes: ['/all-in-one/portal/requests', '/all-in-one/office/requests'], domains: ['SERVICES', 'WORKFLOW', 'DOCUMENTS'], expectedResult: 'End-to-end demo service flow', automated: false, status: 'PARTIAL' },
  { id: 'j4', title: 'Road Ready derivation', persona: 'Customer A', routes: ['/all-in-one/portal/road-ready'], domains: ['ROAD_READY'], expectedResult: 'Status explains READY vs ACTION NEEDED', automated: true, status: 'PASS' },
  { id: 'j5', title: 'Dispatch load lifecycle', persona: 'Dispatcher', routes: ['/all-in-one/office/dispatch/loads'], domains: ['DISPATCH'], expectedResult: 'Load + stops persist on refresh', automated: false, status: 'PASS' },
  { id: 'j6', title: 'Brokerage shipment', persona: 'Brokerage Staff', routes: ['/all-in-one/office/brokerage'], domains: ['BROKERAGE'], expectedResult: 'Margin not exposed to customer portal', automated: false, status: 'PASS' },
  { id: 'j7', title: 'Factoring partner workflow', persona: 'Customer + Factoring Staff', routes: ['/all-in-one/portal/factoring', '/all-in-one/office/factoring'], domains: ['FACTORING'], expectedResult: 'Partner language; no false funded claim', automated: false, status: 'PASS' },
  { id: 'j8', title: 'Insurance referral', persona: 'Customer + Insurance Staff', routes: ['/all-in-one/portal/insurance'], domains: ['INSURANCE'], expectedResult: 'No false ACTIVE COVERAGE', automated: false, status: 'PASS' },
  { id: 'j11', title: 'Finance payment propagation', persona: 'Finance', routes: ['/all-in-one/office/billing'], domains: ['BILLING', 'MANAGEMENT', 'AUDIT'], expectedResult: 'Payment updates invoice, portal, management consistently', automated: true, status: 'PASS' },
  { id: 'j12', title: 'Cross-customer attack', persona: 'Customer A vs B', routes: ['/all-in-one/portal'], domains: ['SECURITY', 'AUTHORIZATION'], expectedResult: 'All cross-org access denied', automated: true, status: 'PASS' },
  { id: 'j13', title: 'Provider failure fallback', persona: 'Staff', routes: ['/all-in-one/office/integrations'], domains: ['INTEGRATIONS'], expectedResult: 'DEGRADED state; manual workflow continues', automated: true, status: 'PASS' },
  { id: 'j20', title: 'Demo reset', persona: 'Any', routes: ['/all-in-one'], domains: ['DEMO', 'SYSTEM'], expectedResult: 'Canonical fixtures restored; no FS mutation', automated: true, status: 'PASS' },
  { id: 'j21', title: 'Extraction simulation', persona: 'System', routes: [], domains: ['EXTRACTION'], expectedResult: 'Dependency graph reviewed; blockers documented', automated: true, status: 'PARTIAL' },
  { id: 'j24', title: 'Extraction readiness gate', persona: 'System', routes: ['/all-in-one/office/system/qa'], domains: ['EXTRACTION'], expectedResult: 'canExtractAllInOne() evidence-based', automated: true, status: 'PARTIAL' },
];
