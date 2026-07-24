/** FDS animation tokens — aligned with FSMS luxury easing */

export const FDS_ANIMATION = {
  durationFast: '200ms',
  durationNormal: '350ms',
  durationSlow: '550ms',
  durationCinematic: '900ms',
  easeLuxury: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  easeDissolve: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeMorning: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const;

export const FDS_ANIMATION_CSS_VARS = {
  '--fds-duration-fast': FDS_ANIMATION.durationFast,
  '--fds-duration-normal': FDS_ANIMATION.durationNormal,
  '--fds-duration-slow': FDS_ANIMATION.durationSlow,
  '--fds-duration-cinematic': FDS_ANIMATION.durationCinematic,
  '--fds-ease-luxury': FDS_ANIMATION.easeLuxury,
  '--fds-ease-dissolve': FDS_ANIMATION.easeDissolve,
  '--fds-ease-morning': FDS_ANIMATION.easeMorning,
} as const;
