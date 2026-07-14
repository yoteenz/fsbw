import type { EnvironmentPackageOutputStatus } from '../../../studio-os-core/environment-asset-package/EnvironmentPackageOutputs';
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
  onOpenBlueprint?: () => void;
};

function blueprintLoadingLabel(status: EnvironmentPackageOutputStatus): string {
  if (status === 'generating') return 'Generating blueprint…';
  if (status === 'failed') return 'Blueprint generation failed';
  return 'Blueprint pending';
}

/** Panel 01 — persistent architectural context with real package blueprint thumbnail. */
export function ExperienceLabBlueprintCard({
  environmentName,
  revision,
  status,
  isStale,
  blueprintUrl,
  blueprintStatus,
  onOpenBlueprint,
}: Props) {
  const showLoading = !blueprintUrl;
  const loadingLabel = blueprintLoadingLabel(blueprintStatus);

  return (
    <ExperienceLabAnchoredEnvironmentDisplay
      anchor="LEFT_FRONT"
      side="left"
      hostClassName="elab-viewport__blueprint-card elab-blueprint-card"
      compositionAttr={ELAB_V2_COMPOSITION.blueprintCard}
      ariaLabel="Blueprint card"
    >
      <div className="elab-blueprint-card__thumb" aria-hidden={showLoading}>
        {blueprintUrl ? (
          <img src={blueprintUrl} alt="" className="elab-blueprint-card__img" />
        ) : (
          <div
            className={`elab-blueprint-card__loading${blueprintStatus === 'failed' ? ' elab-blueprint-card__loading--error' : ''}`}
            aria-live="polite"
          >
            {blueprintStatus !== 'failed' ? <div className="elab-blueprint-card__pulse" /> : null}
            <span className="elab-blueprint-card__loading-label">{loadingLabel}</span>
          </div>
        )}
      </div>

      <div className="elab-blueprint-card__meta">
        <div className="elab-blueprint-card__title-group">
          <h2 className="elab-viewport__scene-title elab-blueprint-card__name">{environmentName.toUpperCase()}</h2>
          <span className="elab-viewport__revision">r{revision}</span>
          <span className={`elab-viewport__badge${isStale ? ' elab-viewport__badge--stale' : ' elab-viewport__badge--ok'}`}>
            {isStale ? 'STALE' : status.toUpperCase()}
          </span>
        </div>

        {onOpenBlueprint ? (
          <button type="button" className="elab-blueprint-card__open" onClick={onOpenBlueprint}>
            <ExperienceLabIcon name="blueprint" size="xs" decorative />
            Open Blueprint
          </button>
        ) : null}
      </div>
    </ExperienceLabAnchoredEnvironmentDisplay>
  );
}
