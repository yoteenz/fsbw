import type { SceneGenesisSceneStatus } from '../../../../studio-os-core/scene-genesis';

type Props = {
  imageUrl: string | null;
  status: SceneGenesisSceneStatus;
  stationLabel: string;
  onRegenerate?: () => void;
};

/**
 * Full-viewport FAL-generated environment plate.
 * Architecture comes from Scene Genesis™ — not CSS.
 */
export function SceneGenesisViewport({ imageUrl, status, stationLabel, onRegenerate }: Props) {
  return (
    <div className="cds-genesis__viewport" aria-label={`${stationLabel} environment`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="cds-genesis__plate"
          decoding="async"
          draggable={false}
        />
      ) : (
        <div className="cds-genesis__plate-fallback" aria-hidden />
      )}
      <div className="cds-genesis__viewport-vignette" aria-hidden />
      {status === 'generating' ? (
        <p className="cds-genesis__viewport-status" role="status">
          Scene Genesis™ — generating {stationLabel}…
        </p>
      ) : null}
      {status === 'failed' ? (
        <div className="cds-genesis__viewport-error">
          <p>Environment generation failed.</p>
          {onRegenerate ? (
            <button type="button" className="cds-genesis__btn" onClick={onRegenerate}>
              Retry Genesis
            </button>
          ) : null}
        </div>
      ) : null}
      {status === 'idle' && !imageUrl ? (
        <p className="cds-genesis__viewport-hint">Scene Genesis™ pending — environment will generate.</p>
      ) : null}
    </div>
  );
}
