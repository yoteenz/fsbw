import type { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  headline: ReactNode;
  headlineGold?: ReactNode;
  supporting?: ReactNode;
  secondary?: ReactNode;
};

export function AuthBrandIntro({
  eyebrow = 'AIO Client Portal',
  headline,
  headlineGold,
  supporting,
  secondary,
}: Props) {
  return (
    <div className="aio-auth-premium__intro">
      <p className="aio-auth-premium__eyebrow">{eyebrow}</p>
      <h1 className="aio-auth-premium__headline">
        {headline}
        {headlineGold ? (
          <>
            <br />
            <span className="aio-auth-premium__headline-line--gold">{headlineGold}</span>
          </>
        ) : null}
      </h1>
      {supporting ? <p className="aio-auth-premium__supporting">{supporting}</p> : null}
      {secondary ? <p className="aio-auth-premium__secondary">{secondary}</p> : null}
    </div>
  );
}
