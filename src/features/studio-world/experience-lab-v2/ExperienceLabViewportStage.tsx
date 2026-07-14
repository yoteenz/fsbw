import { useCallback } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { StudioViewportMode } from './experience-lab-v2.types';
import type { ElabFocusMode } from './experience-lab-v2-layout';
import { StudioViewport } from './StudioViewport';
import { ExperienceLabFloatingInspector } from './ExperienceLabFloatingInspector';
import { ExperienceLabInspectorSwitcher } from './ExperienceLabInspectorSwitcher';
import { ExperienceLabDesignVariantStrip } from './ExperienceLabDesignVariantStrip';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import type { ExperienceLabPanelOrchestrator } from './useExperienceLabPanelOrchestrator';
import type { ExperienceLabDesignVariants } from './useExperienceLabDesignVariants';
import type { InspectorPanelId, PanelDockZone } from './experience-lab-v2-panel-orchestrator';

const VIEWPORT_MODES: StudioViewportMode[] = [
  'BLUEPRINT', 'FOUNDER_RENDER', 'CONSTRUCTION_PLAN', 'MATERIALS', 'LIGHTING', 'CAMERA', 'SPLIT_VIEW',
];

const MOBILE_DOCK_CYCLE: PanelDockZone[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

type Props = {
  model: ExperienceLabV2ViewModel;
  viewportMode: StudioViewportMode;
  onModeChange: (mode: StudioViewportMode) => void;
  onImageLoad: () => void;
  isCompact?: boolean;
  onFocusMode?: (mode: StudioViewportMode) => void;
  focusMode?: ElabFocusMode;
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

/** Viewport stage — orchestrated inspectors, design variants in dedicated chrome region. */
export function ExperienceLabViewportStage({
  model,
  viewportMode,
  onModeChange,
  onImageLoad,
  isCompact,
  onFocusMode,
  orchestrator,
  designVariants,
  reviewIsolate,
}: Props) {
  const onInspectorSelect = useCallback(
    (id: InspectorPanelId) => orchestrator.selectInspector(id, { syncViewport: true }),
    [orchestrator]
  );

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

        {showFloats && isCompact && orchestrator.statusChip ? (
          <span className="elab-status-chip" data-elab-status-chip>
            {orchestrator.statusChip.toUpperCase()}
          </span>
        ) : null}

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
          modes={VIEWPORT_MODES}
          onModeChange={onModeChange}
          onFocusMode={onFocusMode}
          environmentUrl={designVariants.activeEnvironmentUrl}
          inspectorSwitcher={
            <ExperienceLabInspectorSwitcher
              activeInspector={orchestrator.activeInspector}
              open={orchestrator.switcherOpen}
              onToggle={() => orchestrator.setSwitcherOpen(!orchestrator.switcherOpen)}
              onSelect={onInspectorSelect}
              compact={isCompact}
            />
          }
          viewAngles={showFloats ? designVariantStrip : undefined}
          leftRailCollapsed={orchestrator.leftRailCollapsed}
          rightRailCollapsed={orchestrator.rightRailCollapsed}
          onToggleLeftRail={!isCompact ? orchestrator.toggleLeftRail : undefined}
          onToggleRightRail={!isCompact ? orchestrator.toggleRightRail : undefined}
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
