import { ARCHITECTURE_LAW_001_VERSION } from './contract';

export const UI_SOCKET_REGISTRY_VERSION = 'ui-socket-registry.v1' as const;

/** Blueprint Author mounting sockets — React mounts live UI after architecture approval. */
export const DEPARTMENT_UI_SOCKET_IDS = [
  'HEADER_BAR',
  'COMMAND_DOCK',
  'WORKBENCH',
  'LEFT_PANEL',
  'RIGHT_PANEL',
  'CENTER_STAGE',
  'ACTION_BAR',
  'STATUS_BAR',
  'TOOL_GROUPS',
  'BUTTON_ROWS',
  'DISPLAY_A',
  'DISPLAY_B',
  'DISPLAY_C',
  'TIMELINE',
  'REVIEW_PANEL',
  'VIEWPORT',
] as const;

export type DepartmentUiSocketId = (typeof DEPARTMENT_UI_SOCKET_IDS)[number];

export type UiSocketBounds = {
  left: string;
  top: string;
  width: string;
  height: string;
};

export type UiSocketSafeArea = {
  insetTop: string;
  insetRight: string;
  insetBottom: string;
  insetLeft: string;
};

export type UiMountSocket = {
  socketId: DepartmentUiSocketId;
  label: string;
  /** Percentage-based placement in founder render coordinate space. */
  position: UiSocketBounds;
  dimensions: { width: string; height: string };
  rotationDeg: number;
  perspective: string;
  depth: number;
  cornerRadius: string;
  safeContentArea: UiSocketSafeArea;
  animationOrigin: { x: string; y: string };
  clippingMask: string | null;
  /** Architectural shell only — Studio World mounts React here. */
  mountTarget: 'react-runtime';
  required: boolean;
};

export type DepartmentUiSocketBlueprint = {
  registryVersion: typeof UI_SOCKET_REGISTRY_VERSION;
  lawVersion: typeof ARCHITECTURE_LAW_001_VERSION;
  departmentId: string;
  sockets: UiMountSocket[];
};

function socket(
  socketId: DepartmentUiSocketId,
  label: string,
  position: UiSocketBounds,
  required: boolean,
  overrides?: Partial<UiMountSocket>
): UiMountSocket {
  return {
    socketId,
    label,
    position,
    dimensions: { width: position.width, height: position.height },
    rotationDeg: 0,
    perspective: 'none',
    depth: 0,
    cornerRadius: '0',
    safeContentArea: { insetTop: '2%', insetRight: '2%', insetBottom: '2%', insetLeft: '2%' },
    animationOrigin: { x: '50%', y: '50%' },
    clippingMask: null,
    mountTarget: 'react-runtime',
    required,
    ...overrides,
  };
}

/** Default department shell sockets — Command Dock + Workbench + display mounts. */
export function defineDefaultDepartmentUiSockets(departmentId: string): DepartmentUiSocketBlueprint {
  return {
    registryVersion: UI_SOCKET_REGISTRY_VERSION,
    lawVersion: ARCHITECTURE_LAW_001_VERSION,
    departmentId,
    sockets: [
      socket('HEADER_BAR', 'Header bar mount', { left: '0%', top: '0%', width: '100%', height: '8%' }, true),
      socket('COMMAND_DOCK', 'Command Dock™ shell', { left: '4%', top: '82%', width: '92%', height: '10%' }, true, {
        depth: 12,
        cornerRadius: '12px',
        perspective: '1200px',
      }),
      socket('WORKBENCH', 'Workbench™ console', { left: '4%', top: '68%', width: '92%', height: '12%' }, true, {
        depth: 8,
        cornerRadius: '8px',
      }),
      socket('LEFT_PANEL', 'Left panel mount', { left: '2%', top: '10%', width: '18%', height: '56%' }, false),
      socket('RIGHT_PANEL', 'Right panel mount', { left: '80%', top: '10%', width: '18%', height: '56%' }, false),
      socket('CENTER_STAGE', 'Center stage', { left: '22%', top: '12%', width: '56%', height: '52%' }, true),
      socket('ACTION_BAR', 'Action bar', { left: '22%', top: '64%', width: '56%', height: '4%' }, false),
      socket('STATUS_BAR', 'Status bar', { left: '22%', top: '60%', width: '56%', height: '3%' }, false),
      socket('TOOL_GROUPS', 'Tool groups', { left: '6%', top: '70%', width: '20%', height: '8%' }, false),
      socket('BUTTON_ROWS', 'Button row housings', { left: '74%', top: '70%', width: '20%', height: '8%' }, false),
      socket('DISPLAY_A', 'Primary display placeholder', { left: '26%', top: '16%', width: '24%', height: '20%' }, true, {
        cornerRadius: '4px',
        clippingMask: 'inset(0 round 4px)',
      }),
      socket('DISPLAY_B', 'Secondary display placeholder', { left: '52%', top: '16%', width: '24%', height: '20%' }, false, {
        cornerRadius: '4px',
      }),
      socket('DISPLAY_C', 'Tertiary display placeholder', { left: '39%', top: '38%', width: '22%', height: '18%' }, false),
      socket('TIMELINE', 'Timeline mount', { left: '22%', top: '56%', width: '56%', height: '4%' }, false),
      socket('REVIEW_PANEL', 'Review panel', { left: '80%', top: '68%', width: '16%', height: '12%' }, false),
      socket('VIEWPORT', 'Immersive viewport', { left: '22%', top: '12%', width: '56%', height: '52%' }, true),
    ],
  };
}

export function getUiMountSocket(
  blueprint: DepartmentUiSocketBlueprint,
  socketId: DepartmentUiSocketId
): UiMountSocket | undefined {
  return blueprint.sockets.find((s) => s.socketId === socketId);
}

export function assertRequiredUiSocketsPresent(
  blueprint: DepartmentUiSocketBlueprint
): { ok: true } | { ok: false; missing: DepartmentUiSocketId[] } {
  const present = new Set(blueprint.sockets.map((s) => s.socketId));
  const mandatory: DepartmentUiSocketId[] = ['COMMAND_DOCK', 'WORKBENCH', 'VIEWPORT', 'HEADER_BAR'];
  const alsoRequired = blueprint.sockets.filter((s) => s.required).map((s) => s.socketId);
  const allRequired = [...new Set([...mandatory, ...alsoRequired])];
  const missing = allRequired.filter((id) => !present.has(id));
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}
