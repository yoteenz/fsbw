/**
 * Studio OS Recovery — isolated route for scoped storage/cache recovery.
 * Path: /__studio-os-recovery
 */
import { useCallback, useEffect, useState } from 'react';
import {
  getRecoveryHealthSummary,
  reloadCleanly,
  runClearObsoleteCaches,
  runQuarantineIncompatibleState,
  runResetExperienceLabTransientState,
  runResetWorldCompilerTransientState,
  runUnregisterServiceWorkers,
  type RecoveryActionResult,
} from '../../../diagnostic-entry/recovery-actions';
import {
  copyBootTimeline,
  copyNormalVsPrivateDiff,
  copyStorageInventory,
  exportDiagnosticJson,
  exportDiagnosticMarkdown,
} from '../../../diagnostic-entry/diagnostic-report-export';
import { inspectServiceWorkerAndCaches, type ServiceWorkerAudit } from '../../../diagnostic-entry/service-worker-audit';
import { quarantineIncompatiblePersistedState, listQuarantinedKeys } from '../../../diagnostic-entry/persisted-state-audit';
import { readPreMainProbe, readBootTrace } from '../../../diagnostic-entry/boot-events';
import { getBundleVersionLabel } from '../../../diagnostic-entry/plain-dom';

const btn: React.CSSProperties = {
  fontSize: 11,
  padding: '8px 12px',
  cursor: 'pointer',
  border: '1px solid #334155',
  borderRadius: 4,
  background: '#1e293b',
  color: '#e2e8f0',
  marginRight: 8,
  marginBottom: 8,
};

export default function StudioOsRecoveryPage() {
  const [swAudit, setSwAudit] = useState<ServiceWorkerAudit | null>(null);
  const [lastAction, setLastAction] = useState<RecoveryActionResult | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const probe = readPreMainProbe();
  const health = getRecoveryHealthSummary();
  const audit = quarantineIncompatiblePersistedState();

  useEffect(() => {
    void inspectServiceWorkerAndCaches().then(setSwAudit);
  }, []);

  const runAction = useCallback(async (_label: string, fn: () => Promise<RecoveryActionResult> | RecoveryActionResult) => {
    const result = await fn();
    setLastAction(result);
    setConfirmAction(null);
    const fresh = await inspectServiceWorkerAndCaches();
    setSwAudit(fresh);
  }, []);

  const handleCopy = useCallback(async (label: string, fn: () => Promise<boolean>) => {
    const ok = await fn();
    setCopyStatus(ok ? `Copied ${label}` : `Copy failed — ${label}`);
  }, []);

  return (
    <div
      data-temp-debug-route="__studio-os-recovery"
      style={{
        minHeight: '100vh',
        background: '#0b1020',
        color: '#e2e8f0',
        fontFamily: 'ui-monospace, monospace',
        fontSize: 12,
        padding: 16,
      }}
    >
      <h1 style={{ margin: '0 0 8px', fontSize: 18, color: '#7dd3fc' }}>Studio OS Recovery</h1>
      <p style={{ margin: '0 0 16px', color: '#94a3b8', lineHeight: 1.5 }}>
        Isolated recovery shell — does not load Experience Lab, World Compiler, or main application bootstrap.
      </p>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, color: '#fbbf24' }}>Environment</h2>
        <dl style={{ margin: 0, lineHeight: 1.7 }}>
          <div>
            <dt style={{ display: 'inline', color: '#64748b' }}>Build ID: </dt>
            <dd style={{ display: 'inline' }}>{health.buildId ?? probe?.buildId ?? getBundleVersionLabel()}</dd>
          </div>
          <div>
            <dt style={{ display: 'inline', color: '#64748b' }}>Build mismatch: </dt>
            <dd style={{ display: 'inline', color: health.buildMismatch ? '#f87171' : '#86efac' }}>
              {health.buildMismatch ? 'YES — stale cache likely' : 'no'}
            </dd>
          </div>
          <div>
            <dt style={{ display: 'inline', color: '#64748b' }}>SW registrations: </dt>
            <dd style={{ display: 'inline' }}>{swAudit?.registrations ?? '…'}</dd>
          </div>
          <div>
            <dt style={{ display: 'inline', color: '#64748b' }}>Cache names: </dt>
            <dd style={{ display: 'inline' }}>{swAudit?.cacheNames.join(', ') || 'none'}</dd>
          </div>
          <div>
            <dt style={{ display: 'inline', color: '#64748b' }}>Quarantined: </dt>
            <dd style={{ display: 'inline' }}>{listQuarantinedKeys().length} key(s)</dd>
          </div>
          <div>
            <dt style={{ display: 'inline', color: '#64748b' }}>Invalid persisted: </dt>
            <dd style={{ display: 'inline' }}>{audit.invalid.length + audit.quarantined.length}</dd>
          </div>
        </dl>
        {swAudit?.staleAssetHints.length ? (
          <pre style={{ marginTop: 8, padding: 8, background: '#1a0000', color: '#fecaca', fontSize: 10 }}>
            {swAudit.staleAssetHints.join('\n')}
          </pre>
        ) : null}
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, color: '#fbbf24' }}>Scoped recovery</h2>
        <p style={{ color: '#64748b', margin: '0 0 8px' }}>
          Does not clear auth, unrelated site data, or user assets unless you confirm below.
        </p>
        <button type="button" style={btn} onClick={() => void runAction('sw', runUnregisterServiceWorkers)}>
          Unregister Studio OS service workers
        </button>
        <button type="button" style={btn} onClick={() => void runAction('cache', runClearObsoleteCaches)}>
          Clear obsolete Studio OS caches
        </button>
        <button type="button" style={btn} onClick={() => void runAction('quarantine', async () => runQuarantineIncompatibleState())}>
          Quarantine incompatible runtime state
        </button>
        <button type="button" style={btn} onClick={() => void runAction('xelab', async () => runResetExperienceLabTransientState())}>
          Reset Experience Lab transient state
        </button>
        <button type="button" style={btn} onClick={() => void runAction('wc', async () => runResetWorldCompilerTransientState())}>
          Reset World Compiler transient state
        </button>
        <button
          type="button"
          style={{ ...btn, borderColor: '#7dd3fc', color: '#7dd3fc' }}
          onClick={() => {
            if (confirmAction === 'reload') reloadCleanly();
            else setConfirmAction('reload');
          }}
        >
          {confirmAction === 'reload' ? 'Confirm reload cleanly' : 'Reload cleanly'}
        </button>
        {lastAction ? (
          <p style={{ marginTop: 8, color: '#86efac' }}>
            {lastAction.action}: {lastAction.detail}
          </p>
        ) : null}
      </section>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 13, color: '#fbbf24' }}>Diagnostic export</h2>
        <button type="button" style={btn} onClick={() => void handleCopy('Normal vs Private diff', copyNormalVsPrivateDiff)}>
          Copy Normal-vs-Private Diff
        </button>
        <button type="button" style={btn} onClick={() => void handleCopy('Boot timeline', copyBootTimeline)}>
          Copy Boot Timeline
        </button>
        <button type="button" style={btn} onClick={() => void handleCopy('Storage inventory', copyStorageInventory)}>
          Copy Storage Inventory
        </button>
        <button type="button" style={btn} onClick={() => void handleCopy('JSON', () => exportDiagnosticJson(swAudit))}>
          Export JSON
        </button>
        <button type="button" style={btn} onClick={() => void handleCopy('Markdown', () => exportDiagnosticMarkdown(swAudit))}>
          Export Markdown
        </button>
        {copyStatus ? <p style={{ color: '#94a3b8' }}>{copyStatus}</p> : null}
      </section>

      <section>
        <h2 style={{ fontSize: 13, color: '#fbbf24' }}>Boot trace ({readBootTrace().length} events)</h2>
        <pre style={{ fontSize: 10, maxHeight: 200, overflow: 'auto', background: '#0f172a', padding: 8 }}>
          {readBootTrace()
            .map((e) => `${new Date(e.ts).toISOString()} ${e.event}`)
            .join('\n') || 'empty'}
        </pre>
      </section>

      <p style={{ marginTop: 16 }}>
        <a href="/__studio-os-flight-recorder" style={{ color: '#7dd3fc' }}>
          Flight Recorder
        </a>
        {' · '}
        <a href="/__studio-os-live-runtime" style={{ color: '#7dd3fc' }}>
          Live Runtime
        </a>
        {' · '}
        <a href="/__studio-os-session-report" style={{ color: '#7dd3fc' }}>
          Session Report
        </a>
      </p>
    </div>
  );
}
