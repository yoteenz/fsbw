/** Percentage layout zones on the elevator shell artboard (1536×1024). */
export const TOWER_SHELL_HOLO = {
  top: 9,
  width: 30,
} as const;

/** Rear glass viewport — moving exterior visible here. */
export const TOWER_SHELL_GLASS_REAR = {
  left: 28,
  top: 16,
  width: 44,
  height: 58,
} as const;

/** Side glass strips (parallax exterior). */
export const TOWER_SHELL_GLASS_SIDE = {
  top: 20,
  width: 11.4,
  height: 51,
} as const;

export const TOWER_SHELL_GLASS_LEFT = {
  ...TOWER_SHELL_GLASS_SIDE,
  left: 7.5,
} as const;

export const TOWER_SHELL_GLASS_RIGHT = {
  ...TOWER_SHELL_GLASS_SIDE,
  right: 7.5,
} as const;

/** Vertical travel distance in the exterior track per floor id crossed. */
export const TOWER_EXTERIOR_PX_PER_FLOOR = 140;

/** Spacing between ghosted level markers in the exterior track. */
export const TOWER_EXTERIOR_MARKER_STEP_PX = 120;
