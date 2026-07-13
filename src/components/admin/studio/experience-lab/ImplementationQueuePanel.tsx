import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  getImplementationOrchestratorDashboard,
  listImplementationTasks,
  reconcileImplementationQueue,
  approveImplementationTask,
  setImplementationPaused,
  isImplementationPaused,
  getReadyPackets,
  formatImplementationChain,
  tryAutonomousDispatch,
  IMPLEMENTATION_ORCHESTRATOR_VERSION,
} from '../../../../studio-os-core/implementation-orchestrator';

const sectionStyle: CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #e5e7eb',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '11px',
  color: '#111',
};

const labelStyle: CSSProperties = {
  margin: '0 0 4px',
  fontSize: '10px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  color: '#eb1c24',
};

const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  padding: '10px 12px',
  marginBottom: 8,
};

const btnStyle: CSSProperties = {
  padding: '6px 10px',
  margin: '4px 4px 4px 0',
  border: '1px solid #333',
  background: '#fff',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '10px',
};

/** Experience Lab — Implementation Queue™ governance panel. */
export function ImplementationQueuePanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const dashboard = useMemo(() => {
    void refreshKey;
    reconcileImplementationQueue();
    return getImplementationOrchestratorDashboard();
  }, [refreshKey]);

  const tasks = useMemo(() => {
    void refreshKey;
    return listImplementationTasks();
  }, [refreshKey]);

  const packets = useMemo(() => {
    void refreshKey;
    return getReadyPackets();
  }, [refreshKey]);

  const paused = useMemo(() => isImplementationPaused(), [refreshKey]);
  const selected = tasks.find((t) => t.taskId === selectedTaskId) ?? dashboard.nextRecommended;
  const selectedPacket = packets.find((p) => p.taskId === selected?.taskId);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <section style={sectionStyle} data-implementation-queue-panel>
      <p style={labelStyle}>IMPLEMENTATION QUEUE™</p>
      <p style={{ margin: '0 0 12px', color: '#555' }}>
        Living dependency graph — {IMPLEMENTATION_ORCHESTRATOR_VERSION} · {tasks.length} tasks · confidence{' '}
        {dashboard.queueHealth.ok ? 'HIGH' : 'LOW'}
      </p>

      <div style={{ marginBottom: 12 }}>
        <button type="button" style={btnStyle} onClick={refresh}>
          Refresh queue
        </button>
        <button
          type="button"
          style={{ ...btnStyle, fontWeight: paused ? 800 : 400 }}
          onClick={() => {
            setImplementationPaused(!paused);
            refresh();
          }}
        >
          {paused ? 'Resume execution' : 'Pause execution'}
        </button>
        <button
          type="button"
          style={btnStyle}
          onClick={() => {
            tryAutonomousDispatch();
            refresh();
          }}
        >
          Run autonomous dispatch
        </button>
      </div>

      <div style={cardStyle}>
        <strong>Queue Health</strong>
        <p style={{ margin: '4px 0 0' }}>
          Ready {dashboard.ready.length} · Blocked {dashboard.blocked.length} · Running {dashboard.running.length} ·
          Testing {dashboard.testing.length} · Founder {dashboard.waitingFounder.length} · Done {dashboard.completed.length}
        </p>
        <p style={{ margin: '4px 0 0', color: '#666' }}>
          Department coverage {dashboard.departmentCoverage}% · Remaining {dashboard.estimatedCompletionTasks} tasks
        </p>
      </div>

      <div style={cardStyle}>
        <strong>Critical Path</strong>
        <p style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: '10px' }}>
          {formatImplementationChain(dashboard.criticalPath.longestChain, tasks)}
        </p>
        {dashboard.criticalPath.unlockImpact[0] ? (
          <p style={{ margin: '8px 0 0', color: '#166534' }}>{dashboard.criticalPath.unlockImpact[0].message}</p>
        ) : null}
        <p style={{ margin: '4px 0 0' }}>
          Next recommended: {dashboard.nextRecommended?.title ?? '—'} · Largest blocker:{' '}
          {dashboard.criticalPath.largestBlocker ?? '—'}
        </p>
      </div>

      <div style={cardStyle}>
        <strong>Task Board</strong>
        <div style={{ maxHeight: 160, overflowY: 'auto', marginTop: 8 }}>
          {tasks
            .sort((a, b) => b.priority - a.priority)
            .map((task) => (
              <button
                key={task.taskId}
                type="button"
                onClick={() => setSelectedTaskId(task.taskId)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  background: selected?.taskId === task.taskId ? '#fef2f2' : 'transparent',
                  cursor: 'pointer',
                  padding: '4px 0',
                  fontSize: '10px',
                }}
              >
                <span style={{ fontWeight: 700, color: task.status === 'DEPLOYED' ? '#166534' : task.status === 'BLOCKED' ? '#b91c1c' : '#111' }}>
                  {task.status}
                </span>{' '}
                {task.title}
                {task.blockedBy.length ? ` · blocked by ${task.blockedBy.join(', ')}` : ''}
              </button>
            ))}
        </div>
      </div>

      {selected ? (
        <div style={cardStyle}>
          <strong>{selected.title}</strong>
          <p style={{ margin: '4px 0 0' }}>{selected.description}</p>
          <p style={{ margin: '4px 0 0' }}>
            Mode: {selected.executionMode} · Owner: {selected.owner} · Priority: {selected.priority}
          </p>
          {selected.founderApprovalRequired && !selected.founderApproved ? (
            <button
              type="button"
              style={{ ...btnStyle, borderColor: '#eb1c24', color: '#eb1c24' }}
              onClick={() => {
                approveImplementationTask(selected.taskId);
                refresh();
              }}
            >
              Approve for dispatch
            </button>
          ) : null}
          {selectedPacket ? (
            <div style={{ marginTop: 8, padding: 8, background: '#f9fafb', borderRadius: 6 }}>
              <strong>Implementation Packet</strong>
              <p style={{ margin: '4px 0 0' }}>Risk: {selectedPacket.risk} · Duration: {selectedPacket.estimatedDuration}</p>
              <p style={{ margin: '4px 0 0' }}>Spec: {selectedPacket.implementationSpec.slice(0, 200)}…</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
