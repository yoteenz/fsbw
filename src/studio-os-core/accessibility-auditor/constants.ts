/** Milestone 158 — Accessibility Auditor™ · Inclusive design philosophy */

export const ACCESSIBILITY_AUDITOR_STORAGE_KEY = 'studioOsAccessibilityAuditor_v1';
export const ACCESSIBILITY_AUDITOR_VERSION = '1.0.0';
export const STUDIO_OS_ACCESSIBILITY_AUDITOR_UPDATED = 'studio-os-accessibility-auditor-updated';

export const ACCESSIBILITY_AUDITOR_ACCENT = '#1D4ED8';

export const ACCESSIBILITY_AUDITOR_PHILOSOPHY = [
  'Accessibility Auditor™ ensures every Studio OS experience remains inclusive, understandable, and usable by the widest range of people possible.',
  'Accessibility should never be treated as a checklist — it becomes part of Studio OS design philosophy.',
  'Accessibility should feel invisible. Inclusive design is premium design.',
  'Every organization should confidently use Studio OS regardless of ability, device, or circumstance.',
] as const;

export const AUDIT_DIMENSIONS = [
  'color-contrast',
  'typography',
  'font-scaling',
  'keyboard-navigation',
  'screen-reader-compatibility',
  'focus-management',
  'touch-target-sizing',
  'motion-sensitivity',
  'reduced-motion-support',
  'voice-interaction-compatibility',
  'captions',
  'alternative-text',
  'error-messaging',
  'reading-order',
  'responsive-accessibility',
] as const;

export const SIMULATION_USER_TYPES = [
  'low-vision',
  'blindness',
  'color-blindness',
  'motor-impairments',
  'hearing-impairments',
  'cognitive-accessibility-needs',
  'temporary-limitations',
] as const;

export const ACCESSIBILITY_ISSUE_TYPES = [
  'insufficient-contrast',
  'missing-alt-text',
  'keyboard-trap',
  'focus-not-visible',
  'touch-target-too-small',
  'missing-aria-label',
  'incorrect-reading-order',
  'motion-without-reduced-option',
  'unclear-error-message',
  'font-scale-blocked',
  'missing-captions',
  'voice-incompatible-control',
  'responsive-accessibility-gap',
  'cognitive-overload',
] as const;

export const ACCESSIBILITY_SEVERITIES = ['critical', 'warning', 'advisory'] as const;

export const WCAG_LEVELS = ['AAA', 'AA', 'A', 'partial', 'non-compliant'] as const;

export const AUDIT_DIMENSION_LABELS: Record<(typeof AUDIT_DIMENSIONS)[number], string> = {
  'color-contrast': 'Color Contrast',
  typography: 'Typography',
  'font-scaling': 'Font Scaling',
  'keyboard-navigation': 'Keyboard Navigation',
  'screen-reader-compatibility': 'Screen Reader Compatibility',
  'focus-management': 'Focus Management',
  'touch-target-sizing': 'Touch Target Sizing',
  'motion-sensitivity': 'Motion Sensitivity',
  'reduced-motion-support': 'Reduced Motion Support',
  'voice-interaction-compatibility': 'Voice Interaction Compatibility',
  captions: 'Captions',
  'alternative-text': 'Alternative Text',
  'error-messaging': 'Error Messaging',
  'reading-order': 'Reading Order',
  'responsive-accessibility': 'Responsive Accessibility',
};

export const SIMULATION_USER_LABELS: Record<(typeof SIMULATION_USER_TYPES)[number], string> = {
  'low-vision': 'Low Vision',
  blindness: 'Blindness',
  'color-blindness': 'Color Blindness',
  'motor-impairments': 'Motor Impairments',
  'hearing-impairments': 'Hearing Impairments',
  'cognitive-accessibility-needs': 'Cognitive Accessibility Needs',
  'temporary-limitations': 'Temporary Limitations',
};

export const ACCESSIBILITY_ISSUE_LABELS: Record<(typeof ACCESSIBILITY_ISSUE_TYPES)[number], string> = {
  'insufficient-contrast': 'Insufficient Color Contrast',
  'missing-alt-text': 'Missing Alternative Text',
  'keyboard-trap': 'Keyboard Navigation Trap',
  'focus-not-visible': 'Focus Not Visible',
  'touch-target-too-small': 'Touch Target Too Small',
  'missing-aria-label': 'Missing ARIA Label',
  'incorrect-reading-order': 'Incorrect Reading Order',
  'motion-without-reduced-option': 'Motion Without Reduced Option',
  'unclear-error-message': 'Unclear Error Message',
  'font-scale-blocked': 'Font Scaling Blocked',
  'missing-captions': 'Missing Captions',
  'voice-incompatible-control': 'Voice-Incompatible Control',
  'responsive-accessibility-gap': 'Responsive Accessibility Gap',
  'cognitive-overload': 'Cognitive Overload',
};
