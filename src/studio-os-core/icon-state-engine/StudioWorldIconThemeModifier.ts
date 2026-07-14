import type { StudioWorldIconTheme } from '../studio-world-icon-system/StudioWorldIconTheme';
import type { IconStateDevice } from './types';

export type ThemeModifier = {
  contrast: number;
  reflection: number;
  lighting: number;
  glowScale: number;
};

const THEME_MODIFIERS: Record<StudioWorldIconTheme, ThemeModifier> = {
  'studio-dark': { contrast: 1, reflection: 1, lighting: 1, glowScale: 1 },
  'studio-light': { contrast: 0.92, reflection: 0.85, lighting: 0.9, glowScale: 0.85 },
  'luxury-gold': { contrast: 1.05, reflection: 1.15, lighting: 1.1, glowScale: 1.1 },
  monochrome: { contrast: 1.1, reflection: 0.6, lighting: 0.75, glowScale: 0.5 },
  presentation: { contrast: 1.08, reflection: 1.05, lighting: 1.05, glowScale: 0.95 },
  accessibility: { contrast: 1.25, reflection: 0.9, lighting: 1.15, glowScale: 0.8 },
};

const DEVICE_MODIFIERS: Partial<Record<IconStateDevice, Partial<ThemeModifier>>> = {
  mobile: { glowScale: 0.75, reflection: 0.8 },
  tablet: { glowScale: 0.9 },
  tv: { contrast: 1.15, glowScale: 1.05 },
  visionos: { reflection: 1.1, lighting: 1.05 },
};

export function resolveThemeModifier(
  theme: StudioWorldIconTheme,
  device: IconStateDevice
): ThemeModifier {
  const base = THEME_MODIFIERS[theme] ?? THEME_MODIFIERS['studio-dark'];
  const devicePatch = DEVICE_MODIFIERS[device] ?? {};
  return {
    contrast: base.contrast * (devicePatch.contrast ?? 1),
    reflection: base.reflection * (devicePatch.reflection ?? 1),
    lighting: base.lighting * (devicePatch.lighting ?? 1),
    glowScale: base.glowScale * (devicePatch.glowScale ?? 1),
  };
}

export function applyThemeModifier(
  values: { glow: number; highlight: number; reflection: number },
  modifier: ThemeModifier
): { glow: number; highlight: number; reflection: number } {
  return {
    glow: values.glow * modifier.glowScale,
    highlight: values.highlight * modifier.lighting * modifier.contrast,
    reflection: values.reflection * modifier.reflection,
  };
}
