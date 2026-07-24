import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../utilities/cn';

export type FdsIconSize = 'sm' | 'md' | 'lg';

export type FdsIconProps = {
  children?: ReactNode;
  size?: FdsIconSize;
  color?: string;
  interactive?: boolean;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
};

export function FdsIcon({
  children,
  size = 'md',
  color,
  interactive = false,
  animated = false,
  className,
  style,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
}: FdsIconProps) {
  const iconStyle: CSSProperties = {
    ...style,
    ...(color ? { ['--fds-icon-color' as string]: color } : {}),
  };

  return (
    <span
      className={cn(
        'fds-icon',
        `fds-icon--${size}`,
        interactive && 'fds-icon--interactive',
        animated && 'fds-icon--animated',
        className,
      )}
      style={iconStyle}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}
