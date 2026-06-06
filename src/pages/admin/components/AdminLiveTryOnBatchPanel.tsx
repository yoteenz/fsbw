import { useCallback, useMemo, useState } from 'react';
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

const ANGLES = ['left', 'front', 'right'] as const;

function jobBody(job: LiveTryOnBatchJob, compareModels: boolean, photoModel: LiveTryOnPhotoModel) {
  return {
    ...job,
    styling: 'NONE',
    compareModels,
    photoModel,
  };
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
      pushLog(
        res.complete
          ? `READY · ${selectedJob.color} · hash ${res.manifestHash.slice(0, 8)}…`
          : `${res.missing.length} step(s) missing for ${selectedJob.color}`
      );
    } catch (e) {
      pushLog(e instanceof Error ? e.message : 'Status failed');
      setMissing(null);
    } finally {
      setBusy(false);
    }
  }, [selectedJob, compareBoth, photoModel, pushLog]);

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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void refreshStatus()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80"
          style={{ fontFamily: '"Futura PT Medium"', color: '#000' }}
        >
          CHECK STATUS
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void ensureColorWebps()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80"
          style={{ fontFamily: '"Futura PT Medium"', color: '#000' }}
        >
          COLOR WEBPS
        </button>
        <button
          type="button"
          disabled={busy || !missing?.length}
          onClick={() => void runNextMissing()}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80"
          style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24' }}
        >
          RUN NEXT STEP
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void runAllMissingForJob(selectedJob, selectedJob.color)}
          className="text-[10px] border border-black px-3 py-1.5 bg-white/80"
          style={{ fontFamily: '"Futura PT Medium"', color: '#000' }}
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
      >
        BATCH ALL NOIR COLORS
      </button>

      {missing && missing.length > 0 ? (
        <div className="border border-black/20 p-2 bg-white/70 max-h-32 overflow-y-auto">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#EB1C24' }}>MISSING</p>
          {missing.map((m, i) => (
            <p key={i} style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080' }}>
              {m.step} · {m.angle}
              {m.photoModel ? ` · ${m.photoModel}` : ''}
            </p>
          ))}
        </div>
      ) : missing ? (
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#166534' }}>
          ROW READY FOR LIVE TRY ON
        </p>
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
