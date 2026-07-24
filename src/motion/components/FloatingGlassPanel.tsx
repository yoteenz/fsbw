import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { fsmsFramerEase } from '../tokens/easing';

export type FloatingGlassPanelProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
};

export function FloatingGlassPanel({ children, className = '', ...rest }: FloatingGlassPanelProps) {
  return (
    <motion.div
      className={`fsms-floating-glass-panel ${className}`.trim()}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.9, ease: fsmsFramerEase.luxury }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
