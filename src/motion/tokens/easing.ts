/**
 * FSMS easing — cinematic, architectural. No bounce / elastic / overshoot.
 */

/** Primary luxury ease — slow in, slower out */
export const FSMS_EASE_LUXURY = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/** Morning / sunlight — gentle acceleration */
export const FSMS_EASE_MORNING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

/** Dissolve — long tail */
export const FSMS_EASE_DISSOLVE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/** Framer Motion compatible tuples */
export const fsmsFramerEase = {
  luxury: [0.22, 0.61, 0.36, 1] as const,
  morning: [0.25, 0.46, 0.45, 0.94] as const,
  dissolve: [0.4, 0, 0.2, 1] as const,
};
