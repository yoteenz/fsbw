import type { AiWorkerMonitor } from '../../../../studio-os-core/construction-mode/ai-worker-monitor';

type Props = {
  monitor: AiWorkerMonitor;
};

const statusColor: Record<string, string> = {
  running: '#16a34a',
  rendering: '#2563eb',
  inspecting: '#7c3aed',
  queued: '#64748b',
  idle: '#94a3b8',
  offline: '#dc2626',
};

/** AI worker status from Blueprint Author job queue. */
export function WorkerStatus({ monitor }: Props) {
  return (
    <div
      data-blueprint-worker-status
      style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#374151' }}>
        AI WORKERS
      </p>
      <div style={{ display: 'grid', gap: 6 }}>
        {monitor.workers.map((worker) => (
          <div
            key={worker.workerRole}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 10px',
              background: '#f8fafc',
              borderRadius: 6,
            }}
          >
            <span>
              <strong>{worker.label}</strong>
              <span style={{ display: 'block', fontSize: '9px', color: '#64748b' }}>{worker.providerModel}</span>
            </span>
            <span style={{ fontWeight: 800, color: statusColor[worker.status] ?? '#64748b', textTransform: 'uppercase', fontSize: '9px' }}>
              {worker.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
