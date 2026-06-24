import { motion } from 'framer-motion';
import { cardReveal, luxurySpringTransition } from '../animations';

export type PlaceholderSlotType =
  | 'BACKGROUND IMAGE SLOT'
  | 'HERO CONTENT SLOT'
  | 'GLASS PANEL SLOT'
  | 'PRODUCT SHOWCASE SLOT'
  | 'REWARD SHOWCASE SLOT'
  | 'DIRECTORY SLOT'
  | 'SCHEDULE SLOT'
  | 'CAMERA VIEW SLOT'
  | 'ANALYSIS SLOT'
  | 'CONFIGURATOR SLOT'
  | 'SOCIAL SLOT'
  | 'PROFILE SLOT'
  | 'NAVIGATION SLOT'
  | 'CONTENT SLOT';

type PlaceholderSlotProps = {
  label: PlaceholderSlotType | string;
  minHeight?: string | number;
  className?: string;
};

export function PlaceholderSlot({ label, minHeight = '6rem', className = '' }: PlaceholderSlotProps) {
  return (
    <motion.div
      className={`mansion-placeholder ${className}`}
      style={{ minHeight }}
      variants={cardReveal}
      initial="initial"
      animate="animate"
      transition={luxurySpringTransition}
      aria-label={`Placeholder: ${label}`}
    >
      [{label}]
    </motion.div>
  );
}
