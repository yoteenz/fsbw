import { useLocation, useNavigate } from 'react-router-dom';
import { returnUrlFromSearch, sanitizeReturnUrl } from '../../auth/returnUrl';
import { aioPaths } from '../../utils/paths';

type Props = {
  /** Login uses back-only header per approved reference */
  showLogo?: boolean;
};

export function AuthHeader({ showLogo = true }: Props) {
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
    <header className={`aio-auth-premium__header${showLogo ? '' : ' aio-auth-premium__header--back-only'}`}>
      <button type="button" className="aio-auth-premium__back" onClick={onBack}>
        <span className="aio-auth-premium__back-chevron" aria-hidden="true">
          ‹
        </span>
        Back
      </button>
    </header>
  );
}
