import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Dark premium page body (default for public marketing redesign) */
  variant?: 'dark' | 'light';
  className?: string;
};

export function AioPageShell({ children, variant = 'dark', className = '' }: Props) {
  return (
    <div className={`aio-ps-shell aio-ps-shell--${variant}${className ? ` ${className}` : ''}`}>{children}</div>
  );
}
