import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCompositionOverlayRef } from '../../composition';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsBottomDock } from '../components/AsstsMobileNav';
import { AsstsPageShell } from '../components/AsstsPageShell';
import { AsstsBatchCard, AsstsBatchChip, AsstsAssetListRow, AsstsCategoryTile } from '../components/AsstsCards';
import { AsstsMetricTile, AsstsSectionHeader } from '../components/AsstsGlass';
import { AsstsLibraryShell } from '../components/AsstsLibraryShell';
import { fetchAsstsLibrary, type AsstsLibraryResponse } from '../services/asstsApi';
import { batchProgressPercent, batchStatusHint } from '../utils/batchHelpers';

function batchNeedsAttention(priority: AsstsLibraryResponse['priorityBatch']): boolean {
  if (!priority) return false;
  const counts = priority.counts ?? { needsReview: 0, regenerating: 0 };
  if (priority.status === 'READY_TO_LOCK') return true;
  if ((counts.needsReview ?? 0) > 0) return true;
  if ((counts.regenerating ?? 0) > 0 || priority.status === 'GENERATING') return true;
  return false;
}


function AsstsLibraryPageContent() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') ?? '';
  const categoryFilter = searchParams.get('category') ?? '';
  const viewAll = searchParams.get('view') === 'all';

  const [data, setData] = useState<AsstsLibraryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const batchesOverlayRef = useCompositionOverlayRef('RecentBatchesPanel');

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
    (data?.priorityBatch?.counts?.regenerating ?? 0) > 0;

  useAsstsAutoRefresh(load, { hasGenerating: generating });

  const summary = data?.summary;
  const priority = data?.priorityBatch;
  const showPriority = priority && batchNeedsAttention(priority);
  const filteredAssets = data?.filteredAssets;
  const showFiltered = Boolean(statusFilter || categoryFilter || viewAll);
  const needsReviewCount = summary?.needsReview ?? 0;

  const activeMetric = useMemo(() => {
    if (statusFilter === 'needs-review') return 'needs-review';
    if (statusFilter === 'approved') return 'approved';
    if (viewAll) return 'all';
    return null;
  }, [statusFilter, viewAll]);

  const priorityProgress = priority ? batchProgressPercent(priority.counts ?? {}) : 0;
  const batchesList = summary?.batchesList ?? [];
  const leftBatches = batchesList.filter((_, i) => i % 2 === 0);
  const rightBatches = batchesList.filter((_, i) => i % 2 === 1);


  return (
    <AsstsPageShell variant="library">
        <div className="assts-library-composed">
          <div className="assts-composed-header">
            <header className="assts-hero assts-hero--spatial assts-hero--composed">
              <p className="assts-hero__eyebrow site00-label-red">SITE 00 · ASSTS</p>
              <h1 className="assts-hero__title">THE ASSET VAULT.</h1>
              <p className="assts-hero__tagline">EVERYTHING WE BUILD LIVES HERE.</p>
            </header>

            {summary ? (
              <div className="assts-metrics assts-metrics--hud" aria-label="Library metrics">
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
          </div>

          <AsstsDevPanel batchId={priority?.id ?? null} onRefresh={load} />

          {error ? (
            <div className="assts-alert assts-glass assts-glass--panel" role="alert">
              {error}
            </div>
          ) : null}

          {loading && !summary ? (
            <div className="assts-library-loading-skeleton" aria-hidden="true">
              <div className="assts-skeleton assts-skeleton--metric" />
              <div className="assts-skeleton assts-skeleton--metric" />
              <div className="assts-skeleton assts-skeleton--metric" />
              <div className="assts-skeleton assts-skeleton--metric" />
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
                  <p className="assts-empty">No assets match this filter.</p>
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
              <div
                className={`assts-composed-review ${showPriority ? 'assts-composed-review--active' : 'assts-composed-review--collapsed'}`}
              >
                {showPriority && priority ? (
                  <>
                    <AsstsSectionHeader
                      title="NEEDS YOUR REVIEW"
                      action={
                        <Link to={`/assts/batches/${priority.id}`} className="assts-link-action">
                          SEE ALL
                        </Link>
                      }
                    />
                    <AsstsBatchCard
                      batchKey={priority.batch_key}
                      category={priority.category}
                      displayName={priority.display_name}
                      thumbnailUrl={priority.thumbnailUrl}
                      reviewedCount={priority.counts?.approved ?? 0}
                      totalCount={priority.counts?.total ?? 0}
                      progressPercent={priority.progressPercent ?? priorityProgress}
                      to={`/assts/batches/${priority.id}`}
                      variant="priority"
                    />
                  </>
                ) : needsReviewCount === 0 && !generating ? (
                  <p className="assts-status-line">
                    <span className="assts-status-line__dot" aria-hidden="true" />
                    All clear — nothing needs review
                  </p>
                ) : generating ? (
                  <p className="assts-status-line assts-status-line--generating">
                    <span className="assts-status-line__dot" aria-hidden="true" />
                    Generation in progress
                  </p>
                ) : priority?.status === 'LOCKED' ? (
                  <p className="assts-status-line">
                    {priority.batch_key} locked — production environments live
                  </p>
                ) : null}
              </div>

              {batchesList.length > 0 ? (
                <div ref={batchesOverlayRef} className="assts-batches-peripheral">
                  <AsstsSectionHeader title="RECENT BATCHES" />
                  <div className="assts-batches-peripheral__grid">
                    <div className="assts-batches-peripheral__col assts-batches-peripheral__col--left">
                      {leftBatches.map((b) => (
                        <AsstsBatchChip
                          key={b.id}
                          batchKey={b.batch_key}
                          category={b.category}
                          displayName={b.display_name}
                          thumbnailUrl={b.thumbnailUrl}
                          status={b.status}
                          statusHint={batchStatusHint(b)}
                          to={`/assts/batches/${b.id}`}
                        />
                      ))}
                    </div>
                    <div className="assts-batches-peripheral__corridor" aria-hidden="true" />
                    <div className="assts-batches-peripheral__col assts-batches-peripheral__col--right">
                      {rightBatches.map((b) => (
                        <AsstsBatchChip
                          key={b.id}
                          batchKey={b.batch_key}
                          category={b.category}
                          displayName={b.display_name}
                          thumbnailUrl={b.thumbnailUrl}
                          status={b.status}
                          statusHint={batchStatusHint(b)}
                          to={`/assts/batches/${b.id}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="assts-composed-library">
                <AsstsSectionHeader title="BROWSE LIBRARY" />
                <div className="assts-category-grid assts-category-grid--composed">
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
              </div>
            </>
          )}
        </div>
    </AsstsPageShell>
  );
}

export default function AsstsLibraryPage() {
  return (
    <AsstsLibraryShell>
      <AsstsLibraryPageContent />
      <AsstsBottomDock />
    </AsstsLibraryShell>
  );
}
