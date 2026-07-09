import type { XerResolvedDnaLayers } from './dna-resolver';

export type XerMotionBundle = {
  entrance: string;
  transition: string;
  hover: string;
  focus: string;
  loading: string;
  reducedMotionFallback: string;
  timingMs: number;
  easing: string;
  cssTransition: string;
};

export function assembleMotionProfile(
  layers: XerResolvedDnaLayers,
  prefersReducedMotion = false
): XerMotionBundle {
  const { brand, motion } = layers;
  const timingMs = brand.motion.timingMs;
  const easing = brand.motion.easing;

  if (prefersReducedMotion) {
    return {
      entrance: motion.reducedMotionFallback,
      transition: motion.reducedMotionFallback,
      hover: 'none',
      focus: 'outline-only',
      loading: 'opacity-pulse-minimal',
      reducedMotionFallback: motion.reducedMotionFallback,
      timingMs: 0,
      easing: 'linear',
      cssTransition: 'none',
    };
  }

  return {
    entrance: motion.entrance,
    transition: motion.transition,
    hover: motion.hover,
    focus: motion.focus,
    loading: motion.loading,
    reducedMotionFallback: motion.reducedMotionFallback,
    timingMs,
    easing,
    cssTransition: `all ${timingMs}ms ${easing}`,
  };
}
