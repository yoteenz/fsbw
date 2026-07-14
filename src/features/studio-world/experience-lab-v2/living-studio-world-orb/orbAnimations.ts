/** Timing + easing tokens for Living Studio World Orb™ — keep motion subtle. */

export const ORB_BREATHE_MIN = 0.99;
export const ORB_BREATHE_MAX = 1.012;
export const ORB_BREATHE_DURATION_S = 5.4;

export const ORB_OUTER_ORBIT_DURATION_S = 28;
export const ORB_INNER_ORBIT_DURATION_S = 19;

export const ORB_PULSE_HALO_INTERVAL_S = 6.5;
export const ORB_SHIMMER_DURATION_S = 7.2;

export const ORB_HOVER_LIFT_PX = 2.5;
export const ORB_HIGHLIGHT_DRIFT_PX = 2;

export const ORB_APPROVED_BLOOM_MS = 1400;

export const ORB_EASE = 'cubic-bezier(0.45, 0, 0.55, 1)';

export const ORB_ANIMATION_NAMES = {
  breathe: 'lswo-breathe',
  coreGlow: 'lswo-core-glow',
  highlightDrift: 'lswo-highlight-drift',
  outerOrbit: 'lswo-outer-orbit',
  innerOrbit: 'lswo-inner-orbit',
  shimmer: 'lswo-shimmer',
  pulseHalo: 'lswo-pulse-halo',
  generatingEnergy: 'lswo-generating-energy',
  approvedBloom: 'lswo-approved-bloom',
  warningPulse: 'lswo-warning-pulse',
  errorPulse: 'lswo-error-pulse',
} as const;
