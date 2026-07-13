import type { CanonicalQueueEntry } from '../../../../studio-os-core/canonical-studio-world/canonical-department-queue';

const statusColor: Record<string, string> = {
  queued: '#6b7280',
  generating: '#2563eb',
  ready: '#059669',
  approved: '#059669',
  failed: '#dc2626',
  stale: '#d97706',
};

function statusLabel(entry: CanonicalQueueEntry): string {
  return `${entry.renderKind.toUpperCase()} · ${entry.status.toUpperCase()}`;
}

type Props = {
  queue: import('../../../../studio-os-core/canonical-studio-world/canonical-department-queue').CanonicalQueueSnapshot | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

/** Physical canonical render queue — landscape + portrait jobs with live status. */
export function CanonicalDepartmentQueuePanel({ queue, loading, error, onRefresh }: Props) {
  const entries = queue?.entries ?? [];

  return (
    <section style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: '#fff' }} data-canonical-queue-panel>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#eb1c24' }}>
          CANONICAL RENDER QUEUE
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            border: '1px solid #ccc',
            borderRadius: 4,
            background: '#fafafa',
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {queue ? (
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#555' }}>
          Capacity {queue.generatingCount}/{queue.capacity} generating · {queue.queuedCount} queued · {queue.readyCount}{' '}
          ready · {queue.failedCount} failed
        </p>
      ) : null}

      {error ? (
        <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#dc2626' }} role="alert">
          {error}
        </p>
      ) : null}

      {entries.length === 0 ? (
        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
          No jobs in queue. Confirm batch generation above to queue Founder Renders.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {entries.map((entry) => (
            <li
              key={entry.jobId}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #eee',
                fontSize: '11px',
              }}
              data-queue-job-id={entry.jobId}
              data-queue-status={entry.status}
            >
              <span style={{ fontWeight: 700, flex: '1 1 140px' }}>{entry.departmentName}</span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: statusColor[entry.status] ?? '#111',
                }}
              >
                {statusLabel(entry)}
              </span>
              <span style={{ color: '#666', fontSize: '10px' }}>{entry.jobId.slice(0, 18)}…</span>
              {entry.previewArtifactUrl ? (
                <a href={entry.previewArtifactUrl} target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: '#2563eb' }}>
                  Preview
                </a>
              ) : null}
              {entry.failureReason ? (
                <span style={{ color: '#dc2626', fontSize: '10px', width: '100%' }}>{entry.failureReason}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
