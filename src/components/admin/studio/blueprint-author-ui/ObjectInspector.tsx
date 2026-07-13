import type { CSSProperties } from 'react';
import type { AssetInspectorPanel } from '../../../../studio-os-core/construction-mode/asset-inspector';

const panelStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  fontFamily: 'system-ui, sans-serif',
  fontSize: '12px',
};

type Props = {
  inspector: AssetInspectorPanel;
};

/** Selectable placeholder object inspector — no generation required. */
export function ObjectInspector({ inspector }: Props) {
  const rows: Array<[string, string]> = [
    ['Object ID', inspector.assetId],
    ['Blueprint Version', inspector.assetVersion],
    ['DNA Version', inspector.dnaRevision],
    ['Render Intent', inspector.renderIntentId ?? '—'],
    ['Assigned Worker', inspector.manufacturer],
    ['Material Library', inspector.materialLibrary],
    ['Health', inspector.health],
    ['Socket', inspector.socketId],
    ['Status', inspector.status],
    ['Expected Output', `${inspector.expectedDimensions.width}×${inspector.expectedDimensions.height}×${inspector.expectedDimensions.depth}`],
  ];

  return (
    <div data-blueprint-object-inspector style={panelStyle}>
      <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        OBJECT INSPECTOR
      </p>
      <dl style={{ margin: 0, display: 'grid', gap: 10 }}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt style={{ fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>{label}</dt>
            <dd style={{ margin: '2px 0 0' }}>{value}</dd>
          </div>
        ))}
      </dl>
      {inspector.dependencies.length > 0 ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Dependencies</p>
          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
            {inspector.dependencies.map((dep) => (
              <li key={dep}>{dep}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {inspector.inspectionRules.length > 0 ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Inspection rules</p>
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: '11px' }}>
            {inspector.inspectionRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
