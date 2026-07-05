import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CampusTransitionProvider } from './admin/studio-os/campus/CampusTransitionProvider';
import { WorkspaceProvider } from '../studio-os-core/context/WorkspaceProvider';
import { ensureWorkspacesBootstrapped } from '../utils/ensureWorkspacesBootstrapped';
import { ensureOrgMembershipResolved } from '../studio-os-core/auth/membership';
import { activateWorkspaceContext } from '../studio-os-core/workspace/context-bridge';
import { getAccessToken } from '../utils/api';
import LoadingScreen from './base/LoadingScreen';

/**
 * Studio OS routes only (/admin/studio/*, /admin/studio-os/*).
 * Loads workspace registry + org membership + WorkspaceProvider — never on /admin/dashboard.
 */
export default function AdminStudioWorkspaceGuard() {
  const [workspacesReady, setWorkspacesReady] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await ensureWorkspacesBootstrapped();
        const token = await getAccessToken();
        const membership = await ensureOrgMembershipResolved(token ?? undefined);
        if (!membership.isPortfolioOwner) {
          activateWorkspaceContext(membership.workspaceId);
        }
        if (!cancelled) {
          setBootstrapError(null);
          setWorkspacesReady(true);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setBootstrapError(error instanceof Error ? error.message : 'Failed to load Studio OS workspaces');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
            Studio OS could not load
          </p>
          <p style={{ fontSize: '11px', lineHeight: 1.5, color: '#555', margin: '0 0 16px' }}>{bootstrapError}</p>
          <button
            type="button"
            onClick={() => {
              setBootstrapError(null);
              setWorkspacesReady(false);
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
      <CampusTransitionProvider>
        <Outlet />
      </CampusTransitionProvider>
    </WorkspaceProvider>
  );
}
