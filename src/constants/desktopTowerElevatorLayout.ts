/** Percentage layout zones on the elevator shell artboard (1915×821). */
export const TOWER_SHELL_HOLO = {
  top: 4,
  width: 26,
} as const;

/** Rear glass viewport — center cityscape (moving exterior). */
export const TOWER_SHELL_GLASS_REAR = {
  left: 23,
  top: 11,
  width: 54,
  height: 62,
} as const;

/** Side glass strips — curved tower exterior visible through side panels. */
export const TOWER_SHELL_GLASS_SIDE = {
  top: 14,
  width: 17,
  height: 58,
} as const;

export const TOWER_SHELL_GLASS_LEFT = {
  ...TOWER_SHELL_GLASS_SIDE,
  left: 3.5,
} as const;

export const TOWER_SHELL_GLASS_RIGHT = {
  ...TOWER_SHELL_GLASS_SIDE,
  right: 3.5,
} as const;

/** Vertical travel distance in the exterior track per floor id crossed. */
export const TOWER_EXTERIOR_PX_PER_FLOOR = 140;
