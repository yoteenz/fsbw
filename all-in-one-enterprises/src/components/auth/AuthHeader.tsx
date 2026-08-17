import { Link, useLocation, useNavigate } from 'react-router-dom';
import { returnUrlFromSearch, sanitizeReturnUrl } from '../../auth/returnUrl';
import { aioAppConfig } from '../../config/appConfig';
import { aioPaths } from '../../utils/paths';

export function AuthHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { from?: string; return?: string } | null;
  const returnContext = sanitizeReturnUrl(
    state?.return ?? state?.from ?? returnUrlFromSearch(location.search),
    aioPaths.home,
  );
  const hasMeaningfulOrigin = returnContext !== aioPaths.home && returnContext !== aioPaths.portal;

  const onBack = () => {
    if (hasMeaningfulOrigin) {
      navigate(returnContext);
      return;
    }
    if (window.history.length > 1) navigate(-1);
    else navigate(aioPaths.home);
  };

  return (
    <header className="aio-auth-premium__header">
      <button type="button" className="aio-auth-premium__back" onClick={onBack}>
        <span className="aio-auth-premium__back-chevron" aria-hidden="true">
          ‹
        </span>
        Back
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
