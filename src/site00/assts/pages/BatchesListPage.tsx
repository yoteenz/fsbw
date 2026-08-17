import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsBottomDock } from '../components/AsstsMobileNav';
import { AsstsBatchCard } from '../components/AsstsCards';
import { AsstsSectionHeader } from '../components/AsstsGlass';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsLibrary } from '../services/asstsApi';

function batchStatusHint(batch: { counts: { needsReview: number; approved: number; total: number }; status: string }) {
  if (batch.counts.needsReview > 0) return `${String(batch.counts.needsReview).padStart(2, '0')} NEED REVIEW`;
  if (batch.status === 'LOCKED') return 'LOCKED';
  if (batch.counts.approved === batch.counts.total && batch.counts.total > 0) return 'ALL APPROVED';
  return batch.status.replace(/_/g, ' ');
}

export default function AsstsBatchesListPage() {
  const [batches, setBatches] = useState<Awaited<ReturnType<typeof fetchAsstsLibrary>>['summary']['batchesList']>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchAsstsLibrary();
      setBatches(res.summary.batchesList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, []);

  useAsstsAutoRefresh(load, { hasGenerating: false });

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.library}>
      <header className="assts-page-header">
        <Link to="/assts" className="assts-back-link">
          ← LIBRARY
        </Link>
        <h1 className="assts-page-header__title">BATCHES</h1>
        <p className="assts-page-header__sub">Production review groups</p>
      </header>

      <AsstsDevPanel batchId={null} onRefresh={load} />

      {error ? (
        <div className="assts-alert assts-glass assts-glass--panel" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? <p className="assts-empty">Loading batches…</p> : null}

      <AsstsSectionHeader title="ALL BATCHES" />
      <div className="assts-batch-list">
        {batches.map((b) => (
          <AsstsBatchCard
            key={b.id}
            batchKey={b.batch_key}
            category={b.category}
            displayName={b.display_name}
            thumbnailUrl={b.thumbnailUrl}
            reviewedCount={b.counts.approved}
            totalCount={b.counts.total}
            progressPercent={Math.round((b.counts.approved / Math.max(b.counts.total, 1)) * 100)}
            status={b.status}
            statusHint={batchStatusHint(b)}
            to={`/assts/batches/${b.id}`}
            variant="row"
          />
        ))}
      </div>

      <AsstsBottomDock />
    </AsstsEnvironmentShell>
  );
}
