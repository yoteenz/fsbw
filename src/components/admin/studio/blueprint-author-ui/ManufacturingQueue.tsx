import type { LiveConstructionView } from '../../../../studio-os-core/construction-mode/live-construction';
import type { ManufacturingQueue } from '../../../../studio-os-core/manufacturing-engine/manufacturing-queue';

const statusColor: Record<string, string> = {
  pending: '#94a3b8',
  queued: '#64748b',
  rendering: '#2563eb',
  inspecting: '#7c3aed',
  repairing: '#ea580c',
  installed: '#16a34a',
  completed: '#16a34a',
  failed: '#dc2626',
};

type Props = {
  queue?: ManufacturingQueue;
  liveView?: LiveConstructionView;
};

/** Manufacturing queue — per-asset independent status. */
export function ManufacturingQueuePanel({ queue, liveView }: Props) {
  const stages = liveView?.stages ?? queue?.jobs.map((j) => ({
    jobId: j.jobId,
    jobNumber: j.jobNumber,
    label: j.assetId,
    status: j.status as string,
    progressPercent: 0,
    progressBar: '░░░░░░░░░░',
    detail: j.status,
  })) ?? [];

  return (
    <div
      data-blueprint-manufacturing-queue
      style={{
        fontFamily: 'system-ui, sans-serif',
        fontSize: '12px',
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
        MANUFACTURING QUEUE
      </p>
      {liveView ? (
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#374151' }}>
          Overall progress: {liveView.overallProgressPercent}%
          {liveView.currentStage ? ` · Active: ${liveView.currentStage}` : ''}
        </p>
      ) : null}
      <div style={{ display: 'grid', gap: 8 }}>
        {stages.map((stage) => (
          <div
            key={stage.jobId}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 8,
              padding: 10,
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <strong>{stage.jobNumber}</strong> · {stage.label}
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: 4 }}>{stage.detail}</div>
              <pre style={{ margin: '4px 0 0', fontSize: '9px', color: '#475569' }}>{stage.progressBar}</pre>
            </div>
            <span
              style={{
                alignSelf: 'start',
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: statusColor[stage.status] ?? '#64748b',
              }}
            >
              {stage.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
