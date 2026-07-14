/** Operational motion tokens — subtle, never flashy. V3 only. */

export const V3_MOTION = {
  fast: '160ms',
  normal: '240ms',
  slow: '360ms',
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

export const v3Transition = (props = 'all') =>
  `${props} ${V3_MOTION.normal} ${V3_MOTION.easing}`;

export const v3StatusPulseClass = 'elab-v3-pulse';
