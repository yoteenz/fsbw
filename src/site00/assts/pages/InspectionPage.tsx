import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsMobileNav, AsstsStatusBadge } from '../components/AsstsMobileNav';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import {
  approveAsstsAsset,
  fetchAsstsAsset,
  regenerateAsstsAsset,
  rejectAsstsAsset,
  type AsstsAssetDetail,
} from '../services/asstsApi';

export default function AsstsInspectionPage() {
  const { assetId = '' } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<AsstsAssetDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [compareMaster, setCompareMaster] = useState(false);

  const load = useCallback(async () => {
    if (!assetId) return;
    try {
      setError(null);
      const res = await fetchAsstsAsset(assetId);
      setAsset(res.asset);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load asset');
    }
  }, [assetId]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 5000);
    return () => clearInterval(t);
  }, [load]);

  const version = asset?.currentVersion;
  const canReview = version && version.status === 'NEEDS_REVIEW';

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.inspection}>
      <header className="site00-assts-header">
        <Link to={asset?.batch_id ? `/assts/batches/${asset.batch_id}` : '/assts'} className="site00-label">
          ← BATCH
        </Link>
        <h1 className="site00-heading-lg" style={{ fontSize: '1rem', marginTop: 8 }}>
          {asset?.display_name ?? 'INSPECTION'}
        </h1>
        {asset ? (
          <>
            <p className="site00-mono">{asset.asset_key}</p>
            <AsstsStatusBadge status={asset.status} />
          </>
        ) : null}
      </header>

      {error ? <p className="site00-assts-empty" role="alert">{error}</p> : null}

      {version?.previewUrl ? (
        <img src={version.previewUrl} alt="" className="site00-assts-inspection-hero" />
      ) : (
        <div className="site00-assts-empty">Asset generating…</div>
      )}

      {compareMaster && version?.previewUrl ? (
        <p className="site00-assts-empty">Compare to Master — MVP toggle active (same preview shown).</p>
      ) : null}

      <div className="site00-assts-actions">
        <button
          type="button"
          className="site00-assts-btn site00-assts-btn--approve"
          disabled={!canReview || busy}
          onClick={() => {
            if (!asset || !version) return;
            setBusy(true);
            void approveAsstsAsset(asset.id, version.id)
              .then((res) => {
                if (res.nextAssetId) navigate(`/assts/${res.nextAssetId}`);
                else void load();
              })
              .catch((e) => setError(e instanceof Error ? e.message : 'Approve failed'))
              .finally(() => setBusy(false));
          }}
        >
          APPROVE
        </button>
        <button
          type="button"
          className="site00-assts-btn site00-assts-btn--regen"
          disabled={!asset || busy}
          onClick={() => {
            if (!asset) return;
            const note = window.prompt('Regeneration note (optional):') ?? '';
            setBusy(true);
            void regenerateAsstsAsset(asset.id, ['LIGHTING'], note)
              .then(() => load())
              .catch((e) => setError(e instanceof Error ? e.message : 'Regenerate failed'))
              .finally(() => setBusy(false));
          }}
        >
          REGENERATE
        </button>
        <button
          type="button"
          className="site00-assts-btn site00-assts-btn--reject"
          disabled={!canReview || busy}
          onClick={() => {
            if (!asset || !version) return;
            const note = window.prompt('Rejection reason:') ?? '';
            setBusy(true);
            void rejectAsstsAsset(asset.id, version.id, note, ['OTHER'])
              .then(() => load())
              .catch((e) => setError(e instanceof Error ? e.message : 'Reject failed'))
              .finally(() => setBusy(false));
          }}
        >
          REJECT
        </button>
        <button type="button" className="site00-assts-btn" onClick={() => setCompareMaster((v) => !v)}>
          COMPARE TO MASTER
        </button>
      </div>

      <AsstsMobileNav />
    </AsstsEnvironmentShell>
  );
}
