import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useWorkspace } from '../context/WorkspaceProvider';
import { STUDIO_OS_WORKSPACE_CHANGED } from '../workspace/context-bridge';
import { buildActiveOrganizationContext } from './resolve';
import { syncOrganizationBoundary } from './boundary-sync';
import type { ActiveOrganizationContext } from './types';

const OrganizationContext = createContext<ActiveOrganizationContext | null>(null);

type OrganizationContextProviderProps = {
  children: ReactNode;
};

/**
 * Organization boundary — everything beneath this provider operates on the active organization only.
 */
export function OrganizationContextProvider({ children }: OrganizationContextProviderProps) {
  const { workspace, workspaceId, moduleTenantId, resolveModulePath, studioEntryPath } = useWorkspace();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const onWorkspaceChanged = () => setRevision((r) => r + 1);
    window.addEventListener(STUDIO_OS_WORKSPACE_CHANGED, onWorkspaceChanged);
    return () => window.removeEventListener(STUDIO_OS_WORKSPACE_CHANGED, onWorkspaceChanged);
  }, []);

  const context = useMemo(
    () =>
      buildActiveOrganizationContext(workspace, moduleTenantId, resolveModulePath, studioEntryPath),
    [workspace, workspaceId, moduleTenantId, resolveModulePath, studioEntryPath, revision]
  );

  useEffect(() => {
    syncOrganizationBoundary(context);
  }, [context.organizationId, context.moduleTenantId, context.timelineOrganizationId]);

  return (
    <OrganizationContext.Provider value={context}>{children}</OrganizationContext.Provider>
  );
}

export function useOrganizationContext(): ActiveOrganizationContext {
  const ctx = useContext(OrganizationContext);
  if (!ctx) {
    throw new Error('useOrganizationContext must be used within OrganizationContextProvider');
  }
  return ctx;
}

export function useOrganizationContextOptional(): ActiveOrganizationContext | null {
  return useContext(OrganizationContext);
}

/** Workspace-aware module navigation + brand accent for studio pages. */
export function useStudioModuleNav() {
  const org = useOrganizationContext();
  return {
    toModule: org.studioModulePath,
    studioEntry: org.studioEntryPath,
    accentColor: org.accentColor,
    organizationName: org.organizationName,
    organizationId: org.organizationId,
    moduleTenantId: org.moduleTenantId,
  };
}
