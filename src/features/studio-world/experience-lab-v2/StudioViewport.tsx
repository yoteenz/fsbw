import { useCallback } from 'react';
import type { EnvironmentPackageOutputStatus } from '../../../studio-os-core/environment-asset-package/EnvironmentPackageOutputs';
import type { ExperienceLabV2ArtifactRef, StudioViewportMode } from './experience-lab-v2.types';
import { ExperienceLabEnvironmentLayer } from './ExperienceLabEnvironmentLayer';
import { ExperienceLabIcon } from '../icons/ExperienceLabIcon';
import { ExperienceLabBlueprintCard } from './ExperienceLabBlueprintCard';

export type StudioViewportProps = {
  mode: StudioViewportMode;
  departmentName: string;
  revision: number;
  artifactStatus: string;
  artifacts: {
    blueprint?: ExperienceLabV2ArtifactRef;
    founderRender?: ExperienceLabV2ArtifactRef;
    construction?: ExperienceLabV2ArtifactRef;
    materials?: ExperienceLabV2ArtifactRef;
    lighting?: ExperienceLabV2ArtifactRef;
    camera?: ExperienceLabV2ArtifactRef;
  };
  isStale?: boolean;
  onImageLoad?: () => void;
  onFocusMode?: (mode: StudioViewportMode) => void;
  focusActive?: boolean;
  embedded?: boolean;
  blueprintThumbnailUrl?: string | null;
  blueprintThumbnailStatus?: EnvironmentPackageOutputStatus;
  onOpenBlueprint?: () => void;
  dynamicContextCard?: React.ReactNode;
  viewAngles?: React.ReactNode;
  /** Mobile/tablet use 9:16 environment; desktop uses landscape environment. */
  isCompact?: boolean;
  /** Active design variant environment artwork. */
  environmentUrl?: string | null;
};

/** Empty artifact states show only the viewport environment — no placeholder graphics. */
function BlueprintEmptyState() {
  return null;
}

function FounderRenderEmptyState() {
  return null;
}

function ArtifactPane({
  title,
  artifact,
  variant,
  onImageLoad,
}: {
  title: string;
  artifact?: ExperienceLabV2ArtifactRef;
  variant: 'blueprint' | 'render' | 'default';
  onImageLoad?: () => void;
  renderStatus?: string;
}) {
  if (!artifact || artifact.status === 'missing') {
    if (variant === 'blueprint') return <BlueprintEmptyState />;
    if (variant === 'render') return <FounderRenderEmptyState />;
    return null;
  }
  if (artifact.status === 'loading') {
    return (
      <div className="elab-empty elab-empty--loading">
        <div className="elab-empty__pulse" />
        <p className="elab-empty__hint">Loading {title}…</p>
      </div>
    );
  }
  if (artifact.status === 'error') {
    return (
      <div className="elab-empty elab-empty--error">
        <p className="elab-empty__title">{title} ERROR</p>
        <p className="elab-empty__hint">Generation failed — open diagnostics</p>
      </div>
    );
  }
  if (!artifact.previewUrl) {
    return null;
  }
  return (
    <div className={`elab-viewport-pane elab-viewport-pane--${variant}`} data-viewport-pane={title}>
      <img src={artifact.previewUrl} alt={artifact.label} className="elab-viewport-pane__img" onLoad={onImageLoad} />
    </div>
  );
}

/** StudioViewport™ — hero visual workspace; two-panel HUD (blueprint + optional context). */
export function StudioViewport({
  mode,
  departmentName,
  revision,
  artifactStatus,
  artifacts,
  isStale,
  onImageLoad,
  onFocusMode,
  focusActive,
  embedded,
  blueprintThumbnailUrl,
  blueprintThumbnailStatus = 'pending',
  onOpenBlueprint,
  dynamicContextCard,
  viewAngles,
  isCompact,
  environmentUrl,
}: StudioViewportProps) {
  const toggleFocus = useCallback(() => {
    onFocusMode?.(mode);
  }, [mode, onFocusMode]);

  const renderStage = () => {
    switch (mode) {
      case 'LOADING':
        return <div className="elab-empty elab-empty--loading"><div className="elab-empty__pulse" /><p>Syncing viewport…</p></div>;
      case 'ERROR':
        return <div className="elab-empty elab-empty--error"><p>Viewport error</p></div>;
      case 'EMPTY_STATE':
        return <BlueprintEmptyState />;
      case 'BLUEPRINT':
        return <ArtifactPane title="Blueprint" artifact={artifacts.blueprint} variant="blueprint" />;
      case 'FOUNDER_RENDER':
        return <ArtifactPane title="Founder Render" artifact={artifacts.founderRender} variant="render" onImageLoad={onImageLoad} renderStatus={artifactStatus} />;
      case 'CONSTRUCTION_PLAN':
        return <ArtifactPane title="Construction" artifact={artifacts.construction} variant="default" />;
      case 'MATERIALS':
        return <ArtifactPane title="Materials" artifact={artifacts.materials} variant="default" />;
      case 'LIGHTING':
        return <ArtifactPane title="Lighting" artifact={artifacts.lighting} variant="default" />;
      case 'CAMERA':
        return <ArtifactPane title="Camera" artifact={artifacts.camera} variant="default" />;
      case 'SPLIT_VIEW':
        return (
          <div className="elab-viewport-split" data-split-view>
            <ArtifactPane title="Blueprint" artifact={artifacts.blueprint} variant="blueprint" />
            <ArtifactPane title="Founder Render" artifact={artifacts.founderRender} variant="render" onImageLoad={onImageLoad} renderStatus={artifactStatus} />
          </div>
        );
      default:
        return null;
    }
  };

  const rootClass = `elab-viewport${embedded ? ' elab-viewport--embedded' : ''}${focusActive ? ' elab-viewport--focus-active' : ''}`;

  return (
    <section className={rootClass} data-studio-viewport data-mode={mode}>
      <div className="elab-viewport__stage">
        <ExperienceLabEnvironmentLayer scope="viewport" isMobile={isCompact} environmentUrl={environmentUrl} />

        <div className="elab-viewport__hud" data-elab-viewport-hud aria-label="Viewport HUD">
          <div className="elab-viewport__hud-safe">
            <ExperienceLabBlueprintCard
              environmentName={departmentName}
              revision={revision}
              status={artifactStatus}
              isStale={isStale}
              blueprintUrl={blueprintThumbnailUrl ?? null}
              blueprintStatus={blueprintThumbnailStatus}
              onOpenBlueprint={onOpenBlueprint}
            />

            {dynamicContextCard}

            {onFocusMode ? (
              <button
                type="button"
                className="elab-viewport__focus-ctrl"
                onClick={toggleFocus}
                aria-pressed={focusActive}
                aria-label={focusActive ? 'Exit focus mode' : 'Enter focus mode'}
                title="Focus mode"
              >
                <ExperienceLabIcon name="focusMode" size="sm" decorative active={focusActive} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="elab-viewport__stage-content">{renderStage()}</div>
      </div>

      {viewAngles ? <div className="elab-viewport__angles-chrome">{viewAngles}</div> : null}
    </section>
  );
}
