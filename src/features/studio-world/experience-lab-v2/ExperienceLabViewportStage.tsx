import { useMemo } from 'react';
import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { StudioViewportMode } from './experience-lab-v2.types';
import type { ElabFocusMode } from './experience-lab-v2-layout';
import { StudioViewport } from './StudioViewport';
import { ExperienceLabDesignVariantStrip } from './ExperienceLabDesignVariantStrip';
import { ExperienceLabDynamicContextCard } from './ExperienceLabDynamicContextCard';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import type { ExperienceLabPanelOrchestrator } from './useExperienceLabPanelOrchestrator';
import type { ExperienceLabDesignVariants } from './useExperienceLabDesignVariants';
import { inspectorPanelForWorkbenchTool, type WorkbenchEditingToolId } from './experience-lab-v2-workbench-config';
import { resolveDesignVariantBlueprintFromPackage } from './experience-lab-environment-package-bridge';

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
  onOpenInspectorSheet?: () => void;
  /** Isolate one sub-region for component review mode. */
  reviewIsolate?: 'viewport' | 'inspectors' | 'view-angles';
};

/** Viewport stage — two persistent panels: Blueprint Card + single Dynamic Context Card. */
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
  onOpenInspectorSheet,
  reviewIsolate,
}: Props) {
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

  const blueprintOutput = useMemo(
    () => resolveDesignVariantBlueprintFromPackage(designVariants.activeVariantId),
    [designVariants.activeVariantId, designVariants.activeEnvironmentUrl]
  );

  const environmentName = designVariants.activeVariant?.name ?? model.departmentName;

  const dynamicContextCard =
    workbenchToolId && focusMode === 'none' && !designVariantDrawerOpen ? (
      <ExperienceLabDynamicContextCard
        toolId={workbenchToolId}
        model={model}
        viewportMode={viewportMode}
        onModeChange={onModeChange}
        onExpand={() => {
          const inspector = inspectorPanelForWorkbenchTool(workbenchToolId);
          if (inspector) {
            orchestrator.expandPanel(inspector);
            onOpenInspectorSheet?.();
          }
        }}
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
          <ExperienceLabDynamicContextCard
            toolId="material-library"
            model={model}
            viewportMode={viewportMode}
            onModeChange={onModeChange}
          />
        </div>
      </div>
    );
  }

  const showFloats = !reviewIsolate || reviewIsolate === 'viewport';
  const showViewport = !reviewIsolate || reviewIsolate === 'viewport';

  return (
    <div className="elab-stage" {...{ [ELAB_V2_COMPOSITION.viewportStage]: '' }}>
      <div className="elab-stage__viewport-wrap">
        {showViewport ? (
          <StudioViewport
            embedded
            isCompact={isCompact}
            mode={viewportMode}
            departmentName={environmentName}
            revision={model.revision}
            artifactStatus={model.healthState}
            artifacts={model.artifacts}
            isStale={model.isStale}
            onImageLoad={onImageLoad}
            onFocusMode={onFocusMode}
            focusActive={focusMode !== 'none'}
            environmentUrl={designVariants.activeEnvironmentUrl}
            blueprintThumbnailUrl={blueprintOutput.url}
            blueprintThumbnailStatus={blueprintOutput.status}
            onOpenBlueprint={() => onModeChange('BLUEPRINT')}
            dynamicContextCard={dynamicContextCard}
            viewAngles={showFloats ? designVariantStrip : undefined}
          />
        ) : null}
      </div>
    </div>
  );
}
