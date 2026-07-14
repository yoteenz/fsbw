import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { StudioViewportMode } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import {
  contextContentForWorkbenchTool,
  contextLabelForWorkbenchTool,
  type WorkbenchEditingToolId,
} from './experience-lab-v2-workbench-config';
import { VIEWPORT_MODE_LABELS } from './experience-lab-v2-composition';
import { viewportModesForWorkbenchTool } from './experience-lab-v2-workbench-config';

type Props = {
  toolId: WorkbenchEditingToolId;
  model: ExperienceLabV2ViewModel;
  viewportMode: StudioViewportMode;
  onModeChange: (mode: StudioViewportMode) => void;
  onExpand?: () => void;
};

function ContextActionRow({
  label,
  detail,
  active,
  onClick,
}: {
  label: string;
  detail?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={`elab-context-card__action${active ? ' elab-context-card__action--active' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className="elab-context-card__action-label">{label}</span>
      {detail ? <span className="elab-context-card__action-detail">{detail}</span> : null}
    </button>
  );
}

/** Panel 02 — single dynamic context inspector; contents swap when workbench tool changes. */
export function ExperienceLabDynamicContextCard({
  toolId,
  model,
  viewportMode,
  onModeChange,
  onExpand,
}: Props) {
  const contentId = contextContentForWorkbenchTool(toolId);
  const title = contextLabelForWorkbenchTool(toolId);
  const modes = viewportModesForWorkbenchTool(toolId);

  const renderBody = () => {
    switch (contentId) {
      case 'blueprint-actions':
        return (
          <div className="elab-context-card__actions">
            {modes.map((mode) => (
              <ContextActionRow
                key={mode}
                label={VIEWPORT_MODE_LABELS[mode] ?? mode}
                detail={mode === 'BLUEPRINT' ? model.artifacts.blueprint?.summary : model.artifacts.construction?.summary}
                active={viewportMode === mode}
                onClick={() => onModeChange(mode)}
              />
            ))}
          </div>
        );
      case 'materials':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">{model.artifacts.materials?.summary ?? 'Material profile'}</p>
            <p className="elab-context-card__hint">r{model.artifacts.materials?.revision ?? model.revision} · {model.artifacts.materials?.status ?? 'idle'}</p>
          </div>
        );
      case 'lighting':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">{model.artifacts.lighting?.summary ?? 'Lighting profile'}</p>
            <p className="elab-context-card__hint">Executive lighting planner output</p>
          </div>
        );
      case 'camera':
        return (
          <div className="elab-context-card__actions">
            {modes.map((mode) => (
              <ContextActionRow
                key={mode}
                label={VIEWPORT_MODE_LABELS[mode] ?? mode}
                detail={model.artifacts.camera?.summary}
                active={viewportMode === mode}
                onClick={() => onModeChange(mode)}
              />
            ))}
          </div>
        );
      case 'permit':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">Permit status</p>
            <p className="elab-context-card__hint">{model.permitStatus.toUpperCase()}</p>
          </div>
        );
      case 'asset-reference':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">Asset reference vault</p>
            <p className="elab-context-card__hint">{model.artifacts.materials?.summary ?? 'Brand vault refs'}</p>
          </div>
        );
      case 'budget-forecast':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">Generation costs</p>
            <p className="elab-context-card__hint">{model.costEstimate}</p>
          </div>
        );
      case 'workforce':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">Workforce center</p>
            <p className="elab-context-card__hint">Department staffing and digital workers</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="elab-viewport__context-card elab-context-card elab-arch-panel elab-arch-panel--right elab-arch-panel--enter"
      {...{ [ELAB_V2_COMPOSITION.dynamicContextCard]: '' }}
      aria-label={`${title} context`}
    >
      <header className="elab-context-card__header">
        <span className="elab-context-card__title">{title}</span>
        {onExpand ? (
          <button type="button" className="elab-context-card__expand" onClick={onExpand} aria-label={`Expand ${title}`}>
            ⌄
          </button>
        ) : null}
      </header>

      <div key={toolId} className="elab-context-card__body elab-context-card__body--swap">
        {renderBody()}
      </div>
    </div>
  );
}
