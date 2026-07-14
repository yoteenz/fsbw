import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { V3CoreWorkspaceId } from '../experience-lab-v3.types';
import { resolveV3WorkspaceByOffset, resolveV3WorkspaceIndex } from '../registry/v3-workspace-registry';

type V3WorkspaceContextValue = {
  activeWorkspace: V3CoreWorkspaceId;
  activeIndex: number;
  setWorkspace: (id: V3CoreWorkspaceId) => void;
  swipeWorkspace: (direction: -1 | 1) => void;
};

const V3WorkspaceContext = createContext<V3WorkspaceContextValue | null>(null);

export function V3WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeWorkspace, setActiveWorkspace] = useState<V3CoreWorkspaceId>('environment');

  const setWorkspace = useCallback((id: V3CoreWorkspaceId) => {
    setActiveWorkspace(id);
  }, []);

  const swipeWorkspace = useCallback((direction: -1 | 1) => {
    setActiveWorkspace((current) => resolveV3WorkspaceByOffset(current, direction));
  }, []);

  const value = useMemo(
    () => ({
      activeWorkspace,
      activeIndex: resolveV3WorkspaceIndex(activeWorkspace),
      setWorkspace,
      swipeWorkspace,
    }),
    [activeWorkspace, setWorkspace, swipeWorkspace]
  );

  return <V3WorkspaceContext.Provider value={value}>{children}</V3WorkspaceContext.Provider>;
}

export function useV3Workspace(): V3WorkspaceContextValue {
  const ctx = useContext(V3WorkspaceContext);
  if (!ctx) throw new Error('useV3Workspace requires V3WorkspaceProvider');
  return ctx;
}
