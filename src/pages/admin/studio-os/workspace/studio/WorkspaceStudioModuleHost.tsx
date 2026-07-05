import { lazy, Suspense, useEffect } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { useWorkspace } from '../../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../../studio-os-core/workspace/routes';
import { getWorkspaceRegistry } from '../../../../../studio-os-core/workspace/registry';
import { resolveHeadquartersPageModule } from '../../../../../studio-os-core/workspace/headquarters-module-resolver';
import { activateWorkspaceContext } from '../../../../../studio-os-core/workspace/context-bridge';
import { STUDIO_OS_DEFAULT_WORKSPACE_ID } from '../../../../../studio-os-core/workspace/storage';

function wrapLazy(loader: () => Promise<{ default: React.ComponentType }>) {
  const Comp = lazy(loader);
  return function WrappedModulePage() {
    return (
      <Suspense fallback={<div className="p-4 text-[8px] font-futura uppercase">LOADING WORKSPACE MODULE…</div>}>
        <Comp />
      </Suspense>
    );
  };
}

/**
 * Workspace-scoped Studio module host — same OS features, isolated organization context.
 * Route: /admin/studio-os/workspace/:workspaceId/studio/*
 */
export default function WorkspaceStudioModuleHost() {
  const { workspaceId, '*': rest } = useParams<{ workspaceId: string; '*': string }>();
  const { enterWorkspace, workspace } = useWorkspace();
  const { pathname } = useLocation();
  const restPath = rest ?? 'mission-control';

  useEffect(() => {
    if (workspaceId && getWorkspaceRegistry().isKnownWorkspaceId(workspaceId)) {
      enterWorkspace(workspaceId);
      activateWorkspaceContext(workspaceId);
    }
  }, [workspaceId, enterWorkspace]);

  if (!workspaceId || !getWorkspaceRegistry().isKnownWorkspaceId(workspaceId)) {
    return <Navigate to={STUDIO_OS_ROUTES.administration} replace />;
  }

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspaceId)} replace />;
  }

  if (workspaceId === STUDIO_OS_DEFAULT_WORKSPACE_ID && pathname.includes('/studio-os/workspace/')) {
    const segment = restPath.split('/')[0] ?? 'mission-control';
    return <Navigate to={`/admin/studio/${segment}${restPath.includes('/') ? `/${restPath.split('/').slice(1).join('/')}` : ''}`} replace />;
  }

  const loader = resolveHeadquartersPageModule(restPath);
  if (!loader) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceDashboard(workspaceId)} replace />;
  }

  const Page = wrapLazy(loader);
  return <Page />;
}
