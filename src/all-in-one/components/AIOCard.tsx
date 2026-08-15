import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  dark?: boolean;
  className?: string;
};

export function AIOCard({ children, dark, className = '' }: Props) {
  return <div className={`aio-card ${dark ? 'aio-card--dark' : ''} ${className}`.trim()}>{children}</div>;
}
