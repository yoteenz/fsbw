import type { GoldenReference, ScreenshotComparison, VisualDiffFinding, VisualQaReport } from './types';
import { COMPARE_BASE_LABELS } from './constants';
import { SCREEN_SEEDS, getTokenBaselineScore } from './diff-engine';
import { getGoldenReferenceForScreen } from './golden-reference-engine';

function buildVerdict(matchesGolden: boolean, consistencyScore: number): string {
  if (matchesGolden) {
    return `Yes — still looks like Studio OS. Visual Consistency ${consistencyScore}% · matches Golden Reference™ baseline.`;
  }
  return `No — visual regression detected. Consistency ${consistencyScore}% · screen no longer matches approved Studio OS visual identity. See suggested corrections.`;
}

export function buildScreenshotComparisons(
  screenId: string,
  screenLabel: string,
  findings: VisualDiffFinding[],
  golden: GoldenReference | null
): ScreenshotComparison[] {
  const screenFindings = findings.filter((f) => f.screenId === screenId);
  const bases = [...new Set(screenFindings.map((f) => f.compareBase))];

  return bases.slice(0, 3).map((base, idx) => ({
    id: `screenshot-${screenId}-${base}`,
    screenId,
    screenLabel,
    baselineLabel: COMPARE_BASE_LABELS[base],
    currentLabel: 'Current Build',
    pixelDiffPct: Math.min(18, 1.2 + screenFindings.length * 1.8 + idx * 0.5),
    regionsChanged: screenFindings.slice(0, 3).map((f) => f.issueLabel),
    summary: `${screenLabel}: ${COMPARE_BASE_LABELS[base]} vs Current Build — ${screenFindings.length} visual delta(s)${golden ? ` · Golden Reference ${golden.referenceVersion}` : ''}.`,
  }));
}

export function buildVisualQaReports(
  findings: VisualDiffFinding[],
  goldenReferences: GoldenReference[],
  organizationId: string,
  now: string
): VisualQaReport[] {
  const tokenBaseline = getTokenBaselineScore(organizationId);

  return SCREEN_SEEDS.map((screen) => {
    const screenFindings = findings.filter((f) => f.screenId === screen.screenId);
    const criticalCount = screenFindings.filter((f) => f.severity === 'critical').length;
    const warningCount = screenFindings.filter((f) => f.severity === 'warning').length;
    const golden = getGoldenReferenceForScreen(goldenReferences, screen.screenId);

    const visualConsistencyScore = Math.max(42, Math.min(99, tokenBaseline - criticalCount * 10 - warningCount * 4));
    const brandComplianceScore = Math.max(45, 96 - screenFindings.filter((f) => f.issueType === 'brand-inconsistencies' || f.issueType === 'color-drift').length * 12);
    const responsiveScore = Math.max(48, 94 - screenFindings.filter((f) => f.issueType === 'responsive-drift').length * 15);
    const componentIntegrity = Math.max(50, 95 - screenFindings.filter((f) => f.issueType === 'missing-components' || f.issueType === 'component-movement').length * 11);
    const animationIntegrity = Math.max(55, 93 - screenFindings.filter((f) => f.issueType === 'animation-changes').length * 10);
    const luxuryScore = Math.max(46, 92 - screenFindings.filter((f) => f.issueType === 'glass-inconsistencies' || f.issueType === 'broken-environmental-storytelling').length * 9);

    const screenshotComparisons = buildScreenshotComparisons(screen.screenId, screen.screenLabel, screenFindings, golden);
    const corrections = screenFindings.slice(0, 4).map((f) => f.suggestedCorrection);
    const matchesGoldenReference = visualConsistencyScore >= 82 && criticalCount === 0 && (golden?.pixelDiffPct ?? 0) < 2;

    return {
      id: `vqa-${screen.screenId}`,
      screenId: screen.screenId,
      screenLabel: screen.screenLabel,
      route: screen.route,
      visualConsistencyScore,
      brandComplianceScore,
      responsiveScore,
      componentIntegrity,
      animationIntegrity,
      luxuryScore,
      screenshotComparisons,
      suggestedCorrections:
        corrections.length > 0 ? corrections : ['No corrections needed — maintain Golden Reference™ alignment.'],
      matchesGoldenReference,
      visualIdentityVerdict: buildVerdict(matchesGoldenReference, visualConsistencyScore),
      findingsCount: screenFindings.length,
      auditedAt: now,
    };
  }).sort((a, b) => a.visualConsistencyScore - b.visualConsistencyScore);
}

export function summarizeVisualDiff(profile: {
  visualMemoryScore: number;
  screensCompared: number;
  diffsDetected: number;
  screensWithRegressions: number;
  goldenReferencesActive: number;
}): string {
  return `Visual Diff Engine™ ${profile.visualMemoryScore}% visual memory · ${profile.screensCompared} screens · ${profile.diffsDetected} diffs · ${profile.screensWithRegressions} regressions · ${profile.goldenReferencesActive} Golden References™ active.`;
}

export function buildDockVisualDiffLine(profile: {
  visualMemoryScore: number;
  diffsDetected: number;
  screensWithRegressions: number;
  visualReports: VisualQaReport[];
}): string {
  const worst = profile.visualReports.find((r) => !r.matchesGoldenReference);
  const worstLine = worst ? ` Focus: ${worst.screenLabel} (${worst.visualConsistencyScore}% consistency).` : '';
  return `Visual memory ${profile.visualMemoryScore}% · ${profile.diffsDetected} diffs · ${profile.screensWithRegressions} regressions.${worstLine}`;
}

export function explainVisualDiffFinding(finding: VisualDiffFinding): string {
  return `${finding.description} Delta: ${finding.visualDelta} Fix: ${finding.suggestedCorrection}`;
}
