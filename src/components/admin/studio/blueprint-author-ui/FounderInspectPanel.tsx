import type { CSSProperties } from 'react';
import type { AssetInspectorPanel } from '../../../../studio-os-core/construction-mode/asset-inspector';

const panelStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  width: 'min(360px, 92vw)',
  height: '100vh',
  background: 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(16px)',
  borderLeft: '1px solid #e5e7eb',
  padding: 20,
  zIndex: 1200,
  overflowY: 'auto',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
  boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
};

const actionBtn: CSSProperties = {
  padding: '8px 12px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  background: '#fff',
  cursor: 'pointer',
};

type Props = {
  inspector: AssetInspectorPanel;
  lightingInfluence?: number;
  onClose: () => void;
  onInspectBlueprint?: () => void;
};

/** Inspect Mode — contextual side panel, no engineering hunt. */
export function FounderInspectPanel({ inspector, lightingInfluence = 87, onClose, onInspectBlueprint }: Props) {
  const displayName = inspector.assetId.replace(/([A-Z])/g, ' $1').replace(/-/g, ' ').trim();

  return (
    <aside data-founder-inspect-panel style={panelStyle}>
      <button type="button" onClick={onClose} style={{ ...actionBtn, marginBottom: 16 }}>
        Close
      </button>
      <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        INSPECT
      </p>
      <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, textTransform: 'capitalize' }}>
        {displayName}
      </h3>

      <InspectRow label="Current Version" value={`v${inspector.assetVersion}`} />
      <InspectRow label="Material" value={inspector.materialLibrary.replace(/-/g, ' ')} />
      <InspectRow label="Lighting Influence" value={`${lightingInfluence}%`} />
      <InspectRow label="Socket" value={inspector.socketId} />
      <InspectRow label="Assigned Worker" value={inspector.manufacturer} />
      <InspectRow label="Health" value={inspector.health} />

      {inspector.dependencies.length > 0 ? (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Dependencies</p>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {inspector.dependencies.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
        {(['Replace', 'Modify', 'Lock', 'Regenerate', 'Duplicate'] as const).map((label) => (
          <button key={label} type="button" style={actionBtn}>
            {label}
          </button>
        ))}
        {onInspectBlueprint ? (
          <button type="button" style={{ ...actionBtn, borderColor: '#eb1c24', color: '#eb1c24' }} onClick={onInspectBlueprint}>
            Inspect Blueprint
          </button>
        ) : null}
      </div>

      <p style={{ marginTop: 20, fontSize: '10px', color: '#94a3b8' }}>
        Localized edits regenerate only this asset. The entire room never rebuilds.
      </p>
    </aside>
  );
}

function InspectRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontWeight: 600 }}>{value}</p>
    </div>
  );
}
