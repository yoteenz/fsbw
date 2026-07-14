export const RUNTIME_PREVIEW_SIZES = [24, 32, 48, 64, 96, 128, 256, 512] as const;

export const RUNTIME_PREVIEW_CONTEXTS = [
  'command-dock',
  'workbench',
  'navigation',
  'hud',
  'sidebar',
  'toolbar',
  'inspector',
  'drawer',
  'search',
  'mobile',
  'tablet',
] as const;

export const RUNTIME_PREVIEW_THEMES = ['studio-dark', 'studio-light', 'high-contrast'] as const;

export const RUNTIME_PREVIEW_STATES = ['default', 'hover', 'selected', 'disabled'] as const;

export type RuntimePreviewSize = (typeof RUNTIME_PREVIEW_SIZES)[number];
export type RuntimePreviewContext = (typeof RUNTIME_PREVIEW_CONTEXTS)[number];
export type RuntimePreviewTheme = (typeof RUNTIME_PREVIEW_THEMES)[number];
export type RuntimePreviewState = (typeof RUNTIME_PREVIEW_STATES)[number];
