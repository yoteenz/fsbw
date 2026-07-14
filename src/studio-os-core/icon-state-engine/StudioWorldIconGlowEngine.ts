import type { StudioWorldIconProceduralState } from './types';

export type GlowProfile = {
  intensity: number;
  spread: number;
  color: string;
  edgeIntensity: number;
};

const STATE_GLOW: Record<StudioWorldIconProceduralState, GlowProfile> = {
  default: { intensity: 0.12, spread: 4, color: 'rgba(255,255,255,0.35)', edgeIntensity: 0.04 },
  hover: { intensity: 0.22, spread: 6, color: 'rgba(255,255,255,0.55)', edgeIntensity: 0.12 },
  active: { intensity: 0.2, spread: 8, color: 'rgba(212,175,55,0.45)', edgeIntensity: 0.18 },
  focused: { intensity: 0.16, spread: 5, color: 'rgba(255,255,255,0.5)', edgeIntensity: 0.1 },
  pressed: { intensity: 0.14, spread: 3, color: 'rgba(255,255,255,0.4)', edgeIntensity: 0.08 },
  selected: { intensity: 0.18, spread: 7, color: 'rgba(212,175,55,0.35)', edgeIntensity: 0.14 },
  disabled: { intensity: 0.04, spread: 2, color: 'rgba(180,190,200,0.2)', edgeIntensity: 0.02 },
  locked: { intensity: 0.06, spread: 3, color: 'rgba(200,210,220,0.25)', edgeIntensity: 0.03 },
  generating: { intensity: 0.24, spread: 8, color: 'rgba(255,255,255,0.6)', edgeIntensity: 0.22 },
  loading: { intensity: 0.14, spread: 5, color: 'rgba(255,255,255,0.4)', edgeIntensity: 0.06 },
  success: { intensity: 0.2, spread: 6, color: 'rgba(52,211,153,0.5)', edgeIntensity: 0.16 },
  warning: { intensity: 0.18, spread: 6, color: 'rgba(251,191,36,0.5)', edgeIntensity: 0.14 },
  error: { intensity: 0.16, spread: 5, color: 'rgba(248,113,113,0.45)', edgeIntensity: 0.14 },
  approved: { intensity: 0.18, spread: 5, color: 'rgba(52,211,153,0.4)', edgeIntensity: 0.12 },
  rejected: { intensity: 0.16, spread: 5, color: 'rgba(248,113,113,0.4)', edgeIntensity: 0.12 },
  archived: { intensity: 0.06, spread: 2, color: 'rgba(150,160,170,0.25)', edgeIntensity: 0.03 },
  premium: { intensity: 0.2, spread: 7, color: 'rgba(212,175,55,0.5)', edgeIntensity: 0.2 },
  new: { intensity: 0.16, spread: 5, color: 'rgba(96,165,250,0.45)', edgeIntensity: 0.1 },
  favorite: { intensity: 0.18, spread: 6, color: 'rgba(244,114,182,0.4)', edgeIntensity: 0.12 },
  pinned: { intensity: 0.16, spread: 5, color: 'rgba(212,175,55,0.35)', edgeIntensity: 0.1 },
  ai: { intensity: 0.18, spread: 6, color: 'rgba(96,165,250,0.45)', edgeIntensity: 0.12 },
  live: { intensity: 0.16, spread: 5, color: 'rgba(248,113,113,0.35)', edgeIntensity: 0.1 },
  syncing: { intensity: 0.14, spread: 5, color: 'rgba(96,165,250,0.35)', edgeIntensity: 0.08 },
  offline: { intensity: 0.05, spread: 2, color: 'rgba(120,130,140,0.2)', edgeIntensity: 0.02 },
  beta: { intensity: 0.14, spread: 4, color: 'rgba(167,139,250,0.4)', edgeIntensity: 0.08 },
  experimental: { intensity: 0.12, spread: 4, color: 'rgba(251,146,60,0.35)', edgeIntensity: 0.08 },
  future: { intensity: 0.1, spread: 4, color: 'rgba(200,210,255,0.3)', edgeIntensity: 0.06 },
};

export function resolveGlowProfile(state: StudioWorldIconProceduralState): GlowProfile {
  return STATE_GLOW[state] ?? STATE_GLOW.default;
}

export function glowToFilter(profile: GlowProfile): string {
  return `drop-shadow(0 0 ${profile.spread}px ${profile.color})`;
}
