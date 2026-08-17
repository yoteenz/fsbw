import { aioAppConfig } from '../../config/appConfig';

/** Desktop left brand panel — hidden on mobile. */
export function AuthBrandPanel() {
  const { heroTaglineLines, brandDescription } = aioAppConfig.company;

  return (
    <aside className="aio-auth-premium__brand-panel" aria-hidden="true">
      <div className="aio-auth-premium__brand-panel-bg" />
      <div className="aio-auth-premium__brand-panel-content">
        {aioAppConfig.assets.logoLockup ? (
          <img
            src={aioAppConfig.assets.logoLockup}
            alt=""
            className="aio-auth-premium__brand-logo"
            width={1672}
            height={941}
            decoding="async"
          />
        ) : null}
        <h2 className="aio-auth-premium__brand-headline">
          {heroTaglineLines[0]}
          <br />
          {heroTaglineLines[1]}
        </h2>
        <p className="aio-auth-premium__brand-copy">{brandDescription}</p>
      </div>
    </aside>
  );
}
