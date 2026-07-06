/** Milestone 154 — Design Compliance Engine™ · Studio OS Creative Director */

export const DESIGN_COMPLIANCE_ENGINE_STORAGE_KEY = 'studioOsDesignComplianceEngine_v1';
export const DESIGN_COMPLIANCE_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_DESIGN_COMPLIANCE_ENGINE_UPDATED = 'studio-os-design-compliance-engine-updated';

export const DESIGN_COMPLIANCE_ENGINE_ACCENT = '#CA8A04';

export const DESIGN_COMPLIANCE_PHILOSOPHY = [
  'Design Compliance Engine™ continuously audits every interface to ensure it feels like Studio OS — not merely works.',
  'The engine becomes Studio OS\'s Creative Director — referencing the official Design System at all times.',
  'If Apple, Pixar, and the world\'s best luxury designers reviewed this page today… would they recognize it as Studio OS?',
  'If the answer is no — the engine explains why, with scores, evidence, and suggested improvements.',
] as const;

export const AUDIT_CATEGORIES = [
  'typography',
  'spacing',
  'hierarchy',
  'glassmorphism',
  'color-system',
  'brand-consistency',
  'component-usage',
  'animation-language',
  'micro-interactions',
  'responsive-layouts',
  'navigation',
  'accessibility',
  'visual-rhythm',
  'environmental-storytelling',
  'luxury-design-standards',
] as const;

export const VALIDATION_ISSUE_TYPES = [
  'incorrect-spacing',
  'inconsistent-typography',
  'missing-glass-effects',
  'wrong-brand-colors',
  'improper-animation-timing',
  'component-misuse',
  'visual-clutter',
  'hierarchy-conflicts',
  'competing-focal-points',
  'broken-responsive-layouts',
  'excessive-scrolling',
] as const;

export const STUDIO_OS_DESIGN_RULES = [
  'White marble environments',
  'Crystal acrylic surfaces',
  'Glass depth',
  'Chrome accents',
  'Calm motion',
  'Executive hierarchy',
  'Architectural layouts',
  'Immersive environments',
  'Minimal visual noise',
  'Luxury-first presentation',
] as const;

export const COMPLIANCE_SEVERITIES = ['critical', 'warning', 'advisory'] as const;

export const AUDIT_CATEGORY_LABELS: Record<(typeof AUDIT_CATEGORIES)[number], string> = {
  typography: 'Typography',
  spacing: 'Spacing',
  hierarchy: 'Hierarchy',
  glassmorphism: 'Glassmorphism',
  'color-system': 'Color System',
  'brand-consistency': 'Brand Consistency',
  'component-usage': 'Component Usage',
  'animation-language': 'Animation Language',
  'micro-interactions': 'Micro-interactions',
  'responsive-layouts': 'Responsive Layouts',
  navigation: 'Navigation',
  accessibility: 'Accessibility',
  'visual-rhythm': 'Visual Rhythm',
  'environmental-storytelling': 'Environmental Storytelling',
  'luxury-design-standards': 'Luxury Design Standards',
};

export const VALIDATION_ISSUE_LABELS: Record<(typeof VALIDATION_ISSUE_TYPES)[number], string> = {
  'incorrect-spacing': 'Incorrect Spacing',
  'inconsistent-typography': 'Inconsistent Typography',
  'missing-glass-effects': 'Missing Glass Effects',
  'wrong-brand-colors': 'Wrong Brand Colors',
  'improper-animation-timing': 'Improper Animation Timing',
  'component-misuse': 'Component Misuse',
  'visual-clutter': 'Visual Clutter',
  'hierarchy-conflicts': 'Hierarchy Conflicts',
  'competing-focal-points': 'Too Many Competing Focal Points',
  'broken-responsive-layouts': 'Broken Responsive Layouts',
  'excessive-scrolling': 'Excessive Scrolling',
};
