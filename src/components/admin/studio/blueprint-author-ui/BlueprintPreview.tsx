import type { CSSProperties } from 'react';
import type { WorldPreviewModel } from '../../../../studio-os-core/construction-mode/world-preview';
import type { ConstructionModeSession } from '../../../../studio-os-core/construction-mode/construction-mode-session';

const shellStyle: CSSProperties = {
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
  border: '1px solid #cbd5e1',
  borderRadius: 12,
  overflow: 'hidden',
};

type Props = {
  worldPreview: WorldPreviewModel;
  session: ConstructionModeSession;
  onSelectAsset?: (assetId: string) => void;
  selectedAssetId?: string | null;
};

/** Procedural clay blueprint preview — not AI-generated. */
export function BlueprintPreview({ worldPreview, session, onSelectAsset, selectedAssetId }: Props) {
  return (
    <div data-blueprint-preview style={{ fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', color: '#374151' }}>
        BLUEPRINT PREVIEW · {worldPreview.renderStyle}
      </p>
      <div style={shellStyle}>
        <div
          style={{
            position: 'absolute',
            inset: '8%',
            background: '#fff',
            border: '2px solid #94a3b8',
            borderRadius: 8,
            opacity: 0.9,
          }}
          title={worldPreview.architecture.label}
        />
        {worldPreview.placeholderAssets.map((asset) => (
          <button
            key={asset.assetId}
            type="button"
            onClick={() => onSelectAsset?.(asset.assetId)}
            style={{
              position: 'absolute',
              left: asset.bounds.left,
              top: asset.bounds.top,
              width: asset.bounds.width,
              height: asset.bounds.height,
              background: selectedAssetId === asset.assetId ? 'rgba(235,28,36,0.35)' : 'rgba(100,116,139,0.45)',
              border: selectedAssetId === asset.assetId ? '2px solid #eb1c24' : '1px dashed #64748b',
              borderRadius: 4,
              cursor: onSelectAsset ? 'pointer' : 'default',
              padding: 0,
            }}
            title={asset.label}
          />
        ))}
        {worldPreview.sockets.map((socket) => (
          <div
            key={socket.socketId}
            style={{
              position: 'absolute',
              left: socket.bounds.left,
              top: socket.bounds.top,
              width: socket.bounds.width,
              height: socket.bounds.height,
              border: '2px dashed #3b82f6',
              borderRadius: 4,
              pointerEvents: 'none',
              opacity: 0.7,
            }}
            title={socket.label}
          />
        ))}
        {worldPreview.lightingVolumes.map((vol) => (
          <div
            key={vol.volumeId}
            style={{
              position: 'absolute',
              left: vol.bounds.left,
              top: vol.bounds.top,
              width: vol.bounds.width,
              height: vol.bounds.height,
              background: 'rgba(250,204,21,0.2)',
              borderRadius: 8,
              pointerEvents: 'none',
            }}
          />
        ))}
        {worldPreview.cameraMarkers.slice(0, 3).map((cam, i) => (
          <div
            key={cam.anchorId}
            style={{
              position: 'absolute',
              left: `${12 + i * 8}%`,
              top: '6%',
              fontSize: '9px',
              padding: '2px 6px',
              background: '#1e293b',
              color: '#fff',
              borderRadius: 4,
            }}
          >
            📷 {cam.label}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, fontSize: '10px' }}>
        <PreviewMeta label="Architecture" value={worldPreview.architecture.shellId} />
        <PreviewMeta label="Sockets" value={String(worldPreview.sockets.length)} />
        <PreviewMeta label="Navigation" value={String(worldPreview.navigationNodes.length)} />
        <PreviewMeta label="Lighting zones" value={String(worldPreview.lightingVolumes.length)} />
        <PreviewMeta label="Dependencies" value={String(session.dependencies.edges.length)} />
        <PreviewMeta label="Generation" value={worldPreview.generationOccurred ? 'yes' : 'no'} />
      </div>
    </div>
  );
}

function PreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 8, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
      <span style={{ display: 'block', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
