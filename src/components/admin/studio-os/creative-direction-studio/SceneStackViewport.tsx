import type { SceneStackCompositeStatus, SceneStackLayerView } from '../../../../studio-os-core/scene-stack';

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

      {status === 'idle' || status === 'partial' ? (
        <p className="cds-stack__viewport-hint">
          Scene Stack™ {approvedLayers.length}/{layers.length} layers
        </p>
      ) : null}
    </div>
  );
}
