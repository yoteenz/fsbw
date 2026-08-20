/**
 * Partner agency usage analytics — tenant-scoped.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function getAgencyUsageAnalytics(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    clientId?: string;
    projectId?: string;
    campaignId?: string;
    from?: string;
    to?: string;
  }
) {
  let query = supabase
    .from('studio_world_production_usage_events')
    .select('*')
    .eq('organization_id', input.organizationId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (input.clientId) query = query.eq('client_id', input.clientId);
  if (input.projectId) query = query.eq('project_id', input.projectId);
  if (input.campaignId) query = query.eq('campaign_id', input.campaignId);
  if (input.from) query = query.gte('created_at', input.from);
  if (input.to) query = query.lt('created_at', input.to);

  const { data: events } = await query;

  const totals = (events ?? []).reduce(
    (acc, e) => {
      const cost = Number(e.actual_cost ?? e.estimated_cost ?? 0);
      if (e.status === 'failed') return acc;
      acc.actual += cost;
      acc.count += 1;
      return acc;
    },
    { actual: 0, count: 0 }
  );

  const byClient: Record<string, number> = {};
  const byProject: Record<string, number> = {};
  for (const e of events ?? []) {
    if (e.status === 'failed') continue;
    const cost = Number(e.actual_cost ?? e.estimated_cost ?? 0);
    if (e.client_id) byClient[e.client_id as string] = (byClient[e.client_id as string] ?? 0) + cost;
    if (e.project_id) byProject[e.project_id as string] = (byProject[e.project_id as string] ?? 0) + cost;
  }

  return { events: events ?? [], totals, byClient, byProject };
}
