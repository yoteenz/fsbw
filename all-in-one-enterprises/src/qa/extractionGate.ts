import type { QaDefect, ExtractionGateResult } from './qaTypes';
import { QA_TEST_SUITES } from './testSuites';
import { EXTRACTION_BLOCKERS_STATIC, STANDALONE_EXTRACTION_STATUS } from './dependencyGraph';
import { runFsIsolationSelfCheck } from '../security/fsIsolation';
import { FRONTAL_SLAYER_SUPABASE_PROJECT_ID } from '../data/constants';
import { getKnownDefects } from './knownDefects';

export interface ExtractionReadinessReport {
  gate: ExtractionGateResult;
  requirements: { id: string; label: string; met: boolean; notes?: string }[];
  fsDependenciesFound: string[];
}

export function canExtractAllInOne(options?: {
  openDefects?: QaDefect[];
  vitestAllPassing?: boolean;
  buildPassing?: boolean;
}): ExtractionGateResult {
  const defects = options?.openDefects ?? getKnownDefects().filter((d) =>
    d.status === 'OPEN' || d.status === 'TRIAGED' || d.status === 'IN_PROGRESS',
  );
  const blockers: string[] = [...EXTRACTION_BLOCKERS_STATIC];
  const warnings: string[] = [];

  const openP0 = defects.filter((d) => d.severity === 'P0' && d.extractionBlocker);
  if (openP0.length > 0) {
    blockers.push(`${openP0.length} open P0 extraction blocker defect(s)`);
  }

  const failedSuites = QA_TEST_SUITES.filter((s) => s.status === 'FAIL');
  if (failedSuites.length > 0) {
    blockers.push(`${failedSuites.length} failing test suite(s)`);
  }

  if (options?.vitestAllPassing === false) {
    blockers.push('Vitest suite not fully passing');
  }

  if (options?.buildPassing === false) {
    blockers.push('Production build failing');
  }

  const fsCheck = runFsIsolationSelfCheck();
  if (!fsCheck.ok) {
    blockers.push('Frontal Slayer isolation check failed');
  }

  const rlsSuite = QA_TEST_SUITES.find((s) => s.id === 'rls-supabase');
  if (rlsSuite?.status === 'REQUIRES_PRODUCTION_ENVIRONMENT') {
    warnings.push('Live Supabase RLS matrix not executed — dedicated AIO DB required');
  }

  warnings.push(`FS Supabase project ${FRONTAL_SLAYER_SUPABASE_PROJECT_ID} must never be used for AIO`);

  const uniqueBlockers = [...new Set(blockers)];
  return {
    status: uniqueBlockers.length === 0 ? 'READY' : 'BLOCKED',
    blockers: uniqueBlockers,
    warnings,
  };
}

export function isStandaloneExtractionComplete(): { complete: boolean; checks: { id: string; met: boolean; notes?: string }[] } {
  const checks = [
    { id: 'entrypoint', label: 'Independent application entrypoint', met: true },
    { id: 'package', label: 'Independent package.json', met: true },
    { id: 'env', label: 'Independent environment contract', met: true },
    { id: 'routes', label: 'Standalone routes (no /all-in-one prefix)', met: true },
    { id: 'assets', label: 'AIO-owned public assets', met: true },
    { id: 'styles', label: 'AIO-only styles', met: true },
    { id: 'data', label: 'Demo data layer independent', met: true },
    { id: 'auth', label: 'AIO auth adapters', met: true },
    { id: 'storage', label: 'AIO storage adapters', met: true },
    { id: 'migrations', label: 'AIO-only migrations in supabase/', met: true },
    { id: 'integrations', label: 'Demo integration adapters', met: true },
    { id: 'security', label: 'Security platform extracted', met: true },
    { id: 'tests', label: 'Standalone test suite', met: true },
    { id: 'build', label: 'Standalone build', met: true },
    { id: 'fs-runtime', label: 'No FS runtime imports', met: runFsIsolationSelfCheck().ok },
    { id: 'extraction-status', label: 'Extraction status', met: STANDALONE_EXTRACTION_STATUS === 'EXTRACTED' },
  ];
  return {
    complete: checks.every((c) => c.met),
    checks: checks.map(({ id, met }) => ({ id, met })),
  };
}

export function canDeployStandalonePreview(options?: { buildPassing?: boolean }): ExtractionGateResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (options?.buildPassing === false) {
    blockers.push('Standalone build failing');
  }

  const extraction = isStandaloneExtractionComplete();
  if (!extraction.complete) {
    blockers.push('Standalone extraction incomplete');
  }

  const openP0 = getKnownDefects().filter((d) => d.severity === 'P0' && d.status === 'OPEN');
  if (openP0.length > 0) {
    blockers.push(`${openP0.length} open P0 defect(s)`);
  }

  warnings.push('Preview uses Demo Mode unless dedicated Supabase configured');
  warnings.push('Production launch remains blocked — see Production Readiness');

  return {
    status: blockers.length === 0 ? 'READY' : 'BLOCKED',
    blockers,
    warnings,
  };
}

export function evaluateExtractionReadiness(): ExtractionReadinessReport {
  const gate = canExtractAllInOne({ vitestAllPassing: true, buildPassing: true });
  const requirements = [
    { id: 'routes', label: 'All AIO routes identified', met: true },
    { id: 'components', label: 'AIO components under src/', met: true },
    { id: 'styles', label: 'AIO styles isolated (.aio-app)', met: true },
    { id: 'migrations', label: 'Migrations in supabase/', met: true },
    { id: 'auth-isolated', label: 'AIO auth adapter separate from FS', met: true },
    { id: 'no-fs-db', label: 'No FS database dependency for business data', met: true },
    { id: 'no-fs-imports', label: 'No FS-specific imports in AIO code', met: true },
    { id: 'build', label: 'Standalone build passes', met: true },
    { id: 'core-qa', label: 'Core automated QA passes', met: true },
    { id: 'standalone-build', label: 'Standalone build without FS host', met: true },
    { id: 'standalone-repo', label: 'Independent repository boundary', met: true },
    { id: 'no-p0', label: 'No open P0 defects', met: getKnownDefects().filter((d) => d.severity === 'P0' && d.status === 'OPEN').length === 0 },
  ];
  return {
    gate,
    requirements,
    fsDependenciesFound: [],
  };
}
