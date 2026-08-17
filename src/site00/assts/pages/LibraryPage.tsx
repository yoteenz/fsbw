import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { libraryHomeAnchorAttr } from '../composition/library-home-anchors';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsVaultNav } from '../components/AsstsMobileNav';
import { AsstsPageShell } from '../components/AsstsPageShell';
import {
  AsstsAssetListRow,
  AsstsLibraryCategoryCard,
  AsstsLibraryPriorityCard,
  AsstsLibraryRecentBatchRow,
} from '../components/AsstsCards';
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
  const batchesList = summary?.batchesList ?? [];
  const categories = data?.categories ?? [];

  const activeMetric = useMemo(() => {
    if (statusFilter === 'needs-review') return 'needs-review';
    if (statusFilter === 'approved') return 'approved';
    if (viewAll) return 'all';
    return null;
  }, [statusFilter, viewAll]);

  const priorityProgress = priority ? batchProgressPercent(priority.counts ?? {}) : 0;

  if (showFiltered && filteredAssets) {
    return (
      <AsstsPageShell variant="library">
        <div className="assts-library-home">
          <header className="assts-library-home__header" {...libraryHomeAnchorAttr('library.header')}>
            <div className="assts-library-home__header-copy">
              <p className="assts-library-home__eyebrow site00-label-red">SITE 00 · ASSTS</p>
              <h1 className="assts-library-home__title">FILTERED LIBRARY</h1>
            </div>
          </header>
          <div className="assts-library-home__section-head">
            <h2 className="assts-library-home__section-title">
              {statusFilter === 'needs-review'
                ? 'NEEDS REVIEW'
                : statusFilter === 'approved'
                  ? 'APPROVED'
                  : 'ALL ASSETS'}
            </h2>
            <Link to="/assts" className="assts-library-home__see-all">
              CLEAR
            </Link>
          </div>
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
        </div>
      </AsstsPageShell>
    );
  }

  return (
    <AsstsPageShell variant="library">
      <div className="assts-library-home" data-composition="library-home-v1">
        <header className="assts-library-home__header" {...libraryHomeAnchorAttr('library.header')}>
          <div className="assts-library-home__header-copy">
            <p className="assts-library-home__eyebrow site00-label-red">SITE 00 · ASSTS</p>
            <h1 className="assts-library-home__title">THE ASSET VAULT.</h1>
            <p className="assts-library-home__tagline">EVERYTHING WE BUILD LIVES HERE.</p>
          </div>
          <div className="assts-library-home__emblem" aria-hidden="true">
            <span className="assts-library-home__emblem-mark">✦</span>
          </div>
        </header>

        <div {...libraryHomeAnchorAttr('library.hero')} aria-hidden="true" />

        {summary ? (
          <section className="assts-library-home__stats" {...libraryHomeAnchorAttr('library.stats')} aria-label="Library metrics">
            <Link
              to="/assts?view=all"
              className={`assts-library-home__stat ${activeMetric === 'all' ? 'assts-library-home__stat--active' : ''}`}
            >
              <span className="assts-library-home__stat-value">{summary.totalAssets}</span>
              <span className="assts-library-home__stat-label">ASSETS</span>
            </Link>
            <Link to="/assts/batches" className="assts-library-home__stat">
              <span className="assts-library-home__stat-value">{summary.batches}</span>
              <span className="assts-library-home__stat-label">BATCHES</span>
            </Link>
            <Link
              to="/assts?status=needs-review"
              className={`assts-library-home__stat ${activeMetric === 'needs-review' ? 'assts-library-home__stat--active' : ''}`}
            >
              <span className="assts-library-home__stat-value assts-library-home__stat-value--review">
                {summary.needsReview}
              </span>
              <span className="assts-library-home__stat-label">NEED REVIEW</span>
            </Link>
            <Link
              to="/assts?status=approved"
              className={`assts-library-home__stat ${activeMetric === 'approved' ? 'assts-library-home__stat--active' : ''}`}
            >
              <span className="assts-library-home__stat-value">{summary.approved}</span>
              <span className="assts-library-home__stat-label">APPROVED</span>
            </Link>
          </section>
        ) : null}

        {loading && !summary ? (
          <div className="assts-library-loading-skeleton" aria-hidden="true">
            <div className="assts-skeleton assts-skeleton--metric" />
            <div className="assts-skeleton assts-skeleton--metric" />
            <div className="assts-skeleton assts-skeleton--metric" />
            <div className="assts-skeleton assts-skeleton--metric" />
          </div>
        ) : null}

        <div className="assts-library-home__global-status" {...libraryHomeAnchorAttr('library.globalStatus')}>
          {generating ? (
            <p className="assts-library-home__status-strip assts-library-home__status-strip--generating">
              <span className="assts-library-home__status-strip-dot" aria-hidden="true" />
              GENERATION IN PROGRESS
            </p>
          ) : needsReviewCount === 0 ? (
            <p className="assts-library-home__status-strip">
              <span className="assts-library-home__status-strip-dot" aria-hidden="true" />
              ALL CLEAR — NOTHING NEEDS REVIEW
            </p>
          ) : (
            <p className="assts-library-home__status-strip assts-library-home__status-strip--attention">
              <span className="assts-library-home__status-strip-dot assts-library-home__status-strip-dot--review" aria-hidden="true" />
              {needsReviewCount} ITEM{needsReviewCount === 1 ? '' : 'S'} NEED REVIEW
            </p>
          )}
        </div>

        <AsstsDevPanel batchId={priority?.id ?? null} onRefresh={load} />

        {error ? (
          <div className="assts-alert assts-glass assts-glass--panel" role="alert">
            {error}
          </div>
        ) : null}

        <section {...libraryHomeAnchorAttr('library.needsReview')}>
          <div className="assts-library-home__section-head" {...libraryHomeAnchorAttr('library.needsReview.heading')}>
            <h2 className="assts-library-home__section-title">NEEDS YOUR REVIEW</h2>
            <Link
              to={priority ? `/assts/batches/${priority.id}` : '/assts?status=needs-review'}
              className="assts-library-home__see-all"
              {...libraryHomeAnchorAttr('library.needsReview.seeAll')}
            >
              SEE ALL
            </Link>
          </div>
          {showPriority && priority ? (
            <div {...libraryHomeAnchorAttr('library.needsReview.primaryCard')}>
              <AsstsLibraryPriorityCard
                batchKey={priority.batch_key}
                category={priority.category}
                displayName={priority.display_name}
                thumbnailUrl={priority.thumbnailUrl}
                reviewedCount={priority.counts?.approved ?? 0}
                totalCount={priority.counts?.total ?? 0}
                progressPercent={priority.progressPercent ?? priorityProgress}
                to={`/assts/batches/${priority.id}`}
              />
            </div>
          ) : (
            <p className="assts-library-home__empty-note">
              {needsReviewCount > 0
                ? `${needsReviewCount} asset${needsReviewCount === 1 ? '' : 's'} awaiting review — open See All`
                : 'No batches awaiting review right now'}
            </p>
          )}
        </section>

        <section {...libraryHomeAnchorAttr('library.recentBatches')}>
          <div className="assts-library-home__section-head" {...libraryHomeAnchorAttr('library.recentBatches.heading')}>
            <h2 className="assts-library-home__section-title">RECENT BATCHES</h2>
            <Link to="/assts/batches" className="assts-library-home__see-all">
              SEE ALL
            </Link>
          </div>
          {batchesList.length > 0 ? (
            <div className="assts-library-recent-list" {...libraryHomeAnchorAttr('library.recentBatches.list')}>
              {batchesList.map((b) => (
                <AsstsLibraryRecentBatchRow
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
          ) : (
            <p className="assts-library-home__empty-note">No batches registered yet</p>
          )}
        </section>

        <section {...libraryHomeAnchorAttr('library.browseLibrary')}>
          <div className="assts-library-home__section-head">
            <h2 className="assts-library-home__section-title">BROWSE LIBRARY</h2>
          </div>
          <div className="assts-library-browse-grid">
            {categories.map((cat, index) => {
              const isLast = index === categories.length - 1;
              const isOddLast = categories.length % 2 === 1 && isLast;
              return (
                <div key={cat.id} className={isOddLast ? 'assts-library-browse-grid__full' : undefined}>
                  <AsstsLibraryCategoryCard
                    id={cat.id}
                    label={cat.label}
                    count={cat.count}
                    coverUrl={cat.coverUrl}
                    to={`/assts?category=${cat.id}`}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AsstsPageShell>
  );
}

export default function AsstsLibraryPage() {
  return (
    <AsstsLibraryShell scrollLayout>
      <AsstsLibraryPageContent />
      <AsstsVaultNav />
    </AsstsLibraryShell>
  );
}
