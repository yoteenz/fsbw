import { ACCESSIBILITY_REQUIREMENTS } from './constants';
import type { AccessibilitySpec } from './types';

const SPECS: Record<(typeof ACCESSIBILITY_REQUIREMENTS)[number], Omit<AccessibilitySpec, 'requirementId'>> = {
  keyboard: {
    label: 'Keyboard Navigation',
    description: 'All interactive elements reachable via Tab — logical focus order.',
    implementation: 'tabIndex, roving tabindex on composite widgets, Escape closes overlays.',
    mandatory: true,
  },
  touch: {
    label: 'Touch Support',
    description: '44px minimum touch targets on mobile — no hover-only actions.',
    implementation: 'Mobile-first tap targets; long-press alternatives for context menus.',
    mandatory: true,
  },
  mouse: {
    label: 'Mouse Support',
    description: 'Hover affordances complement — never replace — keyboard/touch.',
    implementation: ':hover styles paired with :focus-visible.',
    mandatory: true,
  },
  'screen-reader': {
    label: 'Screen Readers',
    description: 'Meaningful labels, roles, and live regions for dynamic feedback.',
    implementation: 'aria-label, aria-live="polite" for toasts, role="button" on div buttons.',
    mandatory: true,
  },
  'reduced-motion': {
    label: 'Reduced Motion',
    description: 'Respect prefers-reduced-motion — skip celebration and slide animations.',
    implementation: '@media (prefers-reduced-motion: reduce) { transition: none; }',
    mandatory: true,
  },
  'high-contrast': {
    label: 'High Contrast',
    description: 'Focus and state indicators remain visible in high contrast mode.',
    implementation: 'Outline not solely color-dependent; 3:1 contrast on focus rings.',
    mandatory: true,
  },
  'focus-indicator': {
    label: 'Accessible Focus Indicators',
    description: 'Visible focus ring on all focusable elements — never outline: none without replacement.',
    implementation: '2px accent outline, offset 2px — matches Design Token Engine™ accent.',
    mandatory: true,
  },
};

/** Accessibility requirements for every Studio OS interaction. */
export function buildAccessibilitySpecs(): AccessibilitySpec[] {
  return ACCESSIBILITY_REQUIREMENTS.map((requirementId) => ({
    requirementId,
    ...SPECS[requirementId],
  }));
}

export function getMandatoryAccessibilitySpecs(): AccessibilitySpec[] {
  return buildAccessibilitySpecs().filter((s) => s.mandatory);
}

export function getAccessibilitySpec(
  requirementId: (typeof ACCESSIBILITY_REQUIREMENTS)[number]
): AccessibilitySpec | undefined {
  return buildAccessibilitySpecs().find((s) => s.requirementId === requirementId);
}
