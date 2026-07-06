import type { ComplianceFinding, PageComplianceReport } from './types';

const PAGE_ROUTES: Record<string, { pageId: string; pageLabel: string; route: string }> = {
  'mission-control': { pageId: 'mission-control', pageLabel: 'Mission Control', route: '/admin/studio/mission-control' },
  'qa-headquarters': { pageId: 'qa-headquarters', pageLabel: 'QA Headquarters', route: '/admin/studio/qa-headquarters' },
  'executive-trust-dashboard': { pageId: 'executive-trust-dashboard', pageLabel: 'Executive Trust Dashboard', route: '/admin/studio/executive-trust-dashboard' },
  'predictive-qa': { pageId: 'predictive-qa', pageLabel: 'Predictive QA', route: '/admin/studio/predictive-qa' },
  'organizational-guardian': { pageId: 'organizational-guardian', pageLabel: 'Organizational Guardian', route: '/admin/studio/organizational-guardian' },
  'design-token-engine': { pageId: 'design-token-engine', pageLabel: 'Design Token Engine', route: '/admin/studio/design-token-engine' },
  'confidence-engine': { pageId: 'confidence-engine', pageLabel: 'Confidence Engine', route: '/admin/studio/confidence-engine' },
  'time-machine': { pageId: 'time-machine', pageLabel: 'Time Machine', route: '/admin/studio/time-machine' },
};

function buildVerdict(recognized: boolean, luxuryScore: number): string {
  if (recognized) {
    return `Yes — Apple, Pixar, and luxury design reviewers would recognize this as Studio OS. Luxury score ${luxuryScore}%.`;
  }
  return `No — this page does not yet feel like Studio OS. Luxury score ${luxuryScore}% — see findings for specific violations against the Design System.`;
}

export function buildPageComplianceReports(findings: ComplianceFinding[], now: string): PageComplianceReport[] {
  const allPages = Object.values(PAGE_ROUTES);

  return allPages.map((page) => {
    const pageFindings = findings.filter((f) => f.pageId === page.pageId);
    const criticalCount = pageFindings.filter((f) => f.severity === 'critical').length;
    const warningCount = pageFindings.filter((f) => f.severity === 'warning').length;

    const designScore = Math.max(45, 96 - criticalCount * 12 - warningCount * 5);
    const consistencyScore = Math.max(50, 94 - pageFindings.filter((f) => f.category === 'brand-consistency' || f.category === 'component-usage').length * 8);
    const luxuryScore = Math.max(48, 92 - pageFindings.filter((f) => f.category === 'luxury-design-standards' || f.category === 'visual-rhythm').length * 7);
    const accessibilityScore = Math.max(55, 90 - pageFindings.filter((f) => f.category === 'accessibility').length * 10);
    const visualComplexity = Math.min(85, 35 + pageFindings.filter((f) => f.issueType === 'visual-clutter' || f.issueType === 'competing-focal-points').length * 15);
    const hierarchyQuality = Math.max(50, 95 - pageFindings.filter((f) => f.category === 'hierarchy').length * 12);

    const recognized = designScore >= 80 && luxuryScore >= 78 && criticalCount === 0;
    const improvements = pageFindings.slice(0, 4).map((f) => f.suggestedImprovement);

    return {
      id: `report-${page.pageId}`,
      pageId: page.pageId,
      pageLabel: page.pageLabel,
      route: page.route,
      designScore,
      consistencyScore,
      luxuryScore,
      accessibilityScore,
      visualComplexity,
      hierarchyQuality,
      suggestedImprovements: improvements.length > 0 ? improvements : ['Maintain current compliance — re-audit after next design system update.'],
      recognizedAsStudioOs: recognized,
      creativeDirectorVerdict: buildVerdict(recognized, luxuryScore),
      findingsCount: pageFindings.length,
      auditedAt: now,
    };
  }).sort((a, b) => a.designScore - b.designScore);
}

export function summarizeDesignCompliance(profile: {
  creativeDirectorScore: number;
  pagesAudited: number;
  findingsOpen: number;
  pagesNonCompliant: number;
  averageLuxuryScore: number;
}): string {
  return `Design Compliance Engine™ ${profile.creativeDirectorScore}% Creative Director score · ${profile.pagesAudited} pages audited · ${profile.findingsOpen} findings · ${profile.pagesNonCompliant} not yet Studio OS · avg luxury ${profile.averageLuxuryScore}%.`;
}

export function buildDockComplianceLine(profile: {
  creativeDirectorScore: number;
  findingsOpen: number;
  pagesNonCompliant: number;
  pageReports: PageComplianceReport[];
}): string {
  const worst = profile.pageReports.find((p) => !p.recognizedAsStudioOs);
  const worstLine = worst ? ` Focus: ${worst.pageLabel} (${worst.designScore}% design).` : '';
  return `Creative Director ${profile.creativeDirectorScore}% · ${profile.findingsOpen} findings · ${profile.pagesNonCompliant} pages need refinement.${worstLine}`;
}

export function explainFinding(finding: ComplianceFinding): string {
  return `${finding.description} Why not Studio OS: ${finding.whyNotStudioOs} Fix: ${finding.suggestedImprovement}`;
}
