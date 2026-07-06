/** Milestone 157 — Visual Diff Engine™ · Studio OS visual memory */

export const VISUAL_DIFF_ENGINE_STORAGE_KEY = 'studioOsVisualDiffEngine_v1';
export const VISUAL_DIFF_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_VISUAL_DIFF_ENGINE_UPDATED = 'studio-os-visual-diff-engine-updated';

export const VISUAL_DIFF_ENGINE_ACCENT = '#B45309';

export const VISUAL_DIFF_PHILOSOPHY = [
  'Visual Diff Engine™ continuously compares every Studio OS interface against the approved Design System — Studio OS\'s visual memory.',
  'It immediately detects unintended visual changes before users ever see them. Visual regressions should never surprise the team.',
  'Golden Reference™ screens become the canonical baseline — future builds are compared before deployment.',
  'When something no longer looks like Studio OS, the Visual Diff Engine™ explains why and suggests corrections.',
] as const;

export const COMPARE_BASES = [
  'current-build',
  'previous-build',
  'production',
  'approved-design',
  'design-system-reference',
] as const;

export const DIFF_ISSUE_TYPES = [
  'spacing-shifts',
  'typography-changes',
  'glass-inconsistencies',
  'color-drift',
  'border-radius-changes',
  'shadow-inconsistencies',
  'animation-changes',
  'missing-components',
  'component-movement',
  'alignment-issues',
  'responsive-drift',
  'dark-mode-inconsistencies',
  'broken-environmental-storytelling',
  'brand-inconsistencies',
] as const;

export const DIFF_SEVERITIES = ['critical', 'warning', 'advisory'] as const;

export const COMPARE_BASE_LABELS: Record<(typeof COMPARE_BASES)[number], string> = {
  'current-build': 'Current Build',
  'previous-build': 'Previous Build',
  production: 'Production',
  'approved-design': 'Approved Design',
  'design-system-reference': 'Design System Reference',
};

export const DIFF_ISSUE_LABELS: Record<(typeof DIFF_ISSUE_TYPES)[number], string> = {
  'spacing-shifts': 'Spacing Shifts',
  'typography-changes': 'Typography Changes',
  'glass-inconsistencies': 'Glass Effect Inconsistencies',
  'color-drift': 'Color Drift',
  'border-radius-changes': 'Border Radius Changes',
  'shadow-inconsistencies': 'Shadow Inconsistencies',
  'animation-changes': 'Animation Changes',
  'missing-components': 'Missing Components',
  'component-movement': 'Component Movement',
  'alignment-issues': 'Alignment Issues',
  'responsive-drift': 'Responsive Layout Drift',
  'dark-mode-inconsistencies': 'Dark Mode Inconsistencies',
  'broken-environmental-storytelling': 'Broken Environmental Storytelling',
  'brand-inconsistencies': 'Brand Inconsistencies',
};
