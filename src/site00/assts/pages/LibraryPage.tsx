import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsBottomDock } from '../components/AsstsMobileNav';
import { AsstsBatchCard, AsstsAssetListRow, AsstsCategoryTile } from '../components/AsstsCards';
import { AsstsMetricTile, AsstsSectionHeader } from '../components/AsstsGlass';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsLibrary, type AsstsLibraryResponse } from '../services/asstsApi';

function batchNeedsAttention(priority: AsstsLibraryResponse['priorityBatch']): boolean {
  if (!priority) return false;
  if (priority.status === 'READY_TO_LOCK') return true;
  if (priority.counts.needsReview > 0) return true;
  if (priority.counts.regenerating > 0 || priority.status === 'GENERATING') return true;
  return false;
}

function batchStatusHint(batch: { counts: { needsReview: number; approved: number; total: number }; status: string }) {
  if (batch.counts.needsReview > 0) return `${String(batch.counts.needsReview).padStart(2, '0')} NEED REVIEW`;
  if (batch.status === 'LOCKED') return 'LOCKED';
  if (batch.counts.approved === batch.counts.total && batch.counts.total > 0) return 'ALL APPROVED';
  return batch.status.replace(/_/g, ' ');
}

export default function AsstsLibraryPage() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') ?? '';
  const categoryFilter = searchParams.get('category') ?? '';
  const viewAll = searchParams.get('view') === 'all';

  const [data, setData] = useState<AsstsLibraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetchAsstsLibrary({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        view: viewAll ? 'all' : undefined,
      });
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, viewAll]);

  const generating =
    data?.priorityBatch?.status === 'GENERATING' ||
    (data?.priorityBatch?.counts.regenerating ?? 0) > 0;

  useAsstsAutoRefresh(load, { hasGenerating: generating });

  const summary = data?.summary;
  const priority = data?.priorityBatch;
  const showPriority = priority && batchNeedsAttention(priority);
  const filteredAssets = data?.filteredAssets;
  const showFiltered = Boolean(statusFilter || categoryFilter || viewAll);

  const activeMetric = useMemo(() => {
    if (statusFilter === 'needs-review') return 'needs-review';
    if (statusFilter === 'approved') return 'approved';
    if (viewAll) return 'all';
    return null;
  }, [statusFilter, viewAll]);

  const priorityProgress = priority
    ? Math.round((priority.counts.approved / Math.max(priority.counts.total, 1)) * 100)
    : 0;

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.library}>
      <header className="assts-hero">
        <p className="assts-hero__eyebrow site00-label-red">SITE 00 · ASSTS</p>
        <h1 className="assts-hero__title">THE ASSET VAULT.</h1>
        <p className="assts-hero__tagline">EVERYTHING WE BUILD LIVES HERE.</p>
      </header>

      <AsstsDevPanel batchId={priority?.id ?? null} onRefresh={load} />

      {error ? (
        <div className="assts-alert assts-glass assts-glass--panel" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !summary ? <p className="assts-empty">Loading Asset Vault…</p> : null}

      {summary ? (
        <div className="assts-metrics" aria-label="Library metrics">
          <AsstsMetricTile
            value={summary.totalAssets}
            label="Assets"
            to="/assts?view=all"
            active={activeMetric === 'all'}
          />
          <AsstsMetricTile value={summary.batches} label="Batches" to="/assts/batches" />
          <AsstsMetricTile
            value={summary.needsReview}
            label="Need Review"
            to="/assts?status=needs-review"
            accent="review"
            active={activeMetric === 'needs-review'}
          />
          <AsstsMetricTile
            value={summary.approved}
            label="Approved"
            to="/assts?status=approved"
            active={activeMetric === 'approved'}
          />
        </div>
      ) : null}

      {showFiltered && filteredAssets ? (
        <>
          <AsstsSectionHeader
            title={
              statusFilter === 'needs-review'
                ? 'NEEDS REVIEW'
                : statusFilter === 'approved'
                  ? 'APPROVED ASSETS'
                  : categoryFilter
                    ? 'FILTERED LIBRARY'
                    : 'ALL ASSETS'
            }
            action={
              <Link to="/assts" className="assts-link-action">
                CLEAR
              </Link>
            }
          />
          <div className="assts-filtered-list">
            {filteredAssets.length === 0 ? (
              <p className="assts-empty assts-glass assts-glass--panel">No assets match this filter.</p>
            ) : (
              filteredAssets.map((a) => (
                <AsstsAssetListRow
                  key={a.id}
                  assetKey={a.asset_key}
                  displayName={a.display_name}
                  previewUrl={a.currentVersion?.previewUrl}
                  status={a.status}
                  to={`/assts/${a.id}`}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <AsstsSectionHeader
            title="NEEDS YOUR REVIEW"
            action={
              priority ? (
                <Link to={`/assts/batches/${priority.id}`} className="assts-link-action">
                  SEE ALL
                </Link>
              ) : null
            }
          />
          {showPriority && priority ? (
            <AsstsBatchCard
              batchKey={priority.batch_key}
              category={priority.category}
              displayName={priority.display_name}
              thumbnailUrl={priority.thumbnailUrl}
              reviewedCount={priority.counts.approved}
              totalCount={priority.counts.total}
              progressPercent={priority.progressPercent ?? priorityProgress}
              to={`/assts/batches/${priority.id}`}
              variant="priority"
            />
          ) : priority?.status === 'LOCKED' ? (
            <p className="assts-empty assts-glass assts-glass--panel assts-empty--inline">
              {priority.batch_key} is locked — production environments are live.
            </p>
          ) : (
            <p className="assts-empty assts-glass assts-glass--panel assts-empty--inline">
              {generating ? 'Generation in progress — assets will appear here automatically.' : 'No items need review right now.'}
            </p>
          )}

          <AsstsSectionHeader title="RECENT BATCHES" />
          <div className="assts-batch-list">
            {(summary?.batchesList ?? []).map((b) => (
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

          <AsstsSectionHeader title="BROWSE LIBRARY" />
          <div className="assts-category-grid">
            {(data?.categories ?? []).map((cat) => (
              <AsstsCategoryTile
                key={cat.id}
                id={cat.id}
                label={cat.label}
                count={cat.count}
                coverUrl={cat.coverUrl}
                to={`/assts?category=${cat.id}`}
              />
            ))}
          </div>
        </>
      )}

      <AsstsBottomDock />
    </AsstsEnvironmentShell>
  );
}
