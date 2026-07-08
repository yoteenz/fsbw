import type { CSSProperties } from 'react';
import type { WarehouseAsset } from '../../../../studio-os-core/studio-warehouse';
import type { WarehouseCameraZone } from './warehouseCameraZones';

type Props = {
  zone: WarehouseCameraZone;
  assets: WarehouseAsset[];
  selectedAssetId: string | null;
  previewRotation: number;
  previewZoom: number;
  onSelectAsset: (id: string) => void;
};

function pedestalStyle(index: number, layout: WarehouseCameraZone['galleryLayout']): CSSProperties {
  const cols = layout === 'swatches' ? 4 : layout === 'capsules' ? 3 : 2;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const left = 8 + col * (84 / cols);
  const top = layout === 'vault' ? 18 + row * 22 : 12 + row * 28;

  const base: CSSProperties = {
    left: `${left}%`,
    top: `${top}%`,
    width: layout === 'swatches' ? '18%' : layout === 'capsules' ? '24%' : '36%',
    height: layout === 'swatches' ? '16%' : layout === 'capsules' ? '28%' : '32%',
  };

  if (layout === 'capsules') {
    return { ...base, borderRadius: '50% 50% 12% 12%' };
  }
  return base;
}

function previewBackground(asset: WarehouseAsset): CSSProperties {
  if (asset.previewUrl) {
    return { backgroundImage: `url(${asset.previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return { background: asset.previewGradient };
}

/**
 * Physical asset floor — objects exist in gallery space, not card grids.
 */
export function WarehouseGalleryFloor({
  zone,
  assets,
  selectedAssetId,
  previewRotation,
  previewZoom,
  onSelectAsset,
}: Props) {
  const layout = zone.galleryLayout ?? 'showroom';
  const display = assets.slice(0, layout === 'swatches' ? 8 : 6);

  if (!zone.districtId) return null;

  return (
    <div className={`wh-world__gallery wh-world__gallery--${layout}`} aria-label={`${zone.label} objects`}>
      {display.length === 0 ? (
        <p className="wh-world__gallery-empty">
          Generation completes → asset enters {zone.shortLabel} → walk to preview
        </p>
      ) : (
        display.map((asset, i) => {
          const selected = selectedAssetId === asset.id;
          return (
            <button
              key={asset.id}
              type="button"
              className={`wh-world__pedestal${selected ? ' is-selected' : ''}${layout === 'capsules' ? ' is-capsule' : ''}`}
              style={pedestalStyle(i, layout)}
              onClick={() => onSelectAsset(asset.id)}
              aria-pressed={selected}
              title={asset.name}
            >
              <div
                className="wh-world__pedestal-object"
                style={{
                  ...previewBackground(asset),
                  transform: selected
                    ? `rotateY(${previewRotation}deg) scale(${previewZoom})`
                    : `rotateY(${i * 12}deg)`,
                }}
                aria-hidden
              />
              <span className="wh-world__pedestal-label">{asset.name}</span>
            </button>
          );
        })
      )}
    </div>
  );
}
