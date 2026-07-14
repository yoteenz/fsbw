import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ElabBreakpoint, ElabFocusMode } from './experience-lab-v2-layout';
import type { WorkbenchEditingToolId } from './experience-lab-v2-workbench-config';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { StudioViewportMode } from './experience-lab-v2.types';
import {
  buildPanelDiagnostics,
  defaultActiveInspector,
  defaultPersistedLayout,
  inspectorForViewportMode,
  readPersistedPanelLayout,
  resetPersistedPanelLayout,
  resolveOrchestratedPanels,
  snapDockZone,
  viewportModeForInspector,
  writePersistedPanelLayout,
  type InspectorPanelId,
  type PanelDockZone,
  type PanelOrchestratorDiagnostics,
  type PersistedPanelLayout,
  type ResolvedPanel,
} from './experience-lab-v2-panel-orchestrator';

type Args = {
  viewportMode: StudioViewportMode;
  breakpoint: ElabBreakpoint;
  focusMode: ElabFocusMode;
  workbenchToolId: WorkbenchEditingToolId | null;
  model: ExperienceLabV2ViewModel;
  onViewportModeChange: (mode: StudioViewportMode) => void;
};

function artifactSummariesFromModel(model: ExperienceLabV2ViewModel) {
  const a = model.artifacts;
  return {
    blueprint: {
      summary: a.blueprint?.summary ?? 'Wireframe',
      revision: a.blueprint?.revision ?? model.revision,
      status: a.blueprint?.status ?? 'idle',
    },
    construction: {
      summary: a.construction?.summary ?? 'Build order',
      revision: a.construction?.revision ?? model.revision,
      status: a.construction?.status ?? 'idle',
    },
    materials: {
      summary: a.materials?.summary ?? 'Materials',
      revision: a.materials?.revision ?? model.revision,
      status: a.materials?.status ?? 'idle',
    },
    lighting: {
      summary: a.lighting?.summary ?? 'Profile',
      revision: a.lighting?.revision ?? model.revision,
      status: a.lighting?.status ?? 'idle',
    },
    camera: {
      summary: a.camera?.summary ?? 'Founder perspective',
      revision: a.camera?.revision ?? model.revision,
      status: a.camera?.status ?? 'idle',
    },
    metadata: {
      summary: model.approvalStatus,
      revision: model.revision,
      status: model.healthState,
    },
  };
}

/** React state bridge for ExperienceLabPanelOrchestrator. */
export function useExperienceLabPanelOrchestrator({
  viewportMode,
  breakpoint,
  focusMode,
  workbenchToolId,
  model,
  onViewportModeChange,
}: Args) {
  const restored = useMemo(() => readPersistedPanelLayout(), []);
  const [activeInspector, setActiveInspector] = useState<InspectorPanelId>(
    () => restored?.activeInspector ?? defaultActiveInspector(viewportMode)
  );
  const [expandedPanel, setExpandedPanel] = useState<InspectorPanelId | null>(null);
  const [dockZones, setDockZones] = useState<Partial<Record<InspectorPanelId, PanelDockZone>>>(
    () => restored?.dockZones ?? defaultPersistedLayout(viewportMode).dockZones
  );
  const [leftRailCollapsed, setLeftRailCollapsed] = useState(restored?.leftRailCollapsed ?? false);
  const [rightRailCollapsed, setRightRailCollapsed] = useState(restored?.rightRailCollapsed ?? false);
  const [viewAnglesCollapsed, setViewAnglesCollapsed] = useState(restored?.viewAnglesCollapsed ?? false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    const linked = inspectorForViewportMode(viewportMode);
    if (linked && linked !== activeInspector) {
      setActiveInspector(linked);
    }
  }, [viewportMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback(
    (patch: Partial<PersistedPanelLayout>) => {
      const next: PersistedPanelLayout = {
        version: 1,
        activeInspector,
        dockZones,
        leftRailCollapsed,
        rightRailCollapsed,
        viewAnglesCollapsed,
        viewportMode,
        ...patch,
      };
      writePersistedPanelLayout(next);
    },
    [activeInspector, dockZones, leftRailCollapsed, rightRailCollapsed, viewAnglesCollapsed, viewportMode]
  );

  const orchestratorInput = useMemo(
    () => ({
      viewportMode,
      breakpoint,
      focusMode,
      workbenchToolId,
      activeInspector,
      expandedPanel,
      dockZones,
      leftRailCollapsed,
      rightRailCollapsed,
      artifactSummaries: artifactSummariesFromModel(model),
    }),
    [
      viewportMode,
      breakpoint,
      focusMode,
      workbenchToolId,
      activeInspector,
      expandedPanel,
      dockZones,
      leftRailCollapsed,
      rightRailCollapsed,
      model,
    ]
  );

  const resolved = useMemo(() => resolveOrchestratedPanels(orchestratorInput), [orchestratorInput]);
  const diagnostics: PanelOrchestratorDiagnostics = useMemo(
    () => buildPanelDiagnostics(orchestratorInput, resolved),
    [orchestratorInput, resolved]
  );

  const selectInspector = useCallback(
    (id: InspectorPanelId, opts?: { expand?: boolean; syncViewport?: boolean }) => {
      setActiveInspector(id);
      setSwitcherOpen(false);
      if (opts?.expand) {
        setExpandedPanel(id);
      } else {
        setExpandedPanel(null);
      }
      if (opts?.syncViewport !== false) {
        const mode = viewportModeForInspector(id);
        if (mode !== viewportMode) onViewportModeChange(mode);
      }
      persist({ activeInspector: id, viewportMode: viewportModeForInspector(id) });
    },
    [onViewportModeChange, persist, viewportMode]
  );

  const expandPanel = useCallback(
    (id: InspectorPanelId) => {
      setExpandedPanel(id);
      setActiveInspector(id);
    },
    []
  );

  const collapseExpanded = useCallback(() => setExpandedPanel(null), []);

  const dockPanel = useCallback(
    (id: InspectorPanelId, zone: PanelDockZone) => {
      setDockZones((prev) => {
        const occupied = new Set(Object.values(prev));
        const snapped = snapDockZone(zone, breakpoint, occupied);
        const next = { ...prev, [id]: snapped };
        persist({ dockZones: next });
        return next;
      });
    },
    [breakpoint, persist]
  );

  const resetLayout = useCallback(() => {
    const layout = resetPersistedPanelLayout(viewportMode);
    setActiveInspector(layout.activeInspector);
    setDockZones(layout.dockZones);
    setLeftRailCollapsed(layout.leftRailCollapsed);
    setRightRailCollapsed(layout.rightRailCollapsed);
    setViewAnglesCollapsed(layout.viewAnglesCollapsed);
    setExpandedPanel(null);
    setSwitcherOpen(false);
  }, [viewportMode]);

  const toggleLeftRail = useCallback(() => {
    setLeftRailCollapsed((v) => {
      persist({ leftRailCollapsed: !v });
      return !v;
    });
  }, [persist]);

  const toggleRightRail = useCallback(() => {
    setRightRailCollapsed((v) => {
      persist({ rightRailCollapsed: !v });
      return !v;
    });
  }, [persist]);

  const toggleViewAngles = useCallback(() => {
    setViewAnglesCollapsed((v) => {
      persist({ viewAnglesCollapsed: !v });
      return !v;
    });
  }, [persist]);

  return {
    panels: resolved.panels as ResolvedPanel[],
    statusChip: resolved.statusChip,
    activeInspector,
    expandedPanel,
    switcherOpen,
    setSwitcherOpen,
    selectInspector,
    expandPanel,
    collapseExpanded,
    dockPanel,
    resetLayout,
    leftRailCollapsed,
    rightRailCollapsed,
    viewAnglesCollapsed,
    toggleLeftRail,
    toggleRightRail,
    toggleViewAngles,
    diagnostics,
  };
}

export type ExperienceLabPanelOrchestrator = ReturnType<typeof useExperienceLabPanelOrchestrator>;
