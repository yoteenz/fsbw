import { motion, type HTMLMotionProps } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';
import { mansionColors, mansionRadii } from '../../../constants/mobileMansionTokens';

type GlassButtonVariant = 'primary' | 'secondary' | 'ghost';

type GlassButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode;
  variant?: GlassButtonVariant;
  fullWidth?: boolean;
};

const variantStyles: Record<GlassButtonVariant, CSSProperties> = {
  primary: {
    background: mansionColors.primaryRed,
    color: mansionColors.white,
    border: `1px solid ${mansionColors.primaryRed}`,
    boxShadow: '0 2px 12px rgba(235, 28, 36, 0.15)',
  },
  secondary: {
    background: mansionColors.glassFill,
    color: mansionColors.primaryRed,
    border: `1px solid ${mansionColors.chromeBorder}`,
    backdropFilter: 'blur(12px)',
  },
  ghost: {
    background: 'transparent',
    color: mansionColors.gray,
    border: `1px solid ${mansionColors.chromeBorder}`,
  },
};

export function GlassButton({
  children,
  variant = 'secondary',
  fullWidth = false,
  className = '',
  ...rest
}: GlassButtonProps) {
  return (
    <motion.button
      type="button"
      className={`font-futura text-[0.625rem] uppercase tracking-[0.14em] px-5 py-2.5 ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        borderRadius: mansionRadii.button,
        ...variantStyles[variant],
      }}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
