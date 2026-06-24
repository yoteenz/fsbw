import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { mansionRadii } from '../../../constants/mobileMansionTokens';
import { panelFloat, luxurySpringTransition } from '../animations';

type GlassPanelProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  heavy?: boolean;
  className?: string;
};

export function GlassPanel({ children, heavy = false, className = '', ...rest }: GlassPanelProps) {
  return (
    <motion.div
      className={`mansion-glass ${heavy ? 'mansion-glass-heavy' : ''} mansion-glass-chrome ${className}`}
      style={{ borderRadius: mansionRadii.panel }}
      variants={panelFloat}
      initial="initial"
      animate="animate"
      transition={luxurySpringTransition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
