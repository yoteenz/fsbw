import { Link, useNavigate } from 'react-router-dom';
import { aioAppConfig } from '../../config/appConfig';
import { aioPaths } from '../../utils/paths';

export function AuthHeader() {
  const navigate = useNavigate();

  const onBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(aioPaths.home);
  };

  return (
    <header className="aio-auth-premium__header">
      <button type="button" className="aio-auth-premium__back" onClick={onBack}>
        <span aria-hidden="true">←</span> Back
      </button>
      <Link to={aioPaths.home} className="aio-auth-premium__logo" aria-label={`${aioAppConfig.company.legalName} home`}>
        {aioAppConfig.assets.logoLockup ? (
          <img
            src={aioAppConfig.assets.logoLockup}
            alt=""
            className="aio-auth-premium__logo-img"
            width={1672}
            height={941}
            decoding="async"
          />
        ) : (
          <span className="aio-auth-premium__logo-text">{aioAppConfig.company.displayName}</span>
        )}
      </Link>
      <span className="aio-auth-premium__header-spacer" aria-hidden="true" />
    </header>
  );
}
