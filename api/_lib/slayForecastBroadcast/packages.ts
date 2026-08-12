import type { SupabaseClient } from '@supabase/supabase-js';
import { logBroadcastAudit } from './audit.js';
import { getActiveContinuityVersion } from './continuity.js';
import { suggestBroadcastTimeline } from './timeline.js';
import { validateSignalScriptConsistency } from './scriptValidation.js';
import type { BroadcastPackageRow, PublicBroadcastPackage } from './types.js';

export async function getBroadcastPackageForEdition(supabase: SupabaseClient, editionSlug: string) {
  const { data } = await supabase
    .from('slay_forecast_broadcast_packages')
    .select('*')
    .eq('edition_slug', editionSlug)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as BroadcastPackageRow | null;
}

export async function assembleBroadcastPackage(
  supabase: SupabaseClient,
  editionSlug: string,
  signalIds: string[],
  overlayData: unknown[],
  actorEmail: string | null,
) {
  const continuity = await getActiveContinuityVersion(supabase);

  const { data: fullJob } = await supabase
    .from('slay_forecast_generation_jobs')
    .select('*')
    .eq('edition_slug', editionSlug)
    .eq('segment_type', 'full')
    .eq('status', 'approved')
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: openingJob } = await supabase
    .from('slay_forecast_generation_jobs')
    .select('*')
    .eq('edition_slug', editionSlug)
    .eq('segment_type', 'opening')
    .eq('status', 'approved')
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: closingJob } = await supabase
    .from('slay_forecast_generation_jobs')
    .select('*')
    .eq('edition_slug', editionSlug)
    .eq('segment_type', 'closing')
    .eq('status', 'approved')
    .order('attempt_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!fullJob && (!openingJob || !closingJob)) {
    throw new Error('Approved full broadcast or opening+closing segments required');
  }

  if (!fullJob && (!continuity?.resting_video_url)) {
    throw new Error('Legacy package requires approved continuity with resting video');
  }

  const scriptJob = fullJob ?? openingJob;
  const { data: script } = await supabase
    .from('slay_forecast_broadcast_scripts')
    .select('*')
    .eq('id', scriptJob?.script_id ?? '')
    .maybeSingle();

  const consistencyWarning = script
    ? validateSignalScriptConsistency(script.opening_script, signalIds.length)
    : null;

  const broadcastTimeline = suggestBroadcastTimeline(signalIds);
  const existing = await getBroadcastPackageForEdition(supabase, editionSlug);

  const row = {
    edition_slug: editionSlug,
    continuity_version_id: continuity?.id ?? null,
    opening_job_id: openingJob?.id ?? null,
    closing_job_id: closingJob?.id ?? null,
    full_job_id: fullJob?.id ?? null,
    resting_asset_url: continuity?.resting_video_url ?? null,
    script_id: script?.id ?? scriptJob?.script_id,
    script_version: script?.version ?? scriptJob?.script_version,
    broadcast_timeline: broadcastTimeline,
    overlay_data: overlayData,
    status: 'ready_for_review' as const,
    updated_at: new Date().toISOString(),
  };

  let pkg;
  if (existing?.id) {
    const { data, error } = await supabase
      .from('slay_forecast_broadcast_packages')
      .update(row)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    pkg = data;
  } else {
    const { data, error } = await supabase
      .from('slay_forecast_broadcast_packages')
      .insert(row)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    pkg = data;
  }

  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'package.assembled',
    entityType: 'broadcast_package',
    entityId: pkg.id,
    details: { editionSlug, consistencyWarning },
  });

  return { package: pkg, consistencyWarning };
}

export async function approveBroadcastPackage(
  supabase: SupabaseClient,
  packageId: string,
  actorEmail: string | null,
) {
  const { data, error } = await supabase
    .from('slay_forecast_broadcast_packages')
    .update({
      status: 'approved',
      approved_by: actorEmail,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', packageId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'package.approved',
    entityType: 'broadcast_package',
    entityId: packageId,
  });
  return data;
}

export async function publishBroadcastPackage(
  supabase: SupabaseClient,
  packageId: string,
  actorEmail: string | null,
) {
  const { data: pkg } = await supabase
    .from('slay_forecast_broadcast_packages')
    .select('*')
    .eq('id', packageId)
    .single();
  if (!pkg) throw new Error('Package not found');
  if (pkg.status !== 'approved') throw new Error('Package must be approved before publish');
  if (pkg.is_demo && process.env.NODE_ENV === 'production') {
    throw new Error('Demo packages cannot be published in production');
  }

  await supabase
    .from('slay_forecast_broadcast_packages')
    .update({ status: 'draft', updated_at: new Date().toISOString() })
    .eq('edition_slug', pkg.edition_slug)
    .eq('status', 'published')
    .neq('id', packageId);

  const { data, error } = await supabase
    .from('slay_forecast_broadcast_packages')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', packageId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);

  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'package.published',
    entityType: 'broadcast_package',
    entityId: packageId,
    details: { editionSlug: pkg.edition_slug },
  });
  return data;
}

export async function rejectBroadcastPackage(
  supabase: SupabaseClient,
  packageId: string,
  reason: string | null,
  actorEmail: string | null,
) {
  const { data, error } = await supabase
    .from('slay_forecast_broadcast_packages')
    .update({
      status: 'draft',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', packageId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  await logBroadcastAudit(supabase, {
    actorEmail,
    action: 'package.rejected',
    entityType: 'broadcast_package',
    entityId: packageId,
    details: { reason },
  });
  return data;
}

export async function fetchPublicBroadcastPackage(
  supabase: SupabaseClient,
  editionSlug: string,
): Promise<{ editionSlug: string; package: PublicBroadcastPackage | null }> {
  const { data, error } = await supabase.rpc('slay_forecast_public_broadcast_package', {
    p_edition_slug: editionSlug,
  });
  if (error) throw new Error(error.message);
  const payload = (data ?? { editionSlug, package: null }) as {
    editionSlug: string;
    package: PublicBroadcastPackage | null;
  };
  return payload;
}

export function computeGenerationCostSummary(
  jobs: Array<{ segment_type: string; estimated_cost: number | null; actual_cost: number | null; status: string }>,
) {
  const opening = jobs.filter((j) => j.segment_type === 'opening');
  const closing = jobs.filter((j) => j.segment_type === 'closing');
  const full = jobs.filter((j) => j.segment_type === 'full');
  const sum = (rows: typeof jobs) =>
    rows.reduce((acc, j) => acc + (j.actual_cost ?? j.estimated_cost ?? 0), 0);
  return {
    openingTotal: sum(opening),
    closingTotal: sum(closing),
    fullTotal: sum(full),
    total: sum(jobs),
    hasKnownCosts: jobs.some((j) => j.actual_cost != null || j.estimated_cost != null),
  };
}
