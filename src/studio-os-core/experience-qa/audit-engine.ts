import { getOrganizationDesignComplianceEngineProfile } from '../design-compliance-engine/store';
import { getOrganizationExperienceEngineProfile } from '../experience-engine/store';
import { getOrganizationInteractionEngineProfile } from '../interaction-engine/store';
import {
  EVALUATION_CATEGORIES,
  EVALUATION_CATEGORY_LABELS,
  EXPERIENCE_ISSUE_LABELS,
} from './constants';
import type { CategoryEvaluationScore, EvaluationCategory, ExperienceFinding } from './types';

export const PAGE_SEEDS = [
  { pageId: 'mission-control', pageLabel: 'Mission Control', route: '/admin/studio/mission-control' },
  { pageId: 'qa-headquarters', pageLabel: 'QA Headquarters', route: '/admin/studio/qa-headquarters' },
  { pageId: 'executive-trust-dashboard', pageLabel: 'Executive Trust Dashboard', route: '/admin/studio/executive-trust-dashboard' },
  { pageId: 'predictive-qa', pageLabel: 'Predictive QA', route: '/admin/studio/predictive-qa' },
  { pageId: 'organizational-guardian', pageLabel: 'Organizational Guardian', route: '/admin/studio/organizational-guardian' },
  { pageId: 'design-compliance-engine', pageLabel: 'Design Compliance Engine', route: '/admin/studio/design-compliance-engine' },
  { pageId: 'prompt-qa', pageLabel: 'Prompt QA', route: '/admin/studio/prompt-qa' },
  { pageId: 'confidence-engine', pageLabel: 'Confidence Engine', route: '/admin/studio/confidence-engine' },
];

const FINDING_SEEDS: Omit<
  ExperienceFinding,
  'id' | 'issueLabel' | 'categoryLabel' | 'pageId' | 'pageLabel'
>[] = [
  {
    issueType: 'overwhelming-density',
    category: 'cognitive-load',
    severity: 'warning',
    description: 'Overview displays 14 simultaneous metrics — exceeds calm executive density threshold.',
    emotionalImpact: 'Screen feels overwhelming — users experience decision fatigue before understanding priority.',
    suggestedImprovement: 'Reduce hero to 4 primary metrics · progressive disclosure for secondary data · increase whitespace.',
  },
  {
    issueType: 'unnecessary-friction',
    category: 'interaction-friction',
    severity: 'critical',
    description: 'Three-step navigation required to reach primary daily action from Mission Control entry.',
    emotionalImpact: 'Unnecessary friction erodes trust — users feel Studio OS respects process over their time.',
    suggestedImprovement: 'Surface primary action on hero · reduce clicks to task completion · optimize for confidence.',
  },
  {
    issueType: 'unpredictable-flow',
    category: 'navigation',
    severity: 'warning',
    description: 'Tab switch does not preserve scroll context — users lose orientation mid-review.',
    emotionalImpact: 'Users cannot predict what happens next — confidence drops during multi-tab workflows.',
    suggestedImprovement: 'Preserve scroll position · add breadcrumb continuity · predictable tab transitions from Interaction Engine.',
  },
  {
    issueType: 'confidence-eroding',
    category: 'user-confidence',
    severity: 'critical',
    description: 'Destructive action button same visual weight as primary CTA — no confirmation hierarchy.',
    emotionalImpact: 'Interaction does not build confidence — users hesitate to act, fearing unintended consequences.',
    suggestedImprovement: 'Demote destructive actions · add executive confirmation pattern · increase primary CTA clarity.',
  },
  {
    issueType: 'emotional-anxiety',
    category: 'emotional-experience',
    severity: 'warning',
    description: 'Rapid animation timing (150ms) on dense dashboard creates anxious visual rhythm.',
    emotionalImpact: 'Experience is not emotionally calm — rushed motion contradicts Studio OS luxury standards.',
    suggestedImprovement: 'Apply calm motion tokens (280ms) · reduce simultaneous animations · reference Design Compliance Engine.',
  },
  {
    issueType: 'not-premium',
    category: 'visual-flow',
    severity: 'warning',
    description: 'Flat panel backgrounds without glass depth on secondary cards.',
    emotionalImpact: 'Does not feel premium — generic admin aesthetic breaks immersive Studio OS environment.',
    suggestedImprovement: 'Apply crystal acrylic glass surfaces · chrome accents · white marble environment tokens.',
  },
  {
    issueType: 'time-disrespect',
    category: 'task-completion',
    severity: 'advisory',
    description: 'Alerts tab requires 4 screen-heights of scrolling for 8 items.',
    emotionalImpact: 'Does not respect user time — excessive scrolling signals poor information architecture.',
    suggestedImprovement: 'Collapse cards · severity filters · surface priority alerts above fold.',
  },
  {
    issueType: 'not-studio-os-feel',
    category: 'executive-clarity',
    severity: 'critical',
    description: 'Mixed typography and arbitrary accent colors break Studio OS design language.',
    emotionalImpact: 'Does not feel like Studio OS — users lose the calm, trustworthy operating system identity.',
    suggestedImprovement: 'Audit against Design Compliance Engine · enforce Executive IA patterns · inherit design tokens.',
  },
  {
    issueType: 'confusion-point',
    category: 'information-architecture',
    severity: 'warning',
    description: 'Search input visually dominates hero narrative — inverted information hierarchy.',
    emotionalImpact: 'Point of confusion — users unsure whether to search or read executive briefing first.',
    suggestedImprovement: 'Demote search to secondary position · strengthen hero typography · clarify primary narrative.',
  },
  {
    issueType: 'decision-fatigue',
    category: 'decision-fatigue',
    severity: 'warning',
    description: 'Six equally weighted CTAs above the fold compete for attention.',
    emotionalImpact: 'Decision fatigue — users paralyzed by choice instead of guided toward priority action.',
    suggestedImprovement: 'Single primary CTA · demote secondary actions · executive hierarchy from Design System.',
  },
  {
    issueType: 'learning-barrier',
    category: 'learning-curve',
    severity: 'advisory',
    description: 'Module-specific jargon without contextual tooltips for first-time users.',
    emotionalImpact: 'Steep learning curve — first-time users feel excluded from executive intelligence layer.',
    suggestedImprovement: 'Add progressive onboarding · contextual page guides from Documentation Registry.',
  },
  {
    issueType: 'accessibility-gap',
    category: 'accessibility',
    severity: 'critical',
    description: 'Focus indicators insufficient contrast on glass panels at 768px breakpoint.',
    emotionalImpact: 'Accessibility users cannot navigate confidently — exclusion from Studio OS experience.',
    suggestedImprovement: 'Apply Interaction Engine focus tokens · test at RESPONSIVE_BREAKPOINTS · WCAG contrast audit.',
  },
];

export function buildCategoryScores(organizationId: string): CategoryEvaluationScore[] {
  const experience = getOrganizationExperienceEngineProfile(organizationId);
  const interaction = getOrganizationInteractionEngineProfile(organizationId);
  const design = getOrganizationDesignComplianceEngineProfile(organizationId);

  const experienceScore = experience?.atmosphereScore ?? 82;
  const interactionScore = interaction?.engineScore ?? 80;
  const designScore = design?.creativeDirectorScore ?? 78;

  const baseScores: Record<EvaluationCategory, number> = {
    navigation: interactionScore,
    'information-architecture': Math.round((interactionScore + designScore) / 2),
    'cognitive-load': Math.max(68, designScore - 6),
    'interaction-friction': Math.max(70, interactionScore - 4),
    'task-completion': Math.round((interactionScore + experienceScore) / 2),
    'user-confidence': Math.round((experienceScore + designScore) / 2),
    'visual-flow': designScore,
    'emotional-experience': experienceScore,
    'learning-curve': Math.max(72, experienceScore - 5),
    'decision-fatigue': Math.max(70, designScore - 8),
    'perceived-performance': Math.max(75, interactionScore - 2),
    accessibility: Math.max(72, interactionScore - 6),
    'executive-clarity': Math.round((designScore + experienceScore) / 2),
  };

  return EVALUATION_CATEGORIES.map((category) => {
    const score = baseScores[category];
    return {
      category,
      label: EVALUATION_CATEGORY_LABELS[category],
      score,
      status: score >= 85 ? 'excellent' : score >= 72 ? 'watch' : 'needs-work',
      summary: `Evaluated for emotional quality · ${score >= 85 ? 'effortless confidence' : score >= 72 ? 'minor friction detected' : 'experience refinement needed'}`,
    };
  });
}

export function buildExperienceFindings(organizationId: string): ExperienceFinding[] {
  const design = getOrganizationDesignComplianceEngineProfile(organizationId);
  const findings: ExperienceFinding[] = [];

  PAGE_SEEDS.forEach((page, pageIdx) => {
    const pageFindings = FINDING_SEEDS.filter((_, i) => (i + pageIdx) % PAGE_SEEDS.length < 3 || pageIdx === 0);
    pageFindings.slice(0, pageIdx === 0 ? 4 : 2).forEach((seed, i) => {
      findings.push({
        ...seed,
        id: `exp-${page.pageId}-${seed.issueType}-${i}`,
        issueLabel: EXPERIENCE_ISSUE_LABELS[seed.issueType],
        categoryLabel: EVALUATION_CATEGORY_LABELS[seed.category],
        pageId: page.pageId,
        pageLabel: page.pageLabel,
        severity:
          design && design.pagesNonCompliant > 0 && seed.severity === 'warning' ? 'critical' : seed.severity,
      });
    });
  });

  return findings;
}

export function countOpenFindings(findings: ExperienceFinding[]): number {
  return findings.length;
}

export function countPagesNeedingRefinement(reports: import('./types').ExperiencePageReport[]): number {
  return reports.filter((r) => !r.feelsEffortless).length;
}

export function computeOverallExperienceScore(reports: import('./types').ExperiencePageReport[]): number {
  if (reports.length === 0) return 80;
  return Math.round(reports.reduce((s, r) => s + r.experienceScore, 0) / reports.length);
}
