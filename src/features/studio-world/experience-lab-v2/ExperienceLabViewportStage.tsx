import { useMemo } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { StudioViewportMode } from './experience-lab-v2.types';
import type { ElabFocusMode } from './experience-lab-v2-layout';
import { StudioViewport } from './StudioViewport';
import { ExperienceLabFloatingInspector } from './ExperienceLabFloatingInspector';
import { ExperienceLabDesignVariantStrip } from './ExperienceLabDesignVariantStrip';
import { ExperienceLabViewportContextualHud } from './ExperienceLabViewportContextualHud';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import type { ExperienceLabPanelOrchestrator } from './useExperienceLabPanelOrchestrator';
import type { ExperienceLabDesignVariants } from './useExperienceLabDesignVariants';
import type { PanelDockZone } from './experience-lab-v2-panel-orchestrator';
import { viewportModeForInspector } from './experience-lab-v2-panel-orchestrator';
import {
  viewportModesForWorkbenchTool,
  type WorkbenchEditingToolId,
} from './experience-lab-v2-workbench-config';

const MOBILE_DOCK_CYCLE: PanelDockZone[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

type Props = {
  model: ExperienceLabV2ViewModel;
  viewportMode: StudioViewportMode;
  onModeChange: (mode: StudioViewportMode) => void;
  onImageLoad: () => void;
  isCompact?: boolean;
  onFocusMode?: (mode: StudioViewportMode) => void;
  focusMode?: ElabFocusMode;
  workbenchToolId: WorkbenchEditingToolId | null;
  designVariantDrawerOpen?: boolean;
  orchestrator: ExperienceLabPanelOrchestrator;
  designVariants: ExperienceLabDesignVariants;
  /** Isolate one sub-region for component review mode. */
  reviewIsolate?: 'viewport' | 'inspectors' | 'view-angles';
};

function nextDockZone(current: PanelDockZone): PanelDockZone {
  const idx = MOBILE_DOCK_CYCLE.indexOf(current as (typeof MOBILE_DOCK_CYCLE)[number]);
  if (idx === -1) return 'top-left';
  return MOBILE_DOCK_CYCLE[(idx + 1) % MOBILE_DOCK_CYCLE.length];
}

/** Viewport stage — calm hero render; contextual HUD only when workbench/focus/drawer demands it. */
export function ExperienceLabViewportStage({
  model,
  viewportMode,
  onModeChange,
  onImageLoad,
  isCompact,
  onFocusMode,
  focusMode = 'none',
  workbenchToolId,
  designVariantDrawerOpen = false,
  orchestrator,
  designVariants,
  reviewIsolate,
}: Props) {
  const expandedPanel = orchestrator.panels.find((p) => p.id === orchestrator.expandedPanel)
    ?? orchestrator.panels.find((p) => p.isActive);

  const designVariantStrip = (
    <ExperienceLabDesignVariantStrip
      variants={designVariants.variants}
      activeVariantId={designVariants.activeVariantId}
      collapsed={orchestrator.viewAnglesCollapsed}
      isCompact={isCompact}
      onToggleCollapse={orchestrator.toggleViewAngles}
      onSelect={designVariants.selectVariant}
      onOpenDrawer={designVariants.openDrawer}
    />
  );

  const floatingInspectors = orchestrator.panels.map((panel) => (
    <ExperienceLabFloatingInspector
      key={panel.id}
      label={panel.label}
      statusLine={panel.statusLine}
      dockZone={panel.dockZone}
      state={panel.state}
      active={panel.isActive}
      onExpandClick={() => orchestrator.expandPanel(panel.id)}
      onDockClick={isCompact ? () => orchestrator.dockPanel(panel.id, nextDockZone(panel.dockZone)) : undefined}
    />
  ));

  const contextualModes = useMemo(() => {
    if (workbenchToolId) return viewportModesForWorkbenchTool(workbenchToolId);
    if (focusMode !== 'none' && orchestrator.activeInspector) {
      return [viewportModeForInspector(orchestrator.activeInspector)];
    }
    if (designVariantDrawerOpen) return [viewportMode];
    return [];
  }, [workbenchToolId, focusMode, orchestrator.activeInspector, designVariantDrawerOpen, viewportMode]);

  const showContextualHud =
    focusMode !== 'none' || workbenchToolId != null || designVariantDrawerOpen || orchestrator.expandedPanel != null;

  const contextualHud = showContextualHud ? (
    <ExperienceLabViewportContextualHud
      modes={contextualModes}
      activeMode={viewportMode}
      onModeChange={onModeChange}
      showPlayback={focusMode !== 'none'}
    />
  ) : null;

  if (reviewIsolate === 'view-angles') {
    return (
      <div className="elab-stage elab-stage--review-isolate" {...{ [ELAB_V2_COMPOSITION.viewportStage]: '' }}>
        {designVariantStrip}
      </div>
    );
  }

  if (reviewIsolate === 'inspectors') {
    return (
      <div className="elab-stage elab-stage--review-isolate elab-stage--inspectors-only" {...{ [ELAB_V2_COMPOSITION.viewportStage]: '' }}>
        <div className="elab-stage__viewport-wrap elab-stage__viewport-wrap--inspectors-backdrop">
          {floatingInspectors}
        </div>
      </div>
    );
  }

  const showFloats = !reviewIsolate || reviewIsolate === 'viewport';
  const showViewport = !reviewIsolate || reviewIsolate === 'viewport';

  return (
    <div className="elab-stage" {...{ [ELAB_V2_COMPOSITION.viewportStage]: '' }}>
      <div className="elab-stage__viewport-wrap">
        {showFloats ? floatingInspectors : null}

        {showViewport ? (
        <StudioViewport
          embedded
          isCompact={isCompact}
          mode={viewportMode}
          departmentName={model.departmentName}
          revision={model.revision}
          artifactStatus={model.healthState}
          artifacts={model.artifacts}
          isStale={model.isStale}
          onImageLoad={onImageLoad}
          onFocusMode={onFocusMode}
          focusActive={focusMode !== 'none'}
          environmentUrl={designVariants.activeEnvironmentUrl}
          contextualHud={contextualHud}
          viewAngles={showFloats ? designVariantStrip : undefined}
        />
        ) : null}
      </div>

      {expandedPanel ? (
        <div className="elab-panel-expanded-hint" aria-live="polite">
          Expanded: {expandedPanel.label} — open sheet for details
        </div>
      ) : null}
    </div>
  );
}
