import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isSignedIn, canAccessAdminPages } from '../utils/adminAuth';
import {
  assertExperienceLabAccess,
  resolveFounderRedirectFromAdminInfrastructure,
} from '../studio-os-core/canonical-studio-world';

/**
 * Restricts Studio World admin infrastructure routes to portfolio owners (Studio World Admin).
 * Founders are redirected to Creative Director Studio — they never enter Experience Lab.
 */
export function useRequireStudioWorldAdmin(): void {
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
      return;
    }

    const access = assertExperienceLabAccess();
    if (!access.ok) {
      navigate(resolveFounderRedirectFromAdminInfrastructure(location.pathname), { replace: true });
    }
  }, [navigate, location.pathname, location.search]);
}
