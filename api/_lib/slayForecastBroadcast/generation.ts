import type { SupabaseClient } from '@supabase/supabase-js';
import { logBroadcastAudit } from './audit.js';
import { getActiveContinuityVersion } from './continuity.js';
import {
  DEFAULT_CLOSING_DURATION_SEC,
  DEFAULT_OPENING_DURATION_SEC,
  FULL_BROADCAST_DURATION_SEC,
} from './constants.js';
import { slayForecastGenerationConfig } from './generationConfig.js';
import { setEpisodeWorkflowStatus } from './episode.js';
import { buildPromptSnapshot, promptTemplateVersionFor } from './prompts.js';
import { defaultModelForProvider, defaultProviderForProduction, resolveProvider } from './providers/registry.js';
import { hasActiveGenerationJob } from './providers/types.js';
import { editionSegmentStoragePath, mirrorRemoteAssetToStorage } from './storage.js';
import { validateClosingScript, validateFullBroadcastScript, validateOpeningScript } from './scriptValidation.js';
import type { GenerateFullBroadcastInput, GenerateSegmentInput, GenerationProviderId } from './types.js';

export async function getLatestScript(supabase: SupabaseClient, editionSlug: string) {
  const { data } = await supabase
    .from('slay_forecast_broadcast_scripts')
    .select('*')
    .eq('edition_slug', editionSlug)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function saveBroadcastScript(
  supabase: SupabaseClient,
  editionSlug: string,
  openingScript: string,
  closingScript: string,
  actorEmail: string | null,
) {
  const latest = await getLatestScript(supabase, editionSlug);
  const version = (latest?.version ?? 0) + 1;

  const { data, error } = await supabase
    .from('slay_forecast_broadcast_scripts')
    .insert({
      edition_slug: editionSlug,
      opening_script: openingScript,
      closing_script: closingScript,
      status: 'draft',
      version,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'script.saved',
    entityType: 'broadcast_script',
    entityId: data.id,
    details: { editionSlug, version },
  });
  return data;
}

export async function approveBroadcastScript(
  supabase: SupabaseClient,
  scriptId: string,
  actorEmail: string | null,
) {
  const { data: script } = await supabase
    .from('slay_forecast_broadcast_scripts')
    .select('*')
    .eq('id', scriptId)
    .single();
  if (!script) throw new Error('Script not found');

  const openingCheck = validateOpeningScript(script.opening_script);
  const closingCheck = validateClosingScript(script.closing_script);
  const fullCheck = validateFullBroadcastScript(script.opening_script, script.closing_script);
  if (fullCheck.blockingError) {
    throw new Error(fullCheck.blockingError);
  }
  if (openingCheck.warning?.includes('too long') || closingCheck.warning?.includes('too long')) {
    throw new Error('Script exceeds recommended duration — shorten before approval');
  }

  const { data, error } = await supabase
    .from('slay_forecast_broadcast_scripts')
    .update({
      status: 'approved',
      approved_by: actorEmail,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', scriptId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'script.approved',
    entityType: 'broadcast_script',
    entityId: scriptId,
    details: { editionSlug: script.edition_slug },
  });
  return data;
}

export async function listGenerationJobs(supabase: SupabaseClient, editionSlug: string) {
  const { data } = await supabase
    .from('slay_forecast_generation_jobs')
    .select('*')
    .eq('edition_slug', editionSlug)
    .order('segment_type')
    .order('attempt_number', { ascending: false });
  return data ?? [];
}

export async function submitGenerationJob(
  supabase: SupabaseClient,
  input: GenerateSegmentInput,
  actorEmail: string | null,
) {
  const providerId = (input.provider ?? (process.env.SLAY_FORECAST_GENERATION_PROVIDER as GenerationProviderId) ?? 'mock') as GenerationProviderId;
  const isTest = input.isTest ?? process.env.NODE_ENV !== 'production';

  if (!input.forceNewAttempt) {
    const active = await hasActiveGenerationJob(supabase, input.editionSlug, input.segmentType);
    if (active) throw new Error(`A ${input.segmentType} generation job is already in progress`);
  }

  const continuity = await getActiveContinuityVersion(supabase);
  if (!continuity) throw new Error('No approved continuity version — register resting assets first');

  const script = await getLatestScript(supabase, input.editionSlug);
  if (!script) throw new Error('Save and approve a PSA script before generating');
  if (script.status !== 'approved' && !isTest) {
    throw new Error('PSA script must be approved before final generation');
  }

  const segmentScript =
    input.segmentType === 'opening' ? script.opening_script : script.closing_script;
  const durationEstimate =
    input.segmentType === 'opening'
      ? validateOpeningScript(segmentScript)
      : validateClosingScript(segmentScript);

  const startFrame =
    input.segmentType === 'opening'
      ? continuity.studio_master_image_url ?? continuity.resting_first_frame_url
      : continuity.resting_last_frame_url;
  const endFrame = input.segmentType === 'opening' ? continuity.resting_first_frame_url : null;

  const promptSnapshot = buildPromptSnapshot({
    segmentType: input.segmentType,
    script: segmentScript,
    durationSec:
      input.segmentType === 'opening' ? DEFAULT_OPENING_DURATION_SEC : DEFAULT_CLOSING_DURATION_SEC,
    generationNotes: input.generationNotes,
  });

  const { data: lastAttempt } = await supabase
    .from('slay_forecast_generation_jobs')
    .select('attempt_number')
    .eq('edition_slug', input.editionSlug)
    .eq('segment_type', input.segmentType)
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const attemptNumber = (lastAttempt?.attempt_number ?? 0) + 1;
  const modelId = input.modelId ?? defaultModelForProvider(providerId);
  const provider = resolveProvider(providerId);

  const submitResult = await provider.submit({
    segmentType: input.segmentType,
    prompt: String(promptSnapshot.prompt),
    modelId,
    durationSec:
      input.segmentType === 'opening' ? DEFAULT_OPENING_DURATION_SEC : DEFAULT_CLOSING_DURATION_SEC,
    startFrameUrl: startFrame,
    endFrameUrl: endFrame,
    isTest,
  });

  const { data: job, error } = await supabase
    .from('slay_forecast_generation_jobs')
    .insert({
      edition_slug: input.editionSlug,
      segment_type: input.segmentType,
      attempt_number: attemptNumber,
      provider: providerId,
      model_id: modelId,
      continuity_version_id: continuity.id,
      script_id: script.id,
      script_version: script.version,
      prompt_template_version: promptTemplateVersionFor(input.segmentType),
      prompt_snapshot: promptSnapshot,
      start_frame_url: startFrame,
      end_frame_url: endFrame,
      status: 'generating',
      provider_job_id: submitResult.providerJobId,
      estimated_cost: submitResult.estimatedCost ?? null,
      is_test: isTest,
      generation_notes: input.generationNotes ?? null,
      created_by: actorEmail,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'generation.submitted',
    entityType: 'generation_job',
    entityId: job.id,
    details: {
      editionSlug: input.editionSlug,
      segmentType: input.segmentType,
      provider: providerId,
      attemptNumber,
      isTest,
    },
  });

  return { job, durationEstimate };
}

export async function advanceGenerationJob(supabase: SupabaseClient, jobId: string) {
  const { data: job } = await supabase
    .from('slay_forecast_generation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  if (!job) throw new Error('Job not found');
  if (job.status !== 'generating' && job.status !== 'queued') return job;
  if (!job.provider_job_id || !job.model_id) return job;

  const provider = resolveProvider(job.provider as GenerationProviderId);
  const poll = await provider.poll(job.model_id, job.provider_job_id);

  if (poll.status === 'generating') return job;

  if (poll.status === 'failed') {
    const { data: updated } = await supabase
      .from('slay_forecast_generation_jobs')
      .update({
        status: 'failed',
        error: poll.error ?? 'Generation failed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select('*')
      .single();
    if (job.segment_type === 'full') {
      await setEpisodeWorkflowStatus(supabase, job.edition_slug, 'generation_failed', {
        generation_job_id: jobId,
      });
    }
    return updated;
  }

  let outputUrl = poll.outputUrl ?? null;
  if (outputUrl && outputUrl.startsWith('http') && job.provider !== 'mock') {
    try {
      const path = editionSegmentStoragePath(
        job.edition_slug,
        job.segment_type,
        job.attempt_number,
        'mp4',
      );
      outputUrl = await mirrorRemoteAssetToStorage(supabase, outputUrl, path);
    } catch {
      /* keep provider URL as source */
    }
  }

  const { data: updated, error } = await supabase
    .from('slay_forecast_generation_jobs')
    .update({
      status: 'completed',
      output_source_url: poll.outputUrl ?? outputUrl,
      output_optimized_url: outputUrl,
      actual_cost: poll.actualCost ?? null,
      duration_seconds:
        job.segment_type === 'full'
          ? FULL_BROADCAST_DURATION_SEC
          : job.segment_type === 'opening'
            ? DEFAULT_OPENING_DURATION_SEC
            : DEFAULT_CLOSING_DURATION_SEC,
      completed_at: new Date().toISOString(),
      error: null,
    })
    .eq('id', jobId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  if (job.segment_type === 'full') {
    await setEpisodeWorkflowStatus(supabase, job.edition_slug, 'awaiting_approval', {
      generation_job_id: jobId,
      review_status: 'pending',
    });
  }
  return updated;
}

export async function approveGenerationJob(
  supabase: SupabaseClient,
  jobId: string,
  actorEmail: string | null,
) {
  const { data: job } = await supabase
    .from('slay_forecast_generation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  if (!job) throw new Error('Job not found');
  if (job.status !== 'completed') throw new Error('Only completed jobs can be approved');
  if (job.is_test && process.env.NODE_ENV === 'production') {
    throw new Error('Test generation cannot be approved for production');
  }

  await supabase
    .from('slay_forecast_generation_jobs')
    .update({ status: 'rejected' })
    .eq('edition_slug', job.edition_slug)
    .eq('segment_type', job.segment_type)
    .eq('status', 'approved');

  const { data, error } = await supabase
    .from('slay_forecast_generation_jobs')
    .update({ status: 'approved' })
    .eq('id', jobId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'generation.approved',
    entityType: 'generation_job',
    entityId: jobId,
    details: { segmentType: job.segment_type, attemptNumber: job.attempt_number },
  });

  if (job.segment_type === 'full') {
    await setEpisodeWorkflowStatus(supabase, job.edition_slug, 'approved', {
      generation_job_id: jobId,
      review_status: 'approved',
      approved_at: new Date().toISOString(),
    });
  }

  return data;
}

export async function rejectGenerationJob(
  supabase: SupabaseClient,
  jobId: string,
  reason: string | null,
  actorEmail: string | null,
) {
  const { data, error } = await supabase
    .from('slay_forecast_generation_jobs')
    .update({ status: 'rejected', generation_notes: reason, completed_at: new Date().toISOString() })
    .eq('id', jobId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'generation.rejected',
    entityType: 'generation_job',
    entityId: jobId,
    details: { reason },
  });
  return data;
}

export async function pollEditionGenerationJobs(supabase: SupabaseClient, editionSlug: string) {
  const jobs = await listGenerationJobs(supabase, editionSlug);
  const active = jobs.filter((j) => j.status === 'generating' || j.status === 'queued');
  for (const job of active) {
    await advanceGenerationJob(supabase, job.id);
  }
  return listGenerationJobs(supabase, editionSlug);
}

export function previewFullBroadcastPrompt(openingDialogue: string, closingDialogue: string, forecastWeek?: string) {
  const validation = validateFullBroadcastScript(openingDialogue, closingDialogue);
  const promptSnapshot = buildPromptSnapshot({
    segmentType: 'full',
    script: openingDialogue,
    closingScript: closingDialogue,
    forecastWeek,
  });
  return {
    config: slayForecastGenerationConfig,
    validation,
    promptSnapshot,
  };
}

/** Submit one continuous 15s MiniMax H3 weekly forecast generation. */
export async function submitFullBroadcastJob(
  supabase: SupabaseClient,
  input: GenerateFullBroadcastInput,
  actorEmail: string | null,
) {
  const providerId = (input.provider ?? defaultProviderForProduction()) as GenerationProviderId;
  const isTest = input.isTest ?? process.env.NODE_ENV !== 'production';
  const segmentType = 'full' as const;

  if (!input.forceNewAttempt) {
    const active = await hasActiveGenerationJob(supabase, input.editionSlug, segmentType);
    if (active) throw new Error('A full broadcast generation job is already in progress');
  }

  const continuity = await getActiveContinuityVersion(supabase);
  const masterImage =
    continuity?.studio_master_image_url ?? slayForecastGenerationConfig.masterImage;

  const script = await getLatestScript(supabase, input.editionSlug);
  if (!script) throw new Error('Save and approve a PSA script before generating');
  if (script.status !== 'approved' && !isTest) {
    throw new Error('PSA script must be approved before generation');
  }

  const validation = validateFullBroadcastScript(script.opening_script, script.closing_script);
  if (validation.blockingError) {
    throw new Error(validation.blockingError);
  }

  const promptSnapshot = buildPromptSnapshot({
    segmentType: 'full',
    script: script.opening_script,
    closingScript: script.closing_script,
    generationNotes: input.generationNotes,
  });

  const { data: lastAttempt } = await supabase
    .from('slay_forecast_generation_jobs')
    .select('attempt_number')
    .eq('edition_slug', input.editionSlug)
    .eq('segment_type', segmentType)
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const attemptNumber = (lastAttempt?.attempt_number ?? 0) + 1;
  const modelId = slayForecastGenerationConfig.model;
  const provider = resolveProvider(providerId);

  const submitResult = await provider.submit({
    segmentType,
    prompt: String(promptSnapshot.prompt),
    modelId,
    durationSec: FULL_BROADCAST_DURATION_SEC,
    startFrameUrl: masterImage,
    isTest,
  });

  const { data: job, error } = await supabase
    .from('slay_forecast_generation_jobs')
    .insert({
      edition_slug: input.editionSlug,
      segment_type: segmentType,
      attempt_number: attemptNumber,
      provider: providerId,
      model_id: modelId,
      continuity_version_id: continuity?.id ?? null,
      script_id: script.id,
      script_version: script.version,
      prompt_template_version: promptTemplateVersionFor(segmentType),
      prompt_snapshot: promptSnapshot,
      start_frame_url: masterImage,
      end_frame_url: null,
      status: 'generating',
      provider_job_id: submitResult.providerJobId,
      estimated_cost: submitResult.estimatedCost ?? null,
      is_test: isTest,
      generation_notes: input.generationNotes ?? null,
      created_by: actorEmail,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await setEpisodeWorkflowStatus(supabase, input.editionSlug, 'generating', {
    generation_job_id: job.id,
  });

  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'generation.full_submitted',
    entityType: 'generation_job',
    entityId: job.id,
    details: {
      editionSlug: input.editionSlug,
      provider: providerId,
      attemptNumber,
      isTest,
      promptVersion: slayForecastGenerationConfig.promptTemplateVersion,
      masterAssetVersion: slayForecastGenerationConfig.masterAssetVersion,
    },
  });

  return { job, validation, promptSnapshot, config: slayForecastGenerationConfig };
}
