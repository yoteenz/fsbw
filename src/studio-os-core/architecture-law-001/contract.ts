/**
 * Studio World Architecture Law #001
 * AI generates environments — Studio World renders the interface.
 */

export const ARCHITECTURE_LAW_001_VERSION = 'architecture-law-001.v1' as const;
export const ARCHITECTURE_LAW_001_CODE = 'AI_UI_DETECTED' as const;

export const ARCHITECTURE_LAW_001_MESSAGE =
  'Studio World Architecture Law #001 prohibits AI-generated production interfaces.' as const;

/** Physical environment elements AI may generate. */
export const AI_ALLOWED_ENVIRONMENT_CATEGORIES = [
  'architecture',
  'walls',
  'floors',
  'ceilings',
  'furniture',
  'lighting',
  'materials',
  'glass',
  'acrylic',
  'chrome',
  'environment-props',
  'command-dock-shell',
  'workbench-shell',
  'monitor-bezels',
  'display-frames',
  'control-consoles',
  'button-housings',
  'touch-surfaces',
  'dashboard-shells',
  'panel-groupings',
  'toolbar-frames',
  'viewport-windows',
  'graph-containers',
  'thumbnail-frames',
  'navigation-rails',
  'physical-interaction-zones',
  'placeholder-cards',
  'placeholder-buttons',
  'empty-display-screens',
  'embedded-console-architecture',
] as const;

/** Production interface elements AI must never generate. */
export const AI_FORBIDDEN_PRODUCTION_UI_CATEGORIES = [
  'typography',
  'words',
  'letters',
  'numbers',
  'dates',
  'charts',
  'graphs',
  'status-values',
  'progress-bars',
  'notifications',
  'icons',
  'navigation-labels',
  'company-names',
  'department-names',
  'revision-numbers',
  'button-captions',
  'logos',
  'brand-names',
  'breadcrumbs',
  'menus',
  'tooltips',
  'badges',
  'dashboard-metrics',
  'readable-interface-elements',
] as const;

/** Acceptable blank display treatments — no readable information. */
export const DISPLAY_PLACEHOLDER_TREATMENTS = [
  'ambient-gradient',
  'subtle-blueprint-lines',
  'abstract-geometry',
  'neutral-scan-pattern',
  'glass-reflection',
  'soft-emissive-lighting',
  'minimal-wireframe',
  'depth-cue',
] as const;

export type DisplayPlaceholderTreatment = (typeof DISPLAY_PLACEHOLDER_TREATMENTS)[number];

/** Studio World design system owns all live interface rendering. */
export const STUDIO_WORLD_DESIGN_SYSTEM_OWNERSHIP = [
  'typography',
  'buttons',
  'icons',
  'charts',
  'graphs',
  'animations',
  'notifications',
  'navigation',
  'forms',
  'tables',
  'menus',
  'status-indicators',
  'progress-bars',
  'badges',
  'accessibility',
  'localization',
  'theme-switching',
  'brand-styling',
] as const;

export const STUDIO_WORLD_OFFICIAL_FONTS = ['Futura PT', 'Covered By Your Grace', 'Bohemy'] as const;

export type ArchitectureLawValidationResult =
  | { ok: true; lawVersion: typeof ARCHITECTURE_LAW_001_VERSION }
  | { ok: false; code: typeof ARCHITECTURE_LAW_001_CODE; message: string; violations: string[] };

export type RenderPipelinePhase =
  | 'experience-lab-architecture'
  | 'command-dock-generation'
  | 'workbench-generation'
  | 'display-placeholders'
  | 'socket-metadata'
  | 'founder-review'
  | 'approval'
  | 'blueprint-lock'
  | 'cds-runtime-mount'
  | 'interactive-department';

export const ARCHITECTURE_LAW_RENDER_PIPELINE: readonly RenderPipelinePhase[] = [
  'experience-lab-architecture',
  'command-dock-generation',
  'workbench-generation',
  'display-placeholders',
  'socket-metadata',
  'founder-review',
  'approval',
  'blueprint-lock',
  'cds-runtime-mount',
  'interactive-department',
] as const;
