import { useCallback, useState, type CSSProperties } from 'react';
import {
  buildParityComparisonSummary,
  exportGenerationParityForensicsJson,
  listGenerationParityForensics,
  type GenerationParityForensicEnvelope,
} from '../../../../studio-os-core/generation-runtime/generation-parity-forensic';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 6, padding: '2px 0' }}>
      <span style={{ color: '#a8a29e' }}>{label}</span>
      <span style={{ color: '#fafaf9', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

function SurfaceBlock({
  title,
  capture,
}: {
  title: string;
  capture: GenerationParityForensicEnvelope | null;
}) {
  if (!capture) {
    return (
      <div style={{ marginBottom: 8, padding: 6, border: '1px dashed #44403c', borderRadius: 4 }}>
        <strong style={{ color: '#fb923c' }}>{title}</strong>
        <p style={{ margin: '4px 0 0', color: '#78716c', fontSize: 10 }}>No capture yet</p>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 8, padding: 6, border: '1px solid #44403c', borderRadius: 4 }}>
      <strong style={{ color: '#fb923c' }}>{title}</strong>
      <Row label="route" value={capture.endpoint} />
      <Row label="model" value={capture.modelRoute ?? '—'} />
      <Row label="mode" value={capture.generationMode ?? '—'} />
      <Row label="intent" value={capture.artifactIntent ?? '—'} />
      <Row label="refs" value={String(capture.referenceCount)} />
      <Row label="validation" value={capture.validationPath ?? '—'} />
      <Row label="result" value={capture.validationResult ?? capture.finalStatus ?? '—'} />
      <Row label="output" value={capture.providerOutputUrls[0] ? 'received' : '—'} />
    </div>
  );
}

/** compilerDiag=1 — FS vs Studio OS generation parity comparison panel. */
export function GenerationParityDiagnosticPanel() {
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const summary = buildParityComparisonSummary();
  const captures = listGenerationParityForensics();

  const copyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportGenerationParityForensicsJson());
      setCopyMsg('Copied parity JSON');
    } catch {
      setCopyMsg('Copy failed');
    }
    window.setTimeout(() => setCopyMsg(null), 2500);
  }, []);

  const copyRootCause = useCallback(async () => {
    const text = [
      'FIRST CAUSAL DIVERGENCE',
      summary.firstDivergence,
      '',
      'REPAIR',
      'Salvageable opaque studio plates defer isolated-layer rejection until governed background removal completes.',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg('Copied root cause');
    } catch {
      setCopyMsg('Copy failed');
    }
    window.setTimeout(() => setCopyMsg(null), 2500);
  }, [summary.firstDivergence]);

  return (
    <div data-generation-parity-panel style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        <button type="button" onClick={() => void copyJson()} style={btn}>
          Copy comparison
        </button>
        <button type="button" onClick={() => void copyJson()} style={btn}>
          Export JSON
        </button>
        <button type="button" onClick={() => void copyRootCause()} style={btn}>
          Copy root cause
        </button>
        {copyMsg ? <span style={{ fontSize: 10, color: '#4ade80' }}>{copyMsg}</span> : null}
      </div>
      <p style={{ margin: '0 0 6px', color: '#fbbf24', fontSize: 10, fontWeight: 700 }}>
        First divergence: {summary.firstDivergence}
      </p>
      <SurfaceBlock title="FRONTAL SLAYER" capture={summary.frontalSlayer} />
      <SurfaceBlock title="EXPERIENCE LAB" capture={summary.experienceLab} />
      <SurfaceBlock title="CREATIVE DIRECTOR STUDIO" capture={summary.creativeDirectorStudio} />
      {captures.length > 0 ? (
        <p style={{ margin: '6px 0 0', color: '#78716c', fontSize: 9 }}>
          {captures.length} forensic capture(s) in session
        </p>
      ) : null}
    </div>
  );
}

const btn: CSSProperties = {
  padding: '4px 8px',
  fontSize: 10,
  fontWeight: 700,
  border: '1px solid #57534e',
  borderRadius: 4,
  background: '#292524',
  color: '#fafaf9',
  cursor: 'pointer',
};
