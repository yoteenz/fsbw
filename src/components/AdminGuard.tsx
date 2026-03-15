import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { isSignedIn, canAccessAdminPages } from '../utils/adminAuth';

/**
 * Protects all /admin/* routes. Only the allowed admin account (e.g. ayoteenz@yahoo.com) may access.
 * - Signed out → redirect to /sign-in
 * - Signed in but not allowed → redirect to /account
 * - Allowed admin only → render child routes.
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
    return null;
  }

  if (!isSignedIn()) {
    return null;
  }
  if (!canAccessAdminPages()) {
    return null;
  }

  return <Outlet />;
}
