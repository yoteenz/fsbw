/** Sprint 21 — canonical QA status model */

export type QaStatus =
  | 'NOT_TESTED'
  | 'PASS'
  | 'FAIL'
  | 'PARTIAL'
  | 'BLOCKED'
  | 'NOT_APPLICABLE'
  | 'REQUIRES_PROVIDER'
  | 'REQUIRES_PRODUCTION_ENVIRONMENT';

export type QaSeverity = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export type QaDefectState =
  | 'OPEN'
  | 'TRIAGED'
  | 'IN_PROGRESS'
  | 'FIXED'
  | 'READY_FOR_RETEST'
  | 'VERIFIED'
  | 'WONT_FIX'
  | 'DUPLICATE'
  | 'BLOCKED';

export interface QaDefect {
  id: string;
  title: string;
  severity: QaSeverity;
  domain: string;
  route?: string;
  environment: string;
  browser?: string;
  device?: string;
  preconditions?: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  status: QaDefectState;
  owner?: string;
  introducedSprint?: number;
  relatedTest?: string;
  regressionTest?: string;
  extractionBlocker: boolean;
  productionBlocker: boolean;
  createdAt: string;
  resolvedAt?: string;
  verifiedAt?: string;
  wontFixRationale?: string;
}

export interface QaTestEvidence {
  suite: string;
  testName: string;
  result: QaStatus;
  durationMs?: number;
  timestamp: string;
  environment: string;
  failureMessage?: string;
}

export interface QaTestSuiteEntry {
  id: string;
  name: string;
  layer: 'unit' | 'domain' | 'repository' | 'database' | 'rls' | 'integration' | 'component' | 'e2e' | 'security' | 'accessibility' | 'performance';
  domain: string;
  status: QaStatus;
  testFile?: string;
  testCount?: number;
  notes?: string;
}

export interface QaJourneyEntry {
  id: string;
  title: string;
  persona: string;
  routes: string[];
  domains: string[];
  expectedResult: string;
  automated: boolean;
  status: QaStatus;
}

export interface QaOverviewMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  partial: number;
  blocked: number;
  notTested: number;
  openP0: number;
  openP1: number;
  accessibilityIssues: number;
  performanceRegressions: number;
  extractionBlockers: number;
  lastUpdatedAt: string;
}

export type ExtractionGateResult = {
  status: 'READY' | 'BLOCKED';
  blockers: string[];
  warnings: string[];
};
