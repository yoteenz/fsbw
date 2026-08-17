import { aioAppConfig } from '../../config/appConfig';

type Props = {
  variant?: 'default' | 'login';
};

/** Desktop left brand panel — hidden on mobile. */
export function AuthBrandPanel({ variant = 'default' }: Props) {
  const { heroTaglineLines, brandDescription } = aioAppConfig.company;
  const isLogin = variant === 'login';

  return (
    <aside
      className={`aio-auth-premium__brand-panel${isLogin ? ' aio-auth-premium__brand-panel--login' : ''}`}
      aria-hidden="true"
    >
      <div className="aio-auth-premium__brand-panel-bg" />
      <div className="aio-auth-premium__brand-panel-content">
        {!isLogin && aioAppConfig.assets.logoLockup ? (
          <img
            src={aioAppConfig.assets.logoLockup}
            alt=""
            className="aio-auth-premium__brand-logo"
            width={1672}
            height={941}
            decoding="async"
          />
        ) : null}
        {!isLogin ? (
          <>
            <h2 className="aio-auth-premium__brand-headline">
              {heroTaglineLines[0]}
              <br />
              {heroTaglineLines[1]}
            </h2>
            <p className="aio-auth-premium__brand-copy">{brandDescription}</p>
          </>
        ) : null}
      </div>
    </aside>
  );
}
