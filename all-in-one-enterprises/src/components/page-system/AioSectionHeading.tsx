import type { ReactNode } from 'react';
import { AioEyebrow } from './AioEyebrow';

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
  className?: string;
};

export function AioSectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  light = false,
  className = '',
}: Props) {
  return (
    <header
      className={`aio-ps-heading aio-ps-heading--${align}${light ? ' aio-ps-heading--light' : ''}${className ? ` ${className}` : ''}`}
    >
      {eyebrow ? <AioEyebrow>{eyebrow}</AioEyebrow> : null}
      <h2 className="aio-ps-heading__title">{title}</h2>
      {subtitle ? <p className="aio-ps-heading__subtitle">{subtitle}</p> : null}
    </header>
  );
}
