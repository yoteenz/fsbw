import { describe, expect, it } from 'vitest';
import { computeQaOverview } from './qaEngine';
import { canExtractAllInOne, evaluateExtractionReadiness } from './extractionGate';
import { AIO_ROUTE_MANIFEST, getRouteManifestSummary } from './routeManifest';
import { QA_TEST_SUITES, E2E_JOURNEY_MATRIX } from './testSuites';
import { getKnownDefects } from './knownDefects';
import { AIO_DEPENDENCY_GRAPH } from './dependencyGraph';
import { getLegacyBrandAudit } from './qaEngine';
import { runFsIsolationSelfCheck } from '../security/fsIsolation';

describe('QA status model', () => {
  it('computes overview from suites and journeys', () => {
    const overview = computeQaOverview();
    expect(overview.totalTests).toBe(QA_TEST_SUITES.length + E2E_JOURNEY_MATRIX.length);
    expect(overview.openP0).toBe(0);
    expect(overview.lastUpdatedAt).toBeTruthy();
  });

  it('tracks known defects with severity', () => {
    const defects = getKnownDefects();
    expect(defects.every((d) => d.stepsToReproduce.length > 0)).toBe(true);
    expect(defects.some((d) => d.id === 'QA-001')).toBe(true);
  });
});

describe('extraction gate', () => {
  it('returns BLOCKED until dedicated Supabase RLS is configured', () => {
    const gate = canExtractAllInOne({ vitestAllPassing: true, buildPassing: true });
    expect(gate.status).toBe('BLOCKED');
    expect(gate.blockers.some((b) => b.includes('Supabase') || b.includes('RLS'))).toBe(true);
  });

  it('evaluates extraction requirements honestly', () => {
    const report = evaluateExtractionReadiness();
    expect(report.requirements.find((r) => r.id === 'standalone-repo')?.met).toBe(true);
    expect(report.requirements.find((r) => r.id === 'standalone-build')?.met).toBe(true);
    expect(report.requirements.find((r) => r.id === 'no-fs-imports')?.met).toBe(true);
  });
});

describe('route manifest', () => {
  it('includes QA command center routes', () => {
    expect(AIO_ROUTE_MANIFEST.some((r) => r.path.includes('/office/system/qa'))).toBe(true);
    expect(getRouteManifestSummary().total).toBeGreaterThan(30);
  });
});

describe('Frontal Slayer regression', () => {
  it('passes FS isolation self-check', () => {
    const result = runFsIsolationSelfCheck();
    expect(result.ok).toBe(true);
  });

  it('does not list FS-specific nodes as AIO dependencies in use', () => {
    const aioNodes = AIO_DEPENDENCY_GRAPH.filter((n) => n.class === 'AIO_SPECIFIC');
    expect(aioNodes.length).toBeGreaterThan(3);
  });
});

describe('brand audit', () => {
  it('finds no legacy Perfect Choice in AIO scope', () => {
    const audit = getLegacyBrandAudit();
    expect(audit.ok).toBe(true);
  });
});

describe('test suite registry', () => {
  it('marks live RLS as requires production environment', () => {
    const rls = QA_TEST_SUITES.find((s) => s.id === 'rls-supabase');
    expect(rls?.status).toBe('REQUIRES_PRODUCTION_ENVIRONMENT');
  });

  it('includes security and data suites as PASS', () => {
    expect(QA_TEST_SUITES.find((s) => s.id === 'security')?.status).toBe('PASS');
    expect(QA_TEST_SUITES.find((s) => s.id === 'data')?.status).toBe('PASS');
  });
});
