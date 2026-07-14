import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CanonicalMainDepartmentId } from '../../../../studio-os-core/canonical-studio-world/canonical-department-registry';
import type { CanonicalQueueSnapshot } from '../../../../studio-os-core/canonical-studio-world/canonical-department-queue';
import type { EnvironmentAssetPackage } from '../../../../studio-os-core/environment-asset-package';
import { useProgramContext } from '../ProgramContextProvider';
import type { ExperienceLabDesignVariants } from '../useExperienceLabDesignVariants';
import type { WorkbenchEditingToolId } from '../experience-lab-v2-workbench-config';
import { getDesignVariantPackage } from '../experience-lab-environment-package-bridge';
import { buildExperienceLabLiveWorkspaceViewModel } from './buildExperienceLabLiveWorkspaceViewModel';
import type { ExperienceLabLiveWorkspaceViewModel } from './ExperienceLabLiveWorkspaceViewModel';
import {
  EXPERIENCE_LAB_V2_PAGE_ID,
  resolveStudioWorldWorkbenchRegistry,
  resolveActiveWorkbenchTool,
  writePersistedWorkbenchTool,
} from './StudioWorldWorkbenchRegistry';
import {
  generateBlueprintOutput,
  retryBlueprintOutput,
  type PackageActionResult,
} from './experience-lab-package-actions';
import { exportLiveWorkspaceDiagnosticJson } from './experience-lab-live-workspace-diagnostics';
import { useEnvironmentPackageEventSync } from './useEnvironmentPackageEventSync';
import type { EventSyncState } from './useEnvironmentPackageEventSync';

export type ExperienceLabLiveWorkspaceContextValue = {
  liveWorkspace: ExperienceLabLiveWorkspaceViewModel;
  workbenchRegistry: ReturnType<typeof resolveStudioWorldWorkbenchRegistry>;
  syncTick: number;
  historicalPreviewRevision: number | null;
  setHistoricalPreviewRevision: (revision: number | null) => void;
  setWorkbenchTool: (tool: WorkbenchEditingToolId | null) => void;
  refreshPackage: () => void;
  generateBlueprint: () => Promise<PackageActionResult>;
  retryBlueprint: () => Promise<PackageActionResult>;
  exportDiagnostics: () => string;
  eventSync: EventSyncState;
};

const LiveWorkspaceContext = createContext<ExperienceLabLiveWorkspaceContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  designVariants: ExperienceLabDesignVariants;
  canonicalQueue: CanonicalQueueSnapshot | null;
  departmentId: CanonicalMainDepartmentId;
  workbenchToolId: WorkbenchEditingToolId | null;
  onWorkbenchToolChange: (tool: WorkbenchEditingToolId | null) => void;
  imageLoaded?: boolean;
  approvalRecorded?: boolean;
  useMock?: boolean;
};

/** Page-level synchronization boundary for Experience Lab live workspace. */
export function ExperienceLabLiveWorkspaceProvider({
  children,
  designVariants,
  canonicalQueue,
  departmentId,
  workbenchToolId,
  onWorkbenchToolChange,
  imageLoaded = false,
  approvalRecorded = false,
  useMock = false,
}: ProviderProps) {
  const pipeline = useProgramContext();
  const [syncTick, setSyncTick] = useState(0);
  const [historicalPreviewRevision, setHistoricalPreviewRevision] = useState<number | null>(null);

  const environmentPackage: EnvironmentAssetPackage | null = useMemo(() => {
    void syncTick;
    void designVariants.activeVariantId;
    return getDesignVariantPackage(designVariants.activeVariantId);
  }, [designVariants.activeVariantId, syncTick]);

  const workbenchRegistry = useMemo(
    () =>
      resolveStudioWorldWorkbenchRegistry({
        pageId: EXPERIENCE_LAB_V2_PAGE_ID,
        programId: pipeline.state.programId,
        departmentId: pipeline.state.studioDepartmentId,
        industryPackId: pipeline.state.industryPackId,
        environmentId: pipeline.state.environmentId,
        packageLifecycleState: environmentPackage?.status,
      }),
    [
      pipeline.state.programId,
      pipeline.state.studioDepartmentId,
      pipeline.state.industryPackId,
      pipeline.state.environmentId,
      environmentPackage?.status,
    ]
  );

  const resolvedWorkbenchTool = useMemo(
    () =>
      resolveActiveWorkbenchTool({
        pageId: EXPERIENCE_LAB_V2_PAGE_ID,
        registry: workbenchRegistry,
        requestedTool: workbenchToolId,
      }),
    [workbenchRegistry, workbenchToolId]
  );

  const contextKey = `${pipeline.state.programId}:${pipeline.state.studioDepartmentId}:${pipeline.state.industryPackId}:${pipeline.state.environmentId}:${designVariants.activeVariantId}`;

  useEffect(() => {
    setHistoricalPreviewRevision(null);
    setSyncTick((t) => t + 1);
    if (workbenchToolId && !workbenchRegistry.some((e) => e.id === workbenchToolId && e.enabled)) {
      onWorkbenchToolChange(resolveActiveWorkbenchTool({
        pageId: EXPERIENCE_LAB_V2_PAGE_ID,
        registry: workbenchRegistry,
        requestedTool: null,
      }));
    }
  }, [contextKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const liveWorkspace = useMemo(
    () =>
      buildExperienceLabLiveWorkspaceViewModel({
        pipeline: pipeline.state,
        departmentId,
        activeVariant: designVariants.activeVariant,
        activeVariantId: designVariants.activeVariantId,
        environmentPackage,
        queue: canonicalQueue,
        workbenchToolId: resolvedWorkbenchTool,
        historicalPreviewRevision,
        imageLoaded,
        approvalRecorded,
        useMock,
        syncTick,
      }),
    [
      pipeline.state,
      departmentId,
      designVariants.activeVariant,
      designVariants.activeVariantId,
      environmentPackage,
      canonicalQueue,
      resolvedWorkbenchTool,
      historicalPreviewRevision,
      imageLoaded,
      approvalRecorded,
      useMock,
      syncTick,
    ]
  );

  const setWorkbenchTool = useCallback(
    (tool: WorkbenchEditingToolId | null) => {
      if (tool) writePersistedWorkbenchTool(EXPERIENCE_LAB_V2_PAGE_ID, tool);
      onWorkbenchToolChange(tool);
    },
    [onWorkbenchToolChange]
  );

  const refreshPackage = useCallback(() => {
    setSyncTick((t) => t + 1);
  }, []);

  const eventSync = useEnvironmentPackageEventSync({
    packageId: environmentPackage?.packageId ?? null,
    historicalPreviewRevision,
    workbenchToolId: resolvedWorkbenchTool,
    onRefreshPackage: refreshPackage,
  });

  const generateBlueprint = useCallback(async () => {
    if (!environmentPackage) return { ok: false, error: 'No active package' };
    const result = await generateBlueprintOutput(environmentPackage);
    if (result.ok) refreshPackage();
    return result;
  }, [environmentPackage, refreshPackage]);

  const retryBlueprint = useCallback(async () => {
    if (!environmentPackage) return { ok: false, error: 'No active package' };
    const result = await retryBlueprintOutput(environmentPackage);
    if (result.ok) refreshPackage();
    return result;
  }, [environmentPackage, refreshPackage]);

  const exportDiagnostics = useCallback(
    () => exportLiveWorkspaceDiagnosticJson(liveWorkspace, eventSync),
    [liveWorkspace, eventSync]
  );

  const value = useMemo(
    () => ({
      liveWorkspace,
      workbenchRegistry,
      syncTick,
      historicalPreviewRevision,
      setHistoricalPreviewRevision,
      setWorkbenchTool,
      refreshPackage,
      generateBlueprint,
      retryBlueprint,
      exportDiagnostics,
      eventSync,
    }),
    [
      liveWorkspace,
      workbenchRegistry,
      syncTick,
      historicalPreviewRevision,
      setWorkbenchTool,
      refreshPackage,
      generateBlueprint,
      retryBlueprint,
      exportDiagnostics,
      eventSync,
    ]
  );

  return (
    <LiveWorkspaceContext.Provider value={value}>{children}</LiveWorkspaceContext.Provider>
  );
}

export function useExperienceLabLiveWorkspace(): ExperienceLabLiveWorkspaceContextValue {
  const ctx = useContext(LiveWorkspaceContext);
  if (!ctx) {
    throw new Error('useExperienceLabLiveWorkspace must be used within ExperienceLabLiveWorkspaceProvider');
  }
  return ctx;
}

/** Safe accessor when provider may not wrap (tests). */
export function useExperienceLabLiveWorkspaceOptional(): ExperienceLabLiveWorkspaceContextValue | null {
  return useContext(LiveWorkspaceContext);
}
