import type { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  headline: ReactNode;
  supporting?: ReactNode;
  secondary?: ReactNode;
};

export function AuthBrandIntro({ eyebrow = 'AIO Client Portal', headline, supporting, secondary }: Props) {
  return (
    <div className="aio-auth-premium__intro">
      <p className="aio-auth-premium__eyebrow">{eyebrow}</p>
      <h1 className="aio-auth-premium__headline">{headline}</h1>
      {supporting ? <p className="aio-auth-premium__supporting">{supporting}</p> : null}
      {secondary ? <p className="aio-auth-premium__secondary">{secondary}</p> : null}
    </div>
  );
}
