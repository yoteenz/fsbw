import { useCallback, useMemo, useState } from 'react';
import {
  getInspectorSnapshot,
  getReturnBrief,
  getSeason1ResidentRegistry,
  listSeason1Residents,
  runWorldTick,
} from '../../../../studio-os-core/studio-world-residents';
import type { ResidentId } from '../../../../studio-os-core/studio-world-residents';
import { RESIDENT_WORKSPACE_SECTIONS } from '../../../../studio-os-core/studio-world-residents/life-os/workspace-contract';
import { getResidentTimeline } from '../../../../studio-os-core/studio-world-residents/life-os/runtime/return-brief-service';
import { getMindInspectorSnapshot } from '../../../../studio-os-core/studio-world-residents/life-os/runtime/mind-inspector';
import { getSimulationNowIso, setSimulationClockOverride } from '../../../../studio-os-core/studio-world-residents/life-os/runtime/simulation-clock';

type DebugTab = 'inspector' | 'return-brief' | 'timeline' | 'mind';

function briefPreset(preset: '2h' | 'today' | 'yesterday' | 'custom', customFrom?: string): { from: string; to: string } {
  const to = getSimulationNowIso();
  const toDate = new Date(to);
  if (preset === '2h') {
    const from = new Date(toDate.getTime() - 2 * 60 * 60 * 1000).toISOString();
    return { from, to };
  }
  if (preset === 'today') {
    const from = new Date(toDate);
    from.setUTCHours(0, 0, 0, 0);
    return { from: from.toISOString(), to };
  }
  if (preset === 'yesterday') {
    const end = new Date(toDate);
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  return { from: customFrom ?? to, to };
}

export default function StudioWorldResidentsDebugPage() {
  const registry = useMemo(() => getSeason1ResidentRegistry(), []);
  const [selectedId, setSelectedId] = useState<ResidentId>(
    registry.residents[0]?.residentId ?? 'SW-RESIDENT-001',
  );
  const [tab, setTab] = useState<DebugTab>('inspector');
  const [briefPresetKey, setBriefPresetKey] = useState<'2h' | 'today' | 'yesterday' | 'custom'>('2h');
  const [customFrom, setCustomFrom] = useState('');
  const [tickLog, setTickLog] = useState<string>('');
  const [clockOverride, setClockOverride] = useState('');

  const inspector = useMemo(() => getInspectorSnapshot(selectedId), [selectedId, tickLog]);
  const resident = registry.residents.find((r) => r.residentId === selectedId);
  const twin = inspector.twin;
  const mind = useMemo(() => getMindInspectorSnapshot(selectedId), [selectedId, tickLog]);

  const briefWindow = useMemo(
    () => briefPreset(briefPresetKey, customFrom || undefined),
    [briefPresetKey, customFrom, tickLog],
  );
  const returnBrief = useMemo(
    () => getReturnBrief(briefWindow.from, briefWindow.to, { isFounderPrivileged: true }),
    [briefWindow, tickLog],
  );
  const timeline = useMemo(() => getResidentTimeline(selectedId), [selectedId, tickLog]);

  const runTick = useCallback(async () => {
    if (clockOverride) setSimulationClockOverride(clockOverride);
    const result = await runWorldTick({ seed: 42, residentIds: [selectedId] });
    setTickLog(`${result.tickWindowId} · duplicate=${result.skippedDuplicate} · ${result.outputs.join(', ')}`);
  }, [clockOverride, selectedId]);

  return (
    <div style={{ fontFamily: 'monospace', padding: 16, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 18 }}>Studio World — Resident Life Runtime (QA)</h1>
      <p style={{ fontSize: 12, color: '#555' }}>
        Persistence + manual debug tick + return brief. Runtime active: MANUAL_DEBUG (cron disabled).
      </p>
      <p style={{ fontSize: 11 }}>
        Residents: {listSeason1Residents().length} · Registry: {registry.version} · Sim clock: {getSimulationNowIso()}
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {(['inspector', 'return-brief', 'timeline', 'mind'] as DebugTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '6px 10px',
              fontSize: 11,
              background: tab === t ? '#222' : '#eee',
              color: tab === t ? '#fff' : '#222',
              border: '1px solid #999',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <label style={{ display: 'block', marginTop: 16, fontSize: 12 }}>
        Resident
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value as ResidentId)}
          style={{ display: 'block', marginTop: 4, width: '100%', padding: 8 }}
        >
          {registry.residents.map((r) => (
            <option key={r.residentId} value={r.residentId}>
              {r.residentId} — {r.displayName}
            </option>
          ))}
        </select>
      </label>

      <section style={{ marginTop: 16, fontSize: 11 }}>
        <strong>Manual tick</strong>
        <input
          placeholder="Optional clock override ISO"
          value={clockOverride}
          onChange={(e) => setClockOverride(e.target.value)}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: 6 }}
        />
        <button type="button" onClick={() => void runTick()} style={{ marginTop: 6, padding: '6px 12px' }}>
          Run world tick (selected resident)
        </button>
        {tickLog ? <p style={{ marginTop: 6 }}>{tickLog}</p> : null}
      </section>

      {tab === 'return-brief' ? (
        <section style={{ marginTop: 20, fontSize: 12 }}>
          <h2 style={{ fontSize: 14 }}>Return brief</h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['2h', 'today', 'yesterday', 'custom'] as const).map((p) => (
              <button key={p} type="button" onClick={() => setBriefPresetKey(p)} style={{ fontSize: 10 }}>
                {p}
              </button>
            ))}
          </div>
          {briefPresetKey === 'custom' ? (
            <input
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              placeholder="Custom from ISO"
              style={{ width: '100%', marginTop: 8, padding: 6 }}
            />
          ) : null}
          <p>
            Window: {briefWindow.from} → {briefWindow.to} · Items: {returnBrief.items.length}
          </p>
          <ul>
            {returnBrief.items.slice(0, 20).map((item) => (
              <li key={item.groundedEventId}>
                [{item.category}] {item.summary} — founder? {item.founderActionNeeded ? 'yes' : 'no'}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === 'timeline' ? (
        <section style={{ marginTop: 20, fontSize: 11 }}>
          <h2 style={{ fontSize: 14 }}>Life timeline</h2>
          <ul>
            {timeline.slice(-30).map((row) => (
              <li key={row.eventId}>
                {row.at} · {row.eventType} · {row.summary}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === 'mind' ? (
        <section style={{ marginTop: 20, fontSize: 11 }}>
          <h2 style={{ fontSize: 14 }}>Mind / explanation inspector</h2>
          <pre style={{ background: '#f4f4f4', padding: 8, overflow: 'auto' }}>{JSON.stringify(mind, null, 2)}</pre>
        </section>
      ) : null}

      {tab === 'inspector' && resident ? (
        <section style={{ marginTop: 24, fontSize: 12, lineHeight: 1.5 }}>
          <h2 style={{ fontSize: 14 }}>{resident.displayName}</h2>
          <p>
            <strong>Presence:</strong> {twin.current.presence} · <strong>Location:</strong> {twin.current.locationLabel}
          </p>
          <p>
            <strong>Activity:</strong> {twin.current.activity}
          </p>
          <p>
            <strong>Intent:</strong> {twin.current.currentIntent}
          </p>
          <p>
            <strong>Career:</strong> {twin.career.careerState} — {twin.career.title}
          </p>
          <p>
            <strong>Autonomy:</strong> {twin.autonomy.level}
          </p>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Needs (with causes)</h3>
          <pre style={{ fontSize: 11, background: '#f4f4f4', padding: 8, overflow: 'auto' }}>
            {JSON.stringify({ levels: twin.needs.levels, causes: twin.needs.causes.slice(-4) }, null, 2)}
          </pre>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Goals</h3>
          <ul>
            {twin.goals.personalObjectives.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Relationships ({inspector.relationships.length})</h3>
          <ul>
            {inspector.relationships.slice(0, 8).map((e) => (
              <li key={e.residentBId}>
                {e.residentBId}: trust {e.trust.toFixed(2)}
              </li>
            ))}
          </ul>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Memories / Knowledge / Rumors</h3>
          <p>
            Memories: {inspector.memories.length} · Beliefs: {inspector.knowledge.beliefs.length} · Rumors:{' '}
            {inspector.rumors.length}
          </p>
          <p>Requests: {getInspectorSnapshot(selectedId).twin.recentEvents.length} recent events</p>

          <h3 style={{ fontSize: 13, marginTop: 16 }}>Workspace sections (IA contract)</h3>
          <p style={{ fontSize: 10 }}>{RESIDENT_WORKSPACE_SECTIONS.join(' · ')}</p>
        </section>
      ) : null}
    </div>
  );
}
