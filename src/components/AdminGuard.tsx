import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { WorkspaceProvider } from '../studio-os-core/context/WorkspaceProvider';
import { isSignedIn, canAccessAdminPages } from '../utils/adminAuth';
import { ensureWorkspacesBootstrapped } from '../utils/ensureWorkspacesBootstrapped';
import LoadingScreen from './base/LoadingScreen';

/**
 * Protects all /admin/* routes. Only emails in VITE_ADMIN_EMAILS / defaults (e.g. kateenaarmstrong@gmail.com) may access.
 * - Signed out → redirect to /sign-in
 * - Signed in but not allowed → redirect to /account
 * - Allowed admin only → render child routes.
 */
export default function AdminGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [workspacesReady, setWorkspacesReady] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const signedIn = isSignedIn();
      if (!signedIn) {
        const returnTo = encodeURIComponent(location.pathname + location.search);
        navigate(`/sign-in?returnTo=${returnTo}`, { replace: true });
        if (!cancelled) setChecked(true);
        return;
      }
      if (!canAccessAdminPages()) {
        navigate('/account', { replace: true });
        if (!cancelled) setChecked(true);
        return;
      }

      try {
        await ensureWorkspacesBootstrapped();
        if (!cancelled) {
          setBootstrapError(null);
          setWorkspacesReady(true);
          setChecked(true);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setBootstrapError(error instanceof Error ? error.message : 'Failed to load Studio OS workspaces');
          setChecked(true);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search, navigate]);

  if (!checked) {
    return null;
  }

  if (!isSignedIn() || !canAccessAdminPages()) {
    return null;
  }

  if (bootstrapError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: '"Futura PT Medium", Futura, sans-serif',
          color: '#eb1c24',
        }}
      >
        <div style={{ maxWidth: '360px' }}>
          <p style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 12px' }}>
            Admin could not load Studio OS
          </p>
          <p style={{ fontSize: '11px', lineHeight: 1.5, color: '#555', margin: '0 0 16px' }}>{bootstrapError}</p>
          <button
            type="button"
            onClick={() => {
              setBootstrapError(null);
              setWorkspacesReady(false);
              setChecked(false);
            }}
            style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: '1px solid #0a0a0a',
              background: '#fff',
              padding: '10px 16px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!workspacesReady) {
    return <LoadingScreen />;
  }

  return (
    <WorkspaceProvider>
      <Outlet />
    </WorkspaceProvider>
  );
}
