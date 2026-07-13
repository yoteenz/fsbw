import { useCallback, useState } from 'react';
import type { ExperienceLabV2ArtifactRef, StudioViewportMode } from './experience-lab-v2.types';

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
};

function ArtifactPane({
  title,
  artifact,
  holographic,
  onImageLoad,
}: {
  title: string;
  artifact?: ExperienceLabV2ArtifactRef;
  holographic?: boolean;
  onImageLoad?: () => void;
}) {
  if (!artifact || artifact.status === 'missing') {
    return (
      <div className="studio-viewport__pane" data-viewport-pane={title}>
        <p style={{ fontSize: 11, color: 'var(--elab-text-muted)' }}>{title} — no artifact</p>
      </div>
    );
  }
  if (artifact.status === 'loading') {
    return (
      <div className="studio-viewport__pane" data-viewport-pane={title}>
        <p>Loading {title}…</p>
      </div>
    );
  }
  if (artifact.status === 'error') {
    return (
      <div className="studio-viewport__pane" data-viewport-pane={title}>
        <p style={{ color: '#eb1c24' }}>{title} error</p>
      </div>
    );
  }
  return (
    <div
      className="studio-viewport__pane"
      data-viewport-pane={title}
      style={holographic ? { borderColor: 'rgba(99, 179, 237, 0.5)', boxShadow: 'inset 0 0 24px rgba(99,179,237,0.15)' } : undefined}
    >
      {artifact.previewUrl ? (
        <img
          src={artifact.previewUrl}
          alt={artifact.label}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 6 }}
          onLoad={onImageLoad}
        />
      ) : (
        <div>
          <p style={{ fontWeight: 800, fontSize: 12, letterSpacing: '0.08em' }}>{artifact.label}</p>
          <p style={{ fontSize: 10, marginTop: 8, color: 'var(--elab-text-muted)' }}>{artifact.summary}</p>
          <p style={{ fontSize: 9, marginTop: 4 }}>r{artifact.revision} · {artifact.status}</p>
        </div>
      )}
    </div>
  );
}

/** StudioViewport™ — universal center visual workspace. */
export function StudioViewport({
  mode,
  departmentName,
  revision,
  artifactStatus,
  artifacts,
  isStale,
  onImageLoad,
}: StudioViewportProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const toggleFullscreen = useCallback(() => setFullscreen((f) => !f), []);
  const fit = useCallback(() => setZoom(1), []);

  const rootClass = `studio-viewport${fullscreen ? ' studio-viewport--fullscreen' : ''}`;

  const renderStage = () => {
    switch (mode) {
      case 'LOADING':
        return <div className="studio-viewport__pane">Loading viewport…</div>;
      case 'ERROR':
        return <div className="studio-viewport__pane" style={{ color: '#eb1c24' }}>Viewport error</div>;
      case 'EMPTY_STATE':
        return <div className="studio-viewport__pane">Select an inspector module or view mode</div>;
      case 'BLUEPRINT':
        return <ArtifactPane title="Blueprint" artifact={artifacts.blueprint} holographic onImageLoad={onImageLoad} />;
      case 'FOUNDER_RENDER':
        return <ArtifactPane title="Founder Render" artifact={artifacts.founderRender} onImageLoad={onImageLoad} />;
      case 'CONSTRUCTION_PLAN':
        return <ArtifactPane title="Construction Plan" artifact={artifacts.construction} />;
      case 'MATERIALS':
        return <ArtifactPane title="Materials" artifact={artifacts.materials} />;
      case 'LIGHTING':
        return <ArtifactPane title="Lighting" artifact={artifacts.lighting} />;
      case 'CAMERA':
        return <ArtifactPane title="Camera" artifact={artifacts.camera} />;
      case 'SPLIT_VIEW':
        return (
          <div className="studio-viewport__split" data-split-view>
            <ArtifactPane title="Blueprint" artifact={artifacts.blueprint} holographic />
            <ArtifactPane title="Founder Render" artifact={artifacts.founderRender} onImageLoad={onImageLoad} />
          </div>
        );
      default:
        return <div className="studio-viewport__pane">Unknown mode</div>;
    }
  };

  return (
    <section className={rootClass} data-studio-viewport data-mode={mode}>
      <header className="studio-viewport__header">
        <div>
          <strong style={{ letterSpacing: '0.08em', fontSize: 10 }}>{mode.replace(/_/g, ' ')}</strong>
          <span style={{ marginLeft: 8, color: 'var(--elab-text-muted)' }}>
            {departmentName} · r{revision} · {artifactStatus}
          </span>
          {isStale ? <span style={{ marginLeft: 8, color: '#eb1c24' }}>STALE</span> : null}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="elab-v2__mode-btn" onClick={() => setZoom((z) => Math.min(2, z + 0.1))} aria-label="Zoom in">
            +
          </button>
          <button type="button" className="elab-v2__mode-btn" onClick={fit} aria-label="Fit to viewport">
            FIT
          </button>
          <button type="button" className="elab-v2__mode-btn" onClick={toggleFullscreen} aria-label="Toggle fullscreen">
            {fullscreen ? 'EXIT' : 'FULL'}
          </button>
        </div>
      </header>
      <div className="studio-viewport__stage" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
        {renderStage()}
      </div>
    </section>
  );
}
