import type { FscsTransitionId, FscsTransitionPreset } from '../utilities/types';

function transition(
  id: FscsTransitionId,
  label: string,
  opts: Omit<FscsTransitionPreset, 'id' | 'label'>,
): FscsTransitionPreset {
  return { id, label, ...opts };
}

/** FSCS transitions — restrained, never flashy; mapped to FSMS where applicable */
export const FSCS_TRANSITION_PRESETS: Record<FscsTransitionId, FscsTransitionPreset> = {
  'crystal-fade': transition('crystal-fade', 'Crystal Fade', {
    durationMs: 1200,
    fsmsPreset: 'crystal-fade',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    description: 'Glass dissolves into transparency — signature FSMS fade.',
  }),
  'luxury-dissolve': transition('luxury-dissolve', 'Luxury Dissolve', {
    durationMs: 1400,
    fsmsPreset: 'elegant-dissolve',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    description: 'Long-tail dissolve with breathing room.',
  }),
  'architectural-reveal': transition('architectural-reveal', 'Architectural Reveal', {
    durationMs: 1600,
    fsmsPreset: 'luxury-reveal',
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    description: 'Space unveiled through light — wide framing.',
  }),
  'light-sweep': transition('light-sweep', 'Light Sweep', {
    durationMs: 1100,
    fsmsPreset: 'sunlight-sweep',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    description: 'Sunlight passes across glass surfaces.',
  }),
  'glass-reflection': transition('glass-reflection', 'Glass Reflection', {
    durationMs: 900,
    fsmsPreset: 'morning-reveal',
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    description: 'Soft environmental reflection shift.',
  }),
  'soft-blur': transition('soft-blur', 'Soft Blur', {
    durationMs: 800,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    description: 'Gentle defocus handoff — no whip pan.',
  }),
  'morning-glow': transition('morning-glow', 'Morning Glow', {
    durationMs: 1300,
    fsmsPreset: 'morning-reveal',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    description: 'Warm ambient lift at scene open.',
  }),
  'elegant-cut': transition('elegant-cut', 'Elegant Cut', {
    durationMs: 0,
    easing: 'linear',
    description: 'Invisible editorial cut on motion apex.',
  }),
  'invisible-match-cut': transition('invisible-match-cut', 'Invisible Match Cut', {
    durationMs: 0,
    easing: 'linear',
    description: 'Geometry-matched cut — continuity preserved.',
  }),
};

export function resolveTransitionPreset(id: FscsTransitionId): FscsTransitionPreset {
  return FSCS_TRANSITION_PRESETS[id];
}
