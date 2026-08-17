import { Link } from 'react-router-dom';
import { AsstsGlass, AsstsProgress } from './AsstsGlass';
import { AsstsStatusBadge } from './AsstsMobileNav';

type BatchCardProps = {
  batchKey: string;
  category: string | null;
  displayName?: string;
  thumbnailUrl?: string | null;
  reviewedCount: number;
  totalCount: number;
  progressPercent: number;
  status?: string;
  to: string;
  variant?: 'priority' | 'row';
  statusHint?: string;
};

export function AsstsBatchCard({
  batchKey,
  category,
  displayName,
  thumbnailUrl,
  reviewedCount,
  totalCount,
  progressPercent,
  status,
  to,
  variant = 'priority',
  statusHint,
}: BatchCardProps) {
  if (variant === 'row') {
    return (
      <Link to={to} className="assts-batch-row assts-depth-recessed">
        <div className="assts-batch-row__thumb">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" loading="lazy" />
          ) : (
            <div className="assts-batch-row__thumb--empty" aria-hidden="true" />
          )}
        </div>
        <div className="assts-batch-row__body">
          <div className="assts-batch-row__key">{batchKey}</div>
          <div className="assts-batch-row__cat">{category ?? displayName ?? 'BATCH'}</div>
          {statusHint ? <div className="assts-batch-row__hint">{statusHint}</div> : null}
        </div>
        {status ? <AsstsStatusBadge status={status} /> : null}
      </Link>
    );
  }

  return (
    <Link to={to} className="assts-review-bay">
      <div className="assts-review-bay__display">
        <span className="assts-review-bay__locator assts-review-bay__locator--tl" aria-hidden="true" />
        <span className="assts-review-bay__locator assts-review-bay__locator--tr" aria-hidden="true" />
        <span className="assts-review-bay__locator assts-review-bay__locator--bl" aria-hidden="true" />
        <span className="assts-review-bay__locator assts-review-bay__locator--br" aria-hidden="true" />
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="assts-review-bay__img" loading="lazy" />
        ) : (
          <div className="assts-review-bay__img assts-review-bay__img--empty" aria-hidden="true" />
        )}
      </div>
      <div className="assts-review-bay__panel">
        <strong className="assts-priority-card__batch">{batchKey}</strong>
        <p className="assts-priority-card__category">{category ?? displayName}</p>
        <p className="assts-priority-card__progress">
          {String(reviewedCount).padStart(2, '0')} / {String(totalCount).padStart(2, '0')} REVIEWED
        </p>
        <AsstsProgress value={progressPercent} max={100} />
        <span className="assts-review-bay__cta">CONTINUE REVIEW →</span>
      </div>
    </Link>
  );
}

type AssetCardProps = {
  assetKey: string;
  displayName: string;
  variantLabel?: string;
  environmentRoleLabel?: string | null;
  environmentRoleSublabel?: string | null;
  previewUrl?: string | null;
  status: string;
  onClick: () => void;
  compact?: boolean;
  selected?: boolean;
};

export function AsstsAssetCard({
  assetKey,
  displayName,
  variantLabel,
  environmentRoleLabel,
  environmentRoleSublabel,
  previewUrl,
  status,
  onClick,
  compact,
  selected,
}: AssetCardProps) {
  return (
    <button
      type="button"
      className={`assts-wall-frame ${selected ? 'assts-wall-frame--active' : ''} ${compact ? 'assts-wall-frame--compact' : ''}`}
      onClick={onClick}
    >
      <div className="assts-wall-frame__mount">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="assts-wall-frame__img" loading="lazy" />
        ) : (
          <div className="assts-wall-frame__img assts-wall-frame__img--empty" aria-hidden="true" />
        )}
        <span className="assts-asset-card__status-dot" data-status={status.replace(/_/g, '-').toLowerCase()} aria-hidden="true" />
      </div>
      <div className="assts-wall-frame__meta">
        {environmentRoleLabel ? (
          <div className="assts-env-role">
            <span className="assts-env-role__label">{environmentRoleLabel}</span>
            {environmentRoleSublabel ? (
              <span className="assts-env-role__sublabel">{environmentRoleSublabel}</span>
            ) : null}
          </div>
        ) : null}
        <div className="assts-mono assts-asset-card__key">{assetKey}</div>
        <div className="assts-asset-card__name">{displayName}</div>
        {variantLabel ? <div className="assts-asset-card__variant">{variantLabel}</div> : null}
        <AsstsStatusBadge status={status} />
      </div>
    </button>
  );
}

type CategoryTileProps = {
  id: string;
  label: string;
  count: number;
  coverUrl?: string | null;
  to: string;
};

export function AsstsCategoryTile({ label, count, coverUrl, to }: CategoryTileProps) {
  const [num, ...nameParts] = label.split(' ');
  const name = nameParts.join(' ');
  return (
    <Link to={to} className="assts-archive-bay">
      <div className="assts-archive-bay__inset">
        {coverUrl ? (
          <img src={coverUrl} alt="" loading="lazy" />
        ) : (
          <div className="assts-archive-bay__empty" aria-hidden="true">
            <div className="assts-archive-bay__empty-frame" />
          </div>
        )}
      </div>
      <div className="assts-archive-bay__band">
        <span className="assts-category-tile__num">{num}</span>
        <span className="assts-category-tile__name">{name}</span>
        <span className="assts-category-tile__count">{count} ASSETS</span>
      </div>
    </Link>
  );
}

type AssetListRowProps = {
  assetKey: string;
  displayName: string;
  previewUrl?: string | null;
  status: string;
  to: string;
};

export function AsstsAssetListRow({ assetKey, displayName, previewUrl, status, to }: AssetListRowProps) {
  return (
    <Link to={to} className="assts-asset-list-row assts-glass assts-glass--card assts-glass--pressable">
      <div className="assts-asset-list-row__thumb">
        {previewUrl ? <img src={previewUrl} alt="" loading="lazy" /> : <div className="assts-asset-list-row__thumb--empty" />}
      </div>
      <div className="assts-asset-list-row__body">
        <div className="assts-mono">{assetKey}</div>
        <div className="assts-asset-list-row__name">{displayName}</div>
      </div>
      <AsstsStatusBadge status={status} />
    </Link>
  );
}

export function AsstsBatchSummaryPanel({
  counts,
  progressPercent,
}: {
  counts: { total: number; approved: number; needsReview: number; regenerating: number; rejected: number };
  progressPercent: number;
}) {
  return (
    <AsstsGlass variant="panel" className="assts-batch-summary assts-depth-floating">
      <div className="assts-batch-summary__stats">
        <div className="assts-batch-summary__stat">
          <span className="assts-batch-summary__stat-value">{counts.approved}</span>
          <span className="assts-batch-summary__stat-label assts-batch-summary__stat-label--approved">APPROVED</span>
        </div>
        <div className="assts-batch-summary__stat">
          <span className="assts-batch-summary__stat-value">{counts.needsReview}</span>
          <span className="assts-batch-summary__stat-label assts-batch-summary__stat-label--review">NEED REVIEW</span>
        </div>
        <div className="assts-batch-summary__stat">
          <span className="assts-batch-summary__stat-value">{counts.regenerating}</span>
          <span className="assts-batch-summary__stat-label assts-batch-summary__stat-label--regen">REGENERATING</span>
        </div>
        <div className="assts-batch-summary__stat">
          <span className="assts-batch-summary__stat-value">{counts.rejected}</span>
          <span className="assts-batch-summary__stat-label assts-batch-summary__stat-label--rejected">REJECTED</span>
        </div>
      </div>
      <AsstsProgress value={progressPercent} max={100} showRing size="md" />
    </AsstsGlass>
  );
}
