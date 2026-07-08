import type { CSSProperties } from 'react';
import { useRef } from 'react';
import type { SceneStackCompositeStatus, SceneStackLayerView } from '../../../../studio-os-core/scene-stack';
import type { SceneStackPipelineProgress } from '../../../../hooks/useSceneStack';
import { SCENE_STACK_LAYER_SHORT_LABELS } from '../../../../studio-os-core/scene-stack';

const REAR_LAYER_IDS = new Set(['environment-shell']);
const FORE_LAYER_IDS = new Set(['atmospheric-systems', 'surface-materials', 'ambient-motion']);

type Props = {
  layers: SceneStackLayerView[];
  status: SceneStackCompositeStatus;
  stationLabel: string;
  pipeline?: SceneStackPipelineProgress;
  immersiveProfile?: 'story-table' | 'default';
  parallaxStyle?: CSSProperties;
  onRegenerateLayer?: (layerId: string) => void;
};

function layerPlane(layerId: string): 'rear' | 'mid' | 'fore' {
  if (REAR_LAYER_IDS.has(layerId)) return 'rear';
  if (FORE_LAYER_IDS.has(layerId)) return 'fore';
  return 'mid';
}

/** Freeze displayed src once a layer completes — prevents shell swap while later passes generate. */
function StackLayerImage({
  layer,
  locked,
}: {
  layer: SceneStackLayerView;
  locked: boolean;
}) {
  const frozenSrc = useRef<string | null>(null);
  const src = layer.publicUrl!;
  if (locked) {
    if (frozenSrc.current === null) frozenSrc.current = src;
  } else {
    frozenSrc.current = null;
  }
  const displaySrc = locked && frozenSrc.current ? frozenSrc.current : src;

  return (
    <img
      src={displaySrc}
      alt=""
      className={`cds-stack__layer ${layer.definition.composeClass}${locked ? ' cds-stack__layer--locked' : ''}`}
      decoding="async"
      draggable={false}
    />
  );
}

/**
 * Composites independently generated Scene Stack™ layers with depth planes + Idle Life™.
 * NEVER a single complete scene image.
 */
export function SceneStackViewport({
  layers,
  status,
  stationLabel,
  pipeline,
  immersiveProfile = 'default',
  parallaxStyle,
  onRegenerateLayer,
}: Props) {
  const approvedLayers = layers.filter((l) => l.publicUrl && l.status !== 'failed');
  const generatableLayers = layers.filter((l) => l.definition.generatable);
  const isBuilding = status === 'building' || (pipeline?.phase && pipeline.phase !== 'idle');
  const isStoryTable = immersiveProfile === 'story-table';
  const progressPct =
    pipeline && pipeline.layersTotal > 0
      ? Math.round((pipeline.layersComplete / pipeline.layersTotal) * 100)
      : 0;

  const rearLayers = approvedLayers.filter((l) => layerPlane(l.layerId) === 'rear');
  const midLayers = approvedLayers.filter((l) => layerPlane(l.layerId) === 'mid');
  const foreLayers = approvedLayers.filter((l) => layerPlane(l.layerId) === 'fore');

  const showLayerStrip =
    Boolean(onRegenerateLayer) &&
    (isBuilding ||
      generatableLayers.some((l) => l.publicUrl || l.status === 'failed' || l.status === 'generating'));

  const showDepthStage = approvedLayers.length > 0 || isBuilding;

  const isLayerLocked = (layer: SceneStackLayerView) =>
    Boolean(layer.publicUrl) &&
    layer.status !== 'generating' &&
    layer.layerId !== pipeline?.currentLayerId;

  const renderLayer = (layer: SceneStackLayerView) => (
    <StackLayerImage key={layer.layerId} layer={layer} locked={isLayerLocked(layer)} />
  );

  return (
    <div
      className={`cds-stack__viewport${isBuilding ? ' is-pipeline-active' : ''}${isStoryTable ? ' is-story-table' : ''}`}
      style={parallaxStyle}
      aria-label={`${stationLabel} layered environment`}
    >
      {showDepthStage ? (
        <div className="cds-stack__depth-stage">
          <div className="cds-stack__depth-plane cds-stack__depth-plane--rear">
            {rearLayers.map(renderLayer)}
          </div>
          <div className="cds-stack__depth-plane cds-stack__depth-plane--mid">
            {midLayers.map(renderLayer)}
          </div>
          <div className="cds-stack__depth-plane cds-stack__depth-plane--fore">
            {foreLayers.map(renderLayer)}
          </div>
        </div>
      ) : (
        <div className={`cds-stack__plate-fallback${isBuilding ? ' is-pulsing' : ''}`} aria-hidden />
      )}

      <div className={`cds-stack__idle-life${isBuilding ? ' is-frozen' : ''}`} aria-hidden>
        <div className="cds-stack__idle-scanline" />
      </div>
      {isStoryTable ? <div className="cds-stack__foreground-props" aria-hidden /> : null}

      <div className="cds-stack__runtime-effects" aria-hidden />
      <div className="cds-stack__viewport-vignette" aria-hidden />

      {isBuilding ? (
        <div className="cds-stack__pipeline-hud" role="status" aria-live="polite">
          <p className="cds-stack__pipeline-title">Scene Assembly™ — {stationLabel}</p>
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

      {!isBuilding && (status === 'idle' || status === 'partial' || status === 'ready') && !isStoryTable ? (
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
