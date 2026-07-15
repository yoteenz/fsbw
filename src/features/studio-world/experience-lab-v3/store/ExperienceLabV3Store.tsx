import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type {
  ExperienceLabV3State,
  V3CoreWorkspaceId,
  V3DesignVariantId,
  V3InspectorModeId,
  V3WorkbenchToolId,
  V3WorkspaceMemory,
  WorkOrder,
  WorkspaceContextState,
} from '../experience-lab-v3.types';
import { V3_CORE_WORKSPACE_IDS } from '../experience-lab-v3.types';
import { createInitialV3State, rebuildV3ContextState } from './v3-demo-seed';
import {
  defaultV3WorkbenchTool,
  resolveV3InspectorModeForTool,
} from '../registry/v3-workbench-registry';
import { resolveV3WorkspaceByOffset } from '../registry/v3-workspace-registry';
import type { V3LiveDerivedModel } from '../adapters/liveWorkspaceToV3Model';

type V3Action =
  | { type: 'SET_WORKSPACE'; workspace: V3CoreWorkspaceId }
  | { type: 'SWIPE_WORKSPACE'; direction: -1 | 1 }
  | { type: 'SET_PROGRAM'; programId: WorkspaceContextState['programId'] }
  | { type: 'SET_DEPARTMENT'; departmentId: string }
  | { type: 'SET_VARIANT'; variantId: string; variantLabel: string }
  | { type: 'SET_REVISION'; revision: number }
  | { type: 'TOGGLE_DESIGN_VARIANTS_COLLAPSED' }
  | { type: 'SET_WORK_ORDER'; workOrderId: string | null }
  | { type: 'SET_REVIEW'; reviewId: string | null }
  | { type: 'SET_ASSET'; assetId: string | null }
  | { type: 'SET_OUTPUT'; outputId: string | null }
  | { type: 'SET_WORKBENCH_TOOL'; tool: V3WorkbenchToolId | null }
  | { type: 'MOVE_WORK_ORDER'; workOrderId: string; column: WorkOrder['queueColumn'] }
  | { type: 'SET_SPOTLIGHT'; open: boolean }
  | { type: 'SET_ASSISTANT'; open: boolean }
  | { type: 'SET_BLUEPRINT_ZOOM'; zoom: number }
  | { type: 'SET_BLUEPRINT_PAN'; pan: { x: number; y: number } }
  | { type: 'TOGGLE_BLUEPRINT_FULLSCREEN' }
  | { type: 'TICK_OPERATIONS' }
  | { type: 'SYNC_FROM_LIVE'; payload: V3LiveDerivedModel & { eventConnected?: boolean } }
  | { type: 'SET_WORKSPACE_MEMORY'; workspace: V3CoreWorkspaceId; patch: Partial<V3WorkspaceMemory[V3CoreWorkspaceId]> }
  | { type: 'SET_PAGE_ERROR'; error: string | null };

function defaultWorkspaceMemory(): V3WorkspaceMemory {
  return {
    environment: {},
    production: { module: 'queue' },
    review: { comparisonMode: 'side-by-side' },
    assets: { viewMode: 'grid' },
    command: { module: 'jobs', scope: 'package' },
  };
}

function dataStateForWorkspace(
  workspace: V3CoreWorkspaceId,
  derived: V3LiveDerivedModel
): ExperienceLabV3State['workspaceDataState'][V3CoreWorkspaceId] {
  if (derived.loading) return 'loading';
  if (derived.error) return 'error';
  if (derived.empty) return 'empty';
  if (workspace === 'production' && derived.workOrders.length === 0) return 'empty';
  if (workspace === 'review' && derived.reviewItems.length === 0) return 'empty';
  if (workspace === 'assets' && !derived.activePackage) return 'empty';
  return 'ready';
}

function applyWorkspaceChange(
  state: ExperienceLabV3State,
  workspace: V3CoreWorkspaceId
): ExperienceLabV3State {
  const memory = state.workspaceMemory[workspace];
  const rememberedTool = memory && 'module' in memory ? null : null;
  const defaultTool = rememberedTool ?? defaultV3WorkbenchTool(workspace);
  return {
    ...state,
    activeWorkspace: workspace,
    activeWorkbenchTool: defaultTool,
    activeInspectorMode: resolveV3InspectorModeForTool(workspace, defaultTool),
  };
}

function invalidateSelections(state: ExperienceLabV3State, derived: V3LiveDerivedModel): ExperienceLabV3State {
  const workOrderValid = state.activeWorkOrderId
    ? derived.workOrders.some((w) => w.id === state.activeWorkOrderId)
    : true;
  const reviewValid = state.activeReviewId
    ? derived.reviewItems.some((r) => r.id === state.activeReviewId)
    : true;
  const assetValid = state.activeAssetId
    ? derived.assetLibrary.some((a) => a.id === state.activeAssetId)
    : true;

  return {
    ...state,
    activeWorkOrderId: workOrderValid ? state.activeWorkOrderId : derived.workOrders[0]?.id ?? null,
    activeReviewId: reviewValid ? state.activeReviewId : derived.reviewItems[0]?.id ?? null,
    activeAssetId: assetValid ? state.activeAssetId : derived.assetLibrary[0]?.id ?? null,
    activeOutputId:
      state.activeOutputId && derived.activePackage?.outputs.some((o) => o.id === state.activeOutputId)
        ? state.activeOutputId
        : derived.activePackage?.outputs[0]?.id ?? null,
  };
}

function v3Reducer(state: ExperienceLabV3State, action: V3Action): ExperienceLabV3State {
  switch (action.type) {
    case 'SET_WORKSPACE':
      return applyWorkspaceChange(state, action.workspace);
    case 'SWIPE_WORKSPACE':
      return applyWorkspaceChange(state, resolveV3WorkspaceByOffset(state.activeWorkspace, action.direction));
    case 'SET_PROGRAM':
      return rebuildV3ContextState(state, {
        programId: action.programId,
        departmentId: action.programId === 'studio-world' ? 'reception' : 'dental',
      });
    case 'SET_DEPARTMENT':
      return rebuildV3ContextState(state, { departmentId: action.departmentId });
    case 'SET_VARIANT':
      return rebuildV3ContextState(state, {
        variantId: action.variantId,
        variantLabel: action.variantLabel,
      });
    case 'SET_REVISION':
      return { ...state, workspace: { ...state.workspace, revision: action.revision } };
    case 'TOGGLE_DESIGN_VARIANTS_COLLAPSED':
      return { ...state, designVariantsCollapsed: !state.designVariantsCollapsed };
    case 'SET_WORK_ORDER':
      return {
        ...state,
        activeWorkOrderId: action.workOrderId,
        workspaceMemory: {
          ...state.workspaceMemory,
          production: { ...state.workspaceMemory.production, workOrderId: action.workOrderId },
        },
      };
    case 'SET_REVIEW':
      return {
        ...state,
        activeReviewId: action.reviewId,
        workspaceMemory: {
          ...state.workspaceMemory,
          review: { ...state.workspaceMemory.review, reviewItemId: action.reviewId },
        },
      };
    case 'SET_ASSET':
      return {
        ...state,
        activeAssetId: action.assetId,
        workspaceMemory: {
          ...state.workspaceMemory,
          assets: { ...state.workspaceMemory.assets, assetId: action.assetId },
        },
      };
    case 'SET_OUTPUT':
      return { ...state, activeOutputId: action.outputId };
    case 'SET_WORKBENCH_TOOL': {
      const tool = action.tool;
      const ws = state.activeWorkspace;
      return {
        ...state,
        activeWorkbenchTool: tool,
        activeInspectorMode: resolveV3InspectorModeForTool(ws, tool),
        workspaceMemory: {
          ...state.workspaceMemory,
          [ws]: {
            ...state.workspaceMemory[ws],
            module: tool ?? undefined,
          },
        },
      };
    }
    case 'MOVE_WORK_ORDER':
      return {
        ...state,
        workOrders: state.workOrders.map((wo) =>
          wo.id === action.workOrderId ? { ...wo, queueColumn: action.column, updatedAt: new Date().toISOString() } : wo
        ),
      };
    case 'SET_SPOTLIGHT':
      return { ...state, spotlightOpen: action.open };
    case 'SET_ASSISTANT':
      return { ...state, assistantOpen: action.open };
    case 'SET_BLUEPRINT_ZOOM':
      return { ...state, blueprintZoom: action.zoom };
    case 'SET_BLUEPRINT_PAN':
      return { ...state, blueprintPan: action.pan };
    case 'TOGGLE_BLUEPRINT_FULLSCREEN':
      return { ...state, blueprintFullscreen: !state.blueprintFullscreen };
    case 'TICK_OPERATIONS':
      return {
        ...state,
        workOrders: state.workOrders.map((wo) =>
          wo.status === 'generating' && wo.progress < 100
            ? { ...wo, progress: Math.min(100, wo.progress + 2), updatedAt: new Date().toISOString() }
            : wo
        ),
        operations: {
          ...state.operations,
          gpuUsagePercent: Math.min(98, state.operations.gpuUsagePercent + 1),
        },
      };
    case 'SYNC_FROM_LIVE': {
      const { payload } = action;
      const attentionItems = [
        ...(payload.operations.failedJobs > 0
          ? [{ id: 'failures', label: `${payload.operations.failedJobs} failed job(s)`, severity: 'critical' as const, action: 'Open diagnostics' }]
          : []),
        ...(payload.workspace.lifecycleStatus.includes('blocked')
          ? [{ id: 'blocked', label: 'Package blocked — dependency required', severity: 'warning' as const, action: 'View dependencies' }]
          : []),
      ];
      const next: ExperienceLabV3State = {
        ...state,
        workspace: payload.workspace,
        workOrders: payload.workOrders,
        pipeline: payload.pipeline,
        activePackage: payload.activePackage,
        reviewItems: payload.reviewItems,
        assetLibrary: payload.assetLibrary,
        operations: payload.operations,
        attentionItems,
        useLiveData: !payload.empty,
        lastPageError: payload.error,
        workspaceDataState: Object.fromEntries(
          V3_CORE_WORKSPACE_IDS.map((ws) => [ws, dataStateForWorkspace(ws, payload)])
        ) as ExperienceLabV3State['workspaceDataState'],
      };
      return invalidateSelections(next, payload);
    }
    case 'SET_WORKSPACE_MEMORY':
      return {
        ...state,
        workspaceMemory: {
          ...state.workspaceMemory,
          [action.workspace]: { ...state.workspaceMemory[action.workspace], ...action.patch },
        },
      };
    case 'SET_PAGE_ERROR':
      return { ...state, lastPageError: action.error };
    default:
      return state;
  }
}

export type ExperienceLabV3StoreValue = {
  state: ExperienceLabV3State;
  dispatch: Dispatch<V3Action>;
  activeWorkOrder: WorkOrder | null;
  activeReview: ExperienceLabV3State['reviewItems'][number] | null;
  activeAsset: ExperienceLabV3State['assetLibrary'][number] | null;
  setWorkspace: (workspace: V3CoreWorkspaceId) => void;
  swipeWorkspace: (direction: -1 | 1) => void;
  setProgram: (programId: WorkspaceContextState['programId']) => void;
  setDepartment: (departmentId: string) => void;
  setVariant: (variantId: V3DesignVariantId, variantLabel: string) => void;
  setWorkbenchTool: (tool: V3WorkbenchToolId | null) => void;
  setActiveWorkOrder: (id: string | null) => void;
  setActiveReview: (id: string | null) => void;
  setActiveAsset: (id: string | null) => void;
  setActiveOutput: (id: string | null) => void;
};

const ExperienceLabV3StoreContext = createContext<ExperienceLabV3StoreValue | null>(null);

export function ExperienceLabV3StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(v3Reducer, undefined, () => ({
    ...createInitialV3State(),
    workspaceMemory: defaultWorkspaceMemory(),
    workspaceDataState: Object.fromEntries(
      V3_CORE_WORKSPACE_IDS.map((ws) => [ws, 'loading' as const])
    ) as ExperienceLabV3State['workspaceDataState'],
    attentionItems: [],
    activeAssetId: null,
    activeOutputId: null,
    lastPageError: null,
    useLiveData: false,
  }));

  const activeWorkOrder = useMemo(
    () => state.workOrders.find((w) => w.id === state.activeWorkOrderId) ?? null,
    [state.workOrders, state.activeWorkOrderId]
  );

  const activeReview = useMemo(
    () => state.reviewItems.find((r) => r.id === state.activeReviewId) ?? null,
    [state.reviewItems, state.activeReviewId]
  );

  const activeAsset = useMemo(
    () => state.assetLibrary.find((a) => a.id === state.activeAssetId) ?? null,
    [state.assetLibrary, state.activeAssetId]
  );

  const setWorkspace = useCallback((workspace: V3CoreWorkspaceId) => {
    dispatch({ type: 'SET_WORKSPACE', workspace });
  }, []);

  const swipeWorkspace = useCallback((direction: -1 | 1) => {
    dispatch({ type: 'SWIPE_WORKSPACE', direction });
  }, []);

  const setProgram = useCallback((programId: WorkspaceContextState['programId']) => {
    dispatch({ type: 'SET_PROGRAM', programId });
  }, []);

  const setDepartment = useCallback((departmentId: string) => {
    dispatch({ type: 'SET_DEPARTMENT', departmentId });
  }, []);

  const setVariant = useCallback((variantId: V3DesignVariantId, variantLabel: string) => {
    dispatch({ type: 'SET_VARIANT', variantId, variantLabel });
  }, []);

  const setWorkbenchTool = useCallback((tool: V3WorkbenchToolId | null) => {
    dispatch({ type: 'SET_WORKBENCH_TOOL', tool });
  }, []);

  const setActiveWorkOrder = useCallback((id: string | null) => {
    dispatch({ type: 'SET_WORK_ORDER', workOrderId: id });
  }, []);

  const setActiveReview = useCallback((id: string | null) => {
    dispatch({ type: 'SET_REVIEW', reviewId: id });
  }, []);

  const setActiveAsset = useCallback((id: string | null) => {
    dispatch({ type: 'SET_ASSET', assetId: id });
  }, []);

  const setActiveOutput = useCallback((id: string | null) => {
    dispatch({ type: 'SET_OUTPUT', outputId: id });
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      activeWorkOrder,
      activeReview,
      activeAsset,
      setWorkspace,
      swipeWorkspace,
      setProgram,
      setDepartment,
      setVariant,
      setWorkbenchTool,
      setActiveWorkOrder,
      setActiveReview,
      setActiveAsset,
      setActiveOutput,
    }),
    [
      state,
      activeWorkOrder,
      activeReview,
      activeAsset,
      setWorkspace,
      swipeWorkspace,
      setProgram,
      setDepartment,
      setVariant,
      setWorkbenchTool,
      setActiveWorkOrder,
      setActiveReview,
      setActiveAsset,
      setActiveOutput,
    ]
  );

  return (
    <ExperienceLabV3StoreContext.Provider value={value}>{children}</ExperienceLabV3StoreContext.Provider>
  );
}

export function useExperienceLabV3Store(): ExperienceLabV3StoreValue {
  const ctx = useContext(ExperienceLabV3StoreContext);
  if (!ctx) throw new Error('useExperienceLabV3Store requires ExperienceLabV3StoreProvider');
  return ctx;
}

export type { V3InspectorModeId };
