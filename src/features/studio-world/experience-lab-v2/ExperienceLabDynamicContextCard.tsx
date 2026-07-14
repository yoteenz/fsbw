import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { StudioViewportMode } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import { ExperienceLabAnchoredEnvironmentDisplay } from './ExperienceLabAnchoredEnvironmentDisplay';
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
  onGenerateBlueprint?: () => void;
  onRetryBlueprint?: () => void;
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
  onGenerateBlueprint,
  onRetryBlueprint,
}: Props) {
  const live = model.liveWorkspace;
  const modules = live?.workbenchModules;
  const blueprint = live?.blueprintOutput;
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
            {blueprint?.canGenerate && onGenerateBlueprint ? (
              <ContextActionRow label="GENERATE BLUEPRINT" detail={blueprint.displayState} onClick={onGenerateBlueprint} />
            ) : null}
            {blueprint?.canRetry && onRetryBlueprint ? (
              <ContextActionRow label="RETRY BLUEPRINT" detail={blueprint.failureCode ?? 'STALE'} onClick={onRetryBlueprint} />
            ) : null}
            <ContextActionRow
              label="BLUEPRINT STATUS"
              detail={`${modules?.architectural.blueprintStatus ?? '—'} · r${modules?.architectural.activeRevision ?? model.revision}`}
            />
          </div>
        );
      case 'materials':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">{modules?.materials.summary ?? model.artifacts.materials?.summary ?? 'MATERIAL PROFILE'}</p>
            <p className="elab-context-card__hint">
              r{modules?.materials.revision ?? model.revision} · {(modules?.materials.profileStatus ?? 'idle').toUpperCase()} · {modules?.materials.generationJobStatus ?? '—'}
            </p>
          </div>
        );
      case 'lighting':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">{model.artifacts.lighting?.summary ?? 'LIGHTING PROFILE'}</p>
            <p className="elab-context-card__hint">{live?.provider ?? '—'} / {live?.model ?? '—'}</p>
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
            <p className="elab-context-card__summary">PERMIT STATUS</p>
            <p className="elab-context-card__hint">
              {(modules?.permit.permitStatus ?? model.permitStatus).toUpperCase()} · {modules?.permit.readinessPercent ?? 0}% READY
            </p>
            {modules?.permit.blockers.length ? (
              <p className="elab-context-card__hint">{modules.permit.blockers[0]}</p>
            ) : null}
          </div>
        );
      case 'asset-reference':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">{modules?.assetReference.summary ?? 'ASSET MANIFEST'}</p>
            <p className="elab-context-card__hint">
              {modules?.assetReference.attachedCount ?? 0} attached · {modules?.assetReference.missingCount ?? 0} pending
            </p>
          </div>
        );
      case 'budget-forecast':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">GENERATION COSTS</p>
            <p className="elab-context-card__hint">{modules?.budget.displayEstimate ?? model.costEstimate}</p>
            <p className="elab-context-card__hint">
              {modules?.budget.outputsGenerated ?? 0} generated · {modules?.budget.outputsRemaining ?? 0} remaining
            </p>
          </div>
        );
      case 'workforce':
        return (
          <div className="elab-context-card__body-copy">
            <p className="elab-context-card__summary">WORKFORCE CENTER</p>
            <p className="elab-context-card__hint">
              {(modules?.workforce.schedulerJobs ?? []).join(' · ') || modules?.workforce.responsibleDepartment || '—'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ExperienceLabAnchoredEnvironmentDisplay
      anchor="RIGHT_FRONT"
      side="right"
      hostClassName="elab-viewport__context-card elab-context-card"
      compositionAttr={ELAB_V2_COMPOSITION.dynamicContextCard}
      enter
      ariaLabel={`${title} CONTEXT`}
    >
      <header className="elab-context-card__header">
        <span className="elab-context-card__title">{title}</span>
        {onExpand ? (
          <button type="button" className="elab-context-card__expand" onClick={onExpand} aria-label={`EXPAND ${title}`}>
            ⌄
          </button>
        ) : null}
      </header>

      <div key={toolId} className="elab-context-card__body elab-context-card__body--swap">
        {renderBody()}
      </div>
    </ExperienceLabAnchoredEnvironmentDisplay>
  );
}
