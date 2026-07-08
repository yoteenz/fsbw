import type { WarehouseAsset } from '../../../../studio-os-core/studio-warehouse';
import { buildCompareRows } from '../../../../studio-os-core/studio-warehouse/intelligence';

type Props = {
  assets: WarehouseAsset[];
  onRemove: (id: string) => void;
  onClear: () => void;
};

function previewStyle(asset: WarehouseAsset): React.CSSProperties {
  if (asset.previewUrl) {
    return {
      backgroundImage: `url(${asset.previewUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: asset.previewGradient };
}

/**
 * Compare Mode™ — Studio World's design review room.
 * Side-by-side asset comparison for founder decisions.
 */
export function WarehouseCompareMode({ assets, onRemove, onClear }: Props) {
  if (assets.length === 0) return null;

  const rows = buildCompareRows(assets);

  return (
    <div className="wh-campus__compare" aria-label="Compare Mode">
      <header className="wh-campus__compare-header">
        <p className="wh-campus__compare-title">Compare Mode™</p>
        <p className="wh-campus__compare-sub">Design review room · {assets.length} assets selected</p>
        <button type="button" className="wh-campus__compare-clear" onClick={onClear}>
          Clear
        </button>
      </header>

      <div className="wh-campus__compare-scroll">
        <div className="wh-campus__compare-grid">
          {assets.map((asset) => (
            <div key={asset.id} className="wh-campus__compare-column">
              <div className="wh-campus__compare-preview" style={previewStyle(asset)} aria-hidden />
              <p className="wh-campus__compare-name">{asset.name}</p>
              <button type="button" className="wh-campus__compare-remove" onClick={() => onRemove(asset.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <table className="wh-campus__compare-table">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th>{row.label}</th>
                {row.values.map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
