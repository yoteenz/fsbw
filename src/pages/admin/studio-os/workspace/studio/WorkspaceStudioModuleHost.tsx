import { lazy, Suspense, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useWorkspace } from '../../../../../studio-os-core/context/WorkspaceProvider';
import { STUDIO_OS_ROUTES } from '../../../../../studio-os-core/workspace/routes';
import { getWorkspaceRegistry } from '../../../../../studio-os-core/workspace/registry';

const MODULE_IMPORTS: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'mission-control': () => import('../../../studio/mission-control/page'),
  'production-studio': () => import('../../../studio/production-studio/page'),
  'render-queue': () => import('../../../studio/render-queue/page'),
  'screening-room': () => import('../../../studio/screening-room/page'),
  'concierge-approval-flow': () => import('../../../studio/concierge-approval-flow/page'),
  'publishing-queue': () => import('../../../studio/publishing-queue/page'),
  overview: () => import('../../../studio/overview/page'),
  'concierge-layer': () => import('../../../studio/concierge-layer/page'),
  'studio-intelligence': () => import('../../../studio/studio-intelligence/page'),
  ndxbook: () => import('../../../studio/ndxbook/page'),
};

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
 * Workspace-scoped Studio module host — same OS features, isolated workspace context.
 * Route: /admin/studio-os/workspace/:workspaceId/studio/*
 */
export default function WorkspaceStudioModuleHost() {
  const { workspaceId, '*': rest } = useParams<{ workspaceId: string; '*': string }>();
  const { enterWorkspace, workspace } = useWorkspace();
  const segment = (rest ?? 'mission-control').split('/')[0] ?? 'mission-control';

  useEffect(() => {
    if (workspaceId && getWorkspaceRegistry().isKnownWorkspaceId(workspaceId)) {
      enterWorkspace(workspaceId);
    }
  }, [workspaceId, enterWorkspace]);

  if (!workspaceId || !getWorkspaceRegistry().isKnownWorkspaceId(workspaceId)) {
    return <Navigate to={STUDIO_OS_ROUTES.entry} replace />;
  }

  if (!workspace.studioEnabled) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceShell(workspaceId)} replace />;
  }

  const loader = MODULE_IMPORTS[segment];
  if (!loader) {
    return <Navigate to={STUDIO_OS_ROUTES.workspaceDashboard(workspaceId)} replace />;
  }

  const Page = wrapLazy(loader);
  return <Page />;
}
