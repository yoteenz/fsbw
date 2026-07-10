import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CampusTransitionProvider } from './admin/studio-os/campus/CampusTransitionProvider';
import { WorkspaceProvider } from '../studio-os-core/context/WorkspaceProvider';
import { OrganizationContextProvider } from '../studio-os-core/organization-context';
import { PlatformErrorBoundary } from '../platform-stabilization/PlatformErrorBoundary';
import {
  ensureWorkspacesBootstrapped,
  isWorkspacesBootstrapped,
} from '../utils/ensureWorkspacesBootstrapped';
import { ensureOrgMembershipResolved, getCachedOrgMembership } from '../studio-os-core/auth/membership';
import {
  activateWorkspaceContext,
  persistWorkspaceId,
} from '../studio-os-core/workspace/context-bridge';
import { resolveBootstrapWorkspaceId } from '../studio-os-core/workspace/route-workspace-resolver';
import { getAccessToken } from '../utils/api';
import LoadingScreen from './base/LoadingScreen';
import { GuardLoadingRecovery } from '../platform-stabilization/GuardLoadingRecovery';
import { useGuardLoadingTimeout } from '../platform-stabilization/useGuardLoadingTimeout';

const MEMBERSHIP_API_TIMEOUT_MS = 2000;
const WORKSPACE_BOOTSTRAP_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

async function resolveMembershipInBackground(accessToken?: string | null): Promise<void> {
  const cached = getCachedOrgMembership();
  if (cached.source !== 'default') return;

  await Promise.race([
    ensureOrgMembershipResolved(accessToken ?? undefined),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, MEMBERSHIP_API_TIMEOUT_MS);
    }),
  ]);
}

/**
 * Studio OS routes only (/admin/studio/*, /admin/studio-os/*).
 * Loads workspace registry + org membership + WorkspaceProvider — never on /admin/dashboard.
 */
export default function AdminStudioWorkspaceGuard() {
  const { pathname, search } = useLocation();
  const [workspacesReady, setWorkspacesReady] = useState(isWorkspacesBootstrapped);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const workspaceLoading = !bootstrapError && !workspacesReady;
  const workspaceTimedOut = useGuardLoadingTimeout(workspaceLoading, 'AdminStudioWorkspaceGuard');

  const routeWorkspaceId = useMemo(
    () => resolveBootstrapWorkspaceId(pathname, search, getCachedOrgMembership()),
    [pathname, search]
  );

  /** URL → storage only before registry loads (refresh must not boot wrong org). */
  useLayoutEffect(() => {
    persistWorkspaceId(routeWorkspaceId);
  }, [routeWorkspaceId]);

  /** Registry bootstrap — never block paint on auth token or membership API. */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await withTimeout(
          ensureWorkspacesBootstrapped(),
          WORKSPACE_BOOTSTRAP_TIMEOUT_MS,
          'Studio workspace bootstrap'
        );
        if (!cancelled) {
          activateWorkspaceContext(
            resolveBootstrapWorkspaceId(pathname, search, getCachedOrgMembership())
          );
          setBootstrapError(null);
          setWorkspacesReady(true);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setBootstrapError(
            error instanceof Error ? error.message : 'Failed to load Studio OS workspaces'
          );
        }
      }
    })();

    void getAccessToken()
      .then((token) => resolveMembershipInBackground(token))
      .catch(() => resolveMembershipInBackground(null));

    return () => {
      cancelled = true;
    };
  }, []);

  /** Keep workspace context aligned when navigating after bootstrap. */
  useEffect(() => {
    if (!workspacesReady) return;
    activateWorkspaceContext(routeWorkspaceId);
  }, [workspacesReady, routeWorkspaceId]);

  if (workspaceTimedOut && workspaceLoading) {
    return (
      <GuardLoadingRecovery
        guard="AdminStudioWorkspaceGuard"
        detail="Workspace registry import did not finish. Bootstrap may be READY while workspace lazy import is still pending."
        onRetry={() => {
          setBootstrapError(null);
          setWorkspacesReady(false);
        }}
      />
    );
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
    return <LoadingScreen source="AdminStudioWorkspaceGuard" />;
  }

  return (
    <WorkspaceProvider initialWorkspaceId={routeWorkspaceId}>
      <OrganizationContextProvider>
        <PlatformErrorBoundary boundary="admin-studio-workspace">
          <CampusTransitionProvider>
            <Outlet />
          </CampusTransitionProvider>
        </PlatformErrorBoundary>
      </OrganizationContextProvider>
    </WorkspaceProvider>
  );
}
