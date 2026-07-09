import type {
  XeeBrandDna,
  XeeComponentDna,
  XeeDepartmentDna,
  XeeInteractionDna,
  XeeMotionDna,
  XeeSceneDna,
} from '../experience-engine/types';
import type { XerDemoBrandId, XerRoomPath, XerSceneNodeId } from './constants';

export type XerPlatformDna = {
  platformDnaId: string;
  version: string;
  routeAnatomy: string[];
  layoutPrimitives: string[];
  accessibilityFloor: string[];
  sceneGraphContract: string;
  orbMountContract: string;
  dataSlotContract: string;
  componentAnatomyIds: string[];
};

export type XerStateSlot = {
  slotId: string;
  nodeId: XerSceneNodeId;
  label: string;
  persistenceScope: 'ephemeral' | 'session' | 'workspace';
  defaultValue: string;
};

export type XerStateDna = {
  stateDnaId: string;
  version: string;
  sceneId: string;
  slots: XerStateSlot[];
  liveSwitchPolicy: {
    preserveSlots: string[];
    resetSlots: string[];
  };
};

export type XerRuntimeSelection = {
  brandId: string;
  departmentId: string;
  sceneId: string;
  componentId: string;
  motionDnaId: string;
};

export type XerRuntimeOverride = {
  overrideId: string;
  layer: 'brand' | 'department' | 'scene' | 'component' | 'motion' | 'interaction';
  fieldPath: string;
  value: string;
  reason: string;
};

export type XerRenderNode = {
  nodeId: XerSceneNodeId;
  role: string;
  componentId: string;
  variant: string;
  cssBindings: Record<string, string>;
  stateSlotIds: string[];
};

export type XerPerformanceMetrics = {
  assemblyMs: number;
  cacheHit: boolean;
  graphNodeCount: number;
  tokenCount: number;
  overrideCount: number;
  brandSwitchCount: number;
  lastAssembledAt: string;
};

export type XerRuntimeGraph = {
  graphId: string;
  sessionId: string;
  brandId: string;
  departmentId: string;
  sceneId: string;
  platformDna: XerPlatformDna;
  brand: XeeBrandDna;
  department: XeeDepartmentDna;
  scene: XeeSceneDna;
  components: XeeComponentDna[];
  motion: XeeMotionDna;
  interaction: XeeInteractionDna;
  stateDna: XerStateDna;
  renderNodes: XerRenderNode[];
  cssVariables: Record<string, string>;
  cssText: string;
  resolvedTokens: Record<string, string>;
  activeOverrides: XerRuntimeOverride[];
  performance: XerPerformanceMetrics;
  dnaVersions: {
    platform: string;
    brand: string;
    department: string;
    scene: string;
    state: string;
    runtime: string;
  };
};

export type XerInspectorView = {
  platformDna: XerPlatformDna;
  brandDna: XeeBrandDna;
  departmentDna: XeeDepartmentDna;
  sceneDna: XeeSceneDna;
  componentDna: XeeComponentDna[];
  resolvedTokens: Record<string, string>;
  activeOverrides: XerRuntimeOverride[];
  performance: XerPerformanceMetrics;
  renderNodes: XerRenderNode[];
  stateSlots: XerStateSlot[];
  sessionState: Record<string, string>;
};

export type XerStore = {
  version: string;
  platformDna: XerPlatformDna;
  stateDnaProfiles: XerStateDna[];
  selection: XerRuntimeSelection;
  sessionId: string;
  sessionState: Record<string, string>;
  brandSwitchCount: number;
  cacheStats: {
    hits: number;
    misses: number;
    entries: number;
  };
  constitutionLocked: boolean;
  seededAt?: string;
  bootstrappedAt?: string;
  lastOpenedAt?: string;
};

export type XerReadyView = {
  activeRoom: XerRoomPath;
  selection: XerRuntimeSelection;
  runtimeGraph: XerRuntimeGraph;
  inspector: XerInspectorView;
  platformDna: XerPlatformDna;
  stateDna: XerStateDna;
  demoBrandIds: XerDemoBrandId[];
  orbNote: string;
  constitutionLocked: boolean;
};

export type XerRuntimeInput = {
  pathname?: string;
  selection?: Partial<XerRuntimeSelection>;
};

export type XerAssemblyRequest = {
  brandId?: string;
  departmentId?: string;
  sceneId?: string;
  motionDnaId?: string;
  sessionId?: string;
  skipCache?: boolean;
};
