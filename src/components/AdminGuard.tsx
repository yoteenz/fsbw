import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { isSignedIn, canAccessAdminPages } from '../utils/adminAuth';
import LoadingScreen from './base/LoadingScreen';

/**
 * Protects all /admin/* routes. Only emails in VITE_ADMIN_EMAILS / defaults may access.
 * - Signed out → redirect to /sign-in
 * - Signed in but not allowed → redirect to /account
 * - Allowed admin → render child routes immediately (no Studio OS / milestone bootstrap here).
 *
 * Studio OS workspace registry + WorkspaceProvider live in AdminStudioWorkspaceGuard
 * for /admin/studio/* and /admin/studio-os/* only.
 */
export default function AdminGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const signedIn = isSignedIn();
    if (!signedIn) {
      const returnTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/sign-in?returnTo=${returnTo}`, { replace: true });
      setChecked(true);
      return;
    }
    if (!canAccessAdminPages()) {
      navigate('/account', { replace: true });
      setChecked(true);
      return;
    }
    setChecked(true);
  }, [location.pathname, location.search, navigate]);

  if (!checked) {
    return <LoadingScreen />;
  }

  if (!isSignedIn() || !canAccessAdminPages()) {
    return null;
  }

  return <Outlet />;
}
