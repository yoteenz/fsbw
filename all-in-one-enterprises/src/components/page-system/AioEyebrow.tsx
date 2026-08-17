import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export function AioEyebrow({ children, className = '' }: Props) {
  return <p className={`aio-ps-eyebrow${className ? ` ${className}` : ''}`}>{children}</p>;
}
