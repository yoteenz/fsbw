import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isSignedIn, canAccessAdminPages } from '../utils/adminAuth';

/**
 * Protects all /admin/* routes. Terminal states only:
 * - signed out → Navigate to /sign-in
 * - signed in, not admin → Navigate to /account
 * - authorized → Outlet
 */
export default function AdminGuard() {
  const location = useLocation();

  if (!isSignedIn()) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/sign-in?returnTo=${returnTo}`} replace />;
  }

  if (!canAccessAdminPages()) {
    return <Navigate to="/account" replace />;
  }

  return <Outlet />;
}
