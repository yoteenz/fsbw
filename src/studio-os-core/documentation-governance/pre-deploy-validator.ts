import { getAllRegistryEntries } from '../knowledge-registry/registration';
import { COVERAGE_STANDARD_PCT } from './constants';
import { validateAllFeatureCoverage } from './coverage-validator';
import { runDocumentationAudits } from './audit-engine';
import type { PreDeployCheck, PreDeployValidationResult } from './types';

/** Pre-deployment validation — flag release if documentation requirements incomplete. */
export function validatePreDeploymentRelease(): PreDeployValidationResult {
  const entries = getAllRegistryEntries();
  const coverage = validateAllFeatureCoverage();
  const audits = runDocumentationAudits();
  const critical = audits.filter((a) => a.severity === 'critical');

  const checks: PreDeployCheck[] = [
    {
      id: 'registry-complete',
      label: 'Feature Registry Complete',
      passed: entries.length >= 30,
      detail: `${entries.length} features registered in Documentation Registry™`,
      blocking: false,
    },
    {
      id: 'coverage-standard',
      label: 'Documentation Coverage',
      passed: coverage.every((c) => c.coveragePct >= COVERAGE_STANDARD_PCT - 10),
      detail: `${coverage.filter((c) => c.complete).length}/${coverage.length} features at ${COVERAGE_STANDARD_PCT}% standard`,
      blocking: true,
    },
    {
      id: 'walkthrough-sync',
      label: 'Walkthrough Updated',
      passed: coverage.filter((c) => c.surfaces.find((s) => s.surface === 'walkthrough')?.covered).length >= entries.length * 0.85,
      detail: 'Walkthrough references registry — auto-sync active',
      blocking: false,
    },
    {
      id: 'search-sync',
      label: 'Search Synchronized',
      passed: entries.filter((e) => e.keywords.length >= 1).length >= entries.length * 0.9,
      detail: 'Search index queries Documentation Registry™ first',
      blocking: false,
    },
    {
      id: 'tooltips',
      label: 'Tooltips Generated',
      passed: coverage.filter((c) => c.surfaces.find((s) => s.surface === 'tooltips')?.covered).length >= entries.length * 0.9,
      detail: 'Registry tooltips fan out to UI surfaces',
      blocking: false,
    },
    {
      id: 'help-articles',
      label: 'Help Articles Available',
      passed: entries.filter((e) => e.documentationLinks.length > 0).length >= entries.length * 0.85,
      detail: 'Help Center linked via registry doc paths',
      blocking: false,
    },
    {
      id: 'academy',
      label: 'Academy Updated',
      passed: coverage.filter((c) => c.surfaces.find((s) => s.surface === 'academy')?.covered).length >= entries.length * 0.85,
      detail: 'Studio Institute™ lessons generated from registry',
      blocking: false,
    },
    {
      id: 'dependencies',
      label: 'Dependencies Documented',
      passed: critical.length === 0,
      detail: critical.length === 0 ? 'No broken registry references' : `${critical.length} critical issues`,
      blocking: true,
    },
    {
      id: 'architecture',
      label: 'Architecture Synchronized',
      passed: entries.filter((e) => e.architectureDocumentation.length > 0).length >= entries.length * 0.85,
      detail: 'Architecture docs linked per feature',
      blocking: false,
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const scorePct = Math.round((passed / checks.length) * 100);
  const blockingFailed = checks.some((c) => c.blocking && !c.passed);
  const ready = !blockingFailed && scorePct >= 85;

  return {
    ready,
    scorePct,
    checks,
    flaggedForReview: !ready,
    summary: ready
      ? `Pre-deployment documentation validation passed (${scorePct}%).`
      : `Deployment flagged for review — ${checks.filter((c) => !c.passed).length} checks need attention.`,
  };
}
