import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LiveTryOnPhotoModel } from '../../../constants/liveTryOnSpikeAssets';
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
} from '../../../utils/api';

type MissingStep = {
  step: 'color' | 'portrait' | 'overlay';
  angle: 'left' | 'front' | 'right';
  photoModel?: LiveTryOnPhotoModel;
};

type LogLine = { t: string; msg: string };

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
  overlay: 'Hair-only overlay (Ideogram)',
};

function jobBody(job: LiveTryOnBatchJob, compareModels: boolean, photoModel: LiveTryOnPhotoModel) {
  return {
    ...job,
    styling: 'NONE',
    compareModels,
    photoModel,
  };
}

function expectedTotals(compareBoth: boolean): { portraitsTotal: number; overlaysTotal: number } {
  const models = compareBoth ? 2 : 1;
  return { portraitsTotal: 3 * models, overlaysTotal: 3 * models };
}

function summarizePipeline(missing: MissingStep[], compareBoth: boolean): PipelineSummary {
  const { portraitsTotal, overlaysTotal } = expectedTotals(compareBoth);
  const missingColor = missing.filter((m) => m.step === 'color');
  const missingPortrait = missing.filter((m) => m.step === 'portrait');
  const missingOverlay = missing.filter((m) => m.step === 'overlay');

  const colorDone = missingColor.length === 0;
  const portraitsDone = portraitsTotal - missingPortrait.length;
  const overlaysDone = overlaysTotal - missingOverlay.length;
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

  if (missingPortrait.length > 0 && missingOverlay.length > 0) {
    return {
      colorDone: true,
      portraitsDone,
      portraitsTotal,
      overlaysDone,
      overlaysTotal,
      shopperReady: false,
      headline: `PORTRAITS ${portraitsDone}/${portraitsTotal} · OVERLAYS ${overlaysDone}/${overlaysTotal} — SHOPPERS BLOCKED`,
      detail:
        'Some photoreal portraits are still missing, and hair-only overlay PNGs have not been uploaded yet. Live Try On needs the overlay files — not the portraits.',
      nextAction: 'Tap RUN ALL FOR ROW to finish portraits, then Ideogram overlay steps for this color.',
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
      detail: `Photoreal woman portraits from the mannequin reference still need: ${missingPortrait.map((m) => `${m.angle}${m.photoModel ? ` (${m.photoModel})` : ''}`).join(', ')}.`,
      nextAction: 'Tap RUN NEXT STEP or RUN ALL FOR ROW. Overlays come after all portraits exist.',
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
    detail:
      'Portraits are done, but hair-only overlay PNGs (Ideogram cutout) are missing. This is what Live Try On loads on the camera.',
    nextAction: `Tap RUN ALL FOR ROW or RUN NEXT STEP — ${missingOverlay.length} overlay step(s) left.`,
  };
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
  const [missing, setMissing] = useState<MissingStep[] | null>(null);
  const [manifestHash, setManifestHash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);
  const [batchAll, setBatchAll] = useState(false);

  const selectedJob = useMemo(() => {
    const row = manifest.find((r) => r.id === selectedId);
    if (!row) return { ...LIVE_TRY_ON_BATCH_NOIR_DEFAULTS, color: 'OFF BLACK' };
    const { id: _id, label: _label, ...job } = row;
    return job;
  }, [manifest, selectedId]);

  const pipeline = useMemo(
    () => (missing ? summarizePipeline(missing, compareBoth) : null),
    [missing, compareBoth]
  );

  const pushLog = useCallback((msg: string) => {
    const t = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLog((prev) => [...prev.slice(-40), { t, msg }]);
  }, []);

  const refreshStatus = useCallback(async () => {
    setBusy(true);
    try {
      await getAdminLiveTryOnBatchManifest();
      const res = await postAdminLiveTryOnBatchStatus(jobBody(selectedJob, compareBoth, photoModel));
      setMissing(res.missing as MissingStep[]);
      setManifestHash(res.manifestHash);
      const summary = summarizePipeline(res.missing as MissingStep[], compareBoth);
      pushLog(
        res.complete
          ? `READY · ${selectedJob.color} · hash ${res.manifestHash.slice(0, 8)}…`
          : `${summary.headline} · ${selectedJob.color}`
      );
    } catch (e) {
      pushLog(e instanceof Error ? e.message : 'Status failed');
      setMissing(null);
    } finally {
      setBusy(false);
    }
  }, [selectedJob, compareBoth, photoModel, pushLog]);

  useEffect(() => {
    void refreshStatus();
  }, [selectedId, compareBoth, photoModel]); // eslint-disable-line react-hooks/exhaustive-deps -- refresh when row/model changes

  const ensureColorWebps = useCallback(async () => {
    setBusy(true);
    const body = {
      color: selectedJob.color,
      length: selectedJob.length,
      density: selectedJob.density,
      lace: selectedJob.lace,
      texture: selectedJob.texture,
      hairline: selectedJob.hairline,
      styling: 'NONE',
      addOns: selectedJob.addOns,
    };
    try {
      for (const angle of ANGLES) {
        pushLog(`COLOR WEBP · ${angle.toUpperCase()}…`);
        await postWigPreviewLiveNoirColorOneAngle({ ...body, angle });
      }
      pushLog('COLOR WEBPS DONE');
      await refreshStatus();
    } catch (e) {
      pushLog(e instanceof Error ? e.message : 'Color webp failed');
    } finally {
      setBusy(false);
    }
  }, [selectedJob, pushLog, refreshStatus]);

  const runOneStep = useCallback(
    async (step: MissingStep) => {
      if (step.step === 'color') {
        await ensureColorWebps();
        return;
      }
      const model = step.photoModel || photoModel;
      await postAdminLiveTryOnBatchStep({
        ...jobBody(selectedJob, compareBoth, model),
        step: step.step,
        angle: step.angle,
        photoModel: model,
      });
      pushLog(`${model.toUpperCase()} · ${step.step.toUpperCase()} · ${step.angle.toUpperCase()} OK`);
    },
    [selectedJob, compareBoth, photoModel, ensureColorWebps, pushLog]
  );

  const runAllMissingForJob = useCallback(
    async (job: LiveTryOnBatchJob, label: string) => {
      const status = await postAdminLiveTryOnBatchStatus(jobBody(job, compareBoth, photoModel));
      let steps = [...status.missing] as MissingStep[];
      if (steps.some((s) => s.step === 'color')) {
        pushLog(`${label} · COLOR WEBPS…`);
        const body = { ...job, styling: 'NONE' };
        for (const angle of ANGLES) {
          await postWigPreviewLiveNoirColorOneAngle({ ...body, angle });
        }
        const again = await postAdminLiveTryOnBatchStatus(jobBody(job, compareBoth, photoModel));
        steps = again.missing as MissingStep[];
      }
      for (const step of steps) {
        if (step.step === 'color') continue;
        pushLog(`${label} · ${step.photoModel || photoModel} · ${step.step} · ${step.angle}…`);
        await runOneStep(step);
      }
    },
    [compareBoth, photoModel, pushLog, runOneStep]
  );

  const runNextMissing = useCallback(async () => {
    if (!missing?.length) {
      await refreshStatus();
      return;
    }
    setBusy(true);
    try {
      await runOneStep(missing[0]);
      await refreshStatus();
    } catch (e) {
      pushLog(e instanceof Error ? e.message : 'Step failed');
    } finally {
      setBusy(false);
    }
  }, [missing, refreshStatus, runOneStep, pushLog]);

  const runAllForRow = useCallback(async () => {
    setBusy(true);
    try {
      await runAllMissingForJob(selectedJob, selectedJob.color);
      await refreshStatus();
    } catch (e) {
      pushLog(e instanceof Error ? e.message : 'Run all failed');
    } finally {
      setBusy(false);
    }
  }, [selectedJob, runAllMissingForJob, refreshStatus, pushLog]);

  const runEntireManifest = useCallback(async () => {
    if (!confirm(`Pre-generate try-on for all ${manifest.length} NOIR colors? This uses many Fal calls.`)) {
      return;
    }
    setBatchAll(true);
    setBusy(true);
    try {
      for (const row of manifest) {
        const { id: _id, label, ...job } = row;
        pushLog(`—— ${label} ——`);
        await runAllMissingForJob(job, label);
      }
      pushLog('BATCH MANIFEST COMPLETE');
      await refreshStatus();
    } catch (e) {
      pushLog(e instanceof Error ? e.message : 'Batch manifest failed');
    } finally {
      setBatchAll(false);
      setBusy(false);
    }
  }, [manifest, runAllMissingForJob, pushLog, refreshStatus]);

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
          2 · <strong>Portraits</strong> — NBP puts that wig on a photoreal woman (stored for compare; not shown on
          camera)
        </p>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          3 · <strong>Overlays</strong> — Ideogram removes face/background → hair-only PNG (this is what Live Try On
          uses)
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
            }}
            disabled={busy}
          />{' '}
          NBP ONLY
        </label>
        <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080' }}>
          <input
            type="radio"
            name="tryonModel"
            checked={compareBoth}
            onChange={() => setCompareBoth(true)}
            disabled={busy}
          />{' '}
          NBP + GPT2
        </label>
      </div>

      {manifestHash ? (
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
          HASH {manifestHash.slice(0, 16)}…
        </p>
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void refreshStatus()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80"
          style={{ fontFamily: '"Futura PT Medium"', color: '#000' }}
          title="Re-scan Supabase — does not run Fal"
        >
          CHECK STATUS
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void ensureColorWebps()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80"
          style={{ fontFamily: '"Futura PT Medium"', color: '#000' }}
          title="Step 1 — mannequin color L/F/R"
        >
          COLOR WEBPS
        </button>
        <button
          type="button"
          disabled={busy || !missing?.length}
          onClick={() => void runNextMissing()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80"
          style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
          title="Run exactly one missing Fal job"
        >
          RUN NEXT STEP
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void runAllForRow()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80"
          style={{ fontFamily: '"Futura PT Medium"', color: '#000' }}
          title="Finish every missing step for this color"
        >
          RUN ALL FOR ROW
        </button>
      </div>

      <button
        type="button"
        disabled={busy || batchAll}
        onClick={() => void runEntireManifest()}
        className="text-[10px] border border-black px-3 py-2 bg-white/80 w-full"
        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
        title="All 16 NOIR catalog colors — long job"
      >
        BATCH ALL NOIR COLORS
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
          <strong>RUN NEXT STEP</strong> — one Fal job (next item in the MISSING list).
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
