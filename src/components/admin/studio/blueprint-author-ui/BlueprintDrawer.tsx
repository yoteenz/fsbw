import type { CSSProperties, ReactNode } from 'react';
import { BlueprintPreview } from './BlueprintPreview';
import type { WorldPreviewModel } from '../../../../studio-os-core/construction-mode/world-preview';
import type { ConstructionModeSession } from '../../../../studio-os-core/construction-mode/construction-mode-session';

type Props = {
  open: boolean;
  onToggle: () => void;
  worldPreview: WorldPreviewModel;
  session: ConstructionModeSession;
  selectedAssetId?: string | null;
  onSelectAsset?: (assetId: string) => void;
  children?: ReactNode;
};

const toggleStyle: CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  background: '#f8fafc',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

/** Worker View — engineering blueprint (Output B). Collapsed by default. */
export function BlueprintDrawer({ open, onToggle, worldPreview, session, selectedAssetId, onSelectAsset, children }: Props) {
  return (
    <div data-blueprint-drawer style={{ marginTop: 20, fontFamily: 'system-ui, sans-serif' }}>
      <button type="button" style={toggleStyle} onClick={onToggle} aria-expanded={open}>
        <span>Open Blueprint · Engineering View</span>
        <span style={{ fontSize: '14px', color: '#64748b' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open ? (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            background: '#f1f5f9',
            borderRadius: 12,
            border: '1px dashed #94a3b8',
          }}
        >
          <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#475569' }}>
            WORKER VIEW · SOCKETS · DEPENDENCIES · CONSTRUCTION NODES
          </p>
          <BlueprintPreview
            worldPreview={worldPreview}
            session={session}
            selectedAssetId={selectedAssetId}
            onSelectAsset={onSelectAsset}
            engineeringMode
          />
          {children}
        </div>
      ) : null}
    </div>
  );
}
