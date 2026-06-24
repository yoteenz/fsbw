import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { mansionRadii } from '../../../constants/mobileMansionTokens';
import { cardReveal, luxurySpringTransition } from '../animations';

type GlassCardProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className = '', ...rest }: GlassCardProps) {
  return (
    <motion.div
      className={`mansion-glass mansion-glass-chrome ${className}`}
      style={{ borderRadius: mansionRadii.card }}
      variants={cardReveal}
      initial="initial"
      animate="animate"
      transition={luxurySpringTransition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
