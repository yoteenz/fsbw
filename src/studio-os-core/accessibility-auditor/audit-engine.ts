import { getOrganizationExperienceQaProfile } from '../experience-qa/store';
import { getOrganizationInteractionEngineProfile } from '../interaction-engine/store';
import { getOrganizationVisualDiffEngineProfile } from '../visual-diff-engine/store';
import {
  ACCESSIBILITY_ISSUE_LABELS,
  AUDIT_DIMENSION_LABELS,
  AUDIT_DIMENSIONS,
} from './constants';
import type { AccessibilityFinding, AuditDimension, DimensionAuditScore } from './types';

export const PAGE_SEEDS = [
  { pageId: 'mission-control', pageLabel: 'Mission Control', route: '/admin/studio/mission-control' },
  { pageId: 'qa-headquarters', pageLabel: 'QA Headquarters', route: '/admin/studio/qa-headquarters' },
  { pageId: 'accessibility-auditor', pageLabel: 'Accessibility Auditor', route: '/admin/studio/accessibility-auditor' },
  { pageId: 'visual-diff-engine', pageLabel: 'Visual Diff Engine', route: '/admin/studio/visual-diff-engine' },
  { pageId: 'experience-qa', pageLabel: 'Experience QA', route: '/admin/studio/experience-qa' },
  { pageId: 'design-compliance-engine', pageLabel: 'Design Compliance Engine', route: '/admin/studio/design-compliance-engine' },
  { pageId: 'confidence-engine', pageLabel: 'Confidence Engine', route: '/admin/studio/confidence-engine' },
  { pageId: 'organizational-guardian', pageLabel: 'Organizational Guardian', route: '/admin/studio/organizational-guardian' },
];

const FINDING_SEEDS: Omit<
  AccessibilityFinding,
  'id' | 'issueLabel' | 'dimensionLabel' | 'pageId' | 'pageLabel' | 'affectedComponents'
>[] = [
  {
    issueType: 'insufficient-contrast',
    dimension: 'color-contrast',
    severity: 'critical',
    description: 'Secondary card text contrast 3.2:1 — below WCAG AA minimum 4.5:1.',
    estimatedUserImpact: 'Low vision and color blindness users cannot read secondary content reliably.',
    suggestedImprovement: 'Increase text contrast to 4.5:1 · validate with Design Token Engine brand-color tokens.',
  },
  {
    issueType: 'missing-alt-text',
    dimension: 'alternative-text',
    severity: 'critical',
    description: 'ExecutiveHealthRing SVG missing accessible name for screen readers.',
    estimatedUserImpact: 'Blind users receive no context for health score visualization.',
    suggestedImprovement: 'Add aria-label with score value · role="img" on ExecutiveHealthRing.',
  },
  {
    issueType: 'keyboard-trap',
    dimension: 'keyboard-navigation',
    severity: 'critical',
    description: 'Tab navigation cannot escape search results overlay without mouse.',
    estimatedUserImpact: 'Keyboard-only users trapped — cannot continue workflow.',
    suggestedImprovement: 'Add Escape key handler · restore focus to trigger · Interaction Engine keyboard spec.',
  },
  {
    issueType: 'focus-not-visible',
    dimension: 'focus-management',
    severity: 'warning',
    description: 'Tab buttons lose visible focus ring on glass panels.',
    estimatedUserImpact: 'Keyboard users lose track of current focus position.',
    suggestedImprovement: 'Apply :focus-visible outline from Interaction Engine · 2px accent ring.',
  },
  {
    issueType: 'touch-target-too-small',
    dimension: 'touch-target-sizing',
    severity: 'warning',
    description: 'Tab controls measure 32px height — below 44px minimum touch target.',
    estimatedUserImpact: 'Motor impairment and mobile users struggle to activate controls.',
    suggestedImprovement: 'Increase tap target to 44px min · expand hit area with padding tokens.',
  },
  {
    issueType: 'missing-aria-label',
    dimension: 'screen-reader-compatibility',
    severity: 'warning',
    description: 'Icon-only refresh button lacks accessible label.',
    estimatedUserImpact: 'Screen reader announces unlabeled button — purpose unclear.',
    suggestedImprovement: 'Add aria-label="Sync audit" · visible text for critical actions.',
  },
  {
    issueType: 'incorrect-reading-order',
    dimension: 'reading-order',
    severity: 'warning',
    description: 'Search input announced after hero content despite visual placement above.',
    estimatedUserImpact: 'Screen reader users encounter confusing narrative sequence.',
    suggestedImprovement: 'Align DOM order with visual hierarchy · fix flex order properties.',
  },
  {
    issueType: 'motion-without-reduced-option',
    dimension: 'reduced-motion-support',
    severity: 'advisory',
    description: 'Tab transition animates despite prefers-reduced-motion user setting.',
    estimatedUserImpact: 'Motion-sensitive users experience vestibular discomfort.',
    suggestedImprovement: 'Respect prefers-reduced-motion · disable transitions per Interaction Engine spec.',
  },
  {
    issueType: 'unclear-error-message',
    dimension: 'error-messaging',
    severity: 'warning',
    description: 'Form validation shows red border only — no explanatory text.',
    estimatedUserImpact: 'Cognitive and low vision users cannot understand what to fix.',
    suggestedImprovement: 'Add aria-live error text · plain language correction guidance.',
  },
  {
    issueType: 'font-scale-blocked',
    dimension: 'font-scaling',
    severity: 'advisory',
    description: 'Fixed px font sizes prevent browser text scaling beyond 110%.',
    estimatedUserImpact: 'Low vision users cannot enlarge text to readable size.',
    suggestedImprovement: 'Use rem units from typography tokens · allow 200% zoom without loss.',
  },
  {
    issueType: 'missing-captions',
    dimension: 'captions',
    severity: 'advisory',
    description: 'Embedded briefing video lacks caption track.',
    estimatedUserImpact: 'Deaf and hard of hearing users miss executive briefing content.',
    suggestedImprovement: 'Add WebVTT captions · transcript link in Documentation Registry.',
  },
  {
    issueType: 'voice-incompatible-control',
    dimension: 'voice-interaction-compatibility',
    severity: 'advisory',
    description: 'Custom div buttons not exposed to voice control semantic commands.',
    estimatedUserImpact: 'Voice interaction users cannot activate controls by spoken label.',
    suggestedImprovement: 'Use semantic button elements · unique accessible names for voice matching.',
  },
  {
    issueType: 'responsive-accessibility-gap',
    dimension: 'responsive-accessibility',
    severity: 'critical',
    description: 'Focus order breaks at 768px — skip link bypassed on mobile layout.',
    estimatedUserImpact: 'Mobile keyboard and switch users cannot navigate efficiently.',
    suggestedImprovement: 'Test responsive accessibility at all breakpoints · restore skip navigation.',
  },
  {
    issueType: 'cognitive-overload',
    dimension: 'typography',
    severity: 'warning',
    description: 'Dense metric grid without headings breaks scannable structure for assistive tech.',
    estimatedUserImpact: 'Cognitive accessibility users overwhelmed — cannot parse page sections.',
    suggestedImprovement: 'Add semantic headings · reduce density · Experience QA cognitive load guidance.',
  },
];

export function buildDimensionScores(organizationId: string): DimensionAuditScore[] {
  const interaction = getOrganizationInteractionEngineProfile(organizationId);
  const experience = getOrganizationExperienceQaProfile(organizationId);
  const visual = getOrganizationVisualDiffEngineProfile(organizationId);

  const interactionScore = interaction?.engineScore ?? 80;
  const experienceScore = experience?.overallExperienceScore ?? 82;
  const visualScore = visual?.visualMemoryScore ?? 78;

  const baseScores: Record<AuditDimension, number> = {
    'color-contrast': Math.max(72, visualScore - 4),
    typography: Math.round((interactionScore + experienceScore) / 2),
    'font-scaling': Math.max(74, interactionScore - 3),
    'keyboard-navigation': interactionScore,
    'screen-reader-compatibility': Math.max(73, interactionScore - 5),
    'focus-management': Math.max(75, interactionScore - 4),
    'touch-target-sizing': Math.max(70, interactionScore - 6),
    'motion-sensitivity': Math.max(76, interactionScore - 2),
    'reduced-motion-support': Math.max(78, interactionScore - 1),
    'voice-interaction-compatibility': Math.max(68, interactionScore - 8),
    captions: 82,
    'alternative-text': Math.max(72, visualScore - 6),
    'error-messaging': Math.round((experienceScore + interactionScore) / 2 - 2),
    'reading-order': Math.max(74, experienceScore - 5),
    'responsive-accessibility': Math.max(71, visualScore - 7),
  };

  return AUDIT_DIMENSIONS.map((dimension) => {
    const score = baseScores[dimension];
    return {
      dimension,
      label: AUDIT_DIMENSION_LABELS[dimension],
      score,
      status: score >= 85 ? 'excellent' : score >= 72 ? 'watch' : 'needs-work',
      summary: score >= 85 ? 'Inclusive by design — accessibility feels invisible.' : 'Minor barriers detected — refinement recommended.',
    };
  });
}

export function buildAccessibilityFindings(organizationId: string): AccessibilityFinding[] {
  const interaction = getOrganizationInteractionEngineProfile(organizationId);
  const findings: AccessibilityFinding[] = [];

  PAGE_SEEDS.forEach((page, pageIdx) => {
    const seeds = FINDING_SEEDS.filter((_, i) => (i + pageIdx) % PAGE_SEEDS.length < 3 || pageIdx === 0);
    seeds.slice(0, pageIdx === 0 ? 4 : 2).forEach((seed, i) => {
      findings.push({
        ...seed,
        id: `a11y-${page.pageId}-${seed.issueType}-${i}`,
        issueLabel: ACCESSIBILITY_ISSUE_LABELS[seed.issueType],
        dimensionLabel: AUDIT_DIMENSION_LABELS[seed.dimension],
        pageId: page.pageId,
        pageLabel: page.pageLabel,
        affectedComponents: ['ExecutiveSecondaryCard', 'TabBar', 'SearchInput'].slice(0, 1 + (i % 2)),
        severity:
          interaction && interaction.engineScore < 78 && seed.severity === 'warning' ? 'critical' : seed.severity,
      });
    });
  });

  return findings;
}

export function countOpenIssues(findings: AccessibilityFinding[]): number {
  return findings.length;
}

export function countPagesNeedingWork(reports: import('./types').AccessibilityPageReport[]): number {
  return reports.filter((r) => !r.inclusivelyUsable).length;
}

export function computeOverallAccessibilityScore(reports: import('./types').AccessibilityPageReport[]): number {
  if (reports.length === 0) return 84;
  return Math.round(reports.reduce((s, r) => s + r.accessibilityScore, 0) / reports.length);
}

export function deriveAverageWcagLevel(reports: import('./types').AccessibilityPageReport[]): import('./types').WcagLevel {
  const scores = reports.map((r) => r.accessibilityScore);
  const avg = scores.reduce((s, v) => s + v, 0) / Math.max(scores.length, 1);
  if (avg >= 92) return 'AAA';
  if (avg >= 85) return 'AA';
  if (avg >= 75) return 'A';
  if (avg >= 65) return 'partial';
  return 'non-compliant';
}
