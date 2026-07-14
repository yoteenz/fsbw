import type { IconStateDevice } from './types';

/** Runtime tokens — CSS custom property names and base values. */
export const STUDIO_WORLD_ICON_STATE_TOKEN_KEYS = {
  glow: '--swi-glow',
  bloom: '--swi-bloom',
  reflection: '--swi-reflection',
  highlight: '--swi-highlight',
  opacity: '--swi-opacity',
  material: '--swi-material',
  transition: '--swi-transition',
  duration: '--swi-duration',
  pulse: '--swi-pulse',
  hoverScale: '--swi-hover-scale',
  selectionGlow: '--swi-selection-glow',
  focusRing: '--swi-focus-ring',
  disabledAlpha: '--swi-disabled-alpha',
  loadingSpeed: '--swi-loading-speed',
  generatingEnergy: '--swi-generating-energy',
  edgeLight: '--swi-edge-light',
  chromeDepth: '--swi-chrome-depth',
  goldEdge: '--swi-gold-edge',
  elevation: '--swi-elevation',
  scale: '--swi-scale',
  filter: '--swi-filter',
  size: '--swi-size',
} as const;

export type StudioWorldIconStateTokenKey =
  (typeof STUDIO_WORLD_ICON_STATE_TOKEN_KEYS)[keyof typeof STUDIO_WORLD_ICON_STATE_TOKEN_KEYS];

export type IconStateTokenValues = {
  glow: number;
  bloom: number;
  reflection: number;
  highlight: number;
  opacity: number;
  transition: string;
  duration: number;
  pulse: number;
  hoverScale: number;
  selectionGlow: number;
  focusRing: number;
  disabledAlpha: number;
  loadingSpeed: number;
  generatingEnergy: number;
  edgeLight: number;
  chromeDepth: number;
  goldEdge: number;
  elevation: number;
  scale: number;
};

export const STUDIO_WORLD_ICON_STATE_BASE_TOKENS: IconStateTokenValues = {
  glow: 0.12,
  bloom: 0.08,
  reflection: 0.06,
  highlight: 0.08,
  opacity: 1,
  transition: 'filter, opacity, transform',
  duration: 120,
  pulse: 0,
  hoverScale: 1,
  selectionGlow: 0,
  focusRing: 0,
  disabledAlpha: 0.42,
  loadingSpeed: 1.8,
  generatingEnergy: 1.2,
  edgeLight: 0.04,
  chromeDepth: 0.16,
  goldEdge: 0,
  elevation: 0,
  scale: 1,
};

export const DEVICE_STATE_TOKEN_MODIFIERS: Record<
  IconStateDevice,
  Partial<IconStateTokenValues>
> = {
  desktop: {},
  tablet: { bloom: 0.06, glow: 0.1 },
  mobile: { bloom: 0.04, glow: 0.08, elevation: 0 },
  tv: { glow: 0.14, highlight: 0.12, edgeLight: 0.06 },
  visionos: { bloom: 0.1, chromeDepth: 0.2 },
};

export function tokensToCssVariables(
  tokens: Partial<IconStateTokenValues> & { size?: number; filter?: string }
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (tokens.glow != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.glow] = String(tokens.glow);
  if (tokens.bloom != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.bloom] = String(tokens.bloom);
  if (tokens.reflection != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.reflection] = String(tokens.reflection);
  if (tokens.highlight != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.highlight] = String(tokens.highlight);
  if (tokens.opacity != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.opacity] = String(tokens.opacity);
  if (tokens.transition != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.transition] = tokens.transition;
  if (tokens.duration != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.duration] = `${tokens.duration}ms`;
  if (tokens.pulse != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.pulse] = String(tokens.pulse);
  if (tokens.hoverScale != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.hoverScale] = String(tokens.hoverScale);
  if (tokens.selectionGlow != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.selectionGlow] = String(tokens.selectionGlow);
  if (tokens.focusRing != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.focusRing] = String(tokens.focusRing);
  if (tokens.disabledAlpha != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.disabledAlpha] = String(tokens.disabledAlpha);
  if (tokens.loadingSpeed != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.loadingSpeed] = `${tokens.loadingSpeed}s`;
  if (tokens.generatingEnergy != null) {
    vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.generatingEnergy] = `${tokens.generatingEnergy}s`;
  }
  if (tokens.edgeLight != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.edgeLight] = String(tokens.edgeLight);
  if (tokens.chromeDepth != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.chromeDepth] = String(tokens.chromeDepth);
  if (tokens.goldEdge != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.goldEdge] = String(tokens.goldEdge);
  if (tokens.elevation != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.elevation] = String(tokens.elevation);
  if (tokens.scale != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.scale] = String(tokens.scale);
  if (tokens.size != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.size] = `${tokens.size}px`;
  if (tokens.filter != null) vars[STUDIO_WORLD_ICON_STATE_TOKEN_KEYS.filter] = tokens.filter;
  return vars;
}
