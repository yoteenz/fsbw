import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { loadWorkspace, type LoadedWorkspace } from '../workspace/loader';
import { getWorkspaceRegistry } from '../workspace/registry';
import type { WorkspaceDataAdapter } from '../workspace/data-adapter';
import type { WorkspaceListItem, WorkspaceSchema } from '../workspace/types';
import { workspaceStudioEntryPath, workspaceStudioModulePath, STUDIO_OS_ROUTES } from '../workspace/routes';
import {
  readActiveWorkspaceIdFromStorage,
  STUDIO_OS_DEFAULT_WORKSPACE_ID,
} from '../workspace/storage';
import { activateWorkspaceContext } from '../workspace/context-bridge';
import { resolveModuleTenantId, type ModuleTenantId } from '../workspace/tenant-ids';
import { recordWorkspaceVisit } from '../workspace-registry/store';

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
  const fallback = useMemo(() => loadWorkspace(STUDIO_OS_DEFAULT_WORKSPACE_ID)!, []);

  const workspace = loaded?.schema ?? fallback.schema;
  const dataAdapter = loaded?.dataAdapter ?? fallback.dataAdapter;
  const moduleTenantId = useMemo(() => resolveModuleTenantId(workspaceId), [workspaceId]);

  const setActiveWorkspace = useCallback((id: string) => {
    activateWorkspaceContext(id);
    setWorkspaceId(id);
  }, []);

  const enterWorkspace = useCallback((id: string) => {
    activateWorkspaceContext(id);
    setWorkspaceId(id);
    recordWorkspaceVisit(id);
  }, []);

  const resolveModulePath = useCallback(
    (segment: string) => workspaceStudioModulePath(workspaceId, segment),
    [workspaceId]
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceId,
      workspace,
      dataAdapter,
      workspaces: getWorkspaceRegistry().listWorkspaces(),
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
    [workspaceId, workspace, dataAdapter, moduleTenantId, setActiveWorkspace, enterWorkspace, resolveModulePath]
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
