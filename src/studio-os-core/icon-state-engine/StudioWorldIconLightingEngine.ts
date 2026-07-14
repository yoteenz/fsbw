import type { StudioWorldIconTheme } from '../studio-world-icon-system/StudioWorldIconTheme';
import type { IconStateDevice } from './types';

export type LightingProfile = {
  highlightDirection: 'top-left';
  reflectionDirection: 'bottom-right';
  specularEdge: number;
  hoverIntensity: number;
  microBloom: number;
  themeLighting: number;
};

const BASE_LIGHTING: LightingProfile = {
  highlightDirection: 'top-left',
  reflectionDirection: 'bottom-right',
  specularEdge: 0.08,
  hoverIntensity: 1,
  microBloom: 0.06,
  themeLighting: 1,
};

const THEME_LIGHTING: Partial<Record<StudioWorldIconTheme, Partial<LightingProfile>>> = {
  'studio-dark': { themeLighting: 1, microBloom: 0.08 },
  'studio-light': { themeLighting: 0.85, specularEdge: 0.06 },
  'luxury-gold': { themeLighting: 1.1, specularEdge: 0.12, microBloom: 0.1 },
  monochrome: { themeLighting: 0.7, microBloom: 0.04 },
  presentation: { themeLighting: 1.05, specularEdge: 0.1 },
  accessibility: { themeLighting: 1.2, specularEdge: 0.14, microBloom: 0.04 },
};

const DEVICE_LIGHTING: Partial<Record<IconStateDevice, Partial<LightingProfile>>> = {
  mobile: { microBloom: 0.04, hoverIntensity: 0.9 },
  tablet: { microBloom: 0.06 },
  tv: { specularEdge: 0.12, themeLighting: 1.15 },
  visionos: { microBloom: 0.1, specularEdge: 0.1 },
};

export function resolveIconLighting(
  theme: StudioWorldIconTheme,
  device: IconStateDevice,
  stateHoverBoost = 0
): LightingProfile {
  const themePatch = THEME_LIGHTING[theme] ?? {};
  const devicePatch = DEVICE_LIGHTING[device] ?? {};
  return {
    ...BASE_LIGHTING,
    ...themePatch,
    ...devicePatch,
    hoverIntensity: (devicePatch.hoverIntensity ?? BASE_LIGHTING.hoverIntensity) + stateHoverBoost,
  };
}

export function buildLightingFilter(profile: LightingProfile, goldEdge = 0): string {
  const whiteGlow = `drop-shadow(0 -1px ${2 + profile.specularEdge * 8}px rgba(255,255,255,${0.15 + profile.microBloom}))`;
  const reflection = `drop-shadow(1px 2px ${1 + profile.specularEdge * 4}px rgba(255,255,255,${profile.specularEdge * 0.5}))`;
  const gold = goldEdge > 0
    ? ` drop-shadow(0 0 ${4 + goldEdge * 12}px rgba(212,175,55,${0.25 + goldEdge * 0.35}))`
    : '';
  return `${whiteGlow} ${reflection}${gold}`.trim();
}
