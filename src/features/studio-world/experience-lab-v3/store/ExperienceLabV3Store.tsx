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
  SpotlightResult,
  WorkbenchToolId,
  WorkOrder,
  WorkspaceContextState,
} from '../experience-lab-v3.types';
import { createInitialV3State, rebuildV3ContextState } from './v3-demo-seed';
import { resolveV3DepartmentLabel } from '../registry/v3-program-registry';

type V3Action =
  | { type: 'SET_PROGRAM'; programId: WorkspaceContextState['programId'] }
  | { type: 'SET_DEPARTMENT'; departmentId: string }
  | { type: 'SET_VARIANT'; variantId: string; variantLabel: string }
  | { type: 'SET_REVISION'; revision: number }
  | { type: 'SET_WORK_ORDER'; workOrderId: string | null }
  | { type: 'SET_WORKBENCH_TOOL'; tool: WorkbenchToolId | null }
  | { type: 'MOVE_WORK_ORDER'; workOrderId: string; column: WorkOrder['queueColumn'] }
  | { type: 'SET_SPOTLIGHT'; open: boolean }
  | { type: 'SET_ASSISTANT'; open: boolean }
  | { type: 'SET_BLUEPRINT_ZOOM'; zoom: number }
  | { type: 'SET_BLUEPRINT_PAN'; pan: { x: number; y: number } }
  | { type: 'TOGGLE_BLUEPRINT_FULLSCREEN' }
  | { type: 'TICK_OPERATIONS' };

function v3Reducer(state: ExperienceLabV3State, action: V3Action): ExperienceLabV3State {
  switch (action.type) {
    case 'SET_PROGRAM':
      return rebuildV3ContextState(state, {
        programId: action.programId,
        departmentId: action.programId === 'studio-world' ? 'reception' : 'dental',
        departmentLabel: resolveV3DepartmentLabel(action.programId, action.programId === 'studio-world' ? 'reception' : 'dental'),
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
    case 'SET_WORK_ORDER':
      return { ...state, activeWorkOrderId: action.workOrderId };
    case 'SET_WORKBENCH_TOOL':
      return { ...state, activeWorkbenchTool: action.tool };
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
  setProgram: (programId: WorkspaceContextState['programId']) => void;
  setDepartment: (departmentId: string) => void;
  setWorkbenchTool: (tool: WorkbenchToolId) => void;
  setActiveWorkOrder: (id: string | null) => void;
  searchSpotlight: (query: string) => SpotlightResult[];
};

const ExperienceLabV3StoreContext = createContext<ExperienceLabV3StoreValue | null>(null);

export function ExperienceLabV3StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(v3Reducer, undefined, createInitialV3State);

  const activeWorkOrder = useMemo(
    () => state.workOrders.find((w) => w.id === state.activeWorkOrderId) ?? null,
    [state.workOrders, state.activeWorkOrderId]
  );

  const setProgram = useCallback((programId: WorkspaceContextState['programId']) => {
    dispatch({ type: 'SET_PROGRAM', programId });
  }, []);

  const setDepartment = useCallback((departmentId: string) => {
    dispatch({ type: 'SET_DEPARTMENT', departmentId });
  }, []);

  const setWorkbenchTool = useCallback((tool: WorkbenchToolId) => {
    dispatch({ type: 'SET_WORKBENCH_TOOL', tool });
  }, []);

  const setActiveWorkOrder = useCallback((id: string | null) => {
    dispatch({ type: 'SET_WORK_ORDER', workOrderId: id });
  }, []);

  const searchSpotlight = useCallback(
    (query: string): SpotlightResult[] => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const results: SpotlightResult[] = [];

      for (const wo of state.workOrders) {
        if (wo.title.toLowerCase().includes(q)) {
          results.push({ id: wo.id, kind: 'work-order', title: wo.title, subtitle: wo.status });
        }
      }
      if (state.workspace.departmentLabel.toLowerCase().includes(q)) {
        results.push({
          id: state.workspace.departmentId,
          kind: 'department',
          title: state.workspace.departmentLabel,
          subtitle: 'Department',
        });
      }
      if (state.activePackage && state.activePackage.packageId.toLowerCase().includes(q)) {
        results.push({
          id: state.activePackage.packageId,
          kind: 'package',
          title: state.activePackage.packageId,
          subtitle: `Revision R${state.activePackage.revision}`,
        });
      }
      return results.slice(0, 12);
    },
    [state.workOrders, state.workspace, state.activePackage]
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      activeWorkOrder,
      setProgram,
      setDepartment,
      setWorkbenchTool,
      setActiveWorkOrder,
      searchSpotlight,
    }),
    [state, activeWorkOrder, setProgram, setDepartment, setWorkbenchTool, setActiveWorkOrder, searchSpotlight]
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
