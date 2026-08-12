import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { slayForecastGenerationConfig } from '../_lib/slayForecastBroadcast/generationConfig.js';
import { generatePsaBrief } from '../_lib/trendIntelligence/service.js';
import {
  approveContinuityVersion,
  getActiveContinuityVersion,
  listContinuityVersions,
  retireContinuityVersion,
  upsertContinuityVersion,
} from '../_lib/slayForecastBroadcast/continuity.js';
import {
  deriveWorkflowStatusFromJobs,
  getEpisodeForEdition,
  upsertEpisodeFromScript,
} from '../_lib/slayForecastBroadcast/episode.js';
import {
  approveBroadcastScript,
  approveGenerationJob,
  getLatestScript,
  listGenerationJobs,
  pollEditionGenerationJobs,
  previewFullBroadcastPrompt,
  rejectGenerationJob,
  saveBroadcastScript,
  submitFullBroadcastJob,
  submitGenerationJob,
} from '../_lib/slayForecastBroadcast/generation.js';
import {
  approveBroadcastPackage,
  assembleBroadcastPackage,
  computeGenerationCostSummary,
  getBroadcastPackageForEdition,
  publishBroadcastPackage,
  rejectBroadcastPackage,
} from '../_lib/slayForecastBroadcast/packages.js';
import { MODEL_CAPABILITIES, defaultProviderForProduction } from '../_lib/slayForecastBroadcast/providers/registry.js';
import { validateClosingScript, validateFullBroadcastScript, validateOpeningScript } from '../_lib/slayForecastBroadcast/scriptValidation.js';
import type { GenerationProviderId } from '../_lib/slayForecastBroadcast/types.js';

/**
 * /api/admin/slay-forecast-broadcast
 * Slay Forecast Studio — locked golden prompt + MiniMax H3 weekly production.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  const supabase = getSupabaseAdmin();
  const editionSlug =
    typeof req.query.editionSlug === 'string'
      ? req.query.editionSlug
      : typeof (req.body as { editionSlug?: string })?.editionSlug === 'string'
        ? (req.body as { editionSlug: string }).editionSlug
        : 'forecast-2026-08-10';

  try {
    if (req.method === 'GET') {
      const activeContinuity = await getActiveContinuityVersion(supabase);
      const continuityVersions = await listContinuityVersions(supabase);
      const script = await getLatestScript(supabase, editionSlug);
      const jobs = await pollEditionGenerationJobs(supabase, editionSlug);
      const broadcastPackage = await getBroadcastPackageForEdition(supabase, editionSlug);
      const costSummary = computeGenerationCostSummary(jobs);
      const episode = await getEpisodeForEdition(supabase, editionSlug);

      let psaBrief = null;
      try {
        psaBrief = await generatePsaBrief(supabase, editionSlug, 'SOFT LAYERS ARE MOVING IN.');
      } catch {
        /* optional */
      }

      const fullValidation = script
        ? validateFullBroadcastScript(script.opening_script, script.closing_script)
        : null;

      const promptPreview = script
        ? previewFullBroadcastPrompt(script.opening_script, script.closing_script, editionSlug)
        : null;

      const fullJobs = jobs.filter((j) => j.segment_type === 'full');
      const approvedFull = fullJobs.find((j) => j.status === 'approved');
      const latestFull = fullJobs[0];

      return res.status(200).json({
        editionSlug,
        generationConfig: slayForecastGenerationConfig,
        activeContinuity,
        continuityVersions,
        script,
        episode: episode ?? null,
        workflowStatus:
          episode?.workflow_status ??
          deriveWorkflowStatusFromJobs(jobs, script?.status),
        scriptEstimates: script
          ? {
              opening: validateOpeningScript(script.opening_script),
              closing: validateClosingScript(script.closing_script),
              full: fullValidation,
            }
          : null,
        promptPreview,
        jobs,
        fullJobs,
        latestFullJob: latestFull ?? null,
        approvedFullJob: approvedFull ?? null,
        broadcastPackage,
        costSummary,
        psaBrief,
        modelCapabilities: MODEL_CAPABILITIES,
        defaultProvider: defaultProviderForProduction(),
      });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const action = String((body as { action?: string }).action ?? '');

    switch (action) {
      case 'upsert_continuity': {
        const input = body as {
          versionSlug?: string;
          versionNumber?: number;
          studioMasterImageUrl?: string;
          restingVideoUrl?: string;
          restingFirstFrameUrl?: string;
          restingLastFrameUrl?: string;
          restingPosterUrl?: string;
          isDemo?: boolean;
          notes?: string;
        };
        if (!input.versionSlug) return res.status(400).json({ error: 'versionSlug required' });
        const continuity = await upsertContinuityVersion(
          supabase,
          {
            versionSlug: input.versionSlug,
            versionNumber: input.versionNumber,
            studioMasterImageUrl:
              input.studioMasterImageUrl ?? slayForecastGenerationConfig.masterImage,
            restingVideoUrl: input.restingVideoUrl,
            restingFirstFrameUrl: input.restingFirstFrameUrl,
            restingLastFrameUrl: input.restingLastFrameUrl,
            restingPosterUrl:
              input.restingPosterUrl ?? slayForecastGenerationConfig.masterImage,
            isDemo: input.isDemo,
            notes: input.notes,
          },
          admin.email,
        );
        return res.status(200).json({ continuity });
      }
      case 'approve_continuity': {
        const continuityId = String((body as { continuityId?: string }).continuityId);
        const continuity = await approveContinuityVersion(supabase, continuityId, admin.email);
        return res.status(200).json({ continuity });
      }
      case 'retire_continuity': {
        const continuityId = String((body as { continuityId?: string }).continuityId);
        const continuity = await retireContinuityVersion(supabase, continuityId, admin.email);
        return res.status(200).json({ continuity });
      }
      case 'save_script': {
        const { openingScript, closingScript, headline, summary } = body as {
          openingScript?: string;
          closingScript?: string;
          headline?: string;
          summary?: string;
        };
        if (openingScript == null || closingScript == null) {
          return res.status(400).json({ error: 'openingScript and closingScript required' });
        }
        const script = await saveBroadcastScript(
          supabase,
          editionSlug,
          openingScript,
          closingScript,
          admin.email,
        );
        const episode = await upsertEpisodeFromScript(
          supabase,
          {
            editionSlug,
            headline: headline ?? 'SOFT LAYERS ARE MOVING IN.',
            summary,
            openingDialogue: openingScript,
            closingDialogue: closingScript,
            workflowStatus: 'script_draft',
          },
          admin.email,
        );
        return res.status(200).json({ script, episode });
      }
      case 'approve_script': {
        const scriptId = String((body as { scriptId?: string }).scriptId);
        const script = await approveBroadcastScript(supabase, scriptId, admin.email);
        const episode = await upsertEpisodeFromScript(
          supabase,
          {
            editionSlug,
            headline: 'SOFT LAYERS ARE MOVING IN.',
            openingDialogue: script.opening_script,
            closingDialogue: script.closing_script,
            workflowStatus: 'ready_to_generate',
          },
          admin.email,
        );
        return res.status(200).json({ script, episode });
      }
      case 'preview_prompt': {
        const { openingScript, closingScript } = body as {
          openingScript?: string;
          closingScript?: string;
        };
        if (!openingScript || !closingScript) {
          return res.status(400).json({ error: 'openingScript and closingScript required' });
        }
        return res.status(200).json(previewFullBroadcastPrompt(openingScript, closingScript, editionSlug));
      }
      case 'draft_script_from_brief': {
        const brief = await generatePsaBrief(
          supabase,
          editionSlug,
          String((body as { headline?: string }).headline ?? 'SOFT LAYERS ARE MOVING IN.'),
        );
        const openingScript = brief.openingDirection;
        const closingScript = brief.closingDirection;
        const script = await saveBroadcastScript(
          supabase,
          editionSlug,
          openingScript,
          closingScript,
          admin.email,
        );
        const episode = await upsertEpisodeFromScript(
          supabase,
          {
            editionSlug,
            headline: String((body as { headline?: string }).headline ?? 'SOFT LAYERS ARE MOVING IN.'),
            summary: brief.summary,
            openingDialogue: openingScript,
            closingDialogue: closingScript,
            workflowStatus: 'script_draft',
          },
          admin.email,
        );
        return res.status(200).json({ script, brief, episode });
      }
      case 'generate_full_broadcast': {
        const result = await submitFullBroadcastJob(
          supabase,
          {
            editionSlug,
            provider: (body as { provider?: GenerationProviderId }).provider ?? 'minimax',
            isTest: Boolean((body as { isTest?: boolean }).isTest),
            generationNotes: (body as { generationNotes?: string }).generationNotes,
            forceNewAttempt: Boolean((body as { forceNewAttempt?: boolean }).forceNewAttempt),
          },
          admin.email,
        );
        return res.status(200).json(result);
      }
      case 'generate_opening':
      case 'generate_closing': {
        const segmentType = action === 'generate_opening' ? 'opening' : 'closing';
        const result = await submitGenerationJob(
          supabase,
          {
            editionSlug,
            segmentType,
            provider: (body as { provider?: GenerationProviderId }).provider,
            modelId: (body as { modelId?: string }).modelId,
            isTest: Boolean((body as { isTest?: boolean }).isTest),
            generationNotes: (body as { generationNotes?: string }).generationNotes,
            forceNewAttempt: Boolean((body as { forceNewAttempt?: boolean }).forceNewAttempt),
          },
          admin.email,
        );
        return res.status(200).json(result);
      }
      case 'poll_jobs': {
        const jobs = await pollEditionGenerationJobs(supabase, editionSlug);
        return res.status(200).json({ jobs });
      }
      case 'approve_job': {
        const jobId = String((body as { jobId?: string }).jobId);
        const job = await approveGenerationJob(supabase, jobId, admin.email);
        return res.status(200).json({ job });
      }
      case 'reject_job': {
        const jobId = String((body as { jobId?: string }).jobId);
        const reason = (body as { reason?: string }).reason ?? null;
        const job = await rejectGenerationJob(supabase, jobId, reason, admin.email);
        return res.status(200).json({ job });
      }
      case 'assemble_package': {
        const signalIds = ((body as { signalIds?: string[] }).signalIds ?? []).map(String);
        const overlayData = (body as { overlayData?: unknown[] }).overlayData ?? [];
        const result = await assembleBroadcastPackage(
          supabase,
          editionSlug,
          signalIds,
          overlayData,
          admin.email,
        );
        return res.status(200).json(result);
      }
      case 'approve_package': {
        const packageId = String((body as { packageId?: string }).packageId);
        const broadcastPackage = await approveBroadcastPackage(supabase, packageId, admin.email);
        return res.status(200).json({ broadcastPackage });
      }
      case 'publish_package': {
        const packageId = String((body as { packageId?: string }).packageId);
        const broadcastPackage = await publishBroadcastPackage(supabase, packageId, admin.email);
        return res.status(200).json({ broadcastPackage });
      }
      case 'reject_package': {
        const packageId = String((body as { packageId?: string }).packageId);
        const reason = (body as { reason?: string }).reason ?? null;
        const broadcastPackage = await rejectBroadcastPackage(supabase, packageId, reason, admin.email);
        return res.status(200).json({ broadcastPackage });
      }
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
