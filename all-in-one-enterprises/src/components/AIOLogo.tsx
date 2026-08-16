import { Link } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';

type Props = {
  /** Slightly smaller lockup for footer / compact contexts */
  variant?: 'header' | 'footer';
};

export function AIOLogo({ variant = 'header' }: Props) {
  const logoSrc = aioAppConfig.assets.logoLockup;
  const { displayName, displaySuffix } = aioAppConfig.company;

  return (
    <Link
      to={aioPaths.home}
      className={`aio-logo ${variant === 'footer' ? 'aio-logo--footer' : ''}`}
      aria-label={`${aioAppConfig.company.legalName} home`}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt="All In One Enterprises Inc."
          className="aio-logo__lockup"
          width={1672}
          height={941}
          decoding="async"
        />
      ) : (
        <>
          <span className="aio-logo__mark" aria-hidden="true">
            A
          </span>
          <span className="aio-logo__text">
            <span className="aio-logo__primary">{displayName}</span>
            <span className="aio-logo__suffix">{displaySuffix}</span>
          </span>
        </>
      )}
    </Link>
  );
}
