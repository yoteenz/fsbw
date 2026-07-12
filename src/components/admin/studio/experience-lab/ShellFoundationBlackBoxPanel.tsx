import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import {
  buildShellFoundationBlackBoxState,
  copyShellFoundationBlackBox,
  exportShellFoundationBlackBoxJson,
  loadShellFoundationBlackBoxFromSession,
  subscribeShellFoundationBlackBox,
  type ShellFoundationBlackBoxState,
} from '../../../../studio-os/diagnostics/world-compiler-investigation/shell-foundation-black-box';
import type { GenerateShellDispatchDeskState } from '../../../../studio-os/diagnostics/world-compiler-investigation/generate-shell-dispatch-desk';
import type { GenerateShellPackageMicroTraceState } from '../../../../studio-os/diagnostics/world-compiler-investigation/generate-shell-package-micro-trace';
import type { RecordShellStageForensicState } from '../../../../studio-os/diagnostics/world-compiler-investigation/record-shell-stage-forensic';
import { incrementRssRenderLoopCount } from '../../../../studio-os/diagnostics/world-compiler-investigation/record-shell-stage-forensic';

type Props = {
  compileRunId: string | null;
  shellPipelinePhase: string;
  pipelinePhase: string;
  layersComplete: number;
  layersTotal: number;
  compositeStatus: string;
  heartbeatTick: number;
};

function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      style={{
        marginBottom: 8,
        border: '1px solid #44403c',
        borderRadius: 6,
        background: '#1c1917',
        padding: '6px 8px',
      }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em' }}>{title}</summary>
      <div style={{ marginTop: 8, fontSize: 10, lineHeight: 1.5 }}>{children}</div>
    </details>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, padding: '2px 0' }}>
      <span style={{ color: '#a8a29e' }}>{label}</span>
      <span style={{ color: '#fafaf9', wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

const stageColor: Record<string, string> = {
  pending: '#78716c',
  running: '#60a5fa',
  success: '#4ade80',
  failed: '#f87171',
  skipped: '#a8a29e',
};

function JobBoardForensicsSection({ rss }: { rss: RecordShellStageForensicState }) {
  const current = rss.markers.find((m) => m.markerId === rss.currentMicroMarkerId);
  const lastSuccess = rss.markers.find((m) => m.markerId === rss.lastSuccessfulMicroMarkerId);

  return (
    <div data-job-board-forensics style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #44403c' }}>
      <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#38bdf8' }}>JOB BOARD FORENSICS — recordShellStage</p>
      <Row label="Current RSS marker" value={current ? `${current.markerId} · ${current.label}` : '—'} />
      <Row
        label="Last success"
        value={lastSuccess ? `${lastSuccess.markerId} · ${lastSuccess.label}` : rss.lastSuccessfulMicroMarkerId ?? '—'}
      />
      <Row label="recordShellStage returned" value={rss.recordShellStageReturned == null ? '—' : rss.recordShellStageReturned ? 'Yes' : 'No'} />
      <Row label="Active invocations" value={String(rss.activeInvocationCount)} />
      <Row label="Reentrancy depth" value={String(rss.reentrancyDepth)} />
      <Row label="Reentrancy class" value={rss.reentrancyClassification ?? '—'} />
      <Row label="Subscriber count" value={String(rss.subscribers.length)} />
      <Row label="Current subscriber" value={rss.currentSubscriberId ?? '—'} />
      <Row
        label="Slowest subscriber"
        value={
          rss.slowestSubscriberId
            ? `${rss.slowestSubscriberId}${rss.slowestSubscriberDurationMs != null ? ` · ${rss.slowestSubscriberDurationMs}ms` : ''}`
            : '—'
        }
      />
      <Row label="Persistence phase" value={rss.persistence.persistencePhase ?? '—'} />
      <Row
        label="Serialization"
        value={
          rss.persistence.serializationDurationMs != null
            ? `${rss.persistence.payloadByteSize ?? 0}b · ${rss.persistence.serializationDurationMs}ms`
            : '—'
        }
      />
      <Row
        label="Storage write"
        value={rss.persistence.storageWriteDurationMs != null ? `${rss.persistence.storageWriteDurationMs}ms` : '—'}
      />
      <Row label="Derived-state phase" value={rss.derivedState.phase ?? '—'} />
      <Row label="React notifications" value={String(rss.reactStore.subscriberNotificationCount)} />
      <Row label="Panel mounted" value={rss.reactStore.panelMounted ? 'Yes' : 'No'} />
      {rss.rssStallClassification ? (
        <p style={{ margin: '6px 0 0', color: '#f87171', fontWeight: 700 }}>
          RSS stall: {rss.rssStallClassification}
          {rss.rssStallClassificationDetail ? ` — ${rss.rssStallClassificationDetail}` : ''}
        </p>
      ) : null}
    </div>
  );
}

function ContractorDirectoryMicroTrace({ micro }: { micro: GenerateShellPackageMicroTraceState }) {
  const current = micro.markers.find((m) => m.markerId === micro.currentMicroMarkerId);
  const lastSuccess = micro.markers.find((m) => m.markerId === micro.lastSuccessfulMicroMarkerId);
  const reg = micro.packageRegistry;

  return (
    <div data-contractor-directory-micro-trace style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #44403c' }}>
      <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#a3e635' }}>CONTRACTOR DIRECTORY MICRO-TRACE</p>
      <Row label="Current micro-marker" value={current ? `${current.markerId} · ${current.label}` : '—'} />
      <Row label="Source" value={current?.sourceLabel ?? '—'} />
      <Row
        label="Last success"
        value={lastSuccess ? `${lastSuccess.markerId} · ${lastSuccess.label}` : micro.lastSuccessfulMicroMarkerId ?? '—'}
      />
      <Row label="Package key" value={reg.actualPackageKey ?? reg.expectedPackageKey ?? '—'} />
      <Row label="Registry name" value={reg.registryName} />
      <Row label="Registry ready" value={reg.registryReady == null ? '—' : reg.registryReady ? 'Yes' : 'No'} />
      <Row label="Package present" value={reg.keyPresent == null ? '—' : reg.keyPresent ? 'Yes' : 'No'} />
      <Row label="Lookup started" value={reg.lookupStarted ? 'Yes' : 'No'} />
      <Row label="Lookup returned" value={reg.lookupReturned ? 'Yes' : 'No'} />
      <Row label="Lookup duration" value={reg.lookupDurationMs != null ? `${reg.lookupDurationMs}ms` : '—'} />
      <Row label="Boot/init state" value={`${reg.initializationPromiseState} · settled=${String(reg.initSettled)}`} />
      <Row label="Lock state" value={reg.lockState ? `${reg.lockState}${reg.lockOwner ? ` (${reg.lockOwner})` : ''}` : '—'} />
      <Row label="Last transition" value={micro.lastStateTransition ?? '—'} />
      {micro.microStallClassification ? (
        <p style={{ margin: '6px 0 0', color: '#f87171', fontWeight: 700 }}>
          Micro stall: {micro.microStallClassification}
          {micro.microStallClassificationDetail ? ` — ${micro.microStallClassificationDetail}` : ''}
        </p>
      ) : null}
      <div style={{ marginTop: 6, maxHeight: 100, overflowY: 'auto' }}>
        {micro.markers
          .filter((m) => m.status !== 'pending')
          .map((m) => (
            <div key={m.markerId} style={{ color: stageColor[m.status] ?? '#d6d3d1', padding: '2px 0', fontSize: 9 }}>
              {m.markerId} · {m.status}
              {m.durationMs != null ? ` · ${m.durationMs}ms` : ''}
              {m.resultSummary ? ` · ${m.resultSummary}` : ''}
            </div>
          ))}
      </div>
    </div>
  );
}

function DispatchDeskSection({ desk }: { desk: GenerateShellDispatchDeskState }) {
  const currentStage = desk.subStages.find((s) => s.subStageId === desk.currentSubStageId);
  const lastSuccess = desk.subStages.find((s) => s.subStageId === desk.lastSuccessfulSubStageId);

  return (
    <div data-dispatch-desk>
      <p style={{ margin: '0 0 6px', fontWeight: 800, color: '#fbbf24' }}>Dispatch Desk</p>
      <Row label="Invocation count" value={String(desk.invocations.length)} />
      <Row
        label="Invocation IDs"
        value={desk.invocations.map((i) => i.invocationId).join(', ') || '—'}
      />
      <Row
        label="Parent/child"
        value={
          desk.invocations
            .filter((i) => i.parentInvocationId)
            .map((i) => `${i.invocationId} → parent ${i.parentInvocationId}`)
            .join('; ') || '—'
        }
      />
      <Row label="Current sub-stage" value={currentStage ? `${currentStage.subStageId} · ${currentStage.label}` : '—'} />
      <Row
        label="Last success"
        value={lastSuccess ? `${lastSuccess.subStageId} · ${lastSuccess.label}` : desk.lastSuccessfulSubStageId ?? '—'}
      />
      <Row label="Current await" value={desk.currentAwaitLabel ?? '—'} />
      <Row
        label="In-flight promise"
        value={
          desk.promiseForensic
            ? `${desk.promiseForensic.reused ? 'Reused' : 'New'} · ${desk.promiseForensic.promiseKey} · ${desk.promiseForensic.state}${desk.promiseForensic.ageMs != null ? ` · age ${desk.promiseForensic.ageMs}ms` : ''}`
            : 'None'
        }
      />
      <Row
        label="Authorization"
        value={
          desk.authorization.tokenEnsureEntered
            ? `token ensure ${desk.authorization.tokenEnsureReturned ? 'returned' : 'pending'} · present=${String(desk.authorization.tokenPresent)} · grant=${desk.authorization.authorizationResult ?? '—'}`
            : desk.authorization.authorizationResult ?? 'not entered'
        }
      />
      <Row label="Endpoint" value={desk.fetch.endpoint ?? '—'} />
      <Row label="Fetch started" value={desk.fetch.fetchStarted ? 'Yes' : 'No'} />
      <Row label="Fetch response" value={desk.fetch.fetchResolved ? `Yes (${desk.fetch.responseStatus ?? '—'})` : desk.fetch.fetchRejected ? 'Rejected' : 'No'} />
      <Row label="Elapsed" value={desk.elapsedMs != null ? `${desk.elapsedMs}ms` : '—'} />
      <Row label="Last transition" value={desk.lastStateTransition ?? '—'} />
      {desk.duplicateCallDetected ? (
        <p style={{ margin: '6px 0', color: '#a8a29e' }}>
          Instrumentation pair: {desk.duplicateCallExplanation ?? 'wrapper + body'}
        </p>
      ) : (
        <Row label="Duplicate call" value="No" />
      )}
      {desk.stallClassification ? (
        <p style={{ margin: '6px 0 0', color: '#f87171', fontWeight: 700 }}>
          Stall: {desk.stallClassification}
          {desk.stallClassificationDetail ? ` — ${desk.stallClassificationDetail}` : ''}
        </p>
      ) : null}
      <ContractorDirectoryMicroTrace micro={desk.packageMicroTrace} />
      <div style={{ marginTop: 8, maxHeight: 120, overflowY: 'auto' }}>
        {desk.subStages
          .filter((s) => s.status !== 'pending')
          .map((s) => (
            <div key={s.subStageId} style={{ color: stageColor[s.status] ?? '#d6d3d1', padding: '2px 0' }}>
              {s.subStageId} · {s.status}
              {s.durationMs != null ? ` · ${s.durationMs}ms` : ''}
              {s.detail ? ` · ${s.detail}` : ''}
            </div>
          ))}
      </div>
    </div>
  );
}

/** compilerDiag=1 — Shell Foundation Black Box (observe-only). */
export function ShellFoundationBlackBoxPanel({
  compileRunId,
  shellPipelinePhase,
  pipelinePhase,
  layersComplete,
  layersTotal,
  compositeStatus,
  heartbeatTick,
}: Props) {
  const [state, setState] = useState<ShellFoundationBlackBoxState>(() => buildShellFoundationBlackBoxState());
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    incrementRssRenderLoopCount();
    loadShellFoundationBlackBoxFromSession();
    setState(buildShellFoundationBlackBoxState());
  }, []);

  useEffect(() => {
    refresh();
    return subscribeShellFoundationBlackBox(() => setState(buildShellFoundationBlackBoxState()));
  }, [refresh]);

  useEffect(() => {
    void heartbeatTick;
    refresh();
  }, [heartbeatTick, refresh]);

  const handleCopy = async () => {
    const ok = await copyShellFoundationBlackBox();
    setCopyMsg(ok ? 'Copied shell black box JSON' : 'Copy failed');
    window.setTimeout(() => setCopyMsg(null), 3000);
  };

  const handleExport = () => {
    downloadJson(`shell-foundation-black-box-${compileRunId ?? 'run'}.json`, exportShellFoundationBlackBoxJson());
    setCopyMsg('JSON downloaded');
    window.setTimeout(() => setCopyMsg(null), 3000);
  };

  const openAwaits = state.awaitTracks.filter((a) => a.state === 'pending');
  const lastEvent = state.timeline[state.timeline.length - 1];

  return (
    <div
      data-shell-foundation-black-box
      style={{
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        border: '2px solid #b45309',
        background: '#0c0a09',
        color: '#fafaf9',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        maxHeight: '70vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', color: '#fb923c' }}>
          SHELL FOUNDATION BLACK BOX™
        </p>
        <button type="button" onClick={() => void handleCopy()} style={btnStyle}>
          Copy
        </button>
        <button type="button" onClick={handleExport} style={btnStyle}>
          Export
        </button>
        {copyMsg ? <span style={{ fontSize: 10, color: '#4ade80' }}>{copyMsg}</span> : null}
      </div>

      <p style={{ margin: '0 0 8px', fontSize: 10, color: '#a8a29e' }}>
        Last successful stage: <strong style={{ color: '#4ade80' }}>{state.lastSuccessfulStageId ?? '—'}</strong>
        {' · '}
        Last event: <strong>{state.lastVisibleEvent ?? lastEvent?.label ?? '—'}</strong>
      </p>

      <Section title="JOB BOARD FORENSICS — recordShellStage" defaultOpen>
        <JobBoardForensicsSection rss={state.recordShellStageForensic} />
      </Section>

      <Section title="GENERATE SHELL PUBLIC URL — DISPATCH DESK" defaultOpen>
        <DispatchDeskSection desk={state.dispatchDesk} />
      </Section>

      <Section title="A — Shell pipeline stages" defaultOpen>
        {state.stages.map((stage) => (
          <div key={stage.id} style={{ padding: '4px 0', borderBottom: '1px solid #292524' }}>
            <span style={{ color: stageColor[stage.status] ?? '#fafaf9', fontWeight: 700 }}>{stage.label}</span>
            <span style={{ color: '#78716c' }}> · {stage.status}</span>
            {stage.durationMs != null ? <span style={{ color: '#78716c' }}> · {stage.durationMs}ms</span> : null}
            {stage.timestamp ? <div style={{ color: '#57534e', fontSize: 9 }}>{stage.timestamp}</div> : null}
            {stage.detail ? <div style={{ color: '#a8a29e' }}>{stage.detail}</div> : null}
            {stage.errorCode ? <div style={{ color: '#f87171' }}>{stage.errorCode}</div> : null}
          </div>
        ))}
      </Section>

      <Section title="B — Function trace">
        <div style={{ maxHeight: 160, overflowY: 'auto' }}>
          {state.functionTraces.slice(-40).map((fn) => (
            <div key={fn.id} style={{ padding: '2px 0', color: fn.status === 'threw' ? '#f87171' : '#d6d3d1' }}>
              {fn.elapsedMs}ms {fn.status} {fn.functionName}() {fn.durationMs != null ? `(${fn.durationMs}ms)` : ''}
            </div>
          ))}
        </div>
      </Section>

      <Section title="C — Await tracker" defaultOpen={openAwaits.length > 0}>
        {openAwaits.length === 0 ? (
          <p style={{ margin: 0, color: '#78716c' }}>No pending awaits</p>
        ) : (
          openAwaits.map((a) => (
            <div key={a.id} style={{ color: a.elapsedMs >= 5000 ? '#fb923c' : '#60a5fa', padding: '4px 0' }}>
              <strong>{a.label}</strong> · {a.functionName} · {a.elapsedMs}ms pending
              {a.expectedTimeoutMs ? ` (warn ${a.expectedTimeoutMs}ms)` : ''}
            </div>
          ))
        )}
        {state.awaitTracks.slice(-12).map((a) => (
          <div key={`${a.id}-hist`} style={{ color: '#57534e', fontSize: 9 }}>
            {a.label} · {a.state} · {a.elapsedMs}ms
          </div>
        ))}
      </Section>

      <Section title="D — Network">
        {state.network.length === 0 ? (
          <p style={{ margin: 0, color: '#78716c' }}>No shell network events yet</p>
        ) : (
          state.network.slice(-10).map((n) => (
            <div key={n.id} style={{ padding: '4px 0', borderBottom: '1px solid #292524' }}>
              {n.method} {n.route} · {n.status ?? '—'} · {n.durationMs}ms · {n.responseSize}b
              {n.error ? <div style={{ color: '#f87171' }}>{n.error}</div> : null}
            </div>
          ))
        )}
      </Section>

      <Section title="E — State snapshots">
        <Row label="Live compileRunId" value={compileRunId ?? state.runContext.compileRunId ?? '—'} />
        <Row label="shellPipelinePhase" value={shellPipelinePhase} />
        <Row label="layer pipeline" value={`${layersComplete}/${layersTotal} · ${pipelinePhase}`} />
        <Row label="composite" value={compositeStatus} />
        {state.stateSnapshots.slice(-8).map((s) => (
          <div key={s.id} style={{ marginTop: 4, color: '#a8a29e' }}>
            {s.isoTime} · {s.transition} · shell={s.shellStatus ?? '—'}
          </div>
        ))}
      </Section>

      <Section title="F — Dependency graph">
        {state.dependencies.map((d) => (
          <div key={d.id} style={{ padding: '2px 0' }}>
            {d.label} · {d.status}
            {d.waitingOn ? ` · waiting on ${d.waitingOn}` : ''}
          </div>
        ))}
      </Section>

      <Section title="G — Error chain" defaultOpen={state.errors.length > 0}>
        {state.errors.length === 0 ? (
          <p style={{ margin: 0, color: '#78716c' }}>No errors recorded</p>
        ) : (
          state.errors.slice(-5).map((e) => (
            <details key={e.id} style={{ marginBottom: 4 }}>
              <summary style={{ color: '#f87171', cursor: 'pointer' }}>
                {e.category}: {e.message}
              </summary>
              <div style={{ color: '#a8a29e', fontSize: 9, whiteSpace: 'pre-wrap' }}>
                {e.functionName} @ {e.sourceFile}
                {e.stack ? `\n${e.stack}` : ''}
              </div>
            </details>
          ))
        )}
      </Section>

      <Section title="H — Heartbeat">
        <Row label="last progress" value={state.heartbeat.lastProgressEvent ?? '—'} />
        <Row label="last transition" value={state.heartbeat.lastStateTransition ?? '—'} />
        <Row label="last function" value={state.heartbeat.lastSuccessfulFunction ?? '—'} />
        <Row label="last await" value={state.heartbeat.lastCompletedAwait ?? '—'} />
        {state.heartbeat.potentialStall ? (
          <p style={{ margin: '6px 0 0', color: '#fb923c', fontWeight: 700 }}>Potential Stall</p>
        ) : null}
      </Section>

      <Section title="I — Stall detector" defaultOpen={state.stallSignals.length > 0}>
        {state.stallSignals.length === 0 ? (
          <p style={{ margin: 0, color: '#78716c' }}>No stall signals</p>
        ) : (
          state.stallSignals.map((s) => (
            <div key={s.id} style={{ color: '#fb923c', padding: '4px 0' }}>
              <strong>{s.label}</strong> — {s.reason}
            </div>
          ))
        )}
      </Section>

      <Section title="J — Timeline" defaultOpen>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {state.timeline.slice(-50).map((t, i) => (
            <div key={`${t.timestamp}-${i}`} style={{ padding: '2px 0', color: '#d6d3d1' }}>
              <span style={{ color: '#78716c' }}>{t.elapsedMs}ms</span> {t.label}
              <span style={{ color: '#57534e' }}> · {t.status}</span>
              {t.detail ? <span style={{ color: '#a8a29e' }}> · {t.detail}</span> : null}
            </div>
          ))}
          {!state.timeline.length ? <span style={{ color: '#78716c' }}>No events yet — tap Start compile run</span> : null}
        </div>
      </Section>
    </div>
  );
}

const btnStyle: CSSProperties = {
  padding: '4px 8px',
  fontSize: 10,
  fontWeight: 700,
  border: '1px solid #57534e',
  borderRadius: 4,
  background: '#292524',
  color: '#fafaf9',
  cursor: 'pointer',
};
