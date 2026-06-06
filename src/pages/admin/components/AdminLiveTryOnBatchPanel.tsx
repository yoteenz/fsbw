import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LIVE_TRY_ON_PHOTO_MODEL_LABELS,
  type LiveTryOnPhotoModel,
} from '../../../constants/liveTryOnSpikeAssets';
import {
  LIVE_TRY_ON_BATCH_NOIR_DEFAULTS,
  liveTryOnNoirBatchManifestRows,
  type LiveTryOnBatchJob,
} from '../../../constants/liveTryOnBatchManifest';
import {
  getAdminLiveTryOnBatchManifest,
  postAdminLiveTryOnBatchStatus,
  postAdminLiveTryOnBatchStep,
  postWigPreviewLiveNoirColorOneAngle,
  type LiveTryOnPortraitPreviewUrls,
} from '../../../utils/api';

type MissingStep = {
  step: 'color' | 'portrait' | 'overlay_isolate' | 'overlay_cut';
  angle: 'left' | 'front' | 'right';
  photoModel?: LiveTryOnPhotoModel;
};

type LogLine = { t: string; msg: string };

type BusyAction = 'status' | 'color' | 'next' | 'row' | 'batch' | 'auto' | 'portraits' | 'regen';

type PipelineSummary = {
  colorDone: boolean;
  portraitsDone: number;
  portraitsTotal: number;
  overlaysDone: number;
  overlaysTotal: number;
  shopperReady: boolean;
  headline: string;
  detail: string;
  nextAction: string;
};

const ANGLES = ['left', 'front', 'right'] as const;

const STEP_LABELS: Record<MissingStep['step'], string> = {
  color: 'Mannequin color WebP',
  portrait: 'Photoreal portrait (NBP/GPT2)',
  overlay_isolate: 'NBP hair isolation (work PNG)',
  overlay_cut: 'Ideogram cut → transparent overlay PNG',
};

function jobBody(
  job: LiveTryOnBatchJob,
  compareBoth: boolean,
  photoModel: LiveTryOnPhotoModel,
  overlayWinner: LiveTryOnPhotoModel | null
) {
  return {
    ...job,
    styling: 'NONE',
    compareModels: compareBoth,
    photoModel: compareBoth ? undefined : photoModel,
    overlayWinner: compareBoth && overlayWinner ? overlayWinner : undefined,
  };
}

function expectedTotals(
  compareBoth: boolean,
  overlayWinner: LiveTryOnPhotoModel | null
): { portraitsTotal: number; overlaysTotal: number } {
  const portraitModels = compareBoth ? 2 : 1;
  const overlayModels = compareBoth ? (overlayWinner ? 1 : 0) : 1;
  return { portraitsTotal: 3 * portraitModels, overlaysTotal: 3 * overlayModels };
}

function finalOverlayCounts(
  missing: MissingStep[],
  compareBoth: boolean,
  overlayWinner: LiveTryOnPhotoModel | null
) {
  const { overlaysTotal } = expectedTotals(compareBoth, overlayWinner);
  const pendingFinal = new Set(
    missing
      .filter((m) => m.step === 'overlay_isolate' || m.step === 'overlay_cut')
      .map((m) => `${m.photoModel || 'nbp'}:${m.angle}`)
  );
  const overlayStepsLeft = missing.filter(
    (m) => m.step === 'overlay_isolate' || m.step === 'overlay_cut'
  ).length;
  return {
    overlaysTotal,
    overlaysDone: overlaysTotal - pendingFinal.size,
    overlayStepsLeft,
  };
}

function summarizePipeline(
  missing: MissingStep[],
  compareBoth: boolean,
  overlayWinner: LiveTryOnPhotoModel | null,
  awaitingWinner: boolean
): PipelineSummary {
  const { portraitsTotal } = expectedTotals(compareBoth, overlayWinner);
  const { overlaysTotal, overlaysDone, overlayStepsLeft } = finalOverlayCounts(
    missing,
    compareBoth,
    overlayWinner
  );
  const missingColor = missing.filter((m) => m.step === 'color');
  const missingPortrait = missing.filter((m) => m.step === 'portrait');

  const colorDone = missingColor.length === 0;
  const portraitsDone = portraitsTotal - missingPortrait.length;
  const shopperReady = missing.length === 0;

  if (shopperReady) {
    return {
      colorDone: true,
      portraitsDone: portraitsTotal,
      portraitsTotal,
      overlaysDone: overlaysTotal,
      overlaysTotal,
      shopperReady: true,
      headline: 'ROW READY FOR LIVE TRY ON',
      detail: 'All layers are in Storage. Shoppers can open Live Try On for this color.',
      nextAction: 'Pick another color or run BATCH ALL NOIR COLORS to finish the catalog.',
    };
  }

  if (!colorDone) {
    return {
      colorDone: false,
      portraitsDone,
      portraitsTotal,
      overlaysDone,
      overlaysTotal,
      shopperReady: false,
      headline: 'STEP 1 · MANNEQUIN COLOR WEBPS MISSING',
      detail: `Grey NOIR mannequin reference images (L/F/R) are not in Storage yet for this color.`,
      nextAction: 'Tap COLOR WEBPS or RUN ALL FOR ROW to generate the three color angles first.',
    };
  }

  if (missingPortrait.length > 0) {
    return {
      colorDone: true,
      portraitsDone,
      portraitsTotal,
      overlaysDone,
      overlaysTotal,
      shopperReady: false,
      headline: `STEP 2 · PORTRAITS ${portraitsDone}/${portraitsTotal}`,
      detail: compareBoth
        ? `Generate NBP + GPT Image 2 portraits from the same mannequin prompt. Still need: ${missingPortrait.map((m) => `${m.angle} (${m.photoModel})`).join(', ')}.`
        : `Photoreal portraits still need: ${missingPortrait.map((m) => `${m.angle}${m.photoModel ? ` (${m.photoModel})` : ''}`).join(', ')}.`,
      nextAction: 'Tap RUN PORTRAITS ONLY or RUN NEXT STEP. Compare models before locking a winner for cut.',
    };
  }

  if (awaitingWinner && compareBoth && !overlayWinner) {
    return {
      colorDone: true,
      portraitsDone,
      portraitsTotal,
      overlaysDone: 0,
      overlaysTotal: 3,
      shopperReady: false,
      headline: 'STEP 2B · PICK WINNER FOR CUT',
      detail:
        'Both portrait sets are ready. Compare NBP vs GPT Image 2 below (or on Live Try On). Lock a winner — only that model gets isolate + Ideogram cut.',
      nextAction: 'Select WINNER FOR CUT, then RUN NEXT STEP for isolate + Ideogram (6 steps: 3 isolate + 3 cut).',
    };
  }

  return {
    colorDone: true,
    portraitsDone,
    portraitsTotal,
    overlaysDone,
    overlaysTotal,
    shopperReady: false,
    headline: `STEP 3 · OVERLAYS ${overlaysDone}/${overlaysTotal} — SHOPPERS BLOCKED`,
    detail: overlayWinner
      ? `Cutting overlays for ${overlayWinner.toUpperCase()} only. Each angle: NBP hair isolate, then Ideogram alpha.`
      : 'Hair-only overlay PNGs are missing. Each angle needs NBP isolate, then Ideogram cut.',
    nextAction: `Tap RUN NEXT STEP once per MISSING line (${overlayStepsLeft} step(s) left).`,
  };
}

function PortraitCompareGrid({
  model,
  urls,
}: {
  model: LiveTryOnPhotoModel;
  urls?: LiveTryOnPortraitPreviewUrls;
}) {
  if (!urls?.ready) return null;
  const angles = ['left', 'front', 'right'] as const;
  return (
    <div className="flex-1 flex flex-col gap-1">
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#000' }}>
        {LIVE_TRY_ON_PHOTO_MODEL_LABELS[model]}
      </p>
      <div className="grid grid-cols-3 gap-0.5">
        {angles.map((angle) => (
          <a
            key={angle}
            href={urls[angle]}
            target="_blank"
            rel="noreferrer"
            className="aspect-[3/4] bg-black/5 overflow-hidden block"
          >
            <img
              src={urls[angle]}
              alt=""
              className="w-full h-full object-cover object-top"
              key={urls[angle]}
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function formatMissingLine(m: MissingStep): string {
  const label = STEP_LABELS[m.step];
  return `${label} · ${m.angle.toUpperCase()}${m.photoModel ? ` · ${m.photoModel.toUpperCase()}` : ''}`;
}

export default function AdminLiveTryOnBatchPanel() {
  const manifest = useMemo(() => liveTryOnNoirBatchManifestRows(), []);
  const [selectedId, setSelectedId] = useState(manifest[0]?.id ?? '');
  const [photoModel, setPhotoModel] = useState<LiveTryOnPhotoModel>('nbp');
  const [compareBoth, setCompareBoth] = useState(false);
  const [overlayWinner, setOverlayWinner] = useState<LiveTryOnPhotoModel | null>(null);
  const [portraitPreviews, setPortraitPreviews] = useState<
    Partial<Record<LiveTryOnPhotoModel, LiveTryOnPortraitPreviewUrls>>
  >({});
  const [awaitingWinner, setAwaitingWinner] = useState(false);
  const [forceOverwrite, setForceOverwrite] = useState(false);
  const [missing, setMissing] = useState<MissingStep[] | null>(null);
  const [manifestHash, setManifestHash] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  const busy = busyAction !== null;

  const selectedJob = useMemo(() => {
    const row = manifest.find((r) => r.id === selectedId);
    if (!row) return { ...LIVE_TRY_ON_BATCH_NOIR_DEFAULTS, color: 'OFF BLACK' };
    const { id: _id, label: _label, ...job } = row;
    return job;
  }, [manifest, selectedId]);

  const pipeline = useMemo(
    () =>
      missing ? summarizePipeline(missing, compareBoth, overlayWinner, awaitingWinner) : null,
    [missing, compareBoth, overlayWinner, awaitingWinner]
  );

  const pushLog = useCallback((msg: string) => {
    const t = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLog((prev) => [...prev.slice(-40), { t, msg }]);
  }, []);

  const refreshStatusCore = useCallback(async () => {
    await getAdminLiveTryOnBatchManifest();
    const res = await postAdminLiveTryOnBatchStatus(
      jobBody(selectedJob, compareBoth, photoModel, overlayWinner)
    );
    setMissing(res.missing as MissingStep[]);
    setManifestHash(res.manifestHash);
    setPortraitPreviews(res.portraits ?? {});
    setAwaitingWinner(Boolean(res.awaitingWinner));
    const summary = summarizePipeline(
      res.missing as MissingStep[],
      compareBoth,
      overlayWinner,
      Boolean(res.awaitingWinner)
    );
    if (res.complete) setLastError(null);
    pushLog(
      res.complete
        ? `READY · ${selectedJob.color} · hash ${res.manifestHash.slice(0, 8)}…`
        : `${summary.headline} · ${selectedJob.color}`
    );
  }, [selectedJob, compareBoth, photoModel, overlayWinner, pushLog]);

  const refreshStatus = useCallback(async () => {
    setBusyAction('status');
    try {
      await refreshStatusCore();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Status failed';
      setLastError(msg);
      pushLog(msg);
      setMissing(null);
    } finally {
      setBusyAction(null);
    }
  }, [refreshStatusCore, pushLog]);

  useEffect(() => {
    let cancelled = false;
    setBusyAction('auto');
    refreshStatusCore()
      .catch((e) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Status failed';
        setLastError(msg);
        pushLog(msg);
        setMissing(null);
      })
      .finally(() => {
        if (!cancelled) setBusyAction(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, compareBoth, photoModel, overlayWinner]); // eslint-disable-line react-hooks/exhaustive-deps -- refresh when row/model changes

  const ensureColorWebpsCore = useCallback(
    async (job: LiveTryOnBatchJob, label: string) => {
      const body = {
        color: job.color,
        length: job.length,
        density: job.density,
        lace: job.lace,
        texture: job.texture,
        hairline: job.hairline,
        styling: 'NONE',
        addOns: job.addOns,
      };
      for (const angle of ANGLES) {
        pushLog(`${label} · COLOR WEBP · ${angle.toUpperCase()}…`);
        await postWigPreviewLiveNoirColorOneAngle({ ...body, angle });
      }
      pushLog(`${label} · COLOR WEBPS DONE`);
    },
    [pushLog]
  );

  const runOneStep = useCallback(
    async (job: LiveTryOnBatchJob, label: string, step: MissingStep) => {
      if (step.step === 'color') {
        await ensureColorWebpsCore(job, label);
        return;
      }
      const model = step.photoModel || photoModel;
      await postAdminLiveTryOnBatchStep({
        ...jobBody(job, compareBoth, photoModel, overlayWinner),
        step: step.step,
        angle: step.angle,
        photoModel: model,
        forceRegenerate: forceOverwrite,
      });
      setLastError(null);
      pushLog(`${label} · ${model.toUpperCase()} · ${step.step.toUpperCase()} · ${step.angle.toUpperCase()} OK`);
    },
    [compareBoth, photoModel, overlayWinner, forceOverwrite, ensureColorWebpsCore, pushLog]
  );

  const runAllMissingForJob = useCallback(
    async (job: LiveTryOnBatchJob, label: string) => {
      const status = await postAdminLiveTryOnBatchStatus(
        jobBody(job, compareBoth, photoModel, overlayWinner)
      );
      let steps = [...status.missing] as MissingStep[];
      if (steps.some((s) => s.step === 'color')) {
        await ensureColorWebpsCore(job, label);
        const again = await postAdminLiveTryOnBatchStatus(
          jobBody(job, compareBoth, photoModel, overlayWinner)
        );
        steps = again.missing as MissingStep[];
      }
      const ordered = [...steps].sort((a, b) => {
        const order = { color: 0, portrait: 1, overlay_isolate: 2, overlay_cut: 3 };
        const angles = { left: 0, front: 1, right: 2 };
        const sd = order[a.step] - order[b.step];
        if (sd !== 0) return sd;
        return angles[a.angle] - angles[b.angle];
      });
      for (const step of ordered) {
        if (step.step === 'color') continue;
        pushLog(`${label} · ${step.photoModel || photoModel} · ${step.step} · ${step.angle}…`);
        await runOneStep(job, label, step);
      }
    },
    [compareBoth, photoModel, overlayWinner, pushLog, runOneStep, ensureColorWebpsCore]
  );

  const runRegenPortrait = useCallback(
    async (angle: (typeof ANGLES)[number]) => {
      setBusyAction('regen');
      const models: LiveTryOnPhotoModel[] = !compareBoth
        ? [photoModel]
        : overlayWinner
          ? [overlayWinner]
          : ['nbp', 'gpt2'];
      try {
        pushLog(
          `REGEN PORTRAIT · ${angle.toUpperCase()} · ${models.map((m) => m.toUpperCase()).join(' + ')} (Fal ~1–2 min each)…`
        );
        for (const model of models) {
          const result = await postAdminLiveTryOnBatchStep({
            ...jobBody(selectedJob, compareBoth, photoModel, overlayWinner),
            step: 'portrait',
            angle,
            photoModel: model,
            forceRegenerate: true,
          });
          if (result.skipped) {
            throw new Error(
              `${model.toUpperCase()} ${angle.toUpperCase()} was skipped — old file still in Storage. Hard-refresh admin after deploy.`
            );
          }
          pushLog(`REGEN OK · PORTRAIT · ${angle.toUpperCase()} · ${model.toUpperCase()}`);
        }
        setLastError(null);
        await refreshStatusCore();
        pushLog(
          `THUMBS REFRESHED · ${angle.toUpperCase()} — tap OVERLAY · ${angle.toUpperCase()} if camera still shows old hair`
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Portrait regen failed';
        setLastError(msg);
        pushLog(`ERROR · ${msg}`);
      } finally {
        setBusyAction(null);
      }
    },
    [compareBoth, photoModel, overlayWinner, selectedJob, pushLog, refreshStatusCore]
  );

  const runRegenOverlayAngle = useCallback(
    async (angle: (typeof ANGLES)[number]) => {
      const model = compareBoth ? overlayWinner : photoModel;
      if (!model) {
        pushLog('Pick WINNER FOR CUT before regen overlay in compare mode');
        return;
      }
      setBusyAction('regen');
      try {
        for (const step of ['overlay_isolate', 'overlay_cut'] as const) {
          pushLog(`REGEN ${step.toUpperCase()} · ${angle.toUpperCase()} · ${model.toUpperCase()}…`);
          await postAdminLiveTryOnBatchStep({
            ...jobBody(selectedJob, compareBoth, photoModel, overlayWinner),
            step,
            angle,
            photoModel: model,
            forceRegenerate: true,
          });
        }
        setLastError(null);
        await refreshStatusCore();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Overlay regen failed';
        setLastError(msg);
        pushLog(`ERROR · ${msg}`);
      } finally {
        setBusyAction(null);
      }
    },
    [compareBoth, overlayWinner, photoModel, selectedJob, pushLog, refreshStatusCore]
  );

  const runPortraitsOnly = useCallback(async () => {
    if (!missing?.length) {
      await refreshStatus();
      return;
    }
    const portraitSteps = missing.filter((s) => s.step === 'portrait');
    if (!portraitSteps.length) {
      pushLog('No portrait steps left — pick a winner or run overlay cut');
      return;
    }
    setBusyAction('portraits');
    try {
      for (const step of portraitSteps) {
        pushLog(`RUNNING · ${formatMissingLine(step)}…`);
        await runOneStep(selectedJob, selectedJob.color, step);
      }
      await refreshStatusCore();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Portrait batch failed';
      setLastError(msg);
      pushLog(`ERROR · ${msg}`);
      try {
        await refreshStatusCore();
      } catch {
        /* ignore */
      }
    } finally {
      setBusyAction(null);
    }
  }, [missing, refreshStatus, selectedJob, runOneStep, refreshStatusCore, pushLog]);

  const handleColorWebps = useCallback(async () => {
    setBusyAction('color');
    try {
      await ensureColorWebpsCore(selectedJob, selectedJob.color);
      await refreshStatusCore();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Color webp failed';
      setLastError(msg);
      pushLog(`ERROR · ${msg}`);
    } finally {
      setBusyAction(null);
    }
  }, [selectedJob, ensureColorWebpsCore, refreshStatusCore, pushLog]);

  const runNextMissing = useCallback(async () => {
    if (!missing?.length) {
      await refreshStatus();
      return;
    }
    setBusyAction('next');
    const step = missing[0];
    try {
      pushLog(`RUNNING · ${formatMissingLine(step)}…`);
      await runOneStep(selectedJob, selectedJob.color, step);
      await refreshStatusCore();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Step failed';
      setLastError(msg);
      pushLog(`ERROR · ${msg}`);
      try {
        await refreshStatusCore();
        pushLog('CHECKED STATUS AFTER ERROR — MISSING list updated (step may have saved)');
      } catch {
        /* ignore */
      }
    } finally {
      setBusyAction(null);
    }
  }, [missing, refreshStatus, selectedJob, runOneStep, refreshStatusCore, pushLog]);

  const runAllForRow = useCallback(async () => {
    setBusyAction('row');
    try {
      pushLog(`RUNNING ALL · ${selectedJob.color}…`);
      await runAllMissingForJob(selectedJob, selectedJob.color);
      await refreshStatusCore();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Run all failed';
      setLastError(msg);
      pushLog(`ERROR · ${msg}`);
      try {
        await refreshStatusCore();
        pushLog('CHECKED STATUS AFTER ERROR — MISSING list updated');
      } catch {
        /* ignore */
      }
    } finally {
      setBusyAction(null);
    }
  }, [selectedJob, runAllMissingForJob, refreshStatusCore, pushLog]);

  const runEntireManifest = useCallback(async () => {
    if (!confirm(`Pre-generate try-on for all ${manifest.length} NOIR colors? This uses many Fal calls.`)) {
      return;
    }
    setBusyAction('batch');
    try {
      for (const row of manifest) {
        const { id: _id, label, ...job } = row;
        pushLog(`—— ${label} ——`);
        await runAllMissingForJob(job, label);
      }
      pushLog('BATCH MANIFEST COMPLETE');
      await refreshStatusCore();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Batch manifest failed';
      setLastError(msg);
      pushLog(`ERROR · ${msg}`);
    } finally {
      setBusyAction(null);
    }
  }, [manifest, runAllMissingForJob, refreshStatusCore, pushLog]);

  const nextStepLabel = missing?.[0] ? formatMissingLine(missing[0]) : '';

  const buttonLabel = (action: BusyAction, idle: string, loading: string): string =>
    busyAction === action ? loading : idle;

  return (
    <div className="flex flex-col gap-3 mt-2 text-left normal-case">
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', lineHeight: 1.5 }}>
        Pre-generate photoreal try-on layers in Supabase. Shoppers load from Storage only — no Fal when they open Live
        Try On. One Fal job per step. Founder admin only.
      </p>

      <div className="border border-black/20 p-2 bg-white/70" style={{ lineHeight: 1.55 }}>
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#000' }}>PIPELINE (PER COLOR)</p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          1 · <strong>Color WebPs</strong> — grey NOIR mannequin L/F/R (your BAW reference)
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          2 · <strong>Portraits</strong> — same prompt on NBP + GPT Image 2 (compare woman + angles before cut)
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          2b · <strong>Pick winner</strong> — lock NBP or GPT Image 2 for overlay cut
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          3a · <strong>Isolate</strong> — NBP extracts hair from winner portrait (work PNG)
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          3b · <strong>Cut</strong> — Ideogram removes background → transparent PNG (Live Try On uses this)
        </p>
      </div>

      <label style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#000' }}>
        COLOR ROW
        <select
          className="mt-1 w-full border border-black/30 bg-white/90 px-2 py-2 text-[10px]"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={busy}
        >
          {manifest.map((row) => (
            <option key={row.id} value={row.id}>
              {row.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-2 items-center">
        <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>
          <input
            type="radio"
            name="tryonModel"
            checked={photoModel === 'nbp' && !compareBoth}
            onChange={() => {
              setPhotoModel('nbp');
              setCompareBoth(false);
              setOverlayWinner(null);
            }}
            disabled={busy}
          />{' '}
          NBP ONLY
        </label>
        <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>
          <input
            type="radio"
            name="tryonModel"
            checked={photoModel === 'gpt2' && !compareBoth}
            onChange={() => {
              setPhotoModel('gpt2');
              setCompareBoth(false);
              setOverlayWinner(null);
            }}
            disabled={busy}
          />{' '}
          GPT2 ONLY
        </label>
        <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>
          <input
            type="radio"
            name="tryonModel"
            checked={compareBoth}
            onChange={() => {
              setCompareBoth(true);
              setOverlayWinner(null);
            }}
            disabled={busy}
          />{' '}
          NBP + GPT2 COMPARE
        </label>
      </div>

      {compareBoth ? (
        <div className="border border-black/20 p-2 bg-white/70 flex flex-col gap-2">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#000' }}>
            WINNER FOR CUT (after portraits)
          </p>
          <div className="flex flex-wrap gap-3">
            {(['nbp', 'gpt2'] as LiveTryOnPhotoModel[]).map((model) => (
              <label key={model} style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>
                <input
                  type="radio"
                  name="overlayWinner"
                  checked={overlayWinner === model}
                  onChange={() => setOverlayWinner(model)}
                  disabled={busy}
                />{' '}
                {LIVE_TRY_ON_PHOTO_MODEL_LABELS[model]}
              </label>
            ))}
            <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>
              <input
                type="radio"
                name="overlayWinner"
                checked={!overlayWinner}
                onChange={() => setOverlayWinner(null)}
                disabled={busy}
              />{' '}
              NOT PICKED YET
            </label>
          </div>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', lineHeight: 1.5 }}>
            Set Vercel <code>WIG_PREVIEW_TRYON_PHOTO_MODEL</code> to the winner (<code>nbp</code> or <code>gpt2</code>)
            so shoppers load that overlay by default.
          </p>
        </div>
      ) : null}

      {portraitPreviews.nbp?.ready || portraitPreviews.gpt2?.ready ? (
        <div className="border border-black/20 p-2 bg-white/80 flex flex-col gap-2">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#000' }}>
            PORTRAIT COMPARE (tap to enlarge)
          </p>
          <div className="flex gap-2">
            <PortraitCompareGrid model="nbp" urls={portraitPreviews.nbp} />
            <PortraitCompareGrid model="gpt2" urls={portraitPreviews.gpt2} />
          </div>
        </div>
      ) : null}

      <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>
        <input
          type="checkbox"
          checked={forceOverwrite}
          onChange={(e) => setForceOverwrite(e.target.checked)}
          disabled={busy}
        />{' '}
        Overwrite existing Storage files on next run (regen portraits / overlays)
      </label>

      {manifestHash ? (
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          HASH {manifestHash.slice(0, 16)}…
        </p>
      ) : null}

      {lastError ? (
        <div className="border border-[#EB1C24] p-2 bg-[rgba(235,28,36,0.08)]">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#EB1C24' }}>LAST ERROR</p>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#000', marginTop: 4, lineHeight: 1.5 }}>
            {lastError}
          </p>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', marginTop: 6 }}>
            {/TIMEOUT|Internal Server Error|SERVER ERROR/i.test(lastError)
              ? 'Tap CHECK STATUS — isolate steps may have saved even if the server errored. Then RUN NEXT STEP for the first MISSING line.'
              : /unprocessable entity|422/i.test(lastError)
                ? 'Fal could not use the portrait URL (422). A fix re-uploads portraits to Fal storage first — redeploy, then RUN NEXT STEP again.'
                : /missing visible hair|opaque face|shoulders/i.test(lastError)
                  ? 'Validation was blocking upload — redeploy and RUN NEXT STEP again. Cut step now uploads without strict pixel checks.'
                  : 'Fix the issue above, then RUN NEXT STEP or RUN ALL FOR ROW again.'}
          </p>
        </div>
      ) : null}

      {busyAction === 'auto' ? (
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#808080' }}>UPDATING STATUS…</p>
      ) : null}

      {pipeline ? (
        <div
          className="border p-2"
          style={{
            borderColor: pipeline.shopperReady ? '#166534' : '#EB1C24',
            background: pipeline.shopperReady ? 'rgba(22,101,52,0.08)' : 'rgba(235,28,36,0.06)',
          }}
        >
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '9px',
              color: pipeline.shopperReady ? '#166534' : '#EB1C24',
            }}
          >
            {pipeline.headline}
          </p>
          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', marginTop: 4 }}>
            {pipeline.detail}
          </p>
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#000', marginTop: 6 }}>
            NEXT: {pipeline.nextAction}
          </p>
          {!pipeline.shopperReady ? (
            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', marginTop: 4 }}>
              Progress · color {pipeline.colorDone ? 'done' : 'pending'} · portraits {pipeline.portraitsDone}/
              {pipeline.portraitsTotal} · overlays {pipeline.overlaysDone}/{pipeline.overlaysTotal}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="border border-black/20 p-2 bg-white/70 flex flex-col gap-2">
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#000' }}>
          REGEN ONE ANGLE (deletes + re-runs Fal; thumbs refresh after)
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', lineHeight: 1.5 }}>
          Compare mode: regens <strong>winner</strong> only if picked; otherwise NBP + GPT2. Watch LOG for REGEN OK.
        </p>
        <div className="flex flex-wrap gap-2">
          {ANGLES.map((angle) => (
            <button
              key={`regen-portrait-${angle}`}
              type="button"
              disabled={busy}
              onClick={() => void runRegenPortrait(angle)}
              className="text-[9px] border border-black px-2 py-1 bg-white/80 disabled:opacity-55"
              style={{
                fontFamily: '"Futura PT Medium"',
                color: busyAction === 'regen' ? '#EB1C24' : '#000',
              }}
              title={`Regen photoreal portrait for ${angle} only`}
            >
              PORTRAIT · {angle.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ANGLES.map((angle) => (
            <button
              key={`regen-overlay-${angle}`}
              type="button"
              disabled={busy || (compareBoth && !overlayWinner)}
              onClick={() => void runRegenOverlayAngle(angle)}
              className="text-[9px] border border-black px-2 py-1 bg-white/80 disabled:opacity-55"
              style={{
                fontFamily: '"Futura PT Medium"',
                color: busyAction === 'regen' ? '#EB1C24' : '#808080',
              }}
              title="Regen isolate + Ideogram cut for one angle (winner model in compare mode)"
            >
              OVERLAY · {angle.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          aria-busy={busyAction === 'status'}
          onClick={() => void refreshStatus()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80 min-w-[7.5rem] disabled:opacity-55"
          style={{
            fontFamily: '"Futura PT Medium"',
            color: busyAction === 'status' ? '#EB1C24' : '#000',
          }}
          title="Re-scan Supabase — does not run Fal"
        >
          {buttonLabel('status', 'CHECK STATUS', 'CHECKING…')}
        </button>
        <button
          type="button"
          disabled={busy}
          aria-busy={busyAction === 'color'}
          onClick={() => void handleColorWebps()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80 min-w-[7.5rem] disabled:opacity-55"
          style={{
            fontFamily: '"Futura PT Medium"',
            color: busyAction === 'color' ? '#EB1C24' : '#000',
          }}
          title="Step 1 — mannequin color L/F/R"
        >
          {buttonLabel('color', 'COLOR WEBPS', 'RUNNING WEBPS…')}
        </button>
        <button
          type="button"
          disabled={busy || !missing?.some((s) => s.step === 'portrait')}
          aria-busy={busyAction === 'portraits'}
          onClick={() => void runPortraitsOnly()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80 min-w-[7.5rem] disabled:opacity-55"
          style={{ fontFamily: '"Futura PT Medium"', color: '#000' }}
          title="Generate all missing portraits (NBP + GPT2 when comparing) — no cut yet"
        >
          {buttonLabel('portraits', 'RUN PORTRAITS ONLY', 'RUNNING PORTRAITS…')}
        </button>
        <button
          type="button"
          disabled={busy || !missing?.length}
          aria-busy={busyAction === 'next'}
          onClick={() => void runNextMissing()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80 min-w-[7.5rem] disabled:opacity-55"
          style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
          title="Run exactly one missing Fal job"
        >
          {busyAction === 'next'
            ? nextStepLabel
              ? `RUNNING ${nextStepLabel.split(' · ')[0].toUpperCase()}…`
              : 'RUNNING STEP…'
            : 'RUN NEXT STEP'}
        </button>
        <button
          type="button"
          disabled={busy}
          aria-busy={busyAction === 'row'}
          onClick={() => void runAllForRow()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80 min-w-[7.5rem] disabled:opacity-55"
          style={{
            fontFamily: '"Futura PT Medium"',
            color: busyAction === 'row' ? '#EB1C24' : '#000',
          }}
          title="Finish every missing step for this color"
        >
          {buttonLabel('row', 'RUN ALL FOR ROW', 'RUNNING ALL…')}
        </button>
      </div>

      <button
        type="button"
        disabled={busy}
        aria-busy={busyAction === 'batch'}
        onClick={() => void runEntireManifest()}
        className="text-[10px] border border-black px-3 py-2 bg-white/80 w-full disabled:opacity-55"
        style={{
          fontFamily: '"Futura PT Medium"',
          color: busyAction === 'batch' ? '#EB1C24' : '#EB1C24',
        }}
        title="All 16 NOIR catalog colors — long job"
      >
        {buttonLabel('batch', 'BATCH ALL NOIR COLORS', 'BATCHING ALL COLORS…')}
      </button>

      <div className="border border-black/20 p-2 bg-white/70" style={{ lineHeight: 1.55 }}>
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#000' }}>WHAT THE BUTTONS DO</p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          <strong>CHECK STATUS</strong> — read Storage only; lists what is missing (no Fal cost).
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          <strong>COLOR WEBPS</strong> — Step 1: generate/reuse grey mannequin left/front/right for this color.
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          <strong>RUN PORTRAITS ONLY</strong> — Step 2: all missing NBP/GPT2 portraits; compare before cut.
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          <strong>RUN NEXT STEP</strong> — one step (portrait, isolate, or Ideogram cut).
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          <strong>RUN ALL FOR ROW</strong> — finish everything missing for the selected color (best for OFF BLACK now).
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          <strong>BATCH ALL NOIR COLORS</strong> — run RUN ALL FOR ROW on every catalog color (16 colors; many Fal
          calls).
        </p>
      </div>

      {missing && missing.length > 0 ? (
        <div className="border border-black/20 p-2 bg-white/70 max-h-32 overflow-y-auto">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#EB1C24' }}>MISSING</p>
          {missing.map((m, i) => (
            <p key={i} style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
              {formatMissingLine(m)}
            </p>
          ))}
        </div>
      ) : null}

      {log.length > 0 ? (
        <div className="border border-black/20 p-2 bg-white/70 max-h-40 overflow-y-auto">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#808080' }}>LOG</p>
          {log.map((line, i) => (
            <p key={i} style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#000' }}>
              {line.t} — {line.msg}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
