import { auditAssetRegistry } from './asset-registry-auditor';
import { auditWorldContinuity } from './continuity-auditor';
import { memoryConsistencyBoost } from './memory-store';
import { generateRecommendations } from './recommendation-engine';
import { auditStudioRoutes } from './route-auditor';
import { auditSceneStacks } from './scene-stack-auditor';
import { detectWebpageViolations } from './webpage-detector';
import {
  getMigrationAuditSummary,
  listFlaggedWebpageRoutes,
  STUDIO_WORLD_MIGRATION_AUDIT,
} from '../studio-world/migration-audit';
import type {
  ArchitectureAuditReport,
  ArchitectureAuditorGateContext,
  ArchitectureAuditorGateResult,
  ArchitectureScores,
} from './types';

function buildScores(
  routeResult: ReturnType<typeof auditStudioRoutes>,
  sceneResult: ReturnType<typeof auditSceneStacks>,
  assetResult: ReturnType<typeof auditAssetRegistry>,
  continuityResult: ReturnType<typeof auditWorldContinuity>,
  memoryBoost: number
): ArchitectureScores {
  const sceneStackScore = sceneResult.averageCompleteness;
  const overall = Math.round(
    (routeResult.immersionScore * 0.2 +
      routeResult.architectureScore * 0.2 +
      continuityResult.worldContinuityScore * 0.15 +
      assetResult.reuseScore * 0.1 +
      routeResult.navigationScore * 0.1 +
      sceneStackScore * 0.15 +
      continuityResult.generationCostScore * 0.1) +
      memoryBoost
  );

  return {
    immersion: Math.min(100, routeResult.immersionScore + memoryBoost),
    architecture: Math.min(100, routeResult.architectureScore + memoryBoost),
    worldContinuity: Math.min(100, continuityResult.worldContinuityScore + memoryBoost),
    reuse: Math.min(100, assetResult.reuseScore),
    navigation: Math.min(100, routeResult.navigationScore),
    sceneStack: Math.min(100, sceneStackScore),
    generationCost: Math.min(100, continuityResult.generationCostScore),
    overallHeadquartersQuality: Math.min(100, overall),
  };
}

/**
 * Run full Studio World™ architecture audit.
 * Continuous guardian — call on route changes, scene generation, and code deploys.
 */
export function runStudioWorldArchitectureAudit(
  context?: ArchitectureAuditorGateContext
): ArchitectureAuditReport {
  const summary = getMigrationAuditSummary();
  const flagged = listFlaggedWebpageRoutes();

  const webpageInputs = flagged.map((row) => ({
    route: row.currentRoute,
    moduleId: row.moduleId,
    uiPattern: row.currentUiPattern,
    shellHints: row.flaggedAsWebpage ? ['AdminStudioStageShell'] : ['DepartmentGoldenBuildShell'],
    flaggedAsWebpage: row.flaggedAsWebpage,
  }));

  const routeResult = auditStudioRoutes();
  const sceneResult = auditSceneStacks(context?.projectId);
  const assetResult = auditAssetRegistry();
  const continuityResult = auditWorldContinuity();

  const webpageViolations = detectWebpageViolations(webpageInputs);
  const allViolations = [
    ...webpageViolations,
    ...routeResult.violations,
    ...sceneResult.violations,
    ...assetResult.violations,
    ...continuityResult.violations,
  ];

  const memoryBoost = memoryConsistencyBoost(context?.route, context?.departmentId);
  const scores = buildScores(routeResult, sceneResult, assetResult, continuityResult, memoryBoost);
  const recommendations = generateRecommendations(allViolations);

  const upcomingMigrations = STUDIO_WORLD_MIGRATION_AUDIT.filter(
    (r) => r.migrationPriority === 'P0' || r.migrationPriority === 'P1'
  )
    .slice(0, 12)
    .map((r) => ({
      route: r.currentRoute,
      priority: r.migrationPriority,
      room: r.room,
    }));

  const criticalCount = allViolations.filter((v) => v.severity === 'critical').length;
  const passed = criticalCount === 0 && scores.overallHeadquartersQuality >= 40;

  const highCostRoutes = STUDIO_WORLD_MIGRATION_AUDIT.filter(
    (r) => r.estimatedGenerationCost === '$$$'
  ).length;
  const savingsRoutes = STUDIO_WORLD_MIGRATION_AUDIT.filter((r) => r.estimatedReusePct >= 50).length;

  return {
    auditedAt: new Date().toISOString(),
    scores,
    violations: allViolations,
    recommendations,
    remainingWebpages: summary.flaggedWebpageLike,
    immersiveLiveCount: summary.immersiveLive,
    brokenRoutes: routeResult.brokenRoutes,
    duplicateAssetCount: assetResult.duplicateAssetCount,
    sceneReusePct: sceneResult.sceneReusePct,
    registryEfficiencyPct: assetResult.registryEfficiencyPct,
    estimatedGenerationBudget: `$${highCostRoutes * 120}–$${highCostRoutes * 280} (est.)`,
    estimatedOptimizationSavings: `${savingsRoutes} routes eligible for reuse-first migration`,
    upcomingMigrations,
    passed,
  };
}

export function runArchitectureAuditorGate(
  context: ArchitectureAuditorGateContext
): ArchitectureAuditorGateResult {
  const report = runStudioWorldArchitectureAudit(context);
  const critical = report.violations.filter((v) => v.severity === 'critical');

  if (context.kind === 'generation' && critical.length > 0) {
    return {
      ok: true,
      passed: false,
      proceed: false,
      report,
      reason: `Architecture Auditor™ blocked: ${critical[0]?.problem ?? 'critical violation'}`,
    };
  }

  if (context.kind === 'scene' && report.scores.sceneStack < 30) {
    return {
      ok: true,
      passed: false,
      proceed: false,
      report,
      reason: 'Scene Stack™ incomplete — missing required layers before Quality Inspector™',
    };
  }

  const passed = report.passed || context.kind === 'continuous';
  return {
    ok: true,
    passed,
    proceed: passed,
    report,
    reason: passed ? undefined : 'Architecture violations require immersive replacement before deploy',
  };
}

export function requestArchitectureAudit(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('studio-world-architecture-audit-requested'));
  }
}
