import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNdxbookPagePipeline } from '../../../../hooks/useNdxbookPagePipeline';
import { VOLUME_LABELS } from '../../../../studio-os-core/ndxbook/constants';
import type { NdxbookPage } from '../../../../studio-os-core/ndxbook/types';
import type { StudioIntelligenceReview } from '../../../../studio-os-core/ndxbook/types';
import { adminStudioNdxbookSocialAccountsPath } from '../../../../utils/adminStudioRoutes';
import { NR, nrLabel, nrPanel, nrSectionTitle } from './ndxbookNewsroomTheme';

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultScheduleLaterToday(): string {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  return d.toISOString();
}

function ReviewDimension({ label, dim }: { label: string; dim: StudioIntelligenceReview['clarity'] }) {
  return (
    <div className="p-2 border" style={{ borderColor: dim.pass ? '#22C55E' : NR.gold }}>
      <p style={{ ...nrLabel, color: dim.pass ? '#22C55E' : NR.gold, fontFamily: '"Futura PT Medium"' }}>
        {label} · {dim.score}%
      </p>
      <p style={{ ...nrLabel, fontSize: '6px' }}>{dim.note}</p>
    </div>
  );
}

function statusLabel(page: NdxbookPage): string {
  if (page.pipeline?.approvedAt && page.status === 'review') return 'APPROVED · AWAITING SCHEDULE';
  return page.status.replace('-', ' ').toUpperCase();
}

type Props = {
  page: NdxbookPage | null;
  onRefresh?: () => void;
};

export function NdxbookPagePipelinePanel({ page, onRefresh }: Props) {
  const {
    summary,
    instagramStatus,
    accountsLoading,
    createPage001,
    submitReview,
    approveProduction,
    scheduleInstagram,
  } = useNdxbookPagePipeline();

  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState(defaultScheduleLaterToday);

  const review = page?.pipeline?.studioReview ?? null;
  const canCreate = summary.pageCount === 0;

  const igReady = useMemo(
    () => instagramStatus.active && instagramStatus.postingEnabled,
    [instagramStatus]
  );

  const run = async (action: string, fn: () => void | Promise<void>) => {
    setBusy(action);
    setError(null);
    setMessage(null);
    try {
      await fn();
      onRefresh?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="p-3 mb-3" style={{ ...nrPanel, borderLeft: `4px solid ${NR.indigo}` }}>
      <p style={nrSectionTitle}>PAGE 001 PIPELINE · FIRST POST</p>
      <p style={nrLabel}>Money / Credit / Business Education · Instagram only · No fake history</p>

      <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-4">
        {[
          ['PAGE COUNT', String(summary.pageCount).padStart(3, '0')],
          ['NEXT PAGE', `page ${String(summary.nextPageNumber).padStart(3, '0')}`],
          ['INSTAGRAM', accountsLoading ? '…' : igReady ? 'READY' : 'CHECK'],
          ['STATUS', page ? statusLabel(page) : 'NO PAGE'],
        ].map(([label, val]) => (
          <div key={label} className="p-2 border text-center" style={{ borderColor: NR.panelBorder }}>
            <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: NR.accent }}>{val}</p>
            <p style={{ ...nrLabel, fontSize: '5px' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-2 p-2 border" style={{ borderColor: igReady ? '#22C55E' : NR.gold }}>
        <p style={{ ...nrLabel, fontFamily: '"Futura PT Medium"', color: igReady ? '#22C55E' : NR.gold }}>
          INSTAGRAM · {instagramStatus.message.toUpperCase()}
        </p>
        {instagramStatus.accountLabel ? (
          <p style={{ ...nrLabel, fontSize: '6px' }}>ACCOUNT · {instagramStatus.accountLabel}</p>
        ) : null}
        <Link to={adminStudioNdxbookSocialAccountsPath()} style={{ ...nrLabel, color: NR.indigo, fontSize: '6px' }}>
          SOCIAL ACCOUNTS →
        </Link>
      </div>

      {canCreate ? (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            run('create', () => {
              createPage001();
              setMessage('Page 001 created — first official NDXBook knowledge asset.');
            })
          }
          className="mt-3 w-full py-2 text-[7px] font-futura border"
          style={{ fontWeight: 515, borderColor: NR.accent, color: NR.accent, background: 'rgba(220,38,38,0.06)' }}
        >
          {busy === 'create' ? 'CREATING…' : '＋ CREATE PAGE 001'}
        </button>
      ) : null}

      {page ? (
        <div className="mt-3 space-y-2">
          <p style={{ ...nrLabel, color: NR.accent, fontFamily: '"Futura PT Medium"' }}>
            {page.pageLabel.toUpperCase()} · {page.title.toUpperCase()}
          </p>
          <p style={nrLabel}>
            {VOLUME_LABELS[page.volumeId]} · {page.chapter.toUpperCase()} · {page.hook}
          </p>

          {page.thumbnail ? (
            <div className="p-2 border" style={{ borderColor: NR.panelBorder }}>
              <p style={{ ...nrSectionTitle, fontSize: '7px' }}>VISUAL · NDXBOOK IDENTITY</p>
              <img src={page.thumbnail} alt={`${page.pageLabel} cover`} className="w-full max-w-[200px] border" style={{ borderColor: NR.panelBorder }} />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1">
            {page.status === 'draft' ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() =>
                  run('review', () => {
                    const result = submitReview(page.id);
                    if (!result.ok) setError(result.error ?? 'Review failed');
                    else setMessage('Studio Intelligence review complete — check scores below.');
                  })
                }
                className="px-2 py-1 text-[6px] font-futura border"
                style={{ borderColor: NR.indigo, color: NR.indigo }}
              >
                {busy === 'review' ? '…' : 'RUN STUDIO INTELLIGENCE'}
              </button>
            ) : null}

            {page.status === 'review' && !page.pipeline?.approvedAt ? (
              <button
                type="button"
                disabled={busy !== null || !review?.overallPass}
                onClick={() =>
                  run('approve', () => {
                    const result = approveProduction(page.id);
                    if (!result.ok) setError(result.error ?? 'Approval failed');
                    else setMessage(`${page.pageLabel} approved for production.`);
                  })
                }
                className="px-2 py-1 text-[6px] font-futura border"
                style={{ borderColor: '#22C55E', color: '#22C55E' }}
              >
                {busy === 'approve' ? '…' : 'APPROVE PRODUCTION'}
              </button>
            ) : null}

            {page.pipeline?.approvedAt && page.status !== 'published' ? (
              <>
                <input
                  type="datetime-local"
                  value={toDatetimeLocalValue(scheduledAt)}
                  onChange={(e) => setScheduledAt(new Date(e.target.value).toISOString())}
                  className="text-[6px] border px-1 py-1"
                  style={{ borderColor: NR.panelBorder }}
                />
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() =>
                    run('schedule', async () => {
                      const result = await scheduleInstagram(page.id, scheduledAt, false);
                      if (!result.ok && !result.page) setError(result.error ?? 'Schedule failed');
                      else setMessage(result.error ?? `${page.pageLabel} scheduled for Instagram.`);
                    })
                  }
                  className="px-2 py-1 text-[6px] font-futura border"
                  style={{ borderColor: NR.gold, color: NR.gold }}
                >
                  {busy === 'schedule' ? '…' : 'SCHEDULE INSTAGRAM'}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() =>
                    run('publish', async () => {
                      const result = await scheduleInstagram(page.id, new Date().toISOString(), true);
                      if (!result.ok && !result.page) setError(result.error ?? 'Publish failed');
                      else setMessage(result.error ?? `${page.pageLabel} published — saved to Knowledge Library.`);
                    })
                  }
                  className="px-2 py-1 text-[6px] font-futura border"
                  style={{ borderColor: NR.accent, color: NR.accent }}
                >
                  {busy === 'publish' ? '…' : 'PUBLISH NOW'}
                </button>
              </>
            ) : null}
          </div>

          {review ? (
            <div className="mt-2">
              <p style={nrSectionTitle}>STUDIO INTELLIGENCE · {review.overallPass ? 'PASS' : 'NEEDS WORK'}</p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                <ReviewDimension label="CLARITY" dim={review.clarity} />
                <ReviewDimension label="ACCURACY" dim={review.accuracy} />
                <ReviewDimension label="TONE" dim={review.tone} />
                <ReviewDimension label="BRAND" dim={review.brandAlignment} />
                <ReviewDimension label="AUTHENTICITY" dim={review.authenticity} />
              </div>
            </div>
          ) : null}

          {page.pipeline?.publishError ? (
            <p style={{ ...nrLabel, color: NR.gold, fontSize: '6px' }}>NOTE · {page.pipeline.publishError}</p>
          ) : null}
        </div>
      ) : (
        <p style={{ ...nrLabel, marginTop: 8 }}>Create Page 001 to begin NDXBook&apos;s real content history.</p>
      )}

      {message ? <p style={{ ...nrLabel, color: '#22C55E', marginTop: 6 }}>{message}</p> : null}
      {error ? <p style={{ ...nrLabel, color: NR.accent, marginTop: 6 }}>{error}</p> : null}

      {summary.hasPage001 && summary.pageCount === 1 ? (
        <p style={{ ...nrLabel, fontSize: '6px', marginTop: 8, color: NR.gray }}>
          After Page 001 works · create Page 002 · continue Instagram-only until reliable.
        </p>
      ) : null}
    </section>
  );
}
