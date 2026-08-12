import type { SupabaseClient } from '@supabase/supabase-js';
import { logBroadcastAudit } from './audit.js';
import { slayForecastGenerationConfig } from './generationConfig.js';
import { SLAY_FORECAST_GOLDEN_PROMPT_VERSION } from './goldenPrompt.js';
import type { EpisodeSignal, EpisodeWorkflowStatus, SlayForecastEpisodeRow } from './types.js';

export async function getEpisodeForEdition(supabase: SupabaseClient, editionSlug: string) {
  const { data } = await supabase
    .from('slay_forecast_episodes')
    .select('*')
    .eq('edition_slug', editionSlug)
    .maybeSingle();
  return data as SlayForecastEpisodeRow | null;
}

export async function upsertEpisodeFromScript(
  supabase: SupabaseClient,
  input: {
    editionSlug: string;
    headline: string;
    summary?: string;
    openingDialogue: string;
    closingDialogue: string;
    signals?: EpisodeSignal[];
    displayDateRange?: string;
    weekStart?: string;
    weekEnd?: string;
    workflowStatus?: EpisodeWorkflowStatus;
  },
  actorEmail: string | null,
) {
  const existing = await getEpisodeForEdition(supabase, input.editionSlug);
  const row = {
    edition_slug: input.editionSlug,
    headline: input.headline,
    summary: input.summary ?? null,
    opening_dialogue: input.openingDialogue,
    closing_dialogue: input.closingDialogue,
    signals: input.signals ?? [],
    display_date_range: input.displayDateRange ?? null,
    week_start: input.weekStart ?? null,
    week_end: input.weekEnd ?? null,
    workflow_status: input.workflowStatus ?? ('script_draft' as const),
    prompt_version: SLAY_FORECAST_GOLDEN_PROMPT_VERSION,
    master_asset_version: slayForecastGenerationConfig.masterAssetVersion,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from('slay_forecast_episodes')
      .update(row)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as SlayForecastEpisodeRow;
  }

  const { data, error } = await supabase
    .from('slay_forecast_episodes')
    .insert(row)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'episode.created',
    entityType: 'slay_forecast_episode',
    entityId: data.id,
    details: { editionSlug: input.editionSlug },
  });
  return data as SlayForecastEpisodeRow;
}

export async function setEpisodeWorkflowStatus(
  supabase: SupabaseClient,
  editionSlug: string,
  workflowStatus: EpisodeWorkflowStatus,
  extra?: Partial<Pick<SlayForecastEpisodeRow, 'generation_job_id' | 'review_status' | 'approved_at' | 'publish_status' | 'published_at'>>,
) {
  const { data, error } = await supabase
    .from('slay_forecast_episodes')
    .update({
      workflow_status: workflowStatus,
      ...extra,
      updated_at: new Date().toISOString(),
    })
    .eq('edition_slug', editionSlug)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as SlayForecastEpisodeRow;
}

export function deriveWorkflowStatusFromJobs(
  jobs: Array<{ segment_type: string; status: string }>,
  scriptStatus?: string,
): EpisodeWorkflowStatus {
  const fullJobs = jobs.filter((j) => j.segment_type === 'full');
  const latest = fullJobs[0];
  if (latest?.status === 'generating' || latest?.status === 'queued') return 'generating';
  if (latest?.status === 'failed') return 'generation_failed';
  if (latest?.status === 'completed') return 'awaiting_approval';
  if (latest?.status === 'approved') return 'approved';
  if (scriptStatus === 'approved') return 'ready_to_generate';
  if (scriptStatus === 'draft') return 'script_draft';
  return 'script_review';
}
