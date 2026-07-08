import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CampusTransitionProvider } from './admin/studio-os/campus/CampusTransitionProvider';
import { WorkspaceProvider } from '../studio-os-core/context/WorkspaceProvider';
import { OrganizationContextProvider } from '../studio-os-core/organization-context';
import { ensureWorkspacesBootstrapped } from '../utils/ensureWorkspacesBootstrapped';
import { ensureOrgMembershipResolved, getCachedOrgMembership } from '../studio-os-core/auth/membership';
import { activateWorkspaceContext } from '../studio-os-core/workspace/context-bridge';
import { resolveBootstrapWorkspaceId } from '../studio-os-core/workspace/route-workspace-resolver';
import { getAccessToken } from '../utils/api';
import LoadingScreen from './base/LoadingScreen';

const MEMBERSHIP_API_TIMEOUT_MS = 2000;

async function resolveMembershipWithTimeout(accessToken?: string) {
  const cached = getCachedOrgMembership();
  if (cached.source !== 'default') {
    return cached;
  }
  return Promise.race([
    ensureOrgMembershipResolved(accessToken),
    new Promise<ReturnType<typeof getCachedOrgMembership>>((resolve) => {
      window.setTimeout(() => resolve(getCachedOrgMembership()), MEMBERSHIP_API_TIMEOUT_MS);
    }),
  ]);
}

async function getAccessTokenWithTimeout(): Promise<string | null> {
  return Promise.race([
    getAccessToken(),
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), MEMBERSHIP_API_TIMEOUT_MS);
    }),
  ]);
}

/**
 * Studio OS routes only (/admin/studio/*, /admin/studio-os/*).
 * Loads workspace registry + org membership + WorkspaceProvider — never on /admin/dashboard.
 */
export default function AdminStudioWorkspaceGuard() {
  const { pathname, search } = useLocation();
  const [workspacesReady, setWorkspacesReady] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  const routeWorkspaceId = useMemo(
    () => resolveBootstrapWorkspaceId(pathname, search, getCachedOrgMembership()),
    [pathname, search]
  );

  /** URL is source of truth — sync before paint so refresh never boots the wrong workspace. */
  useLayoutEffect(() => {
    activateWorkspaceContext(routeWorkspaceId);
  }, [routeWorkspaceId]);

  /** Registry + membership bootstrap runs once — never re-triggered on in-app navigation. */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const token = await getAccessTokenWithTimeout();
        await Promise.all([ensureWorkspacesBootstrapped(), resolveMembershipWithTimeout(token ?? undefined)]);
        activateWorkspaceContext(
          resolveBootstrapWorkspaceId(pathname, search, getCachedOrgMembership())
        );
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
    <WorkspaceProvider initialWorkspaceId={routeWorkspaceId}>
      <OrganizationContextProvider>
        <CampusTransitionProvider>
          <Outlet />
        </CampusTransitionProvider>
      </OrganizationContextProvider>
    </WorkspaceProvider>
  );
}
