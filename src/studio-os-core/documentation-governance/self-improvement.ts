import { runDocumentationAudits } from './audit-engine';
import { validateAllFeatureCoverage } from './coverage-validator';
import { scanTerminologyInconsistencies } from './consistency-engine';
import type { SelfImprovementRecommendation } from './types';

/** Continuous self-improvement — identify documentation enhancement opportunities. */
export function generateSelfImprovementRecommendations(): SelfImprovementRecommendation[] {
  const recs: SelfImprovementRecommendation[] = [];
  const audits = runDocumentationAudits();
  const coverage = validateAllFeatureCoverage();
  const terminology = scanTerminologyInconsistencies();

  const noAcademy = audits.filter((a) => a.issueType === 'missing-academy' && a.severity !== 'info');
  if (noAcademy.length > 0) {
    recs.push({
      id: 'si-academy-gap',
      category: 'academy',
      priority: 'high',
      title: `${noAcademy.length} live features lack Academy lessons`,
      detail: noAcademy.slice(0, 3).map((a) => a.featureName).join(', ') + (noAcademy.length > 3 ? '…' : ''),
      action: 'Register academyLessons — Studio Institute™ auto-generates learning content.',
    });
  }

  const noWalkthrough = audits.filter((a) => a.issueType === 'missing-walkthrough' && a.severity === 'warning');
  if (noWalkthrough.length > 0) {
    recs.push({
      id: 'si-walkthrough-gap',
      category: 'walkthrough',
      priority: 'high',
      title: 'Onboarding guidance missing for key features',
      detail: `${noWalkthrough.length} features not linked to inauguration walkthrough.`,
      action: 'Add walkthroughReferences — walkthrough updates automatically from registry.',
    });
  }

  const searchGaps = audits.filter((a) => a.issueType === 'missing-search-keywords');
  if (searchGaps.length >= 3) {
    recs.push({
      id: 'si-search-gap',
      category: 'search-gap',
      priority: 'medium',
      title: 'Frequently searched concepts may lack keywords',
      detail: `${searchGaps.length} features have sparse search metadata.`,
      action: 'Expand keywords and searchSynonyms for smart search discoverability.',
    });
  }

  if (terminology.length > 0) {
    recs.push({
      id: 'si-terminology',
      category: 'terminology',
      priority: terminology.length > 3 ? 'high' : 'medium',
      title: 'Confusing terminology detected across help surfaces',
      detail: `${terminology.length} inconsistencies — e.g. "${terminology[0]?.foundVariant}" vs "${terminology[0]?.officialTerm}".`,
      action: 'Run Consistency Engine fixes — enforce official Studio OS terminology.',
    });
  }

  const belowStandard = coverage.filter((c) => !c.complete);
  if (belowStandard.length > 0) {
    recs.push({
      id: 'si-coverage',
      category: 'coverage',
      priority: 'high',
      title: `Documentation coverage below 95% for ${belowStandard.length} features`,
      detail: belowStandard.slice(0, 3).map((c) => `${c.featureName} (${c.coveragePct}%)`).join(' · '),
      action: 'Complete missing surfaces before considering features production-ready.',
    });
  }

  recs.push({
    id: 'si-onboarding',
    category: 'onboarding',
    priority: 'medium',
    title: 'Improve Getting Started completion',
    detail: 'Ensure walkthrough steps reference latest M120–M126 intelligence stack.',
    action: 'Review Documentation Registry™ walkthrough sync and Getting Started progression.',
  });

  return recs.sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return rank[a.priority] - rank[b.priority];
  });
}
