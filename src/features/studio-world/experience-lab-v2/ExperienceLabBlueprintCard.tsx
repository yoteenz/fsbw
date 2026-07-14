import type { EnvironmentPackageOutputStatus } from '../../../studio-os-core/environment-asset-package/EnvironmentPackageOutputs';
import type { BlueprintDisplayState } from './live-workspace/ExperienceLabLiveWorkspaceViewModel';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';
import { ExperienceLabIcon } from '../icons/ExperienceLabIcon';
import { ExperienceLabAnchoredEnvironmentDisplay } from './ExperienceLabAnchoredEnvironmentDisplay';

type Props = {
  environmentName: string;
  revision: number;
  status: string;
  isStale?: boolean;
  blueprintUrl: string | null;
  blueprintStatus: EnvironmentPackageOutputStatus;
  displayState?: BlueprintDisplayState;
  blockerReason?: string | null;
  onOpenBlueprint?: () => void;
  onGenerateBlueprint?: () => void;
  onRetryBlueprint?: () => void;
};

function blueprintLoadingLabel(
  status: EnvironmentPackageOutputStatus,
  displayState?: BlueprintDisplayState
): string {
  if (displayState === 'NOT_REQUESTED') return 'BLUEPRINT NOT GENERATED';
  if (displayState === 'BLOCKED') return 'BLUEPRINT BLOCKED';
  if (displayState === 'QUEUED') return 'BLUEPRINT QUEUED';
  if (displayState === 'GENERATING' || status === 'generating') return 'GENERATING BLUEPRINT…';
  if (displayState === 'FAILED' || status === 'failed') return 'BLUEPRINT GENERATION FAILED';
  if (displayState === 'STALE') return 'STALE BLUEPRINT';
  if (displayState === 'CANONICAL') return 'CANONICAL BLUEPRINT';
  if (displayState === 'APPROVED') return 'APPROVED BLUEPRINT';
  return 'BLUEPRINT PENDING';
}

/** Panel 01 — persistent architectural context with real package blueprint thumbnail. */
export function ExperienceLabBlueprintCard({
  environmentName,
  revision,
  status,
  isStale,
  blueprintUrl,
  blueprintStatus,
  displayState,
  blockerReason,
  onOpenBlueprint,
  onGenerateBlueprint,
  onRetryBlueprint,
}: Props) {
  const showImage = Boolean(blueprintUrl);
  const loadingLabel = blueprintLoadingLabel(blueprintStatus, displayState);
  const isError = blueprintStatus === 'failed' || displayState === 'FAILED';
  const isGenerating = blueprintStatus === 'generating' || displayState === 'GENERATING';

  return (
    <ExperienceLabAnchoredEnvironmentDisplay
      anchor="LEFT_FRONT"
      side="left"
      hostClassName="elab-viewport__blueprint-card elab-blueprint-card"
      compositionAttr={ELAB_V2_COMPOSITION.blueprintCard}
      ariaLabel="BLUEPRINT CARD"
    >
      <div className="elab-blueprint-card__thumb" aria-hidden={!showImage}>
        {showImage ? (
          <img src={blueprintUrl!} alt="" className="elab-blueprint-card__img" />
        ) : (
          <div
            className={`elab-blueprint-card__loading${isError ? ' elab-blueprint-card__loading--error' : ''}`}
            aria-live="polite"
          >
            {!isError && isGenerating ? <div className="elab-blueprint-card__pulse" /> : null}
            <span className="elab-blueprint-card__loading-label">{loadingLabel}</span>
            {blockerReason ? <span className="elab-blueprint-card__loading-label">{blockerReason}</span> : null}
          </div>
        )}
        {showImage && (isStale || displayState === 'STALE') ? (
          <span className="elab-viewport__badge elab-viewport__badge--stale">STALE</span>
        ) : null}
      </div>

      <div className="elab-blueprint-card__meta">
        <div className="elab-blueprint-card__title-group">
          <h2 className="elab-viewport__scene-title elab-blueprint-card__name">{environmentName.toUpperCase()}</h2>
          <span className="elab-viewport__revision">r{revision}</span>
          <span className={`elab-viewport__badge${isStale || displayState === 'STALE' ? ' elab-viewport__badge--stale' : ' elab-viewport__badge--ok'}`}>
            {(displayState ?? status).toString().toUpperCase()}
          </span>
        </div>

        <div className="elab-blueprint-card__actions">
          {onOpenBlueprint && showImage ? (
            <button type="button" className="elab-blueprint-card__open" onClick={onOpenBlueprint}>
              <ExperienceLabIcon name="blueprint" size="xs" decorative />
              Open Blueprint
            </button>
          ) : null}
          {onGenerateBlueprint && !showImage ? (
            <button type="button" className="elab-blueprint-card__open" onClick={onGenerateBlueprint}>
              Generate Blueprint
            </button>
          ) : null}
          {onRetryBlueprint && isError ? (
            <button type="button" className="elab-blueprint-card__open" onClick={onRetryBlueprint}>
              Retry Blueprint
            </button>
          ) : null}
        </div>
      </div>
    </ExperienceLabAnchoredEnvironmentDisplay>
  );
}
