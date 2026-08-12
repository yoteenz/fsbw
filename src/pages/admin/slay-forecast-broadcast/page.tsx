import { useCallback, useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { apiFetch } from '../../../utils/api';
import {
  APPROVED_PSA_FORECAST_MASTER_IMAGE_URL,
  slayForecastGenerationConfig,
} from '../../../constants/slayForecastGenerationConfig';

type Workspace = {
  editionSlug: string;
  generationConfig: typeof slayForecastGenerationConfig;
  workflowStatus: string;
  script: {
    id: string;
    opening_script: string;
    closing_script: string;
    status: string;
    version: number;
  } | null;
  scriptEstimates: {
    opening: { estimatedSeconds: number; warning?: string };
    closing: { estimatedSeconds: number; warning?: string };
    full?: {
      fitsInDuration: boolean;
      blockingError?: string;
      warning?: string;
      silentHoldSec: number;
      totalSpokenSec: number;
    };
  } | null;
  promptPreview: {
    config: typeof slayForecastGenerationConfig;
    validation: Workspace['scriptEstimates'] extends infer S ? S extends { full?: infer F } ? F : never : never;
    promptSnapshot: { prompt?: string };
  } | null;
  fullJobs: Array<{
    id: string;
    attempt_number: number;
    status: string;
    output_optimized_url: string | null;
    created_at: string;
    provider: string;
    model_id: string | null;
  }>;
  latestFullJob: Workspace['fullJobs'][number] | null;
  approvedFullJob: Workspace['fullJobs'][number] | null;
  broadcastPackage: { id: string; status: string } | null;
  defaultProvider: string;
};

const DEFAULT_EDITION = 'forecast-2026-08-10';

const DEFAULT_OPENING =
  "This week's Slay Forecast? Soft layers are moving in.";
const DEFAULT_CLOSING = 'Looks like the forecast is calling for movement.';

export default function AdminSlayForecastBroadcastPage() {
  useRequireAdminPageAccess();
  const [editionSlug, setEditionSlug] = useState(DEFAULT_EDITION);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const [scriptForm, setScriptForm] = useState({
    openingScript: DEFAULT_OPENING,
    closingScript: DEFAULT_CLOSING,
    headline: 'SOFT LAYERS ARE MOVING IN.',
  });

  const load = useCallback(async () => {
    const res = await apiFetch(`/api/admin/slay-forecast-broadcast?editionSlug=${encodeURIComponent(editionSlug)}`);
    if (!res.ok) return;
    const data = (await res.json()) as Workspace;
    setWorkspace(data);
    if (data.script) {
      setScriptForm((s) => ({
        ...s,
        openingScript: data.script!.opening_script,
        closingScript: data.script!.closing_script,
      }));
    }
  }, [editionSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const post = async (body: Record<string, unknown>) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await apiFetch('/api/admin/slay-forecast-broadcast', {
        method: 'POST',
        body: { editionSlug, ...body },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Request failed');
      setMessage(typeof data.message === 'string' ? data.message : 'Saved.');
      await load();
      return data;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const previewVideoUrl =
    workspace?.latestFullJob?.output_optimized_url ??
    workspace?.approvedFullJob?.output_optimized_url ??
    null;

  const fullValidation = workspace?.scriptEstimates?.full;

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminHeader title="SLAY FORECAST STUDIO" showBack onBack={() => window.history.back()} />
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <p className="text-xs tracking-widest text-white/50 -mt-2">
          WEEKLY PSA BROADCAST PRODUCTION · LOCKED GOLDEN PROMPT · MINIMAX H3 · 15s · 16:9
        </p>

        <label className="block text-xs text-white/50">
          EDITION SLUG
          <input
            className="mt-1 w-full max-w-md bg-black border border-white/20 px-2 py-1 text-sm"
            value={editionSlug}
            onChange={(e) => setEditionSlug(e.target.value)}
            onBlur={() => void load()}
          />
        </label>

        {message ? (
          <p className={`text-sm ${message.includes('Error') || message.includes('TOO LONG') ? 'text-red-300' : 'text-green-300'}`}>
            {message}
          </p>
        ) : null}

        <section className="border border-white/10 p-4 space-y-3">
          <h2 className="text-sm tracking-widest text-white/70">CURRENT PRODUCTION</h2>
          <p className="text-lg tracking-wide">{scriptForm.headline}</p>
          <p className="text-xs text-white/50">
            STATUS: {(workspace?.workflowStatus ?? 'script_draft').replace(/_/g, ' ').toUpperCase()}
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-xs text-white/60">
            <div>
              <p className="text-white/40 mb-1">MASTER IMAGE ({slayForecastGenerationConfig.masterAssetVersion})</p>
              <img
                src={APPROVED_PSA_FORECAST_MASTER_IMAGE_URL}
                alt="PSA forecast master"
                className="w-full max-w-xs border border-white/10"
              />
            </div>
            <div className="space-y-1">
              <p>MODEL: {slayForecastGenerationConfig.model}</p>
              <p>DURATION: {slayForecastGenerationConfig.durationSeconds}s</p>
              <p>ASPECT: {slayForecastGenerationConfig.aspectRatio}</p>
              <p>RESOLUTION: {slayForecastGenerationConfig.resolution}</p>
              <p>PROMPT: {slayForecastGenerationConfig.promptTemplateVersion}</p>
              <p>PROVIDER: {workspace?.defaultProvider ?? 'minimax'}</p>
            </div>
          </div>
        </section>

        <section className="border border-white/10 p-4 space-y-3 max-w-3xl">
          <h2 className="text-sm tracking-widest text-white/70">WEEKLY SCRIPT</h2>
          <label className="block text-xs text-white/50">
            OPENING
            <textarea
              className="mt-1 w-full bg-black border border-white/20 px-2 py-1 text-sm min-h-[64px]"
              value={scriptForm.openingScript}
              onChange={(e) => setScriptForm((s) => ({ ...s, openingScript: e.target.value }))}
            />
          </label>
          <label className="block text-xs text-white/50">
            CLOSING
            <textarea
              className="mt-1 w-full bg-black border border-white/20 px-2 py-1 text-sm min-h-[64px]"
              value={scriptForm.closingScript}
              onChange={(e) => setScriptForm((s) => ({ ...s, closingScript: e.target.value }))}
            />
          </label>

          {fullValidation ? (
            <div className={`text-xs p-2 border ${fullValidation.blockingError ? 'border-red-500/50 text-red-300' : 'border-white/10 text-white/60'}`}>
              {fullValidation.blockingError ? (
                <p>{fullValidation.blockingError}</p>
              ) : (
                <>
                  <p>
                    Spoken ~{fullValidation.totalSpokenSec.toFixed(1)}s · Silent hold ~{fullValidation.silentHoldSec.toFixed(1)}s
                  </p>
                  {fullValidation.warning ? <p>{fullValidation.warning}</p> : null}
                </>
              )}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <StudioButton label="DRAFT FROM INTELLIGENCE" disabled={busy} onClick={() => void post({ action: 'draft_script_from_brief', headline: scriptForm.headline })} />
            <StudioButton
              label="SAVE SCRIPT"
              disabled={busy}
              onClick={() =>
                void post({
                  action: 'save_script',
                  openingScript: scriptForm.openingScript,
                  closingScript: scriptForm.closingScript,
                  headline: scriptForm.headline,
                })
              }
            />
            {workspace?.script ? (
              <StudioButton label="APPROVE SCRIPT" disabled={busy || Boolean(fullValidation?.blockingError)} onClick={() => void post({ action: 'approve_script', scriptId: workspace.script!.id })} />
            ) : null}
            <StudioButton label="PREVIEW PROMPT" disabled={busy} onClick={() => void post({ action: 'preview_prompt', openingScript: scriptForm.openingScript, closingScript: scriptForm.closingScript })} />
          </div>

          <button
            type="button"
            className="text-xs text-red-400 tracking-wider"
            onClick={() => setShowFullPrompt((v) => !v)}
          >
            {showFullPrompt ? 'HIDE FULL GENERATION PROMPT' : 'VIEW FULL GENERATION PROMPT'}
          </button>
          {showFullPrompt && workspace?.promptPreview?.promptSnapshot?.prompt ? (
            <pre className="text-[10px] whitespace-pre-wrap bg-black/60 border border-white/10 p-3 max-h-64 overflow-auto text-white/70">
              {workspace.promptPreview.promptSnapshot.prompt}
            </pre>
          ) : null}
        </section>

        <section className="border border-white/10 p-4 space-y-3">
          <h2 className="text-sm tracking-widest text-white/70">GENERATION</h2>
          <div className="flex flex-wrap gap-2">
            <StudioButton
              label="GENERATE FORECAST"
              disabled={busy || Boolean(fullValidation?.blockingError) || workspace?.script?.status !== 'approved'}
              onClick={() => void post({ action: 'generate_full_broadcast', provider: 'minimax', isTest: true, forceNewAttempt: true })}
            />
            <StudioButton label="POLL JOBS" disabled={busy} onClick={() => void post({ action: 'poll_jobs' })} />
            <StudioButton
              label="REGENERATE"
              disabled={busy}
              onClick={() => void post({ action: 'generate_full_broadcast', provider: 'minimax', isTest: true, forceNewAttempt: true })}
            />
          </div>

          {previewVideoUrl ? (
            <div className="space-y-2">
              <p className="text-xs text-white/50">VIDEO PREVIEW</p>
              <video src={previewVideoUrl} controls playsInline className="w-full max-w-2xl border border-white/10" />
              <div className="flex flex-wrap gap-2">
                {workspace?.latestFullJob?.status === 'completed' ? (
                  <StudioButton label="APPROVE" disabled={busy} onClick={() => void post({ action: 'approve_job', jobId: workspace.latestFullJob!.id })} />
                ) : null}
                {workspace?.latestFullJob ? (
                  <StudioButton label="REJECT" disabled={busy} onClick={() => void post({ action: 'reject_job', jobId: workspace.latestFullJob!.id })} />
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/40">No generated clip yet — approve script, then generate.</p>
          )}

          <ul className="space-y-2 text-xs">
            {(workspace?.fullJobs ?? []).map((job) => (
              <li key={job.id} className="border border-white/10 p-2 flex justify-between gap-2">
                <span>
                  ATTEMPT {String(job.attempt_number).padStart(2, '0')} · {job.status.toUpperCase()} · {job.provider} ·{' '}
                  {new Date(job.created_at).toLocaleString()}
                </span>
                {job.status === 'approved' ? <span className="text-green-400">APPROVED PRODUCTION ASSET</span> : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-white/10 p-4 space-y-3 max-w-2xl">
          <h2 className="text-sm tracking-widest text-white/70">PUBLISH</h2>
          <p className="text-xs text-white/50">Package: {workspace?.broadcastPackage?.status?.toUpperCase() ?? 'NONE'}</p>
          <div className="flex flex-wrap gap-2">
            <StudioButton
              label="ASSEMBLE PACKAGE"
              disabled={busy}
              onClick={() =>
                void post({
                  action: 'assemble_package',
                  signalIds: [
                    'obs-aug10-face-framing',
                    'obs-aug10-airy-layers',
                    'obs-aug10-glossy-movement',
                  ],
                  overlayData: [],
                })
              }
            />
            {workspace?.broadcastPackage ? (
              <>
                <StudioButton label="APPROVE PACKAGE" disabled={busy} onClick={() => void post({ action: 'approve_package', packageId: workspace.broadcastPackage!.id })} />
                <StudioButton label="PUBLISH TO EXPLORE" disabled={busy} onClick={() => void post({ action: 'publish_package', packageId: workspace.broadcastPackage!.id })} />
              </>
            ) : null}
          </div>
          <p className="text-[10px] text-white/40">
            Publish requires package approval. Generation success alone does not publish — founder approval gate enforced.
          </p>
        </section>
      </main>
    </div>
  );
}

function StudioButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="border border-white/20 px-3 py-1 text-xs tracking-wider hover:border-red-500/40 disabled:opacity-40"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
