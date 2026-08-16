import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isBackendMode, isDemoMode } from '../../config/dataMode';
import { useAIOAuth } from '../AIOAuthProvider';
import { aioPaths } from '../../utils/paths';
import { AIOLoadingState } from '../../components/AIOLoadingState';

export function CustomerRouteGuard() {
  const { loading, isAuthenticated } = useAIOAuth();
  const location = useLocation();

  if (isDemoMode()) {
    return <Outlet />;
  }

  if (!isBackendMode()) {
    return <Outlet />;
  }

  if (loading) return <AIOLoadingState label="Loading your account…" />;

  if (!isAuthenticated) {
    return <Navigate to={aioPaths.login} state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}

export function OfficeRouteGuard() {
  const { loading, isAuthenticated, isInternal } = useAIOAuth();
  const location = useLocation();

  if (isDemoMode()) {
    return <Outlet />;
  }

  if (!isBackendMode()) {
    return <Navigate to={aioPaths.home} replace />;
  }

  if (loading) return <AIOLoadingState label="Verifying staff access…" />;

  if (!isAuthenticated) {
    return <Navigate to={aioPaths.login} state={{ from: location.pathname, office: true }} replace />;
  }

  if (!isInternal) {
    return <Navigate to={aioPaths.portal} replace />;
  }

  return <Outlet />;
}
