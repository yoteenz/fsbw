import { getOrganizationDesignTokenEngineProfile } from '../design-token-engine/store';
import { getOrganizationInteractionEngineProfile } from '../interaction-engine/store';
import { getOrganizationQaInspectorProfile } from '../qa-inspector/store';
import {
  AUDIT_CATEGORIES,
  AUDIT_CATEGORY_LABELS,
  STUDIO_OS_DESIGN_RULES,
  VALIDATION_ISSUE_LABELS,
} from './constants';
import type { AuditCategory, CategoryAuditScore, ComplianceFinding } from './types';

const PAGE_SEEDS = [
  { pageId: 'mission-control', pageLabel: 'Mission Control', route: '/admin/studio/mission-control' },
  { pageId: 'qa-headquarters', pageLabel: 'QA Headquarters', route: '/admin/studio/qa-headquarters' },
  { pageId: 'executive-trust-dashboard', pageLabel: 'Executive Trust Dashboard', route: '/admin/studio/executive-trust-dashboard' },
  { pageId: 'predictive-qa', pageLabel: 'Predictive QA', route: '/admin/studio/predictive-qa' },
  { pageId: 'organizational-guardian', pageLabel: 'Organizational Guardian', route: '/admin/studio/organizational-guardian' },
  { pageId: 'design-token-engine', pageLabel: 'Design Token Engine', route: '/admin/studio/design-token-engine' },
  { pageId: 'confidence-engine', pageLabel: 'Confidence Engine', route: '/admin/studio/confidence-engine' },
  { pageId: 'time-machine', pageLabel: 'Time Machine', route: '/admin/studio/time-machine' },
];

const FINDING_SEEDS: Omit<ComplianceFinding, 'id' | 'issueLabel' | 'categoryLabel' | 'pageId' | 'pageLabel'>[] = [
  {
    issueType: 'incorrect-spacing',
    category: 'spacing',
    severity: 'warning',
    description: 'Tab bar uses 4px gap instead of canonical 8px token spacing.',
    whyNotStudioOs: 'Architectural layouts require consistent rhythm — irregular spacing breaks executive hierarchy and visual calm.',
    suggestedImprovement: 'Apply spacing.token.sm (8px) between tab controls · inherit from Design Token Engine.',
    designRuleViolated: 'Architectural layouts',
  },
  {
    issueType: 'inconsistent-typography',
    category: 'typography',
    severity: 'critical',
    description: 'Body copy mixes Futura PT Medium with system sans-serif on secondary cards.',
    whyNotStudioOs: 'Luxury-first presentation demands single typographic voice — mixed fonts feel unfinished, not Studio OS.',
    suggestedImprovement: 'Enforce font-futura on all ExecutiveSecondaryCard content · reference typography tokens.',
    designRuleViolated: 'Luxury-first presentation',
  },
  {
    issueType: 'missing-glass-effects',
    category: 'glassmorphism',
    severity: 'warning',
    description: 'Hero panel uses flat background instead of crystal acrylic glass depth.',
    whyNotStudioOs: 'Studio OS environments use glass depth and white marble — flat panels feel like generic admin software.',
    suggestedImprovement: 'Apply glass.blur.md + glass.opacity.surface tokens · add subtle chrome accent border.',
    designRuleViolated: 'Crystal acrylic surfaces',
  },
  {
    issueType: 'wrong-brand-colors',
    category: 'color-system',
    severity: 'critical',
    description: 'CTA button uses #3B82F6 instead of module accent from Design Token Engine.',
    whyNotStudioOs: 'Brand consistency requires accent inheritance — arbitrary blues break the Studio OS color system.',
    suggestedImprovement: 'Replace hardcoded hex with module accent prop · validate against brand-color tokens.',
    designRuleViolated: 'Chrome accents',
  },
  {
    issueType: 'improper-animation-timing',
    category: 'animation-language',
    severity: 'advisory',
    description: 'Tab transition at 150ms — below calm motion standard of 280ms.',
    whyNotStudioOs: 'Calm motion is a Studio OS design rule — rushed transitions feel anxious, not executive.',
    suggestedImprovement: 'Use animation.timing.calm (280ms) · ease-out curve from Interaction Engine.',
    designRuleViolated: 'Calm motion',
  },
  {
    issueType: 'component-misuse',
    category: 'component-usage',
    severity: 'warning',
    description: 'Custom button styling instead of Executive IA eiaActionBtn pattern.',
    whyNotStudioOs: 'Component registry defines canonical patterns — custom buttons fragment the design language.',
    suggestedImprovement: 'Replace with eiaActionBtn from executive-ia · register variant in Component Registry.',
    designRuleViolated: 'Minimal visual noise',
  },
  {
    issueType: 'visual-clutter',
    category: 'visual-rhythm',
    severity: 'warning',
    description: 'Overview tab displays 14 metrics simultaneously — exceeds focal point threshold.',
    whyNotStudioOs: 'Minimal visual noise and executive hierarchy require restrained information density.',
    suggestedImprovement: 'Reduce hero stats to 4 · move secondary metrics to dedicated tab · increase whitespace.',
    designRuleViolated: 'Minimal visual noise',
  },
  {
    issueType: 'hierarchy-conflicts',
    category: 'hierarchy',
    severity: 'critical',
    description: 'Search input visually dominates hero card — inverted hierarchy.',
    whyNotStudioOs: 'Executive hierarchy places primary narrative first — utility controls should recede.',
    suggestedImprovement: 'Demote search to secondary position · increase hero typography weight · reduce input border contrast.',
    designRuleViolated: 'Executive hierarchy',
  },
  {
    issueType: 'competing-focal-points',
    category: 'hierarchy',
    severity: 'warning',
    description: 'Three accent-colored CTAs compete for attention above the fold.',
    whyNotStudioOs: 'Luxury presentation uses one primary focal point — multiple accents create visual noise.',
    suggestedImprovement: 'Designate single primary CTA · demote others to secondary border style.',
    designRuleViolated: 'Luxury-first presentation',
  },
  {
    issueType: 'broken-responsive-layouts',
    category: 'responsive-layouts',
    severity: 'critical',
    description: 'Dashboard grid collapses incorrectly at 768px — cards overlap.',
    whyNotStudioOs: 'Architectural layouts must breathe at every breakpoint — broken grids destroy immersive environments.',
    suggestedImprovement: 'Apply responsive grid-cols-1 sm:grid-cols-2 · test at RESPONSIVE_BREAKPOINTS.md.',
    designRuleViolated: 'Architectural layouts',
  },
  {
    issueType: 'excessive-scrolling',
    category: 'navigation',
    severity: 'advisory',
    description: 'Alerts tab requires 4 screen-heights of scrolling for 8 items.',
    whyNotStudioOs: 'Immersive environments prioritize overview density — excessive scrolling signals poor information architecture.',
    suggestedImprovement: 'Collapse finding cards · add severity filter · use progressive disclosure.',
    designRuleViolated: 'Immersive environments',
  },
];

export function buildCategoryScores(organizationId: string): CategoryAuditScore[] {
  const tokens = getOrganizationDesignTokenEngineProfile(organizationId);
  const interaction = getOrganizationInteractionEngineProfile(organizationId);
  const tokenScore = tokens?.engineScore ?? 78;
  const interactionScore = interaction?.engineScore ?? 80;

  const baseScores: Record<AuditCategory, number> = {
    typography: Math.min(99, tokenScore + 2),
    spacing: tokenScore,
    hierarchy: Math.round((tokenScore + interactionScore) / 2),
    glassmorphism: Math.max(65, tokenScore - 5),
    'color-system': tokenScore,
    'brand-consistency': Math.min(99, tokenScore + 1),
    'component-usage': Math.round((tokenScore + interactionScore) / 2 - 3),
    'animation-language': interactionScore,
    'micro-interactions': interactionScore,
    'responsive-layouts': Math.max(68, tokenScore - 8),
    navigation: interactionScore,
    accessibility: Math.max(72, interactionScore - 4),
    'visual-rhythm': Math.round((tokenScore + interactionScore) / 2),
    'environmental-storytelling': Math.max(70, tokenScore - 6),
    'luxury-design-standards': Math.round((tokenScore + interactionScore) / 2 + 2),
  };

  return AUDIT_CATEGORIES.map((category) => {
    const score = baseScores[category];
    return {
      category,
      label: AUDIT_CATEGORY_LABELS[category],
      score,
      status: score >= 85 ? 'compliant' : score >= 70 ? 'watch' : 'non-compliant',
      summary: `Audited against ${STUDIO_OS_DESIGN_RULES[category === 'glassmorphism' ? 2 : category === 'luxury-design-standards' ? 9 : 5]} standards`,
    };
  });
}

export function buildComplianceFindings(organizationId: string): ComplianceFinding[] {
  const inspector = getOrganizationQaInspectorProfile(organizationId);
  const findings: ComplianceFinding[] = [];

  PAGE_SEEDS.forEach((page, pageIdx) => {
    const pageFindings = FINDING_SEEDS.filter((_, i) => (i + pageIdx) % PAGE_SEEDS.length < 3 || pageIdx === 0);
    pageFindings.slice(0, pageIdx === 0 ? 4 : 2).forEach((seed, i) => {
      findings.push({
        ...seed,
        id: `finding-${page.pageId}-${seed.issueType}-${i}`,
        issueLabel: VALIDATION_ISSUE_LABELS[seed.issueType],
        categoryLabel: AUDIT_CATEGORY_LABELS[seed.category],
        pageId: page.pageId,
        pageLabel: page.pageLabel,
        severity: inspector && inspector.criticalFindings > 0 && seed.severity === 'warning' ? 'critical' : seed.severity,
      });
    });
  });

  return findings;
}

export function computeCreativeDirectorScore(
  categoryScores: CategoryAuditScore[],
  reports: import('./types').PageComplianceReport[]
): number {
  const avgCategory = categoryScores.reduce((s, c) => s + c.score, 0) / Math.max(categoryScores.length, 1);
  const avgDesign = reports.reduce((s, r) => s + r.designScore, 0) / Math.max(reports.length, 1);
  return Math.round((avgCategory + avgDesign) / 2);
}

export function countOpenFindings(findings: ComplianceFinding[]): number {
  return findings.length;
}

export function countNonCompliantPages(reports: import('./types').PageComplianceReport[]): number {
  return reports.filter((r) => !r.recognizedAsStudioOs).length;
}
