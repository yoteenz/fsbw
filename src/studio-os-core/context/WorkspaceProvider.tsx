import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { loadWorkspace, type LoadedWorkspace } from '../workspace/loader';
import { getWorkspaceRegistry } from '../workspace/registry';
import type { WorkspaceDataAdapter } from '../workspace/data-adapter';
import type { WorkspaceListItem, WorkspaceSchema } from '../workspace/types';
import { workspaceStudioEntryPath, workspaceStudioModulePath, STUDIO_OS_ROUTES } from '../workspace/routes';
import {
  readActiveWorkspaceIdFromStorage,
} from '../workspace/storage';
import { activateWorkspaceContext } from '../workspace/context-bridge';
import { resolveModuleTenantId, type ModuleTenantId } from '../workspace/tenant-ids';
import { recordWorkspaceVisit } from '../workspace-registry/store';
import {
  canSwitchOrganizations,
  getAssignedOrganizationWorkspaceId,
} from '../application/portfolio-access';
import { STUDIO_PLATFORM_WORKSPACE } from '../platform/schema';
import { emptyWorkspaceDataAdapter } from '../workspace/empty-data-adapter';

export type WorkspaceContextValue = {
  workspaceId: string;
  workspace: WorkspaceSchema;
  dataAdapter: WorkspaceDataAdapter;
  workspaces: WorkspaceListItem[];
  moduleTenantId: ModuleTenantId;
  setActiveWorkspace: (workspaceId: string) => void;
  enterWorkspace: (workspaceId: string) => void;
  resolveModulePath: (segment: string) => string;
  getModuleSubtitle: (moduleKey: keyof WorkspaceSchema['moduleCopy']) => string | undefined;
  studioEntryPath: string;
  registryPath: string;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

type WorkspaceProviderProps = {
  children: ReactNode;
  initialWorkspaceId?: string;
};

export function WorkspaceProvider({ children, initialWorkspaceId }: WorkspaceProviderProps) {
  const [workspaceId, setWorkspaceId] = useState(() => {
    const id = initialWorkspaceId ?? readActiveWorkspaceIdFromStorage();
    activateWorkspaceContext(id);
    return id;
  });

  const loaded = useMemo(() => loadWorkspace(workspaceId), [workspaceId]);
  const platformFallback = useMemo(
    () => ({
      schema: STUDIO_PLATFORM_WORKSPACE,
      dataAdapter: emptyWorkspaceDataAdapter,
    }),
    []
  );

  const workspace = loaded?.schema ?? platformFallback.schema;
  const dataAdapter = loaded?.dataAdapter ?? platformFallback.dataAdapter;
  const moduleTenantId = useMemo(() => resolveModuleTenantId(workspaceId), [workspaceId]);

  const setActiveWorkspace = useCallback((id: string) => {
    if (id === workspaceId) return;
    activateWorkspaceContext(id);
    setWorkspaceId(id);
  }, [workspaceId]);

  const enterWorkspace = useCallback((id: string) => {
    if (id === workspaceId) return;
    activateWorkspaceContext(id);
    setWorkspaceId(id);
    recordWorkspaceVisit(id);
  }, [workspaceId]);

  const resolveModulePath = useCallback(
    (segment: string) => workspaceStudioModulePath(workspaceId, segment),
    [workspaceId]
  );

  const visibleWorkspaces = useMemo(() => {
    const all = getWorkspaceRegistry().listWorkspaces();
    if (canSwitchOrganizations()) return all;
    const assignedId = getAssignedOrganizationWorkspaceId();
    if (!assignedId) return [];
    return all.filter((w) => w.id === assignedId);
  }, [workspaceId]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceId,
      workspace,
      dataAdapter,
      workspaces: visibleWorkspaces,
      moduleTenantId,
      setActiveWorkspace,
      enterWorkspace,
      resolveModulePath,
      getModuleSubtitle: (moduleKey) => {
        const copy = workspace.moduleCopy[moduleKey];
        if (!copy || typeof copy !== 'object' || !('subtitle' in copy)) return undefined;
        return copy.subtitle;
      },
      studioEntryPath: workspaceStudioEntryPath(workspace.id, workspace.studioEntryPath),
      registryPath: STUDIO_OS_ROUTES.entry,
    }),
    [workspaceId, workspace, dataAdapter, visibleWorkspaces, moduleTenantId, setActiveWorkspace, enterWorkspace, resolveModulePath]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return ctx;
}

export function getActiveWorkspaceDataAdapter(): WorkspaceDataAdapter {
  const id = readActiveWorkspaceIdFromStorage();
  return getWorkspaceRegistry().getWorkspaceDataAdapter(id);
}

export type { LoadedWorkspace };
