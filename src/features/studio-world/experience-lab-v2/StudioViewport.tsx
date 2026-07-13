import { useCallback, useState } from 'react';
import type { ExperienceLabV2ArtifactRef, StudioViewportMode } from './experience-lab-v2.types';
import { ELAB_V2_COMPOSITION, VIEWPORT_MODE_LABELS } from './experience-lab-v2-composition';
import { ExperienceLabIcon } from '../icons/ExperienceLabIcon';
import { VIEWPORT_MODE_ICON } from './experience-lab-v2-icon-bindings';

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
  modes?: StudioViewportMode[];
  onModeChange?: (mode: StudioViewportMode) => void;
  onFocusMode?: (mode: StudioViewportMode) => void;
  embedded?: boolean;
  inspectorSwitcher?: React.ReactNode;
  viewAngles?: React.ReactNode;
  leftRailCollapsed?: boolean;
  rightRailCollapsed?: boolean;
  onToggleLeftRail?: () => void;
  onToggleRightRail?: () => void;
};

function BlueprintEmptyState() {
  return (
    <div className="elab-empty elab-empty--blueprint" data-empty-state="blueprint">
      <svg className="elab-empty__grid" viewBox="0 0 200 200" aria-hidden>
        <defs>
          <pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(77,163,255,0.25)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#bp-grid)" />
        <rect x="40" y="50" width="120" height="80" fill="none" stroke="rgba(77,163,255,0.5)" strokeWidth="1" strokeDasharray="4 2" />
        <line x1="100" y1="50" x2="100" y2="130" stroke="rgba(77,163,255,0.35)" />
        <line x1="40" y1="90" x2="160" y2="90" stroke="rgba(77,163,255,0.35)" />
      </svg>
      <p className="elab-empty__title">BLUEPRINT MODE</p>
      <p className="elab-empty__hint">Holographic specification layer · awaiting artifact</p>
    </div>
  );
}

function FounderRenderEmptyState({ status }: { status?: string }) {
  return (
    <div className="elab-empty elab-empty--render" data-empty-state="founder-render">
      <div className="elab-empty__glow" />
      <p className="elab-empty__title">FOUNDER RENDER</p>
      <p className="elab-empty__hint">Status: {status ?? 'no_preview'}</p>
      <p className="elab-empty__hint">Photoreal preview loads here — not in environment layer</p>
    </div>
  );
}

function ArtifactPane({
  title,
  artifact,
  variant,
  onImageLoad,
  renderStatus,
}: {
  title: string;
  artifact?: ExperienceLabV2ArtifactRef;
  variant: 'blueprint' | 'render' | 'default';
  onImageLoad?: () => void;
  renderStatus?: string;
}) {
  if (!artifact || artifact.status === 'missing') {
    if (variant === 'blueprint') return <BlueprintEmptyState />;
    if (variant === 'render') return <FounderRenderEmptyState status={renderStatus} />;
    return (
      <div className="elab-empty elab-empty--default">
        <p className="elab-empty__title">{title}</p>
        <p className="elab-empty__hint">No artifact loaded</p>
      </div>
    );
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
  return (
    <div className={`elab-viewport-pane elab-viewport-pane--${variant}`} data-viewport-pane={title}>
      {artifact.previewUrl ? (
        <img src={artifact.previewUrl} alt={artifact.label} className="elab-viewport-pane__img" onLoad={onImageLoad} />
      ) : (
        <div className="elab-viewport-pane__meta">
          <p className="elab-viewport-pane__label">{artifact.label}</p>
          <p className="elab-viewport-pane__summary">{artifact.summary}</p>
          <p className="elab-viewport-pane__rev">r{artifact.revision}</p>
        </div>
      )}
    </div>
  );
}

/** StudioViewport™ — hero visual workspace with integrated mode rail. */
export function StudioViewport({
  mode,
  departmentName,
  revision,
  artifactStatus,
  artifacts,
  isStale,
  onImageLoad,
  modes,
  onModeChange,
  onFocusMode,
  embedded,
  inspectorSwitcher,
  viewAngles,
  leftRailCollapsed,
  rightRailCollapsed,
  onToggleLeftRail,
  onToggleRightRail,
}: StudioViewportProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const toggleFullscreen = useCallback(() => setFullscreen((f) => !f), []);

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

  const rootClass = `elab-viewport${fullscreen ? ' elab-viewport--fullscreen' : ''}${embedded ? ' elab-viewport--embedded' : ''}`;

  const modeLabel = VIEWPORT_MODE_LABELS[mode] ?? mode;

  return (
    <section className={rootClass} data-studio-viewport data-mode={mode}>
      <div className="elab-viewport__chrome">
        <div className="elab-viewport__title-bar">
          <div className="elab-viewport__title-group">
            <h2 className="elab-viewport__scene-title">{departmentName.toUpperCase()}</h2>
            <span className="elab-viewport__revision">r{revision}</span>
            <span className={`elab-viewport__badge${isStale ? ' elab-viewport__badge--stale' : ' elab-viewport__badge--ok'}`}>
              {isStale ? 'STALE' : artifactStatus.toUpperCase()}
            </span>
          </div>
          {inspectorSwitcher}
          <div className="elab-viewport__controls">
            <span className="elab-viewport__mode-chip" aria-label={`Viewport mode ${modeLabel}`}>{modeLabel}</span>
            {onToggleLeftRail ? (
              <button type="button" className="elab-viewport__ctrl" onClick={onToggleLeftRail} aria-pressed={!leftRailCollapsed} aria-label="Toggle left inspector rail">
                L
              </button>
            ) : null}
            {onToggleRightRail ? (
              <button type="button" className="elab-viewport__ctrl" onClick={onToggleRightRail} aria-pressed={!rightRailCollapsed} aria-label="Toggle right inspector rail">
                R
              </button>
            ) : null}
            {onFocusMode ? (
              <button type="button" className="elab-viewport__ctrl" onClick={() => onFocusMode(mode)} aria-label="Focus mode">
                <ExperienceLabIcon name="focusMode" size="sm" decorative />
              </button>
            ) : null}
            <button type="button" className="elab-viewport__ctrl" aria-label="Toggle grid" aria-pressed={false}>
              <ExperienceLabIcon name="grid" size="sm" decorative />
            </button>
            <button type="button" className="elab-viewport__ctrl" aria-label="Toggle UI">
              <ExperienceLabIcon name="toggleUi" size="sm" decorative />
            </button>
            <button type="button" className="elab-viewport__ctrl" aria-label="Zoom in">
              <ExperienceLabIcon name="zoomIn" size="sm" decorative />
            </button>
            <button type="button" className="elab-viewport__ctrl" aria-label="Zoom out">
              <ExperienceLabIcon name="zoomOut" size="sm" decorative />
            </button>
            <button type="button" className="elab-viewport__ctrl" aria-label="Fit view">
              <ExperienceLabIcon name="fitView" size="sm" decorative />
            </button>
            <button type="button" className="elab-viewport__ctrl" aria-label="Pan">
              <ExperienceLabIcon name="pan" size="sm" decorative />
            </button>
            <button type="button" className="elab-viewport__ctrl" onClick={toggleFullscreen} aria-label="Fullscreen">
              <ExperienceLabIcon name={fullscreen ? 'stop' : 'fullscreen'} size="sm" decorative />
            </button>
          </div>
        </div>

        {modes && onModeChange ? (
          <nav className="elab-viewport__mode-rail" {...{ [ELAB_V2_COMPOSITION.modeRail]: '' }} aria-label="Viewport modes">
            {modes.map((m) => {
              const iconName = VIEWPORT_MODE_ICON[m];
              return (
              <button
                key={m}
                type="button"
                className="elab-viewport__mode-seg"
                aria-pressed={mode === m}
                onClick={() => onModeChange(m)}
              >
                {iconName ? <ExperienceLabIcon name={iconName} size="xs" decorative active={mode === m} /> : null}
                {VIEWPORT_MODE_LABELS[m] ?? m}
              </button>
              );
            })}
          </nav>
        ) : null}
      </div>

      <div className="elab-viewport__stage">{renderStage()}</div>

      {viewAngles ? <div className="elab-viewport__angles-chrome">{viewAngles}</div> : null}
    </section>
  );
}
