import type { WarehouseAsset } from '../../../../studio-os-core/studio-warehouse';
import { WAREHOUSE_DISTRICTS } from '../../../../studio-os-core/studio-warehouse';
import { whSectionTitle } from './warehouseTheme';

type Props = {
  asset: WarehouseAsset;
  selected: boolean;
  onSelect: () => void;
};

export function WarehouseAssetCard({ asset, selected, onSelect }: Props) {
  const style = asset.previewUrl
    ? { backgroundImage: `url(${asset.previewUrl})` }
    : { background: asset.previewGradient };

  return (
    <button
      type="button"
      className={`wh-asset-card${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="wh-asset-card__preview" style={style} aria-hidden />
      <div className="wh-asset-card__meta">
        <p className="wh-asset-card__name">{asset.name}</p>
        <p className="wh-asset-card__ver">
          {asset.version} · {asset.provider}
        </p>
      </div>
    </button>
  );
}

export function WarehouseDistrictHeader({ districtId }: { districtId: string }) {
  const district = WAREHOUSE_DISTRICTS.find((d) => d.id === districtId);
  if (!district) return null;
  return (
    <>
      <p className="wh-district-label">
        {district.icon} {district.label}
      </p>
      <p className="wh-district-tagline">{district.tagline}</p>
    </>
  );
}

export function WarehouseMetaGrid({ asset }: { asset: WarehouseAsset }) {
  const rows: Array<[string, string]> = [
    ['Version', asset.version],
    ['Department', asset.department],
    ['Workspace', asset.workspace],
    ['Generated', asset.generationDate],
    ['Cost', `$${asset.generationCostUsd.toFixed(2)}`],
    ['Provider', asset.provider],
    ['Usage', String(asset.usageCount)],
    ['Reuse', String(asset.reuseCount)],
    ['Marketplace', asset.marketplaceStatus.replace('-', ' ')],
    ['Genome Match', `${asset.genomeCompatibilityPct}%`],
    ['Golden Builds', String(asset.goldenBuildCount)],
  ];
  return (
    <div style={{ marginTop: 8 }}>
      <p style={whSectionTitle}>Asset Record</p>
      {rows.map(([label, value]) => (
        <div key={label} className="wh-meta-row">
          <span>{label}</span>
          <span style={{ color: '#f5f0e8', textAlign: 'right' }}>{value}</span>
        </div>
      ))}
      {asset.similarAssetIds.length > 0 ? (
        <p style={{ ...whSectionTitle, marginTop: 8 }}>Similar · Compatible Packs</p>
      ) : null}
      {asset.compatibleScenePackIds.length > 0 ? (
        <p style={{ fontSize: 4, opacity: 0.65, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {asset.compatibleScenePackIds.join(' · ')}
        </p>
      ) : null}
    </div>
  );
}
