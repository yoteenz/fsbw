import type { CSSProperties } from 'react';
import { useImmuneSystemHealth } from '../../../../hooks/useImmuneSystemHealth';

const sectionStyle: CSSProperties = {
  marginTop: 12,
  padding: 10,
  border: '1px solid #d6d3d1',
  borderRadius: 6,
  background: '#fafaf9',
  fontSize: 10,
  lineHeight: 1.5,
};

export function ImmuneSystemPanel() {
  const { health, incidents, loading, error, refresh } = useImmuneSystemHealth();

  const copyReport = () => {
    const payload = { health, incidents, exportedAt: new Date().toISOString() };
    void navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
  };

  const gg = health?.subsystems?.governedGeneration;

  return (
    <section style={sectionStyle} data-immune-system-panel aria-label="Studio OS Immune System">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <strong style={{ letterSpacing: '0.06em', fontSize: 11 }}>IMMUNE SYSTEM™ — Schema Drift</strong>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" onClick={() => void refresh()} style={btnStyle} disabled={loading}>
            Refresh
          </button>
          <button type="button" onClick={copyReport} style={btnStyle}>
            Export JSON
          </button>
        </div>
      </div>

      {error ? <p style={{ color: '#991b1b', margin: '8px 0 0' }}>{error}</p> : null}

      <dl style={{ margin: '8px 0 0', display: 'grid', gap: 4 }}>
        <Row label="Environment" value={health?.environment ?? '—'} />
        <Row label="Project" value={health?.projectRef ?? '—'} />
        <Row label="Auto-repair" value={health?.autoRepairEnabled ? 'enabled' : 'disabled'} />
        <Row label="Target verified" value={health?.productionTargetVerified ? 'yes' : 'no'} />
        <Row label="Governed generation" value={gg?.health ?? '—'} />
        <Row label="Deployment ready" value={health?.deploymentReadiness?.ready ? 'yes' : 'blocked'} />
      </dl>

      {gg?.missingResources?.length ? (
        <p style={{ margin: '6px 0 0', color: '#b45309' }}>Missing: {gg.missingResources.join(', ')}</p>
      ) : null}
      {gg?.message ? <p style={{ margin: '4px 0 0', color: '#57534e' }}>{gg.message}</p> : null}

      {incidents.length > 0 ? (
        <div style={{ marginTop: 8 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Recent incidents ({incidents.length})</p>
          <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
            {incidents.slice(0, 5).map((inc) => (
              <li key={inc.incidentId}>
                {inc.finalStatus} — {inc.symptom.slice(0, 80)}
                {inc.repairAuthorized ? ' · repair authorized' : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{ margin: '8px 0 0', color: '#78716c' }}>No immune incidents recorded in this runtime.</p>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ display: 'inline', fontWeight: 700 }}>{label}: </dt>
      <dd style={{ display: 'inline', margin: 0 }}>{value}</dd>
    </div>
  );
}

const btnStyle: CSSProperties = {
  fontSize: 9,
  padding: '3px 8px',
  border: '1px solid #a8a29e',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
};
