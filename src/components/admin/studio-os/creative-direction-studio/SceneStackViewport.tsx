import type { SceneStackCompositeStatus, SceneStackLayerView } from '../../../../studio-os-core/scene-stack';
import type { SceneStackPipelineProgress } from '../../../../hooks/useSceneStack';
import { SCENE_STACK_LAYER_SHORT_LABELS } from '../../../../studio-os-core/scene-stack';

type Props = {
  layers: SceneStackLayerView[];
  status: SceneStackCompositeStatus;
  stationLabel: string;
  pipeline?: SceneStackPipelineProgress;
  onRegenerateLayer?: (layerId: string) => void;
};

/**
 * Composites independently generated Scene Stack™ layers.
 * NEVER a single complete scene image.
 */
export function SceneStackViewport({
  layers,
  status,
  stationLabel,
  pipeline,
  onRegenerateLayer,
}: Props) {
  const approvedLayers = layers.filter((l) => l.publicUrl && l.status !== 'failed');
  const generatableLayers = layers.filter((l) => l.definition.generatable);
  const isBuilding = status === 'building' || (pipeline?.phase && pipeline.phase !== 'idle');
  const progressPct =
    pipeline && pipeline.layersTotal > 0
      ? Math.round((pipeline.layersComplete / pipeline.layersTotal) * 100)
      : 0;

  const showLayerStrip =
    Boolean(onRegenerateLayer) &&
    (isBuilding ||
      generatableLayers.some((l) => l.publicUrl || l.status === 'failed' || l.status === 'generating'));

  return (
    <div
      className={`cds-stack__viewport${isBuilding ? ' is-pipeline-active' : ''}`}
      aria-label={`${stationLabel} layered environment`}
    >
      {approvedLayers.length === 0 ? (
        <div className={`cds-stack__plate-fallback${isBuilding ? ' is-pulsing' : ''}`} aria-hidden />
      ) : (
        approvedLayers.map((layer) => (
          <img
            key={`${layer.layerId}-v${layer.version}`}
            src={layer.publicUrl!}
            alt=""
            className={`cds-stack__layer ${layer.definition.composeClass}`}
            decoding="async"
            draggable={false}
          />
        ))
      )}
      <div className="cds-stack__runtime-effects" aria-hidden />
      <div className="cds-stack__viewport-vignette" aria-hidden />

      {isBuilding ? (
        <div className="cds-stack__pipeline-hud" role="status" aria-live="polite">
          <p className="cds-stack__pipeline-title">Scene Stack™ — {stationLabel}</p>
          <p className="cds-stack__pipeline-step">
            {pipeline?.phase === 'queued'
              ? `Queued · ${pipeline.currentLayerLabel ?? 'preparing'}…`
              : pipeline?.currentLayerLabel
                ? `Generating ${pipeline.currentLayerLabel}…`
                : 'Assembling layers…'}
          </p>
          <div className="cds-stack__pipeline-bar" aria-hidden>
            <div
              className="cds-stack__pipeline-bar-fill"
              style={{ width: `${Math.max(progressPct, pipeline?.phase === 'queued' ? 6 : 12)}%` }}
            />
          </div>
          <p className="cds-stack__pipeline-count">
            {pipeline?.layersComplete ?? 0}/{pipeline?.layersTotal ?? generatableLayers.length} layers
            {pipeline?.currentLayerLabel ? ` · ${pipeline.currentLayerLabel}` : ''}
          </p>
        </div>
      ) : null}

      {status === 'failed' ? (
        <div className="cds-stack__viewport-error">
          <p>Layer generation failed.</p>
          {onRegenerateLayer ? (
            <button
              type="button"
              className="cds-genesis__btn"
              onClick={() => onRegenerateLayer('environment-shell')}
            >
              Retry Shell Layer
            </button>
          ) : null}
        </div>
      ) : null}

      {!isBuilding && (status === 'idle' || status === 'partial' || status === 'ready') ? (
        <p className="cds-stack__viewport-hint">
          Scene Stack™ {approvedLayers.length}/{layers.length} layers
        </p>
      ) : null}

      {showLayerStrip ? (
        <div className="cds-stack__layer-strip" aria-label={`${stationLabel} layer controls`}>
          {generatableLayers.map((layer) => {
            const canRegen = Boolean(layer.publicUrl) && layer.status !== 'generating';
            const isGenerating =
              layer.status === 'generating' ||
              (pipeline?.currentLayerId === layer.layerId &&
                pipeline?.phase !== undefined &&
                pipeline.phase !== 'idle');
            const isQueued =
              pipeline?.currentLayerId === layer.layerId && pipeline?.phase === 'queued';
            const label =
              SCENE_STACK_LAYER_SHORT_LABELS[layer.layerId as keyof typeof SCENE_STACK_LAYER_SHORT_LABELS] ??
              layer.definition.displayName;
            return (
              <div
                key={layer.layerId}
                className={`cds-stack__layer-strip-row${isGenerating ? ' is-generating' : ''}${isQueued ? ' is-queued' : ''}`}
              >
                <span
                  className={`cds-stack__layer-strip-dot${layer.publicUrl ? ' is-ready' : ''}${layer.status === 'failed' ? ' is-failed' : ''}${isGenerating || isQueued ? ' is-active' : ''}`}
                  aria-hidden
                />
                <span className="cds-stack__layer-strip-label">{label}</span>
                {isGenerating ? (
                  <span className="cds-stack__layer-strip-busy">Gen</span>
                ) : isQueued ? (
                  <span className="cds-stack__layer-strip-busy">…</span>
                ) : canRegen ? (
                  <button
                    type="button"
                    className="cds-stack__layer-strip-btn"
                    onClick={() => onRegenerateLayer?.(layer.layerId)}
                    title={`Regenerate ${layer.definition.displayName} only`}
                  >
                    Regen
                  </button>
                ) : layer.status === 'failed' && onRegenerateLayer ? (
                  <button
                    type="button"
                    className="cds-stack__layer-strip-btn"
                    onClick={() => onRegenerateLayer(layer.layerId)}
                  >
                    Retry
                  </button>
                ) : (
                  <span className="cds-stack__layer-strip-pending">—</span>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
