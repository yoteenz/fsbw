import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsMobileNav, AsstsStatusBadge } from '../components/AsstsMobileNav';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsBatch, lockAsstsBatch, type AsstsBatchDetail } from '../services/asstsApi';

export default function AsstsBatchPage() {
  const { batchId = '' } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<AsstsBatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);

  const load = useCallback(async () => {
    if (!batchId) return;
    try {
      setError(null);
      const res = await fetchAsstsBatch(batchId);
      setBatch(res.batch);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load batch');
    }
  }, [batchId]);

  const hasGenerating =
    batch?.status === 'GENERATING' ||
    (batch?.counts.regenerating ?? 0) > 0 ||
    batch?.assets.some((a) => a.status === 'GENERATING' || a.status === 'REGENERATING');

  useAsstsAutoRefresh(load, { hasGenerating: !!hasGenerating });

  const readyToLock = batch?.status === 'READY_TO_LOCK';

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.batch}>
      <header className="site00-assts-header">
        <Link to="/assts" className="site00-label">
          ← LIBRARY
        </Link>
        <h1 className="site00-heading-lg site00-assts-batch-title">{batch?.batch_key ?? 'BATCH'}</h1>
        <p className="site00-assts-batch-subtitle">{batch?.display_name ?? batch?.category}</p>
        {batch ? (
          <div className="site00-assts-batch-stats">
            <span className="site00-label">{String(batch.counts.total).padStart(2, '0')} ASSETS</span>
            <AsstsStatusBadge status={`${batch.counts.approved} APPROVED`} variant="muted" />
            <AsstsStatusBadge status={`${batch.counts.needsReview} NEED REVIEW`} variant="review" />
          </div>
        ) : null}
      </header>

      <AsstsDevPanel batchId={batchId} onRefresh={load} />

      {error ? (
        <div className="site00-assts-alert site00-assts-panel" role="alert">
          {error}
        </div>
      ) : null}

      {!batch?.assets.length ? (
        <p className="site00-assts-empty">
          {hasGenerating ? 'Batch generating — assets will appear automatically.' : 'Batch empty or loading…'}
        </p>
      ) : (
        <div className="site00-assts-grid" role="list">
          {batch.assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className="site00-assts-asset-card site00-assts-panel"
              onClick={() => navigate(`/assts/${asset.id}`)}
            >
              {asset.currentVersion?.previewUrl ? (
                <img
                  src={asset.currentVersion.previewUrl}
                  alt=""
                  className="site00-assts-asset-card__img"
                  loading="lazy"
                />
              ) : (
                <div className="site00-assts-asset-card__img site00-assts-asset-card__img--empty" />
              )}
              <div className="site00-assts-asset-card__meta">
                <div className="site00-mono">{asset.asset_key}</div>
                <div className="site00-assts-asset-card__name">{asset.display_name}</div>
                <AsstsStatusBadge status={asset.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      {batch && readyToLock ? (
        <div className="site00-assts-lock-bar">
          <span>BATCH READY TO LOCK</span>
          <button
            type="button"
            disabled={locking}
            onClick={() => {
              setLocking(true);
              void lockAsstsBatch(batch.id)
                .then(() => load())
                .catch((e) => setError(e instanceof Error ? e.message : 'Lock failed'))
                .finally(() => setLocking(false));
            }}
          >
            LOCK BATCH
          </button>
        </div>
      ) : null}

      <AsstsMobileNav />
    </AsstsEnvironmentShell>
  );
}
