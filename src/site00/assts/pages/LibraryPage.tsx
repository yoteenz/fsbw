import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsMobileNav, AsstsStatusBadge } from '../components/AsstsMobileNav';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsLibrary, type AsstsLibraryResponse } from '../services/asstsApi';

function batchNeedsAttention(priority: AsstsLibraryResponse['priorityBatch']): boolean {
  if (!priority) return false;
  if (priority.status === 'READY_TO_LOCK') return true;
  if (priority.counts.needsReview > 0) return true;
  if (priority.counts.regenerating > 0 || priority.status === 'GENERATING') return true;
  return false;
}

export default function AsstsLibraryPage() {
  const [data, setData] = useState<AsstsLibraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchAsstsLibrary();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, []);

  const generating =
    data?.priorityBatch?.status === 'GENERATING' ||
    (data?.priorityBatch?.counts.regenerating ?? 0) > 0 ||
    (data?.summary.needsReview === 0 && data?.priorityBatch?.counts.approved === 0 && data?.summary.totalAssets > 0);

  useAsstsAutoRefresh(load, { hasGenerating: generating });

  const summary = data?.summary;
  const priority = data?.priorityBatch;
  const showPriority = priority && batchNeedsAttention(priority);

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.library}>
      <header className="site00-assts-header">
        <p className="site00-label-red">ASSTS</p>
        <h1 className="site00-heading-lg site00-assts-title">THE ASSET VAULT.</h1>
      </header>

      <AsstsDevPanel batchId={priority?.id ?? null} onRefresh={load} />

      {error ? (
        <div className="site00-assts-alert site00-assts-panel" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !summary ? <p className="site00-assts-empty">Loading Asset Vault…</p> : null}

      {summary ? (
        <div className="site00-assts-metrics" aria-label="Library metrics">
          <div className="site00-assts-metric site00-assts-panel">
            <div className="site00-assts-metric__value">{summary.totalAssets}</div>
            <div className="site00-assts-metric__label">Assets</div>
          </div>
          <div className="site00-assts-metric site00-assts-panel">
            <div className="site00-assts-metric__value">{summary.batches}</div>
            <div className="site00-assts-metric__label">Batches</div>
          </div>
          <div className="site00-assts-metric site00-assts-panel">
            <div className="site00-assts-metric__value site00-assts-metric__value--review">{summary.needsReview}</div>
            <div className="site00-assts-metric__label">Need Review</div>
          </div>
          <div className="site00-assts-metric site00-assts-panel">
            <div className="site00-assts-metric__value">{summary.approved}</div>
            <div className="site00-assts-metric__label">Approved</div>
          </div>
        </div>
      ) : null}

      <p className="site00-assts-section-title">NEEDS YOUR REVIEW</p>
      {showPriority ? (
        <Link to={`/assts/batches/${priority!.id}`} className="site00-assts-priority-card site00-assts-panel">
          <div className="site00-assts-priority-card__top">
            <div>
              <strong className="site00-assts-priority-card__batch">{priority!.batch_key}</strong>
              <p className="site00-assts-priority-card__category">{priority!.category}</p>
              <p className="site00-assts-priority-card__progress">
                {priority!.counts.total} ASSETS · {priority!.counts.approved} / {priority!.counts.total} APPROVED
              </p>
            </div>
            <AsstsStatusBadge status={priority!.status} />
          </div>
          <p className="site00-assts-priority-card__cta">CONTINUE REVIEW →</p>
        </Link>
      ) : priority?.status === 'LOCKED' ? (
        <p className="site00-assts-empty site00-assts-panel site00-assts-empty--inline">
          {priority.batch_key} is locked — production environments are live.
        </p>
      ) : (
        <p className="site00-assts-empty site00-assts-panel site00-assts-empty--inline">
          {generating ? 'Generation in progress — assets will appear here automatically.' : 'No items need review right now.'}
        </p>
      )}

      <p className="site00-assts-section-title" id="batches">
        RECENT BATCHES
      </p>
      {summary?.batchesList.map((b) => (
        <Link key={b.id} to={`/assts/batches/${b.id}`} className="site00-assts-batch-row site00-assts-panel">
          <span>{b.batch_key}</span>
          <AsstsStatusBadge status={b.status} />
        </Link>
      ))}

      <p className="site00-assts-section-title">BROWSE LIBRARY</p>
      {(data?.categories ?? []).map((cat) => (
        <div key={cat.id} className="site00-assts-category-row site00-assts-panel">
          <span>{cat.label}</span>
          <span className="site00-label">{cat.count} assets</span>
        </div>
      ))}

      <AsstsMobileNav />
    </AsstsEnvironmentShell>
  );
}
