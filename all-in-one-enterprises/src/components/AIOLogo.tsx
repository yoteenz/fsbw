import { Link } from 'react-router-dom';
import { aioAppConfig } from '../config/appConfig';
import { aioPaths } from '../utils/paths';

export function AIOLogo() {
  const { displayName, displaySuffix } = aioAppConfig.company;
  const logoSrc = aioAppConfig.assets.logoSlot;

  return (
    <Link to={aioPaths.home} className="aio-logo" aria-label={`${aioAppConfig.company.legalName} home`}>
      {logoSrc ? (
        <img src={logoSrc} alt="" className="aio-logo__mark" width={36} height={36} />
      ) : (
        <span className="aio-logo__mark" aria-hidden="true">
          A
        </span>
      )}
      <span className="aio-logo__text">
        <span className="aio-logo__primary">{displayName}</span>
        <span className="aio-logo__suffix">{displaySuffix}</span>
      </span>
    </Link>
  );
}
