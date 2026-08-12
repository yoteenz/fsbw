import type { SupabaseClient } from '@supabase/supabase-js';
import { logBroadcastAudit } from './audit.js';

export async function getActiveContinuityVersion(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('slay_forecast_continuity_versions')
    .select('*')
    .eq('status', 'approved')
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function listContinuityVersions(supabase: SupabaseClient) {
  const { data } = await supabase
    .from('slay_forecast_continuity_versions')
    .select('*')
    .order('version_number', { ascending: false });
  return data ?? [];
}

export type ContinuityUpsertInput = {
  versionSlug: string;
  versionNumber?: number;
  studioMasterImageUrl?: string;
  restingVideoUrl?: string;
  restingFirstFrameUrl?: string;
  restingLastFrameUrl?: string;
  restingPosterUrl?: string;
  isDemo?: boolean;
  notes?: string;
};

export async function upsertContinuityVersion(
  supabase: SupabaseClient,
  input: ContinuityUpsertInput,
  actorEmail: string | null,
) {
  const { data: existing } = await supabase
    .from('slay_forecast_continuity_versions')
    .select('id')
    .eq('version_slug', input.versionSlug)
    .maybeSingle();

  const row = {
    version_slug: input.versionSlug,
    version_number: input.versionNumber ?? 1,
    studio_master_image_url: input.studioMasterImageUrl ?? null,
    resting_video_url: input.restingVideoUrl ?? null,
    resting_first_frame_url: input.restingFirstFrameUrl ?? null,
    resting_last_frame_url: input.restingLastFrameUrl ?? null,
    resting_poster_url: input.restingPosterUrl ?? null,
    is_demo: input.isDemo ?? false,
    notes: input.notes ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from('slay_forecast_continuity_versions')
      .update(row)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    await logBroadcastAudit(supabase, {
      actorEmail,
      action: 'continuity.updated',
      entityType: 'continuity_version',
      entityId: data.id,
      details: { versionSlug: input.versionSlug },
    });
    return data;
  }

  const { data, error } = await supabase
    .from('slay_forecast_continuity_versions')
    .insert({ ...row, status: 'draft' })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'continuity.created',
    entityType: 'continuity_version',
    entityId: data.id,
    details: { versionSlug: input.versionSlug },
  });
  return data;
}

export async function approveContinuityVersion(
  supabase: SupabaseClient,
  continuityId: string,
  actorEmail: string | null,
) {
  const { data: target } = await supabase
    .from('slay_forecast_continuity_versions')
    .select('*')
    .eq('id', continuityId)
    .single();
  if (!target) throw new Error('Continuity version not found');
  const hasMasterImage = Boolean(target.studio_master_image_url?.trim());
  const hasLegacyResting =
    target.resting_video_url && target.resting_first_frame_url && target.resting_last_frame_url;
  if (!hasMasterImage && !hasLegacyResting) {
    throw new Error(
      'Continuity requires approved master image (v1) or legacy resting video + boundary frames before approval',
    );
  }

  await supabase
    .from('slay_forecast_continuity_versions')
    .update({ status: 'retired', updated_at: new Date().toISOString() })
    .eq('status', 'approved')
    .neq('id', continuityId);

  const { data, error } = await supabase
    .from('slay_forecast_continuity_versions')
    .update({
      status: 'approved',
      approved_by: actorEmail,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', continuityId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'continuity.approved',
    entityType: 'continuity_version',
    entityId: continuityId,
    details: { versionSlug: target.version_slug },
  });
  return data;
}

export async function retireContinuityVersion(
  supabase: SupabaseClient,
  continuityId: string,
  actorEmail: string | null,
) {
  const { data, error } = await supabase
    .from('slay_forecast_continuity_versions')
    .update({ status: 'retired', updated_at: new Date().toISOString() })
    .eq('id', continuityId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'continuity.retired',
    entityType: 'continuity_version',
    entityId: continuityId,
  });
  return data;
}
