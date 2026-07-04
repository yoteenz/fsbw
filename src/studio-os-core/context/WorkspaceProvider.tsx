import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { loadWorkspace, type LoadedWorkspace } from '../workspace/loader';
import { getWorkspaceRegistry } from '../workspace/registry';
import type { WorkspaceDataAdapter } from '../workspace/data-adapter';
import type { WorkspaceListItem, WorkspaceSchema } from '../workspace/types';
import { workspaceStudioEntryPath } from '../workspace/routes';
import {
  readActiveWorkspaceIdFromStorage,
  writeActiveWorkspaceIdToStorage,
  setRuntimeActiveWorkspaceId,
  STUDIO_OS_DEFAULT_WORKSPACE_ID,
} from '../workspace/storage';

export type WorkspaceContextValue = {
  workspaceId: string;
  workspace: WorkspaceSchema;
  dataAdapter: WorkspaceDataAdapter;
  workspaces: WorkspaceListItem[];
  setActiveWorkspace: (workspaceId: string) => void;
  getModuleSubtitle: (moduleKey: keyof WorkspaceSchema['moduleCopy']) => string | undefined;
  studioEntryPath: string;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

type WorkspaceProviderProps = {
  children: ReactNode;
  /** Optional override for tests; defaults to localStorage active workspace. */
  initialWorkspaceId?: string;
};

export function WorkspaceProvider({ children, initialWorkspaceId }: WorkspaceProviderProps) {
  const [workspaceId, setWorkspaceId] = useState(() => {
    const id = initialWorkspaceId ?? readActiveWorkspaceIdFromStorage();
    setRuntimeActiveWorkspaceId(id);
    return id;
  });

  const loaded = useMemo(() => loadWorkspace(workspaceId), [workspaceId]);
  const fallback = useMemo(() => loadWorkspace(STUDIO_OS_DEFAULT_WORKSPACE_ID)!, []);

  const workspace = loaded?.schema ?? fallback.schema;
  const dataAdapter = loaded?.dataAdapter ?? fallback.dataAdapter;

  const setActiveWorkspace = useCallback((id: string) => {
    writeActiveWorkspaceIdToStorage(id);
    setWorkspaceId(id);
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceId,
      workspace,
      dataAdapter,
      workspaces: getWorkspaceRegistry().listWorkspaces(),
      setActiveWorkspace,
      getModuleSubtitle: (moduleKey) => {
        const copy = workspace.moduleCopy[moduleKey];
        if (!copy || typeof copy !== 'object' || !('subtitle' in copy)) return undefined;
        return copy.subtitle;
      },
      studioEntryPath: workspaceStudioEntryPath(workspace.id, workspace.studioEntryPath),
    }),
    [workspaceId, workspace, dataAdapter, setActiveWorkspace]
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

/** Safe accessor for non-React modules (storage, loaders). */
export function getActiveWorkspaceDataAdapter(): WorkspaceDataAdapter {
  const id = readActiveWorkspaceIdFromStorage();
  return getWorkspaceRegistry().getWorkspaceDataAdapter(id);
}

export type { LoadedWorkspace };
