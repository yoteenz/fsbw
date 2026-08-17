import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
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

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 6000);
    return () => clearInterval(t);
  }, [load]);

  const readyToLock = batch?.status === 'READY_TO_LOCK';

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.batch}>
      <header className="site00-assts-header">
        <Link to="/assts" className="site00-label">
          ← LIBRARY
        </Link>
        <h1 className="site00-heading-lg" style={{ fontSize: '1.1rem', marginTop: 8 }}>
          {batch?.batch_key ?? 'BATCH'}
        </h1>
        <p className="site00-label">{batch?.category}</p>
        {batch ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <AsstsStatusBadge status={`${batch.counts.approved} APPROVED`} />
            <AsstsStatusBadge status={`${batch.counts.needsReview} NEED REVIEW`} />
            <AsstsStatusBadge status={`${batch.counts.regenerating} REGENERATING`} />
          </div>
        ) : null}
      </header>

      {error ? <p className="site00-assts-empty" role="alert">{error}</p> : null}

      {!batch?.assets.length ? (
        <p className="site00-assts-empty">Batch generating or empty.</p>
      ) : (
        <div className="site00-assts-grid" role="list">
          {batch.assets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className="site00-assts-asset-card"
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
                <div className="site00-assts-asset-card__img" />
              )}
              <div className="site00-assts-asset-card__meta">
                <div>{asset.asset_key}</div>
                <div>{asset.display_name}</div>
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
