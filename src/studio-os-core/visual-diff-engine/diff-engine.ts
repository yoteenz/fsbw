import { getOrganizationDesignComplianceEngineProfile } from '../design-compliance-engine/store';
import { getOrganizationDesignTokenEngineProfile } from '../design-token-engine/store';
import { getOrganizationExperienceQaProfile } from '../experience-qa/store';
import {
  COMPARE_BASE_LABELS,
  COMPARE_BASES,
  DIFF_ISSUE_LABELS,
} from './constants';
import type { CompareBase, VisualDiffFinding } from './types';

export const SCREEN_SEEDS = [
  { screenId: 'mission-control', screenLabel: 'Mission Control', route: '/admin/studio/mission-control' },
  { screenId: 'qa-headquarters', screenLabel: 'QA Headquarters', route: '/admin/studio/qa-headquarters' },
  { screenId: 'design-compliance-engine', screenLabel: 'Design Compliance Engine', route: '/admin/studio/design-compliance-engine' },
  { screenId: 'prompt-qa', screenLabel: 'Prompt QA', route: '/admin/studio/prompt-qa' },
  { screenId: 'experience-qa', screenLabel: 'Experience QA', route: '/admin/studio/experience-qa' },
  { screenId: 'design-token-engine', screenLabel: 'Design Token Engine', route: '/admin/studio/design-token-engine' },
  { screenId: 'executive-trust-dashboard', screenLabel: 'Executive Trust Dashboard', route: '/admin/studio/executive-trust-dashboard' },
  { screenId: 'organizational-guardian', screenLabel: 'Organizational Guardian', route: '/admin/studio/organizational-guardian' },
];

const FINDING_SEEDS: Omit<
  VisualDiffFinding,
  'id' | 'issueLabel' | 'compareBaseLabel' | 'screenId' | 'screenLabel' | 'compareBase'
>[] = [
  {
    issueType: 'spacing-shifts',
    severity: 'warning',
    description: 'Hero card padding shifted from 16px to 12px vs Golden Reference™.',
    visualDelta: '+4px vertical compression in hero region · tab bar gap reduced 8px → 4px.',
    suggestedCorrection: 'Restore spacing.token.md (16px) on ExecutiveHeroCard · sync from Design Token Engine.',
  },
  {
    issueType: 'typography-changes',
    severity: 'critical',
    description: 'Secondary card body switched from Futura PT Medium to system sans-serif.',
    visualDelta: 'Font weight 515 → 400 · line-height 1.45 → 1.35 in 3 card regions.',
    suggestedCorrection: 'Enforce font-futura class on all ExecutiveSecondaryCard content · compare against approved design.',
  },
  {
    issueType: 'glass-inconsistencies',
    severity: 'warning',
    description: 'Panel glass blur reduced from blur.md to flat background vs production.',
    visualDelta: 'glass.opacity.surface 0.72 → 1.0 · backdrop-filter removed on 2 panels.',
    suggestedCorrection: 'Reapply crystal acrylic tokens · reference Design Compliance glassmorphism audit.',
  },
  {
    issueType: 'color-drift',
    severity: 'critical',
    description: 'CTA accent drifted from module token #CA8A04 to hardcoded #3B82F6.',
    visualDelta: 'Brand color delta ΔE 28.4 · 2 buttons affected in current build.',
    suggestedCorrection: 'Replace hardcoded hex with module accent prop · validate against design-system-reference.',
  },
  {
    issueType: 'border-radius-changes',
    severity: 'advisory',
    description: 'Card corner radius changed from radius.lg (12px) to radius.sm (4px).',
    visualDelta: 'Border radius −8px on ExecutiveFocusPanel containers.',
    suggestedCorrection: 'Restore radius.lg from Design Token Engine · compare previous build screenshot.',
  },
  {
    issueType: 'shadow-inconsistencies',
    severity: 'warning',
    description: 'Elevation shadow.elevation.md missing on floating panels vs approved design.',
    visualDelta: 'box-shadow removed · panels appear flat against marble background.',
    suggestedCorrection: 'Apply shadow.elevation.md token · match Golden Reference depth.',
  },
  {
    issueType: 'animation-changes',
    severity: 'advisory',
    description: 'Tab transition timing changed 280ms → 150ms vs design system reference.',
    visualDelta: 'Animation duration −130ms · easing curve switched to linear.',
    suggestedCorrection: 'Restore animation.timing.calm (280ms) · Interaction Engine calm motion standard.',
  },
  {
    issueType: 'missing-components',
    severity: 'critical',
    description: 'ExecutiveHealthRing missing from Mission Control preview panel vs production.',
    visualDelta: 'Component registry ID executive-health-ring absent in current build layout.',
    suggestedCorrection: 'Restore ExecutiveHealthRing from Component Registry · verify against production baseline.',
  },
  {
    issueType: 'component-movement',
    severity: 'warning',
    description: 'Search input relocated above hero — component order differs from Golden Reference.',
    visualDelta: 'DOM order shift · search bar +48px vertical offset vs approved design.',
    suggestedCorrection: 'Restore canonical Executive IA layout order · compare screenshot regions.',
  },
  {
    issueType: 'alignment-issues',
    severity: 'warning',
    description: 'Stats grid misaligned at 2px offset — flex baseline drift detected.',
    visualDelta: 'Horizontal alignment delta 2px in hero stats row vs previous build.',
    suggestedCorrection: 'Apply align-items-center · verify grid-cols alignment tokens.',
  },
  {
    issueType: 'responsive-drift',
    severity: 'critical',
    description: 'Dashboard grid breaks at 768px — card overlap vs production responsive baseline.',
    visualDelta: 'Layout shift at md breakpoint · 3 regions overflow container.',
    suggestedCorrection: 'Apply responsive grid-cols-1 sm:grid-cols-2 · test against production screenshot at 768px.',
  },
  {
    issueType: 'dark-mode-inconsistencies',
    severity: 'warning',
    description: 'Dark theme glass opacity 0.45 vs approved 0.62 — atmosphere mismatch.',
    visualDelta: 'Theme.dark.glass.opacity delta −0.17 · text contrast ratio 3.8:1 (below 4.5:1).',
    suggestedCorrection: 'Sync dark theme tokens from Design Token Engine · re-compare approved design.',
  },
  {
    issueType: 'broken-environmental-storytelling',
    severity: 'warning',
    description: 'White marble background gradient removed — immersive environment degraded.',
    visualDelta: 'Background atmosphere flat #F8FAFC vs marble gradient in Golden Reference.',
    suggestedCorrection: 'Restore environmental storytelling layers · Experience Engine atmosphere settings.',
  },
  {
    issueType: 'brand-inconsistencies',
    severity: 'critical',
    description: 'StudioOsBrandTagline missing from workspace header vs approved Studio OS identity.',
    visualDelta: 'Brand voice element absent · page no longer reads as canonical Studio OS module.',
    suggestedCorrection: 'Add StudioOsBrandTagline · audit brand-positioning constants for module.',
  },
];

const BASE_ROTATION: CompareBase[] = ['approved-design', 'production', 'previous-build', 'design-system-reference', 'current-build'];

export function buildVisualDiffFindings(organizationId: string): VisualDiffFinding[] {
  const design = getOrganizationDesignComplianceEngineProfile(organizationId);
  const experience = getOrganizationExperienceQaProfile(organizationId);
  const findings: VisualDiffFinding[] = [];

  SCREEN_SEEDS.forEach((screen, screenIdx) => {
    const compareBase = COMPARE_BASES[screenIdx % COMPARE_BASES.length];
    const seeds = FINDING_SEEDS.filter((_, i) => (i + screenIdx) % SCREEN_SEEDS.length < 3 || screenIdx === 0);
    seeds.slice(0, screenIdx === 0 ? 4 : 2).forEach((seed, i) => {
      const base = compareBase === 'current-build' ? 'previous-build' : compareBase;
      findings.push({
        ...seed,
        id: `vdiff-${screen.screenId}-${seed.issueType}-${i}`,
        issueLabel: DIFF_ISSUE_LABELS[seed.issueType],
        screenId: screen.screenId,
        screenLabel: screen.screenLabel,
        compareBase: base,
        compareBaseLabel: COMPARE_BASE_LABELS[base],
        severity:
          design && design.pagesNonCompliant > 0 && seed.severity === 'warning'
            ? 'critical'
            : experience && experience.pagesNeedingRefinement > 0 && seed.issueType === 'alignment-issues'
              ? 'warning'
              : seed.severity,
      });
    });
  });

  return findings;
}

export function countDiffs(findings: VisualDiffFinding[]): number {
  return findings.length;
}

export function countScreensWithRegressions(reports: import('./types').VisualQaReport[]): number {
  return reports.filter((r) => !r.matchesGoldenReference).length;
}

export function computeVisualMemoryScore(reports: import('./types').VisualQaReport[]): number {
  if (reports.length === 0) return 82;
  const avg = reports.reduce((s, r) => s + r.visualConsistencyScore, 0) / reports.length;
  return Math.round(avg);
}

export function pickCompareBaseForScreen(screenIdx: number): CompareBase {
  return BASE_ROTATION[screenIdx % BASE_ROTATION.length] ?? 'design-system-reference';
}

export function getTokenBaselineScore(organizationId: string): number {
  const tokens = getOrganizationDesignTokenEngineProfile(organizationId);
  return tokens?.engineScore ?? 80;
}
