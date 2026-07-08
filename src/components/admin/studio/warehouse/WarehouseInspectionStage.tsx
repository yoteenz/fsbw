import type { CSSProperties } from 'react';
import type { WarehouseAsset } from '../../../../studio-os-core/studio-warehouse';
import { buildReuseIntelligence, computeQualityScore } from '../../../../studio-os-core/studio-warehouse/intelligence';

type Props = {
  asset: WarehouseAsset | null;
  previewRotation: number;
  previewZoom: number;
  inspectionActive: boolean;
  onRotate: (delta: number) => void;
  onZoom: (delta: number) => void;
  onResetPreview: () => void;
  onOpenInspector: () => void;
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

/**
 * Hero inspection viewport — ~70% of workspace.
 * Asset sits on illuminated pedestal inside luxury design gallery.
 */
export function WarehouseInspectionStage({
  asset,
  previewRotation,
  previewZoom,
  inspectionActive,
  onRotate,
  onZoom,
  onResetPreview,
  onOpenInspector,
}: Props) {
  if (!asset) {
    return (
      <div className="wh-campus__stage wh-campus__stage--idle">
        <div className="wh-campus__stage-vignette" aria-hidden />
        <div className="wh-campus__stage-pedestal wh-campus__stage-pedestal--empty" aria-hidden />
        <div className="wh-campus__stage-idle-copy">
          <p className="wh-campus__stage-label">Inspection Stage™</p>
          <p className="wh-campus__stage-hint">
            Select an asset from the Architectural Asset Shelf™ — it travels here for museum-quality inspection
          </p>
        </div>
      </div>
    );
  }

  const reuse = buildReuseIntelligence(asset);
  const quality = computeQualityScore(asset);

  return (
    <div className={`wh-campus__stage${inspectionActive ? ' is-inspecting' : ''}`}>
      <div className="wh-campus__stage-vignette" aria-hidden />
      <div className="wh-campus__stage-spotlight" aria-hidden />

      <div className="wh-campus__stage-hero">
        <div
          className="wh-campus__stage-object"
          style={{
            ...previewStyle(asset),
            transform: `rotateY(${previewRotation}deg) scale(${previewZoom})`,
          }}
          aria-label={asset.name}
        />
        <div className="wh-campus__stage-plinth" aria-hidden />
      </div>

      <div className="wh-campus__stage-controls">
        <button type="button" className="wh-campus__stage-btn" onClick={() => onRotate(-15)}>
          Orbit ←
        </button>
        <button type="button" className="wh-campus__stage-btn" onClick={() => onRotate(15)}>
          Orbit →
        </button>
        <button type="button" className="wh-campus__stage-btn" onClick={() => onZoom(0.12)}>
          Zoom +
        </button>
        <button type="button" className="wh-campus__stage-btn" onClick={() => onZoom(-0.12)}>
          Zoom −
        </button>
        <button type="button" className="wh-campus__stage-btn" onClick={onResetPreview}>
          Reset
        </button>
        <button type="button" className="wh-campus__stage-btn wh-campus__stage-btn--gold" onClick={onOpenInspector}>
          Inspector →
        </button>
      </div>

      <div className="wh-campus__stage-intelligence">
        <p className="wh-campus__stage-title">{asset.name}</p>
        <p className="wh-campus__stage-sub">
          {asset.version} · {asset.category.replace(/-/g, ' ')} · Quality {quality.grade} ({quality.score})
        </p>
        <div className="wh-campus__reuse-strip">
          <div className="wh-campus__reuse-item">
            <span className="wh-campus__reuse-label">Gen cost</span>
            <span>${reuse.generationCostUsd.toFixed(2)}</span>
          </div>
          <div className="wh-campus__reuse-item wh-campus__reuse-item--highlight">
            <span className="wh-campus__reuse-label">Reuse instead</span>
            <span>${reuse.reuseCostUsd.toFixed(2)}</span>
          </div>
          <div className="wh-campus__reuse-item">
            <span className="wh-campus__reuse-label">Savings</span>
            <span>${reuse.totalSavingsUsd.toFixed(2)}</span>
          </div>
          <div className="wh-campus__reuse-item">
            <span className="wh-campus__reuse-label">Used in</span>
            <span>{reuse.usedInCount} workspaces</span>
          </div>
          <div className="wh-campus__reuse-item">
            <span className="wh-campus__reuse-label">Efficiency</span>
            <span>{reuse.reuseEfficiencyPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
