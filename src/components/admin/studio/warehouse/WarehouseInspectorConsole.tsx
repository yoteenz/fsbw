import type { WarehouseAsset } from '../../../../studio-os-core/studio-warehouse';
import { WarehouseMetaGrid } from './WarehousePanels';

type Props = {
  asset: WarehouseAsset | null;
  recommendReuse: boolean;
  onFavorite: () => void;
  onArchive: () => void;
  onRotate: (delta: number) => void;
  onZoom: (delta: number) => void;
  onResetPreview: () => void;
  onApply?: () => void;
  applyLabel?: string;
};

/** Diegetic inspector console — embedded in gallery architecture, not a sidebar panel. */
export function WarehouseInspectorConsole({
  asset,
  recommendReuse,
  onFavorite,
  onArchive,
  onRotate,
  onZoom,
  onResetPreview,
  onApply,
  applyLabel,
}: Props) {
  if (!asset) {
    return (
      <div className="wh-world__inspector wh-world__inspector--idle">
        <p className="wh-world__label">Asset Registry™</p>
        <p className="wh-world__hint">Select an object on the floor to preview · rotate · compare · apply</p>
      </div>
    );
  }

  return (
    <div className="wh-world__inspector">
      <p className="wh-world__label">{asset.name}</p>
      <p className="wh-world__hint">
        {asset.version} · {asset.department} · {asset.usageCount} uses
      </p>
      {recommendReuse ? (
        <p className="wh-world__reuse-banner">Reuse recommended — save generation cost</p>
      ) : null}
      <div className="wh-world__inspector-preview">
        <div
          className="wh-world__inspector-plate"
          style={
            asset.previewUrl
              ? { backgroundImage: `url(${asset.previewUrl})` }
              : { background: asset.previewGradient }
          }
          aria-hidden
        />
      </div>
      <div className="wh-world__btn-row">
        <button type="button" className="wh-world__btn" onClick={() => onRotate(-15)}>
          Rotate ←
        </button>
        <button type="button" className="wh-world__btn" onClick={() => onRotate(15)}>
          Rotate →
        </button>
        <button type="button" className="wh-world__btn" onClick={() => onZoom(0.1)}>
          Zoom +
        </button>
        <button type="button" className="wh-world__btn" onClick={() => onZoom(-0.1)}>
          Zoom −
        </button>
        <button type="button" className="wh-world__btn" onClick={onResetPreview}>
          Reset
        </button>
      </div>
      <div className="wh-world__btn-row">
        <button type="button" className="wh-world__btn" onClick={onFavorite}>
          {asset.favorite ? 'Unfavorite' : 'Favorite'}
        </button>
        <button type="button" className="wh-world__btn" onClick={onArchive}>
          Archive
        </button>
        {onApply ? (
          <button type="button" className="wh-world__btn wh-world__btn--gold" onClick={onApply}>
            {applyLabel ?? 'Apply to Workspace™'}
          </button>
        ) : null}
      </div>
      <div className="wh-world__meta-scroll">
        <WarehouseMetaGrid asset={asset} />
      </div>
    </div>
  );
}
