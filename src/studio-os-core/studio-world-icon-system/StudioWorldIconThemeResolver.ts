import type { StudioWorldIconTheme } from './StudioWorldIconTheme';
import type { StudioWorldIconDefinition } from './StudioWorldIconDefinition';
import { STUDIO_WORLD_ICON_DESIGN_TOKENS } from './StudioWorldIconTheme';

export type ResolvedIconTheme = {
  theme: StudioWorldIconTheme;
  supported: boolean;
  scale: number;
  tokens: typeof STUDIO_WORLD_ICON_DESIGN_TOKENS;
};

export function resolveTheme(
  icon: StudioWorldIconDefinition,
  theme: StudioWorldIconTheme = 'studio-dark'
): ResolvedIconTheme {
  const supported = icon.themeCompatibility[theme] ?? theme === 'studio-dark';
  return {
    theme,
    supported,
    scale: 1,
    tokens: STUDIO_WORLD_ICON_DESIGN_TOKENS,
  };
}

export function resolveThemeForDevice(
  icon: StudioWorldIconDefinition,
  theme: StudioWorldIconTheme,
  device: keyof typeof STUDIO_WORLD_ICON_DESIGN_TOKENS.deviceScales
): ResolvedIconTheme {
  const base = resolveTheme(icon, theme);
  return {
    ...base,
    scale: STUDIO_WORLD_ICON_DESIGN_TOKENS.deviceScales[device] ?? 1,
  };
}
