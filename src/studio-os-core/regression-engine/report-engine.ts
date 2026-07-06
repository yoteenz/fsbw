import type { BrokenFeature, BuildRegressionReport, RegressionRiskLevel } from './types';
import { SYSTEM_SEEDS } from './regression-engine';

function deriveRiskLevel(criticalCount: number, warningCount: number): RegressionRiskLevel {
  if (criticalCount >= 2) return 'critical';
  if (criticalCount >= 1) return 'high';
  if (warningCount >= 3) return 'medium';
  return 'low';
}

function buildVerdict(score: number, riskLevel: RegressionRiskLevel, brokenCount: number): string {
  if (score >= 90 && brokenCount === 0) {
    return `Build verified — Regression Score ${score}% · risk ${riskLevel}. Studio OS remembers everything that worked.`;
  }
  if (score >= 80) {
    return `Minor regressions detected — Score ${score}% · ${brokenCount} broken feature(s). Review before production.`;
  }
  return `Regression attention required — Score ${score}% · risk ${riskLevel}. See rollback recommendation.`;
}

export function buildBuildRegressionReports(
  brokenFeatures: BrokenFeature[],
  now: string
): BuildRegressionReport[] {
  const builds = [
    { buildId: 'build-current', buildLabel: 'Current Build' },
    { buildId: 'build-previous', buildLabel: 'Previous Release' },
    { buildId: 'build-nightly', buildLabel: 'Nightly Verification' },
  ];

  return builds.map((build, idx) => {
    const slice = brokenFeatures.slice(idx * 4, idx * 4 + (idx === 0 ? 6 : 3));
    const criticalCount = slice.filter((f) => f.severity === 'critical').length;
    const warningCount = slice.filter((f) => f.severity === 'warning').length;
    const regressionScore = Math.max(45, 96 - criticalCount * 14 - warningCount * 6 - idx * 4);
    const riskLevel = deriveRiskLevel(criticalCount, warningCount);
    const affectedSystems = [...new Set(slice.flatMap((f) => f.affectedSystems))];
    const unexpectedChanges = slice.map((f) => f.unexpectedChange);
    const suggestedFixes = slice.map((f) => f.suggestedFix);
    const rollbackNeeded = criticalCount > 0;

    return {
      id: `regression-report-${build.buildId}`,
      buildId: build.buildId,
      buildLabel: build.buildLabel,
      regressionScore,
      brokenFeatures: slice.map((f) => f.featureLabel),
      unexpectedChanges: unexpectedChanges.length > 0 ? unexpectedChanges : ['No unexpected changes detected.'],
      affectedSystems: affectedSystems.length > 0 ? affectedSystems : SYSTEM_SEEDS.slice(0, 3).map((s) => s.systemLabel),
      rootCauseAnalysis:
        slice.length > 0
          ? slice.map((f) => `${f.featureLabel}: ${f.rootCause}`).join(' · ')
          : 'No root causes identified — all related systems passed retest.',
      riskLevel,
      suggestedFixes: suggestedFixes.length > 0 ? suggestedFixes : ['Continue monitoring — no fixes required.'],
      rollbackRecommendation: rollbackNeeded
        ? `Rollback recommended for ${criticalCount} critical regression(s) before production deploy.`
        : 'No rollback required — regressions are advisory or resolved.',
      regressionVerdict: buildVerdict(regressionScore, riskLevel, slice.length),
      brokenFeaturesCount: slice.length,
      generatedAt: now,
    };
  }).sort((a, b) => b.regressionScore - a.regressionScore);
}

export function summarizeRegressionEngine(profile: {
  overallRegressionScore: number;
  buildsTested: number;
  brokenFeaturesOpen: number;
  regressionsInHistory: number;
  recurringPatterns: number;
}): string {
  return `Regression Engine™ ${profile.overallRegressionScore}% · ${profile.buildsTested} builds · ${profile.brokenFeaturesOpen} broken features · ${profile.regressionsInHistory} in Historical Memory™ · ${profile.recurringPatterns} recurring pattern(s).`;
}

export function buildDockRegressionLine(profile: {
  overallRegressionScore: number;
  brokenFeaturesOpen: number;
  recurringPatterns: number;
  buildReports: BuildRegressionReport[];
}): string {
  const worst = profile.buildReports.find((r) => r.riskLevel === 'critical' || r.riskLevel === 'high');
  const worstLine = worst ? ` Focus: ${worst.buildLabel} (${worst.regressionScore}%).` : '';
  return `Regression ${profile.overallRegressionScore}% · ${profile.brokenFeaturesOpen} broken · ${profile.recurringPatterns} patterns.${worstLine}`;
}

export function explainBrokenFeature(feature: BrokenFeature): string {
  return `${feature.description} Root cause: ${feature.rootCause}. Fix: ${feature.suggestedFix}`;
}
