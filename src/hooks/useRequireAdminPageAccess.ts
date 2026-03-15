import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSignedIn, canAccessAdminPages } from '../utils/adminAuth';

/**
 * Call from every admin page component. Redirects if the current user is not allowed to access admin pages:
 * - Signed out → /sign-in (with returnTo)
 * - Signed in but not in ALLOWED_ADMIN_PAGE_EMAILS → /account
 * No-op if canAccessAdminPages() is true.
 */
export function useRequireAdminPageAccess(): void {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isSignedIn()) {
      const returnTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/sign-in?returnTo=${returnTo}`, { replace: true });
      return;
    }
    if (!canAccessAdminPages()) {
      navigate('/account', { replace: true });
    }
  }, [navigate, location.pathname, location.search]);
}
