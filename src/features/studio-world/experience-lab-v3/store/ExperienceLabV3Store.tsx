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
  WorkOrder,
  WorkspaceContextState,
} from '../experience-lab-v3.types';
import { createInitialV3State, rebuildV3ContextState } from './v3-demo-seed';
import {
  defaultV3WorkbenchTool,
  resolveV3InspectorModeForTool,
} from '../registry/v3-workbench-registry';
import { resolveV3WorkspaceByOffset } from '../registry/v3-workspace-registry';

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
  | { type: 'SET_WORKBENCH_TOOL'; tool: V3WorkbenchToolId | null }
  | { type: 'MOVE_WORK_ORDER'; workOrderId: string; column: WorkOrder['queueColumn'] }
  | { type: 'SET_SPOTLIGHT'; open: boolean }
  | { type: 'SET_ASSISTANT'; open: boolean }
  | { type: 'SET_BLUEPRINT_ZOOM'; zoom: number }
  | { type: 'SET_BLUEPRINT_PAN'; pan: { x: number; y: number } }
  | { type: 'TOGGLE_BLUEPRINT_FULLSCREEN' }
  | { type: 'TICK_OPERATIONS' };

function applyWorkspaceChange(
  state: ExperienceLabV3State,
  workspace: V3CoreWorkspaceId
): ExperienceLabV3State {
  const defaultTool = defaultV3WorkbenchTool(workspace);
  return {
    ...state,
    activeWorkspace: workspace,
    activeWorkbenchTool: defaultTool,
    activeInspectorMode: resolveV3InspectorModeForTool(workspace, defaultTool),
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
      return { ...state, activeWorkOrderId: action.workOrderId };
    case 'SET_REVIEW':
      return { ...state, activeReviewId: action.reviewId };
    case 'SET_WORKBENCH_TOOL': {
      const tool = action.tool;
      return {
        ...state,
        activeWorkbenchTool: tool,
        activeInspectorMode: resolveV3InspectorModeForTool(state.activeWorkspace, tool),
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
    default:
      return state;
  }
}

export type ExperienceLabV3StoreValue = {
  state: ExperienceLabV3State;
  dispatch: Dispatch<V3Action>;
  activeWorkOrder: WorkOrder | null;
  setWorkspace: (workspace: V3CoreWorkspaceId) => void;
  swipeWorkspace: (direction: -1 | 1) => void;
  setProgram: (programId: WorkspaceContextState['programId']) => void;
  setDepartment: (departmentId: string) => void;
  setVariant: (variantId: V3DesignVariantId, variantLabel: string) => void;
  setWorkbenchTool: (tool: V3WorkbenchToolId | null) => void;
  setActiveWorkOrder: (id: string | null) => void;
  setActiveReview: (id: string | null) => void;
};

const ExperienceLabV3StoreContext = createContext<ExperienceLabV3StoreValue | null>(null);

export function ExperienceLabV3StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(v3Reducer, undefined, createInitialV3State);

  const activeWorkOrder = useMemo(
    () => state.workOrders.find((w) => w.id === state.activeWorkOrderId) ?? null,
    [state.workOrders, state.activeWorkOrderId]
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

  const value = useMemo(
    () => ({
      state,
      dispatch,
      activeWorkOrder,
      setWorkspace,
      swipeWorkspace,
      setProgram,
      setDepartment,
      setVariant,
      setWorkbenchTool,
      setActiveWorkOrder,
      setActiveReview,
    }),
    [
      state,
      activeWorkOrder,
      setWorkspace,
      swipeWorkspace,
      setProgram,
      setDepartment,
      setVariant,
      setWorkbenchTool,
      setActiveWorkOrder,
      setActiveReview,
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
