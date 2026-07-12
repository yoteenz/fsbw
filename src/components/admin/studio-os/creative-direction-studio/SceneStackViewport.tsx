import type { CSSProperties } from 'react';
import { useRef } from 'react';
import type {
  SceneGraph,
  SceneGraphNode,
  SceneStackCompositeStatus,
  SceneStackLayerView,
} from '../../../../studio-os-core/scene-stack';
import type { SceneStackPipelineProgress } from '../../../../hooks/useSceneStack';
import { SCENE_STACK_LAYER_SHORT_LABELS } from '../../../../studio-os-core/scene-stack';
import {
  debugCategoryForLayerId,
  type ArchitectDebugViewState,
} from '../../../../studio-os-core/scene-stack/world-compiler/debug-view';
import { ArchitectDebugPanel } from './ArchitectDebugPanel';

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
  sceneGraph?: SceneGraph | null;
  debugView?: ArchitectDebugViewState;
  onDebugToggle?: () => void;
  onDebugLayerToggle?: (layer: import('../../../../studio-os-core/scene-stack/world-compiler/debug-view').ArchitectDebugLayer) => void;
  compilationHeadline?: string | null;
  sceneIntegrityPct?: number | null;
  /** Terminal Layer 1 failure — diagnostic / forensic display */
  layer1Failure?: {
    state: 'FAILED_AT_LAYER_1';
    failedLayerId: string;
    failedLayerLabel: string;
    errorCode: string | null;
    errorMessage: string;
    compileRunId: string | null;
    shellId: string | null;
    failedTransition: string;
    lastSuccessfulTransition: string | null;
    failedFunction: string;
    onCopyDiagnostics?: () => void;
  } | null;
};

function layerPlane(layerId: string): 'rear' | 'mid' | 'fore' {
  if (REAR_LAYER_IDS.has(layerId)) return 'rear';
  if (FORE_LAYER_IDS.has(layerId)) return 'fore';
  return 'mid';
}

function nodeStyleForGraph(node: SceneGraphNode | undefined): CSSProperties {
  if (!node) return {};
  const isStructural = node.mountType === 'structural' || node.mountType === 'reference-only';
  return {
    zIndex: node.zIndex,
    mixBlendMode: node.blendMode as CSSProperties['mixBlendMode'],
    opacity: node.opacity,
    ...(isStructural ? { mixBlendMode: 'normal', opacity: 1 } : {}),
  };
}

/** Freeze displayed src once a layer completes — prevents shell swap while later passes generate. */
function StackLayerImage({
  layer,
  locked,
  graphNode,
  hidden,
}: {
  layer: SceneStackLayerView;
  locked: boolean;
  graphNode?: SceneGraphNode;
  hidden?: boolean;
}) {
  const frozenSrc = useRef<string | null>(null);
  const src = layer.publicUrl!;
  if (locked) {
    if (frozenSrc.current === null) frozenSrc.current = src;
  } else {
    frozenSrc.current = null;
  }
  const displaySrc = locked && frozenSrc.current ? frozenSrc.current : src;
  const wcClass =
    graphNode?.mountType === 'effect-calculated'
      ? ' cds-stack__layer--wc-effect'
      : graphNode?.mountType === 'structural'
        ? ' cds-stack__layer--wc-structural'
        : ' cds-stack__layer--wc-reference';

  return (
    <img
      src={displaySrc}
      alt=""
      className={`cds-stack__layer ${layer.definition.composeClass}${locked ? ' cds-stack__layer--locked' : ''}${wcClass}${hidden ? ' cds-stack__layer--debug-hidden' : ''}`}
      style={graphNode ? nodeStyleForGraph(graphNode) : undefined}
      decoding="async"
      draggable={false}
    />
  );
}

/**
 * World Compiler™ viewport — Scene Graph™ drives composition.
 * NEVER alpha-composites full scenes. Structural layers mount at opacity 1.
 */
export function SceneStackViewport({
  layers,
  status,
  stationLabel,
  pipeline,
  immersiveProfile = 'default',
  parallaxStyle,
  onRegenerateLayer,
  sceneGraph,
  debugView,
  onDebugToggle,
  onDebugLayerToggle,
  compilationHeadline,
  sceneIntegrityPct,
  layer1Failure,
}: Props) {
  const approvedLayers = layers.filter((l) => l.publicUrl && l.status !== 'failed');
  const generatableLayers = layers.filter((l) => l.definition.generatable);
  const isBuilding = status === 'building' || (pipeline?.phase && pipeline.phase !== 'idle');
  const isStoryTable = immersiveProfile === 'story-table';
  const isWorldCompiler = sceneGraph?.compositionMode !== 'legacy-stack';
  const progressPct =
    pipeline && pipeline.layersTotal > 0
      ? Math.round((pipeline.layersComplete / pipeline.layersTotal) * 100)
      : 0;

  const nodeByLayer = new Map(sceneGraph?.nodes.map((n) => [n.layerId, n]) ?? []);

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

  const isLayerDebugHidden = (layerId: string) => {
    if (!debugView?.enabled) return false;
    const cat = debugCategoryForLayerId(layerId);
    if (!cat) return false;
    return !debugView.visibleLayers.has(cat);
  };

  const renderLayer = (layer: SceneStackLayerView) => (
    <StackLayerImage
      key={layer.layerId}
      layer={layer}
      locked={isLayerLocked(layer)}
      graphNode={nodeByLayer.get(layer.layerId)}
      hidden={isLayerDebugHidden(layer.layerId)}
    />
  );

  return (
    <div
      className={`cds-stack__viewport${isBuilding ? ' is-pipeline-active' : ''}${isStoryTable ? ' is-story-table' : ''}${isWorldCompiler ? ' is-world-compiler' : ''}${debugView?.enabled ? ' is-debug-active' : ''}`}
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

      {debugView && onDebugToggle && onDebugLayerToggle ? (
        <ArchitectDebugPanel
          debugView={debugView}
          onToggle={onDebugToggle}
          onToggleLayer={onDebugLayerToggle}
          compilationHeadline={compilationHeadline}
          sceneIntegrityPct={sceneIntegrityPct}
        />
      ) : null}

      {isBuilding ? (
        <div className="cds-stack__pipeline-hud" role="status" aria-live="polite">
          <p className="cds-stack__pipeline-title">
            {isWorldCompiler ? 'World Compiler™' : 'Scene Assembly™'} — {stationLabel}
          </p>
          <p className="cds-stack__pipeline-step">
            {pipeline?.regeneration?.jobId
              ? `Regenerating ${pipeline.currentLayerLabel ?? 'layer'} (attempt ${pipeline.regeneration.attempt}, job ${pipeline.regeneration.jobId}) — shell preserved`
              : pipeline?.productionStageLabel
                ? pipeline.productionStageLabel
                : pipeline?.phase === 'queued'
                  ? `Queued · ${pipeline.currentLayerLabel ?? 'preparing'}…`
                  : pipeline?.currentLayerLabel
                    ? `Generating ${pipeline.currentLayerLabel}…`
                    : isWorldCompiler
                      ? 'Compiling world…'
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
          {layer1Failure?.state === 'FAILED_AT_LAYER_1' ? (
            <>
              <p style={{ fontWeight: 800, letterSpacing: '0.06em' }}>
                {layer1Failure.failedLayerLabel} rejected
              </p>
              <p style={{ marginTop: 6, fontSize: 11, lineHeight: 1.5 }}>
                Layer 1 ({layer1Failure.failedLayerLabel}) failed after shell loaded successfully.
              </p>
              <dl style={{ margin: '8px 0 0', fontSize: 10, lineHeight: 1.6, textAlign: 'left' }}>
                <div>
                  <dt style={{ display: 'inline', fontWeight: 700 }}>Error code: </dt>
                  <dd style={{ display: 'inline', margin: 0 }}>{layer1Failure.errorCode ?? 'UNKNOWN'}</dd>
                </div>
                <div>
                  <dt style={{ display: 'inline', fontWeight: 700 }}>Failed stage: </dt>
                  <dd style={{ display: 'inline', margin: 0 }}>{layer1Failure.failedTransition}</dd>
                </div>
                <div>
                  <dt style={{ display: 'inline', fontWeight: 700 }}>Function: </dt>
                  <dd style={{ display: 'inline', margin: 0 }}>{layer1Failure.failedFunction}</dd>
                </div>
                <div>
                  <dt style={{ display: 'inline', fontWeight: 700 }}>Compile run: </dt>
                  <dd style={{ display: 'inline', margin: 0 }}>{layer1Failure.compileRunId ?? '—'}</dd>
                </div>
                <div>
                  <dt style={{ display: 'inline', fontWeight: 700 }}>Shell ID: </dt>
                  <dd style={{ display: 'inline', margin: 0 }}>{layer1Failure.shellId ?? '—'}</dd>
                </div>
                <div>
                  <dt style={{ display: 'inline', fontWeight: 700 }}>Last success: </dt>
                  <dd style={{ display: 'inline', margin: 0 }}>{layer1Failure.lastSuccessfulTransition ?? '—'}</dd>
                </div>
                <div>
                  <dt style={{ display: 'inline', fontWeight: 700 }}>Detail: </dt>
                  <dd style={{ display: 'inline', margin: 0 }}>{layer1Failure.errorMessage}</dd>
                </div>
              </dl>
              {layer1Failure.onCopyDiagnostics ? (
                <button
                  type="button"
                  className="cds-genesis__btn"
                  style={{ marginTop: 10 }}
                  onClick={layer1Failure.onCopyDiagnostics}
                >
                  Copy Layer 1 diagnostics
                </button>
              ) : null}
            </>
          ) : (
            <>
              <p>Layer generation failed.</p>
              {onRegenerateLayer && sceneGraph?.shellLocked ? (
                <button
                  type="button"
                  className="cds-genesis__btn"
                  onClick={() => {
                    const failedLayer =
                      layers.find((l) => l.status === 'failed')?.layerId ??
                      pipeline?.currentLayerId ??
                      'signature-landmark';
                    onRegenerateLayer(failedLayer);
                  }}
                >
                  Retry failed layer
                </button>
              ) : onRegenerateLayer ? (
                <button
                  type="button"
                  className="cds-genesis__btn"
                  onClick={() => onRegenerateLayer('environment-shell')}
                >
                  Retry Shell Layer
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {!isBuilding && (status === 'idle' || status === 'partial' || status === 'ready') && !isStoryTable ? (
        <p className="cds-stack__viewport-hint">
          {isWorldCompiler ? 'World Compiler™' : 'Scene Stack™'} {approvedLayers.length}/{layers.length}{' '}
          layers
          {sceneGraph?.shellLocked ? ' · Shell Locked™' : ''}
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
