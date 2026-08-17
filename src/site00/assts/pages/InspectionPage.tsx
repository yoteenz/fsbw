import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AsstsEnvironmentShell } from '../components/AsstsEnvironmentShell';
import { AsstsDevPanel, useAsstsAutoRefresh } from '../components/AsstsDevPanel';
import { AsstsRegenerateSheet } from '../components/AsstsRegenerateSheet';
import { AsstsMobileNav, AsstsStatusBadge } from '../components/AsstsMobileNav';
import { ASSTS_ENVIRONMENT_SLOTS, type CorrectionCategory } from '../config/slots';
import {
  addAsstsNote,
  approveAsstsAsset,
  fetchAsstsAsset,
  regenerateAsstsAsset,
  rejectAsstsAsset,
  requestAsstsVariant,
  type AsstsAssetDetail,
} from '../services/asstsApi';

export default function AsstsInspectionPage() {
  const { assetId = '' } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<AsstsAssetDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [compareMaster, setCompareMaster] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);

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

  const isGenerating = asset?.status === 'GENERATING' || asset?.status === 'REGENERATING';
  useAsstsAutoRefresh(load, { hasGenerating: isGenerating });

  const version = asset?.currentVersion;
  const canReview = version && version.status === 'NEEDS_REVIEW';

  return (
    <AsstsEnvironmentShell slotKey={ASSTS_ENVIRONMENT_SLOTS.inspection}>
      <header className="site00-assts-header site00-assts-inspection-header">
        <Link to={asset?.batch_id ? `/assts/batches/${asset.batch_id}` : '/assts'} className="site00-label">
          ← BATCH
        </Link>
        <h1 className="site00-assts-inspection-title">{asset?.display_name ?? 'INSPECTION'}</h1>
        {asset ? (
          <div className="site00-assts-inspection-meta">
            <p className="site00-mono">{asset.asset_key}</p>
            {version ? (
              <p className="site00-label">
                V{String(version.version_number).padStart(2, '0')} · {version.status.replace(/_/g, ' ')}
              </p>
            ) : null}
            <AsstsStatusBadge status={asset.status} />
          </div>
        ) : null}
      </header>

      <AsstsDevPanel batchId={asset?.batch_id ?? null} onRefresh={load} />

      {error ? (
        <div className="site00-assts-alert site00-assts-panel" role="alert">
          {error}
        </div>
      ) : null}

      <div className="site00-assts-inspection-stage site00-assts-panel">
        {version?.previewUrl ? (
          <img src={version.previewUrl} alt="" className="site00-assts-inspection-hero" />
        ) : (
          <div className="site00-assts-inspection-hero site00-assts-inspection-hero--empty">
            {isGenerating ? 'Generating…' : 'No preview yet'}
          </div>
        )}
      </div>

      {compareMaster && version?.previewUrl ? (
        <p className="site00-assts-compare-hint site00-assts-panel">Compare to Master — toggle between current and approved reference (MVP).</p>
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
          disabled={!asset || busy || asset.status === 'LOCKED'}
          onClick={() => setRegenOpen(true)}
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
      </div>

      <div className="site00-assts-secondary-actions">
        <button type="button" className="site00-assts-btn site00-assts-btn--secondary" onClick={() => setCompareMaster((v) => !v)}>
          COMPARE TO MASTER
        </button>
        <button
          type="button"
          className="site00-assts-btn site00-assts-btn--secondary"
          disabled={!asset || busy}
          onClick={() => {
            if (!asset) return;
            const note = window.prompt('Variant request note:') ?? '';
            if (!note.trim()) return;
            setBusy(true);
            void requestAsstsVariant(asset.id, note)
              .then(() => load())
              .catch((e) => setError(e instanceof Error ? e.message : 'Variant request failed'))
              .finally(() => setBusy(false));
          }}
        >
          REQUEST VARIANT
        </button>
        <button
          type="button"
          className="site00-assts-btn site00-assts-btn--secondary"
          disabled={!asset || busy}
          onClick={() => {
            if (!asset) return;
            const note = window.prompt('Review note:') ?? '';
            if (!note.trim()) return;
            setBusy(true);
            void addAsstsNote(asset.id, note)
              .catch((e) => setError(e instanceof Error ? e.message : 'Note failed'))
              .finally(() => setBusy(false));
          }}
        >
          ADD NOTE
        </button>
        {version?.previewUrl ? (
          <a href={version.previewUrl} target="_blank" rel="noreferrer" className="site00-assts-btn site00-assts-btn--secondary">
            VIEW FULL SIZE
          </a>
        ) : null}
      </div>

      <AsstsRegenerateSheet
        open={regenOpen}
        busy={busy}
        onClose={() => setRegenOpen(false)}
        onSubmit={(categories: CorrectionCategory[], note: string) => {
          if (!asset) return;
          setBusy(true);
          void regenerateAsstsAsset(asset.id, categories, note)
            .then(() => {
              setRegenOpen(false);
              return load();
            })
            .catch((e) => setError(e instanceof Error ? e.message : 'Regenerate failed'))
            .finally(() => setBusy(false));
        }}
      />

      <AsstsMobileNav />
    </AsstsEnvironmentShell>
  );
}
