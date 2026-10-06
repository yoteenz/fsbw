import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isDemoMode, isSupabaseMode } from '../../config/dataMode';
import { useDemoStore } from '../../demo/useDemoStore';
import { evaluatePortalPathAccess } from '../../client-migration/portalLifecycleAccess';
import type { ClientLifecycleState } from '../../client-migration/types';
import { aioPaths } from '../../utils/paths';
import { useAIOAuth } from '../AIOAuthProvider';

/**
 * Supabase + demo: gate CLIENT OFFICE routes by canonical lifecycle.
 * Demo uses portalClientId client record; supabase uses session organization when wired.
 */
export function ClientPortalLifecycleGuard() {
  const location = useLocation();
  const store = useDemoStore();
  const { session } = useAIOAuth();

  if (!isDemoMode() && !isSupabaseMode()) {
    return <Outlet />;
  }

  const orgId = session?.organization?.id ?? store.portalClientId ?? store.clients[0]?.id;
  const client = store.clients.find((c) => c.id === orgId);
  const lifecycle =
    (session?.organization?.clientLifecycle as ClientLifecycleState | undefined) ?? client?.clientLifecycle;
  const decision = evaluatePortalPathAccess(lifecycle, location.pathname);

  if (decision === 'ALLOW_PORTAL') return <Outlet />;
  if (decision === 'REDIRECT_ACTIVATION') {
    return <Navigate to={aioPaths.login} state={{ from: location.pathname, activation: true }} replace />;
  }
  if (decision === 'REDIRECT_ACTIVATION_REVIEW') {
    return <Navigate to={aioPaths.portalActivationReview} replace />;
  }

  return (
    <div className="aio-page" style={{ padding: '2rem 1rem', maxWidth: 480, margin: '0 auto' }}>
      <h1 className="aio-display-md">Your AIO office is not active yet</h1>
      <p className="aio-body">
        AIO is still preparing or verifying your business profile. Use your activation link from email when invited.
      </p>
    </div>
  );
}
