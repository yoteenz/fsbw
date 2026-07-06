/** Milestone 128 — Component Registry™ V1.0 */

export const COMPONENT_REGISTRY_STORAGE_KEY = 'studioOsComponentRegistry_v1';
export const COMPONENT_REGISTRY_VERSION = '1.0.0';
export const STUDIO_OS_COMPONENT_REGISTRY_UPDATED = 'studio-os-component-registry-updated';

export const COMPONENT_REGISTRY_ACCENT = '#7C2D12';

export const COMPONENT_REGISTRY_PHILOSOPHY = [
  'Interfaces should be assembled—not recreated.',
  'Every visual component exists once and is reused everywhere.',
  'The Component Registry™ ensures Studio OS grows through reusable design, not duplicated interfaces.',
  'Every component becomes a managed platform asset.',
] as const;

export const COMPONENT_CATEGORIES = [
  'button',
  'card',
  'panel',
  'chart',
  'dialog',
  'drawer',
  'table',
  'form',
  'input',
  'navigation',
  'glass',
  'timeline',
  'mission-control-widget',
  'command-dock',
  'animation',
  'loading',
  'icon',
  'illustration',
  'brand-asset',
] as const;

export const DESIGN_TOKEN_KEYS = [
  'ADMIN_STUDIO_THEME.accent',
  'ADMIN_STUDIO_THEME.panelBorder',
  'EIA.red',
  'EIA.panel',
  'eiaActionBtn',
  'eiaCaption',
  'STUDIO_OS_UPPERCASE_CLASS',
] as const;
