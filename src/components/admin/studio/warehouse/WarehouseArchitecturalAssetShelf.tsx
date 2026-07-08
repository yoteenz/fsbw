import type { CSSProperties } from 'react';
import type { WarehouseAsset } from '../../../../studio-os-core/studio-warehouse';
import { buildReuseIntelligence, computeQualityScore } from '../../../../studio-os-core/studio-warehouse/intelligence';

type Props = {
  assets: WarehouseAsset[];
  selectedAssetId: string | null;
  compareAssetIds: string[];
  compareMode: boolean;
  transitioningAssetId: string | null;
  onSelectAsset: (id: string) => void;
  onToggleCompare: (id: string) => void;
};

function previewStyle(asset: WarehouseAsset): CSSProperties {
  if (asset.previewUrl) {
    return {
      backgroundImage: `url(${asset.previewUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: asset.previewGradient };
}

function formatCategory(category: string): string {
  return category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Architectural Asset Shelf™ — museum exhibition pedestals in horizontal scroll.
 * ERA 2 — WORLD™ · Warehouse Industrial Design Campus™
 */
export function WarehouseArchitecturalAssetShelf({
  assets,
  selectedAssetId,
  compareAssetIds,
  compareMode,
  transitioningAssetId,
  onSelectAsset,
  onToggleCompare,
}: Props) {
  const display = assets.length > 0 ? assets : [];

  return (
    <div className="wh-campus__shelf" aria-label="Architectural Asset Shelf">
      <div className="wh-campus__shelf-rail" aria-hidden />
      <div className="wh-campus__shelf-track">
        {display.length === 0 ? (
          <p className="wh-campus__shelf-empty">
            Generation completes → asset enters this wing → select a pedestal to inspect
          </p>
        ) : (
          display.map((asset) => {
            const selected = selectedAssetId === asset.id;
            const inCompare = compareAssetIds.includes(asset.id);
            const transitioning = transitioningAssetId === asset.id;
            const reuse = buildReuseIntelligence(asset);
            const quality = computeQualityScore(asset);

            return (
              <article
                key={asset.id}
                className={`wh-campus__pedestal${selected ? ' is-selected' : ''}${inCompare ? ' is-compare' : ''}${transitioning ? ' is-rising' : ''}${asset.favorite ? ' is-favorite' : ''}${asset.archived ? ' is-archived' : ''}`}
              >
                <button
                  type="button"
                  className="wh-campus__pedestal-select"
                  onClick={() => onSelectAsset(asset.id)}
                  aria-pressed={selected}
                  aria-label={`Inspect ${asset.name}`}
                >
                  <div className="wh-campus__pedestal-light" aria-hidden />
                  <div className="wh-campus__pedestal-preview" style={previewStyle(asset)} aria-hidden />
                  <div className="wh-campus__pedestal-plinth" aria-hidden />
                </button>

                <div className="wh-campus__pedestal-meta">
                  <p className="wh-campus__pedestal-name">{asset.name}</p>
                  <p className="wh-campus__pedestal-category">{formatCategory(asset.category)}</p>
                  <div className="wh-campus__pedestal-stats">
                    <span>${asset.generationCostUsd.toFixed(2)}</span>
                    <span className="wh-campus__pedestal-savings">−${reuse.savingsUsd.toFixed(2)} reuse</span>
                    <span>{asset.reuseCount}× reuse</span>
                    <span>{quality.score} quality</span>
                  </div>
                  <div className="wh-campus__pedestal-footer">
                    <span>{asset.version}</span>
                    <span>{asset.workspace}</span>
                    <span>{asset.generationDate}</span>
                  </div>
                  <div className="wh-campus__pedestal-badges">
                    {asset.favorite ? <span className="wh-campus__badge wh-campus__badge--gold">★</span> : null}
                    {asset.archived ? <span className="wh-campus__badge">Archived</span> : null}
                    {reuse.reuseEfficiencyPct >= 90 ? (
                      <span className="wh-campus__badge wh-campus__badge--green">Reuse {reuse.reuseEfficiencyPct}%</span>
                    ) : null}
                  </div>
                </div>

                {compareMode ? (
                  <button
                    type="button"
                    className={`wh-campus__compare-toggle${inCompare ? ' is-active' : ''}`}
                    onClick={() => onToggleCompare(asset.id)}
                    aria-pressed={inCompare}
                  >
                    {inCompare ? 'In Compare' : 'Compare'}
                  </button>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
