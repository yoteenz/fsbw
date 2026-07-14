import type { ElabBreakpoint, ElabFocusMode } from './experience-lab-v2-layout';
import type { StudioViewportMode } from './experience-lab-v2.types';
import type { WorkbenchEditingToolId } from './experience-lab-v2-workbench-config';
import { inspectorPanelForWorkbenchTool } from './experience-lab-v2-workbench-config';

/** Panel presentation states for contextual orchestration. */
export type PanelPresentationState =
  | 'HIDDEN'
  | 'MINIMIZED'
  | 'PEEK'
  | 'DOCKED'
  | 'EXPANDED'
  | 'FOCUSED';

export type InspectorPanelId =
  | 'blueprint'
  | 'construction'
  | 'materials'
  | 'lighting'
  | 'camera'
  | 'metadata';

export type PanelDockZone =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-rail'
  | 'right-rail';

export type InspectorPanelDefinition = {
  id: InspectorPanelId;
  label: string;
  shortLabel: string;
  viewportMode: StudioViewportMode;
  priority: 1 | 2 | 3 | 4;
  defaultDock: PanelDockZone;
  statusKey?: string;
};

export const INSPECTOR_PANELS: InspectorPanelDefinition[] = [
  { id: 'blueprint', label: 'Blueprint', shortLabel: 'BP', viewportMode: 'BLUEPRINT', priority: 1, defaultDock: 'top-left' },
  { id: 'construction', label: 'Construction', shortLabel: 'BLD', viewportMode: 'CONSTRUCTION_PLAN', priority: 1, defaultDock: 'top-right' },
  { id: 'materials', label: 'Materials', shortLabel: 'MAT', viewportMode: 'MATERIALS', priority: 3, defaultDock: 'bottom-right' },
  { id: 'lighting', label: 'Lighting', shortLabel: 'LGT', viewportMode: 'LIGHTING', priority: 3, defaultDock: 'bottom-left' },
  { id: 'camera', label: 'Camera', shortLabel: 'CAM', viewportMode: 'CAMERA', priority: 3, defaultDock: 'bottom-right' },
  { id: 'metadata', label: 'Metadata', shortLabel: 'META', viewportMode: 'FOUNDER_RENDER', priority: 2, defaultDock: 'top-left', statusKey: 'render' },
];

export const PANEL_LAYOUT_STORAGE_KEY = 'experience_lab_v2_panel_layout_v1';
export const PANEL_LAYOUT_VERSION = 1;

export type PersistedPanelLayout = {
  version: number;
  activeInspector: InspectorPanelId;
  dockZones: Partial<Record<InspectorPanelId, PanelDockZone>>;
  leftRailCollapsed: boolean;
  rightRailCollapsed: boolean;
  viewAnglesCollapsed: boolean;
  workbenchTab?: string;
  viewportMode?: StudioViewportMode;
};

export type ResolvedPanel = {
  id: InspectorPanelId;
  label: string;
  shortLabel: string;
  viewportMode: StudioViewportMode;
  state: PanelPresentationState;
  dockZone: PanelDockZone;
  isActive: boolean;
  revision: number;
  statusLine: string;
  summary: string;
};

export type PanelOrchestratorDiagnostics = {
  visiblePanels: InspectorPanelId[];
  activeInspector: InspectorPanelId;
  expandedPanel: InspectorPanelId | null;
  focusedPanel: InspectorPanelId | null;
  dockZones: Partial<Record<InspectorPanelId, PanelDockZone>>;
  collisionsPrevented: number;
  viewportSafeZonePct: number;
  breakpoint: ElabBreakpoint;
  layoutVersion: number;
};

export type PanelOrchestratorInput = {
  viewportMode: StudioViewportMode;
  breakpoint: ElabBreakpoint;
  focusMode: ElabFocusMode;
  workbenchToolId: WorkbenchEditingToolId | null;
  activeInspector: InspectorPanelId;
  expandedPanel: InspectorPanelId | null;
  dockZones: Partial<Record<InspectorPanelId, PanelDockZone>>;
  leftRailCollapsed: boolean;
  rightRailCollapsed: boolean;
  artifactSummaries: Partial<Record<InspectorPanelId, { summary: string; revision: number; status: string }>>;
};

const MOBILE_DOCK_ZONES: PanelDockZone[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const DESKTOP_RAIL_ZONES: PanelDockZone[] = ['left-rail', 'right-rail'];

export function inspectorForViewportMode(mode: StudioViewportMode): InspectorPanelId | null {
  switch (mode) {
    case 'BLUEPRINT':
      return 'blueprint';
    case 'CONSTRUCTION_PLAN':
      return 'construction';
    case 'MATERIALS':
      return 'materials';
    case 'LIGHTING':
      return 'lighting';
    case 'CAMERA':
      return 'camera';
    case 'FOUNDER_RENDER':
      return 'metadata';
    case 'SPLIT_VIEW':
      return null;
    default:
      return 'blueprint';
  }
}

export function viewportModeForInspector(id: InspectorPanelId): StudioViewportMode {
  return INSPECTOR_PANELS.find((p) => p.id === id)?.viewportMode ?? 'BLUEPRINT';
}

export function defaultDockForPanel(id: InspectorPanelId, breakpoint: ElabBreakpoint): PanelDockZone {
  const def = INSPECTOR_PANELS.find((p) => p.id === id);
  if (!def) return 'top-left';
  if (breakpoint === 'desktop') {
    return ['blueprint', 'construction', 'metadata'].includes(id) ? 'left-rail' : 'right-rail';
  }
  return def.defaultDock;
}

export function defaultActiveInspector(viewportMode: StudioViewportMode): InspectorPanelId {
  return inspectorForViewportMode(viewportMode) ?? 'blueprint';
}

export function defaultPersistedLayout(viewportMode: StudioViewportMode = 'BLUEPRINT'): PersistedPanelLayout {
  const activeInspector = defaultActiveInspector(viewportMode);
  return {
    version: PANEL_LAYOUT_VERSION,
    activeInspector,
    dockZones: Object.fromEntries(
      INSPECTOR_PANELS.map((p) => [p.id, defaultDockForPanel(p.id, 'mobile')])
    ) as Partial<Record<InspectorPanelId, PanelDockZone>>,
    leftRailCollapsed: false,
    rightRailCollapsed: false,
    viewAnglesCollapsed: false,
    viewportMode,
  };
}

export function readPersistedPanelLayout(): PersistedPanelLayout | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PANEL_LAYOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedPanelLayout;
    if (parsed.version !== PANEL_LAYOUT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePersistedPanelLayout(layout: PersistedPanelLayout): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PANEL_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
}

export function resetPersistedPanelLayout(viewportMode: StudioViewportMode = 'BLUEPRINT'): PersistedPanelLayout {
  const layout = defaultPersistedLayout(viewportMode);
  writePersistedPanelLayout(layout);
  return layout;
}

function isCompactBreakpoint(bp: ElabBreakpoint): boolean {
  return bp === 'mobile' || bp === 'tablet';
}

function panelSummary(input: PanelOrchestratorInput, id: InspectorPanelId): { summary: string; revision: number; statusLine: string } {
  const meta = input.artifactSummaries[id];
  const revision = meta?.revision ?? 1;
  const status = meta?.status ?? 'idle';
  const summary = meta?.summary ?? '—';
  return { summary, revision, statusLine: `r${revision} · ${status}` };
}

/** Resolve which panels may render and their dock/minimize state. */
export function resolveOrchestratedPanels(input: PanelOrchestratorInput): {
  panels: ResolvedPanel[];
  statusChip: InspectorPanelId | null;
  collisionsPrevented: number;
  safeZonePct: number;
} {
  const compact = isCompactBreakpoint(input.breakpoint);
  const modeInspector = inspectorForViewportMode(input.viewportMode);
  const active = input.activeInspector;
  const expanded = input.expandedPanel;
  const workbenchInspector = input.workbenchToolId
    ? inspectorPanelForWorkbenchTool(input.workbenchToolId)
    : null;
  let collisionsPrevented = 0;

  const occupiedZones = new Set<PanelDockZone>();

  const contextualActive =
    input.focusMode !== 'none' || workbenchInspector != null || expanded != null;

  if (!contextualActive) {
    return {
      panels: [],
      statusChip: null,
      collisionsPrevented: 0,
      safeZonePct: 96,
    };
  }

  const makePanel = (
    id: InspectorPanelId,
    state: PanelPresentationState,
    dockZone: PanelDockZone,
    isActive: boolean
  ): ResolvedPanel => {
    const def = INSPECTOR_PANELS.find((p) => p.id === id)!;
    const { summary, revision, statusLine } = panelSummary(input, id);
    return {
      id,
      label: def.label,
      shortLabel: def.shortLabel,
      viewportMode: def.viewportMode,
      state,
      dockZone,
      isActive,
      revision,
      statusLine,
      summary,
    };
  };

  if (input.focusMode !== 'none') {
    const focusId = modeInspector ?? active;
    const dock = input.dockZones[focusId] ?? defaultDockForPanel(focusId, input.breakpoint);
    return {
      panels: [makePanel(focusId, 'MINIMIZED', dock, true)],
      statusChip: null,
      collisionsPrevented: 0,
      safeZonePct: compact ? 92 : 88,
    };
  }

  if (workbenchInspector && !expanded) {
    const dock = input.dockZones[workbenchInspector] ?? defaultDockForPanel(workbenchInspector, input.breakpoint);
    return {
      panels: [makePanel(workbenchInspector, 'MINIMIZED', dock, true)],
      statusChip: null,
      collisionsPrevented: 0,
      safeZonePct: compact ? 90 : 88,
    };
  }

  if (compact) {
    const visibleIds: InspectorPanelId[] = [];
    if (expanded) {
      visibleIds.push(expanded);
    } else if (workbenchInspector) {
      visibleIds.push(workbenchInspector);
    } else if (modeInspector) {
      visibleIds.push(modeInspector);
    } else {
      visibleIds.push(active);
    }

    const statusChip = null;

    const panels: ResolvedPanel[] = visibleIds.slice(0, 1).map((id) => {
      const dock = input.dockZones[id] ?? defaultDockForPanel(id, input.breakpoint);
      if (occupiedZones.has(dock)) {
        collisionsPrevented += 1;
      }
      occupiedZones.add(dock);
      const state: PanelPresentationState = expanded === id ? 'EXPANDED' : 'MINIMIZED';
      return makePanel(id, state, dock, id === active || id === modeInspector);
    });

    return {
      panels,
      statusChip,
      collisionsPrevented,
      safeZonePct: panels.length === 0 ? 95 : statusChip ? 86 : 90,
    };
  }

  // Desktop — show only contextual inspector(s), never scatter full rail set by default
  if (expanded) {
    const dock = input.dockZones[expanded] ?? defaultDockForPanel(expanded, input.breakpoint);
    return {
      panels: [makePanel(expanded, 'EXPANDED', dock, true)],
      statusChip: null,
      collisionsPrevented: 0,
      safeZonePct: 88,
    };
  }

  if (workbenchInspector) {
    const dock = input.dockZones[workbenchInspector] ?? defaultDockForPanel(workbenchInspector, input.breakpoint);
    return {
      panels: [makePanel(workbenchInspector, 'MINIMIZED', dock, true)],
      statusChip: null,
      collisionsPrevented: 0,
      safeZonePct: 90,
    };
  }

  return {
    panels: [],
    statusChip: null,
    collisionsPrevented: 0,
    safeZonePct: 96,
  };
}

export function isValidDockZone(zone: PanelDockZone, breakpoint: ElabBreakpoint): boolean {
  if (breakpoint === 'desktop') return DESKTOP_RAIL_ZONES.includes(zone);
  return MOBILE_DOCK_ZONES.includes(zone);
}

export function snapDockZone(
  zone: PanelDockZone,
  breakpoint: ElabBreakpoint,
  occupied: Set<PanelDockZone>
): PanelDockZone {
  if (isValidDockZone(zone, breakpoint) && !occupied.has(zone)) return zone;
  const candidates = breakpoint === 'desktop' ? DESKTOP_RAIL_ZONES : MOBILE_DOCK_ZONES;
  return candidates.find((z) => !occupied.has(z)) ?? candidates[0];
}

export function buildPanelDiagnostics(
  input: PanelOrchestratorInput,
  resolved: ReturnType<typeof resolveOrchestratedPanels>
): PanelOrchestratorDiagnostics {
  const expanded = input.expandedPanel;
  const focused = resolved.panels.find((p) => p.state === 'FOCUSED')?.id ?? null;
  return {
    visiblePanels: resolved.panels.filter((p) => p.state !== 'HIDDEN').map((p) => p.id),
    activeInspector: input.activeInspector,
    expandedPanel: expanded,
    focusedPanel: focused,
    dockZones: input.dockZones,
    collisionsPrevented: resolved.collisionsPrevented,
    viewportSafeZonePct: resolved.safeZonePct,
    breakpoint: input.breakpoint,
    layoutVersion: PANEL_LAYOUT_VERSION,
  };
}

export function shouldHidePanelForMode(panelId: InspectorPanelId, viewportMode: StudioViewportMode): boolean {
  const linked = inspectorForViewportMode(viewportMode);
  if (viewportMode === 'SPLIT_VIEW') return false;
  if (!linked) return panelId !== 'metadata';
  return panelId !== linked;
}
