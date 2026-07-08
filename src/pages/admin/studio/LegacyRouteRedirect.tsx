import { Navigate, useLocation } from 'react-router-dom';
import { resolveLegacyCanonicalRedirect } from '../../../studio-os-core/company-routes';

/**
 * Redirects legacy Studio paths to canonical Multi-Company Route Architecture™ URLs.
 */
export default function StudioLegacyRouteRedirect() {
  const { pathname } = useLocation();
  const target = resolveLegacyCanonicalRedirect(pathname);
  if (!target) {
    return <Navigate to="/admin/studio/command-center" replace />;
  }
  return <Navigate to={target} replace />;
}
