import type { StudioWorldIconProceduralState } from './types';
import type { IconStateDevice, IconStateRenderInput, IconStateRenderOutput } from './types';
import { resolveRuntimeIcon } from '../studio-world-icon-system/resolveRuntimeIcon';
import { resolveGlowProfile, glowToFilter } from './StudioWorldIconGlowEngine';
import { resolveIconLighting, buildLightingFilter } from './StudioWorldIconLightingEngine';
import { resolveThemeModifier, applyThemeModifier } from './StudioWorldIconThemeModifier';
import { materialIdsForState } from './StudioWorldIconMaterialSystem';
import { resolveAnimation } from './StudioWorldIconAnimationController';
import { resolveInteractionState } from './StudioWorldIconInteractionResolver';
import { resolveAccessibilityHints } from './StudioWorldIconAccessibilityRenderer';
import { resolvePerformanceProfile } from './StudioWorldIconPerformanceManager';
import {
  STUDIO_WORLD_ICON_STATE_BASE_TOKENS,
  DEVICE_STATE_TOKEN_MODIFIERS,
  tokensToCssVariables,
  type IconStateTokenValues,
} from './StudioWorldIconTokens';
import type { StudioWorldIconTheme } from '../studio-world-icon-system/StudioWorldIconTheme';

const STATE_TOKEN_PATCHES: Partial<Record<StudioWorldIconProceduralState, Partial<IconStateTokenValues>>> = {
  default: {},
  hover: {
    glow: 0.22,
    bloom: 0.12,
    highlight: 0.14,
    edgeLight: 0.12,
    elevation: 1,
    duration: 150,
    hoverScale: 1.02,
  },
  active: {
    glow: 0.2,
    bloom: 0.14,
    goldEdge: 0.22,
    edgeLight: 0.18,
    highlight: 0.16,
    duration: 180,
  },
  focused: {
    glow: 0.16,
    focusRing: 1,
    highlight: 0.14,
    pulse: 1,
    edgeLight: 0.1,
  },
  pressed: { scale: 0.96, duration: 100, elevation: 0 },
  selected: { selectionGlow: 0.22, goldEdge: 0.18, glow: 0.18, bloom: 0.1 },
  disabled: { opacity: 0.42, glow: 0.04, bloom: 0.02, disabledAlpha: 0.42 },
  locked: { opacity: 0.72, glow: 0.06 },
  generating: { generatingEnergy: 1.2, edgeLight: 0.22, glow: 0.24 },
  loading: { loadingSpeed: 1.8, glow: 0.14, pulse: 1 },
  success: { edgeLight: 0.16, glow: 0.2, duration: 600 },
  warning: { edgeLight: 0.14, glow: 0.18, pulse: 1 },
  error: { edgeLight: 0.14, glow: 0.16 },
  approved: { edgeLight: 0.12, glow: 0.18 },
  rejected: { edgeLight: 0.12, glow: 0.14, opacity: 0.85 },
  premium: { goldEdge: 0.2, glow: 0.2, bloom: 0.12 },
  new: { edgeLight: 0.1, glow: 0.16 },
  favorite: { edgeLight: 0.12, glow: 0.18 },
  pinned: { goldEdge: 0.12, selectionGlow: 0.14 },
  ai: { glow: 0.18, edgeLight: 0.12 },
  live: { pulse: 1, glow: 0.16 },
  syncing: { edgeLight: 0.1, glow: 0.14 },
  offline: { opacity: 0.55, glow: 0.05 },
  archived: { opacity: 0.5, glow: 0.04 },
  beta: { edgeLight: 0.08, glow: 0.14 },
  experimental: { edgeLight: 0.08, glow: 0.12 },
  future: { glow: 0.1, edgeLight: 0.06 },
};

function mapDeviceToRuntime(device: IconStateDevice): 'mobile' | 'tablet' | 'desktop' | 'tv' | 'ar' | 'vr' {
  if (device === 'visionos') return 'ar';
  return device;
}

function mapThemeAlias(theme?: StudioWorldIconTheme | 'dark' | 'light'): StudioWorldIconTheme {
  if (theme === 'dark') return 'studio-dark';
  if (theme === 'light') return 'studio-light';
  return theme ?? 'studio-dark';
}

export function renderIconState(input: IconStateRenderInput): IconStateRenderOutput | null {
  const theme = mapThemeAlias(input.theme as StudioWorldIconTheme | 'dark' | 'light');
  const device = input.device ?? 'desktop';
  const sizePx = input.sizePx ?? 24;
  const reducedMotion = input.reducedMotion ?? false;
  const highContrast = input.highContrast ?? false;

  const resolvedState = resolveInteractionState(input.state ?? 'default', input.interaction);
  const runtime = resolveRuntimeIcon({
    iconId: input.iconId,
    state: resolvedState,
    theme,
    device: mapDeviceToRuntime(device),
    sizePx,
  });
  if (!runtime) return null;

  const glowProfile = resolveGlowProfile(resolvedState);
  const themeModifier = resolveThemeModifier(theme, device);
  const statePatch = STATE_TOKEN_PATCHES[resolvedState] ?? {};
  const devicePatch = DEVICE_STATE_TOKEN_MODIFIERS[device] ?? {};

  const tokenValues = applyThemeModifier(
    {
      glow: (statePatch.glow ?? STUDIO_WORLD_ICON_STATE_BASE_TOKENS.glow) * themeModifier.glowScale,
      highlight: statePatch.highlight ?? STUDIO_WORLD_ICON_STATE_BASE_TOKENS.highlight,
      reflection: (statePatch.reflection ?? STUDIO_WORLD_ICON_STATE_BASE_TOKENS.reflection) * themeModifier.reflection,
    },
    themeModifier
  );

  const lighting = resolveIconLighting(
    theme,
    device,
    resolvedState === 'hover' ? 0.15 : 0
  );
  const goldEdge = statePatch.goldEdge ?? 0;
  const filter = `${glowToFilter(glowProfile)} ${buildLightingFilter(lighting, goldEdge)}`.trim();

  const animation = resolveAnimation(resolvedState, input.animated ?? true, reducedMotion);
  const performance = resolvePerformanceProfile(resolvedState, animation.preset);
  const a11y = resolveAccessibilityHints(resolvedState, {
    label: runtime.displayName,
    reducedMotion,
    highContrast,
    sizePx,
  });

  const cssVariables = tokensToCssVariables({
    ...STUDIO_WORLD_ICON_STATE_BASE_TOKENS,
    ...devicePatch,
    ...statePatch,
    glow: tokenValues.glow,
    highlight: tokenValues.highlight,
    reflection: tokenValues.reflection,
    size: sizePx,
    filter,
  });

  const classNames = [
    'swi-icon',
    `swi-icon--${resolvedState}`,
    `swi-icon--theme-${theme}`,
    `swi-icon--device-${device}`,
    animation.cssClass,
    highContrast ? 'swi-icon--high-contrast' : '',
    reducedMotion ? 'swi-icon--reduced-motion' : '',
  ].filter(Boolean);

  return {
    iconId: runtime.iconId,
    state: resolvedState,
    theme,
    device,
    sizePx,
    assetPath: runtime.assetPath,
    provider: runtime.provider,
    cssVariables,
    classNames,
    animation: animation.preset,
    materials: materialIdsForState(resolvedState),
    aria: {
      role: a11y.role,
      label: a11y.ariaLabel,
      busy: a11y.ariaBusy,
      disabled: a11y.ariaDisabled,
      hidden: a11y.ariaHidden,
    },
    dataAttributes: {
      'data-swi-icon': runtime.iconId,
      'data-swi-state': resolvedState,
      'data-swi-theme': theme,
      'data-swi-device': device,
      'data-swi-animation': animation.preset,
    },
    performance,
  };
}
