import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../utilities/cn';
import type { FdsButtonVariant } from '../tokens/types';

export type FdsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: FdsButtonVariant;
  loading?: boolean;
  children?: ReactNode;
};

const VARIANT_CLASS: Record<FdsButtonVariant, string> = {
  primary: 'fds-btn--primary',
  secondary: 'fds-btn--secondary',
  ghost: 'fds-btn--ghost',
  glass: 'fds-btn--glass',
  luxury: 'fds-btn--luxury',
  icon: 'fds-btn--icon',
  floating: 'fds-btn--floating',
};

export function FdsButton({
  variant = 'primary',
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: FdsButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'fds-btn',
        VARIANT_CLASS[variant],
        loading && 'fds-btn--loading',
        disabled && 'fds-btn--disabled',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(props: Omit<FdsButtonProps, 'variant'>) {
  return <FdsButton variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<FdsButtonProps, 'variant'>) {
  return <FdsButton variant="secondary" {...props} />;
}

export function GhostButton(props: Omit<FdsButtonProps, 'variant'>) {
  return <FdsButton variant="ghost" {...props} />;
}

export function GlassButton(props: Omit<FdsButtonProps, 'variant'>) {
  return <FdsButton variant="glass" {...props} />;
}

export function LuxuryButton(props: Omit<FdsButtonProps, 'variant'>) {
  return <FdsButton variant="luxury" {...props} />;
}

export function IconButton(props: Omit<FdsButtonProps, 'variant'>) {
  return <FdsButton variant="icon" {...props} />;
}

export function FloatingButton(props: Omit<FdsButtonProps, 'variant'>) {
  return <FdsButton variant="floating" {...props} />;
}

export function LoadingButton({ loading = true, ...props }: FdsButtonProps) {
  return <FdsButton loading={loading} {...props} />;
}

export function DisabledButton(props: FdsButtonProps) {
  return <FdsButton disabled {...props} />;
}
