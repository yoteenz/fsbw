import { useCallback, useState } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { StudioViewportMode } from './experience-lab-v2.types';
import type { ElabFocusMode } from './experience-lab-v2-layout';
import { StudioViewport } from './StudioViewport';
import { ExperienceLabFloatingInspector } from './ExperienceLabFloatingInspector';
import { ExperienceLabInspectorSwitcher } from './ExperienceLabInspectorSwitcher';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import type { ExperienceLabPanelOrchestrator } from './useExperienceLabPanelOrchestrator';
import type { InspectorPanelId, PanelDockZone } from './experience-lab-v2-panel-orchestrator';

const VIEWPORT_MODES: StudioViewportMode[] = [
  'BLUEPRINT', 'FOUNDER_RENDER', 'CONSTRUCTION_PLAN', 'MATERIALS', 'LIGHTING', 'CAMERA', 'SPLIT_VIEW',
];

const VIEW_ANGLES = ['Hero L', 'Hero P', 'Desktop', 'Mobile', 'Wide', 'Detail'] as const;

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
};

function nextDockZone(current: PanelDockZone): PanelDockZone {
  const idx = MOBILE_DOCK_CYCLE.indexOf(current as (typeof MOBILE_DOCK_CYCLE)[number]);
  if (idx === -1) return 'top-left';
  return MOBILE_DOCK_CYCLE[(idx + 1) % MOBILE_DOCK_CYCLE.length];
}

/** Viewport stage — orchestrated inspectors, view angles in dedicated chrome region. */
export function ExperienceLabViewportStage({
  model,
  viewportMode,
  onModeChange,
  onImageLoad,
  isCompact,
  onFocusMode,
  orchestrator,
}: Props) {
  const [activeAngle, setActiveAngle] = useState(0);

  const onInspectorSelect = useCallback(
    (id: InspectorPanelId) => orchestrator.selectInspector(id, { syncViewport: true }),
    [orchestrator]
  );

  const expandedPanel = orchestrator.panels.find((p) => p.id === orchestrator.expandedPanel)
    ?? orchestrator.panels.find((p) => p.isActive);

  return (
    <div className="elab-stage" {...{ [ELAB_V2_COMPOSITION.viewportStage]: '' }}>
      <div className="elab-stage__viewport-wrap">
        {orchestrator.panels.map((panel) => (
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
        ))}

        {isCompact && orchestrator.statusChip ? (
          <span className="elab-status-chip" data-elab-status-chip>
            {orchestrator.statusChip.toUpperCase()}
          </span>
        ) : null}

        <StudioViewport
          embedded
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
          inspectorSwitcher={
            <ExperienceLabInspectorSwitcher
              activeInspector={orchestrator.activeInspector}
              open={orchestrator.switcherOpen}
              onToggle={() => orchestrator.setSwitcherOpen(!orchestrator.switcherOpen)}
              onSelect={onInspectorSelect}
              compact={isCompact}
            />
          }
          viewAngles={
            <nav
              className={`elab-view-angles elab-view-angles--chrome${orchestrator.viewAnglesCollapsed ? ' elab-view-angles--collapsed' : ''}`}
              {...{ [ELAB_V2_COMPOSITION.viewAngles]: '' }}
              aria-label="View angles"
            >
              <div className="elab-view-angles__head">
                {!isCompact ? <span className="elab-view-angles__label">VIEW ANGLES</span> : null}
                <button
                  type="button"
                  className="elab-view-angles__collapse"
                  aria-expanded={!orchestrator.viewAnglesCollapsed}
                  onClick={orchestrator.toggleViewAngles}
                >
                  {orchestrator.viewAnglesCollapsed
                    ? `${VIEW_ANGLES[activeAngle]} · ${VIEW_ANGLES.length}`
                    : 'Collapse'}
                </button>
              </div>
              {!orchestrator.viewAnglesCollapsed ? (
                <div className="elab-view-angles__strip">
                  {VIEW_ANGLES.map((angle, i) => (
                    <button
                      key={angle}
                      type="button"
                      className={`elab-view-angles__thumb${i === activeAngle ? ' elab-view-angles__thumb--active' : ''}`}
                      aria-pressed={i === activeAngle}
                      onClick={() => setActiveAngle(i)}
                    >
                      <span className="elab-view-angles__thumb-inner" />
                      {!isCompact ? <span className="elab-view-angles__thumb-label">{angle}</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </nav>
          }
          leftRailCollapsed={orchestrator.leftRailCollapsed}
          rightRailCollapsed={orchestrator.rightRailCollapsed}
          onToggleLeftRail={!isCompact ? orchestrator.toggleLeftRail : undefined}
          onToggleRightRail={!isCompact ? orchestrator.toggleRightRail : undefined}
        />
      </div>

      {expandedPanel ? (
        <div className="elab-panel-expanded-hint" aria-live="polite">
          Expanded: {expandedPanel.label} — open sheet for details
        </div>
      ) : null}
    </div>
  );
}
