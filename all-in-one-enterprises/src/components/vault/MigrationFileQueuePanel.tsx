import type { ArchiveMigrationBatchFile } from '../../vault/archiveMigrationTypes';
import { MIGRATION_FILE_QUEUE_LABELS } from '../../client-migration/migrationFileQueueTypes';

type QueueRow = ArchiveMigrationBatchFile & {
  queueState?: string;
  processingStage?: string;
  processingError?: string;
};

type Props = {
  files: QueueRow[];
  onRetry?: (fileId: string) => void;
  onRemove?: (fileId: string) => void;
};

export function MigrationFileQueuePanel({ files, onRetry, onRemove }: Props) {
  if (files.length === 0) {
    return <p className="aio-empty-state__text">No files in queue yet.</p>;
  }

  return (
    <div className="aio-office-table-wrap">
      <table className="aio-office-table">
        <thead>
          <tr>
            <th>File</th>
            <th>Type</th>
            <th>Size</th>
            <th>Status</th>
            <th>Stage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => {
            const state = f.queueState ?? f.processingState ?? 'QUEUED';
            const label = MIGRATION_FILE_QUEUE_LABELS[state as keyof typeof MIGRATION_FILE_QUEUE_LABELS] ?? state;
            return (
              <tr key={f.id}>
                <td>{f.fileName}</td>
                <td>{f.mimeType}</td>
                <td>{Math.round(f.fileSizeBytes / 1024)} KB</td>
                <td>
                  {label}
                  {f.processingError ? <span className="aio-prototype-note"> — {f.processingError}</span> : null}
                </td>
                <td>{f.processingStage ?? '—'}</td>
                <td style={{ display: 'flex', gap: '0.35rem' }}>
                  {onRetry && state === 'FAILED' ? (
                    <button type="button" className="aio-btn aio-btn--sm aio-btn--outline-dark" onClick={() => onRetry(f.id)}>
                      Retry
                    </button>
                  ) : null}
                  {onRemove && ['QUEUED', 'FAILED', 'UNSUPPORTED'].includes(String(state)) ? (
                    <button type="button" className="aio-btn aio-btn--sm aio-btn--outline-dark" onClick={() => onRemove(f.id)}>
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
