import type { FounderRenderDiagnostics } from '../../../../studio-os-core/founder-render';

type Props = {
  diagnostics: FounderRenderDiagnostics | null;
  onCopy?: () => void;
};

export function FounderRenderDiagnosticsPanel({ diagnostics, onCopy }: Props) {
  if (!diagnostics) return null;

  const copyDiagnostics = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
      onCopy?.();
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      data-founder-render-diagnostics
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        fontSize: '10px',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong style={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Founder Render Diagnostics</strong>
        <button type="button" onClick={() => void copyDiagnostics()} style={{ fontSize: '9px', fontWeight: 700, padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
          Copy diagnostics
        </button>
      </div>
      <Row label="artifact intent" value={diagnostics.artifactIntent} />
      <Row label="model route" value={diagnostics.modelRoute ?? '—'} />
      <Row label="provider model" value={diagnostics.providerModel ?? '—'} />
      <Row label="prompt version" value={diagnostics.promptVersion} />
      <Row label="blueprint revision" value={String(diagnostics.blueprintRevision)} />
      <Row label="references" value={String(diagnostics.referenceCount)} />
      <Row label="provider job" value={diagnostics.providerJobId ?? '—'} />
      <Row label="output" value={diagnostics.outputUrl ? 'received' : '—'} />
      <Row label="persistence" value={diagnostics.persistenceStatus} />
      <Row label="approval" value={diagnostics.approvalStatus} />
      {diagnostics.effectivePromptPreview ? (
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', color: '#475569' }}>Effective prompt preview</summary>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 6, color: '#334155' }}>{diagnostics.effectivePromptPreview}</pre>
        </details>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, padding: '2px 0' }}>
      <span style={{ color: '#94a3b8' }}>{label}</span>
      <span style={{ color: '#0f172a', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}
