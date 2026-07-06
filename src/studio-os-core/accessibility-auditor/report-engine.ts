import type { AccessibilityFinding, AccessibilityPageReport, AccessibilitySeverity, WcagLevel } from './types';
import { PAGE_SEEDS } from './audit-engine';

function severityRank(s: AccessibilitySeverity): number {
  return s === 'critical' ? 3 : s === 'warning' ? 2 : 1;
}

function deriveWcagLevel(score: number, criticalCount: number): WcagLevel {
  if (criticalCount > 0) return score >= 70 ? 'partial' : 'non-compliant';
  if (score >= 92) return 'AAA';
  if (score >= 85) return 'AA';
  if (score >= 75) return 'A';
  return 'partial';
}

function buildVerdict(inclusive: boolean, score: number, wcag: WcagLevel): string {
  if (inclusive) {
    return `Inclusive and usable — Accessibility Score ${score}% · WCAG ${wcag}. Accessibility feels invisible.`;
  }
  return `Barriers detected — Score ${score}% · WCAG ${wcag}. Inclusive design refinement needed before all users can confidently use this page.`;
}

function aggregateUserImpact(findings: AccessibilityFinding[]): string {
  const impacts = findings.slice(0, 3).map((f) => f.estimatedUserImpact);
  return impacts.length > 0 ? impacts.join(' · ') : 'Minimal user impact — maintain inclusive design standards.';
}

export function buildAccessibilityPageReports(findings: AccessibilityFinding[], now: string): AccessibilityPageReport[] {
  return PAGE_SEEDS.map((page) => {
    const pageFindings = findings.filter((f) => f.pageId === page.pageId);
    const criticalCount = pageFindings.filter((f) => f.severity === 'critical').length;
    const warningCount = pageFindings.filter((f) => f.severity === 'warning').length;
    const highestSeverity = pageFindings.reduce<AccessibilitySeverity>(
      (max, f) => (severityRank(f.severity) > severityRank(max) ? f.severity : max),
      'advisory'
    );

    const accessibilityScore = Math.max(44, 96 - criticalCount * 12 - warningCount * 5);
    const wcagComplianceStatus = deriveWcagLevel(accessibilityScore, criticalCount);
    const affectedComponents = [...new Set(pageFindings.flatMap((f) => f.affectedComponents))].slice(0, 6);
    const improvements = pageFindings.slice(0, 4).map((f) => f.suggestedImprovement);
    const inclusivelyUsable = accessibilityScore >= 82 && criticalCount === 0;

    return {
      id: `a11y-report-${page.pageId}`,
      pageId: page.pageId,
      pageLabel: page.pageLabel,
      route: page.route,
      accessibilityScore,
      wcagComplianceStatus,
      issuesFound: pageFindings.length,
      highestSeverity: pageFindings.length > 0 ? highestSeverity : 'advisory',
      affectedComponents: affectedComponents.length > 0 ? affectedComponents : ['No components flagged'],
      suggestedImprovements:
        improvements.length > 0 ? improvements : ['Maintain current accessibility quality — re-audit after next release.'],
      estimatedUserImpact: aggregateUserImpact(pageFindings),
      inclusivelyUsable,
      accessibilityVerdict: buildVerdict(inclusivelyUsable, accessibilityScore, wcagComplianceStatus),
      auditedAt: now,
    };
  }).sort((a, b) => a.accessibilityScore - b.accessibilityScore);
}

export function summarizeAccessibilityAuditor(profile: {
  overallAccessibilityScore: number;
  pagesAudited: number;
  issuesOpen: number;
  pagesNeedingWork: number;
  averageWcagLevel: WcagLevel;
}): string {
  return `Accessibility Auditor™ ${profile.overallAccessibilityScore}% · ${profile.pagesAudited} pages · ${profile.issuesOpen} issues · ${profile.pagesNeedingWork} need work · avg WCAG ${profile.averageWcagLevel}.`;
}

export function buildDockAccessibilityLine(profile: {
  overallAccessibilityScore: number;
  issuesOpen: number;
  pagesNeedingWork: number;
  pageReports: AccessibilityPageReport[];
}): string {
  const worst = profile.pageReports.find((p) => !p.inclusivelyUsable);
  const worstLine = worst ? ` Focus: ${worst.pageLabel} (${worst.accessibilityScore}% · WCAG ${worst.wcagComplianceStatus}).` : '';
  return `Accessibility ${profile.overallAccessibilityScore}% · ${profile.issuesOpen} issues · ${profile.pagesNeedingWork} pages need inclusive refinement.${worstLine}`;
}

export function explainAccessibilityFinding(finding: AccessibilityFinding): string {
  return `${finding.description} Impact: ${finding.estimatedUserImpact} Fix: ${finding.suggestedImprovement}`;
}
