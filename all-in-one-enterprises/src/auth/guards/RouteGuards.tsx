import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isBackendMode, isDemoMode } from '../../config/dataMode';
import { useAIOAuth } from '../AIOAuthProvider';
import { aioPaths } from '../../utils/paths';
import { AIOLoadingState } from '../../components/AIOLoadingState';
import { evaluateRouteAccess } from '../routeAccess';

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

function ProjectionRouteGuard({ guard }: { guard: 'PROVIDER' | 'DRIVER' }) {
  const { loading, session } = useAIOAuth();
  const location = useLocation();

  if (isDemoMode()) {
    return <Outlet />;
  }

  if (!isBackendMode()) {
    return <Navigate to={aioPaths.home} replace />;
  }

  if (loading) {
    return <AIOLoadingState label={guard === 'PROVIDER' ? 'Verifying provider access…' : 'Verifying driver access…'} />;
  }

  const decision = evaluateRouteAccess({
    guard,
    session,
    isDemoUnauthenticated: false,
  });

  if (decision === 'REDIRECT_LOGIN') {
    return <Navigate to={aioPaths.login} state={{ from: location.pathname }} replace />;
  }
  if (decision === 'REDIRECT_PORTAL' || decision === 'REDIRECT_HOME') {
    return <Navigate to={aioPaths.portal} replace />;
  }

  return <Outlet />;
}

export function ProviderRouteGuard() {
  return <ProjectionRouteGuard guard="PROVIDER" />;
}

export function DriverRouteGuard() {
  return <ProjectionRouteGuard guard="DRIVER" />;
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
