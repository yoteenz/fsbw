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
      data-department-diagnostics
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
        <strong style={{ letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>
          Department Render Diagnostics
        </strong>
        <button
          type="button"
          onClick={() => void copyDiagnostics()}
          style={{
            fontSize: '9px',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: 4,
            border: '1px solid #cbd5e1',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Copy diagnostics
        </button>
      </div>
      <Row label="department" value={diagnostics.departmentId ?? '—'} />
      <Row label="department class" value={diagnostics.departmentClass ?? '—'} />
      <Row label="blueprint" value={diagnostics.blueprintId ?? '—'} />
      <Row label="shell spec" value={diagnostics.shellSpecId ?? '—'} />
      <Row label="prompt" value={diagnostics.promptVersion} />
      <Row label="prompt hash" value={diagnostics.promptHash ?? '—'} />
      <Row label="reference package" value={diagnostics.referencePackageVersion ?? '—'} />
      <Row label="model" value={diagnostics.providerModel ?? '—'} />
      <Row label="model route" value={diagnostics.modelRoute ?? '—'} />
      <Row label="cache key" value={diagnostics.cacheKey ? diagnostics.cacheKey.slice(0, 24) + '…' : '—'} />
      <Row label="artifact intent" value={diagnostics.artifactIntent} />
      <Row label="job id" value={diagnostics.jobId ?? '—'} />
      <Row label="render id" value={diagnostics.renderId ? 'persisted' : '—'} />
      <Row label="references" value={String(diagnostics.referenceCount)} />
      <Row label="blueprint revision" value={String(diagnostics.blueprintRevision)} />
      <Row label="provider job" value={diagnostics.providerJobId ?? '—'} />
      <Row label="output" value={diagnostics.outputUrl ? 'received' : '—'} />
      <Row label="persistence" value={diagnostics.persistenceStatus} />
      <Row label="approval" value={diagnostics.approvalStatus} />
      {diagnostics.architecturalFingerprint?.length ? (
        <Row label="fingerprint" value={diagnostics.architecturalFingerprint.slice(0, 4).join(' · ')} />
      ) : null}
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
