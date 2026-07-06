/** Milestone 129 — Design Token Engine™ V1.0 */

export const DESIGN_TOKEN_ENGINE_STORAGE_KEY = 'studioOsDesignTokenEngine_v1';
export const DESIGN_TOKEN_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_DESIGN_TOKEN_ENGINE_UPDATED = 'studio-os-design-token-engine-updated';

export const DESIGN_TOKEN_ENGINE_ACCENT = '#9333EA';

export const DESIGN_TOKEN_ENGINE_PHILOSOPHY = [
  'Design consistency should be automatic — never manually match spacing, typography, colors, or motion.',
  'The Design Token Engine™ is the visual source of truth for Studio OS.',
  'Every component inherits its visual language from centralized tokens — pages never redefine core design values.',
  'The Design Token Engine™ protects the Studio OS Design Bible.',
] as const;

export const TOKEN_CATEGORIES = [
  'spacing',
  'typography',
  'border-radius',
  'glass',
  'blur',
  'shadow',
  'elevation',
  'animation-timing',
  'transition',
  'opacity',
  'brand-color',
  'accent-color',
  'gradient',
  'icon-size',
  'panel-height',
  'margin',
  'padding',
  'breakpoint',
  'theme',
] as const;

export const STUDIO_OS_THEMES = ['light', 'dark', 'future'] as const;

/** Canonical responsive breakpoints — Studio OS admin surfaces */
export const RESPONSIVE_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
