import type { Transition, Variants } from 'framer-motion';
import { mansionAnimation } from '../../constants/mobileMansionTokens';

const luxurySpring: Transition = {
  type: 'spring',
  stiffness: mansionAnimation.springStiffness,
  damping: mansionAnimation.springDamping,
  mass: mansionAnimation.springMass,
};

/** Page enter — subtle fade + rise. */
export const pageEnter: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** Page exit — gentle dissolve upward. */
export const pageExit: Variants = {
  initial: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10, transition: { duration: mansionAnimation.durationFast } },
};

/** Panel fade — content regions. */
export const panelFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Panel float — gentle vertical drift on enter. */
export const panelFloat: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/** Panel hover — micro lift for interactive glass surfaces. */
export const panelHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -2, scale: 1.005, transition: luxurySpring },
  tap: { scale: 0.995, transition: { duration: 0.1 } },
};

/** Card reveal — staggered content cards. */
export const cardReveal: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

export const luxurySpringTransition = luxurySpring;

export const fadeTransition: Transition = {
  duration: mansionAnimation.durationNormal,
  ease: [0.16, 1, 0.3, 1],
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};
