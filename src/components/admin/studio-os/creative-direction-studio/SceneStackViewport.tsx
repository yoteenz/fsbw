import type { SceneStackCompositeStatus, SceneStackLayerView } from '../../../../studio-os-core/scene-stack';

const LAYER_SHORT_LABELS: Record<string, string> = {
  'environment-shell': 'Shell',
  'signature-landmark': 'Landmark',
  'furniture-objects': 'Furniture',
  'lighting-systems': 'Lighting',
  'atmospheric-systems': 'Atmosphere',
  'surface-materials': 'Materials',
  'ambient-motion': 'Motion',
  'founder-personalization': 'Personal',
};

type Props = {
  layers: SceneStackLayerView[];
  status: SceneStackCompositeStatus;
  stationLabel: string;
  onRegenerateLayer?: (layerId: string) => void;
};

/**
 * Composites independently generated Scene Stack™ layers.
 * NEVER a single complete scene image.
 */
export function SceneStackViewport({ layers, status, stationLabel, onRegenerateLayer }: Props) {
  const approvedLayers = layers.filter((l) => l.publicUrl && l.status !== 'failed');
  const generatableLayers = layers.filter((l) => l.definition.generatable);
  const showLayerStrip =
    Boolean(onRegenerateLayer) &&
    generatableLayers.some((l) => l.publicUrl || l.status === 'failed' || l.status === 'generating');

  return (
    <div className="cds-stack__viewport" aria-label={`${stationLabel} layered environment`}>
      {approvedLayers.length === 0 ? (
        <div className="cds-stack__plate-fallback" aria-hidden />
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

      {status === 'building' ? (
        <p className="cds-stack__viewport-status" role="status">
          Scene Stack™ — assembling {stationLabel}…
        </p>
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

      {status === 'idle' || status === 'partial' || status === 'ready' ? (
        <p className="cds-stack__viewport-hint">
          Scene Stack™ {approvedLayers.length}/{layers.length} layers
        </p>
      ) : null}

      {showLayerStrip ? (
        <div className="cds-stack__layer-strip" aria-label={`${stationLabel} layer controls`}>
          {generatableLayers.map((layer) => {
            const canRegen = Boolean(layer.publicUrl) && layer.status !== 'generating';
            const isGenerating = layer.status === 'generating';
            const label = LAYER_SHORT_LABELS[layer.layerId] ?? layer.definition.displayName;
            return (
              <div key={layer.layerId} className="cds-stack__layer-strip-row">
                <span
                  className={`cds-stack__layer-strip-dot${layer.publicUrl ? ' is-ready' : ''}${layer.status === 'failed' ? ' is-failed' : ''}`}
                  aria-hidden
                />
                <span className="cds-stack__layer-strip-label">{label}</span>
                {isGenerating ? (
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
