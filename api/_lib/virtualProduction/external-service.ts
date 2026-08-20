/**
 * External integration service — contract v1.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  EXTERNAL_CONTRACT_VERSION,
  type ClientSafeActivityV1,
  type ClientSafeCampaignStatusV1,
  type ClientSafeDeliverableV1,
  type ClientSafeReviewV1,
  type ProvisionCampaignRequestV1,
  type ProvisionCampaignResponseV1,
  mapLifecycleToExternalStatus,
} from '../../../src/studio-os-core/virtual-production/external/contract-v1';
import { seedFrontalSlayerCanonAndCampaign001 } from './canon-seed.js';
import { logVirtualProductionEvent } from '../../../src/studio-os-core/virtual-production/observability';

const CONTRACT_VERSION = EXTERNAL_CONTRACT_VERSION;

function now(): string {
  return new Date().toISOString();
}

export async function provisionCampaignExternal(
  supabase: SupabaseClient,
  orgId: string,
  externalSystem: string,
  req: ProvisionCampaignRequestV1
): Promise<ProvisionCampaignResponseV1> {
  const { data: existing } = await supabase
    .from('studio_vp_external_engagements')
    .select('*, studio_vp_campaigns(*)')
    .eq('org_id', orgId)
    .eq('external_system', externalSystem)
    .eq('external_engagement_id', req.externalEngagementId)
    .maybeSingle();

  if (existing?.campaign_id) {
    return {
      contractVersion: CONTRACT_VERSION,
      studioWorldCampaignId: existing.campaign_id as string,
      externalEngagementId: req.externalEngagementId,
      status: existing.status as string,
      currentPhase: existing.current_phase as string,
      brandSetupRequired: existing.brand_setup_required as boolean,
      createdAt: existing.created_at as string,
      idempotentReplay: true,
    };
  }

  const seed = await seedFrontalSlayerCanonAndCampaign001(supabase, orgId);

  const { data: engagement, error } = await supabase
    .from('studio_vp_external_engagements')
    .insert({
      org_id: orgId,
      external_system: externalSystem,
      external_engagement_id: req.externalEngagementId,
      external_project_id: req.externalProjectId,
      external_client_id: req.externalClientId,
      client_visible_project_id: req.clientVisibleProjectId,
      campaign_id: seed.campaignId,
      brand_id: seed.brandId,
      engagement_type: req.engagementType,
      service_type: req.serviceType,
      provision_payload: req,
      status: 'provisioned',
      current_phase: 'initialized',
      brand_setup_required: req.brandSetupRequired ?? false,
      contract_version: CONTRACT_VERSION,
      updated_at: now(),
    })
    .select('*')
    .single();

  if (error) throw error;

  await supabase.from('studio_vp_client_activity').insert({
    org_id: orgId,
    campaign_id: seed.campaignId,
    activity_key: `ext-provision-${req.externalEngagementId}`,
    activity_type: 'campaign_initialized',
    client_safe_message: 'Campaign initialized',
  });

  logVirtualProductionEvent('campaign_created', {
    orgId,
    campaignId: seed.campaignId,
    providerId: externalSystem,
  });

  return {
    contractVersion: CONTRACT_VERSION,
    studioWorldCampaignId: seed.campaignId,
    externalEngagementId: req.externalEngagementId,
    status: engagement!.status as string,
    currentPhase: engagement!.current_phase as string,
    brandSetupRequired: engagement!.brand_setup_required as boolean,
    createdAt: engagement!.created_at as string,
    idempotentReplay: false,
  };
}

export async function getClientSafeStatus(
  supabase: SupabaseClient,
  orgId: string,
  campaignId: string,
  externalSystem: string,
  externalEngagementId: string
): Promise<ClientSafeCampaignStatusV1 | null> {
  const authorized = await assertEngagementAccess(
    supabase,
    orgId,
    campaignId,
    externalSystem,
    externalEngagementId
  );
  if (!authorized) return null;

  const { data: campaign } = await supabase
    .from('studio_vp_campaigns')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', campaignId)
    .single();
  if (!campaign) return null;

  const { data: shots } = await supabase
    .from('studio_vp_shots')
    .select('approval_state, qc_summary')
    .eq('campaign_id', campaignId);

  const list = shots ?? [];
  const approved = list.filter((s) => s.approval_state === 'approved').length;
  const repair = list.filter((s) => s.approval_state === 'repair_required').length;
  const notReviewed = list.filter(
    (s) => (s.qc_summary as { overall?: string })?.overall === 'not_reviewed'
  ).length;

  const { count: reviewPending } = await supabase
    .from('studio_vp_client_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('status', 'pending')
    .eq('client_visible', true);

  const { count: deliverablesReady } = await supabase
    .from('studio_vp_deliverables')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('client_visible', true)
    .eq('approval_state', 'approved');

  return {
    contractVersion: CONTRACT_VERSION,
    campaignId,
    status: mapLifecycleToExternalStatus(
      campaign.lifecycle_status as string,
      campaign.approval_state as string,
      (reviewPending ?? 0) > 0,
      (deliverablesReady ?? 0) > 0
    ),
    currentPhase: (campaign.current_phase as string) ?? 'brief',
    progress: {
      shotsTotal: list.length,
      shotsApproved: approved,
      shotsRepair: repair,
      shotsNotReviewed: notReviewed,
    },
    latestMilestone: campaign.lifecycle_status as string,
    clientInputRequired: (reviewPending ?? 0) > 0,
    reviewReady: (reviewPending ?? 0) > 0,
    deliverablesReady: (deliverablesReady ?? 0) > 0,
    updatedAt: campaign.updated_at as string,
  };
}

export async function listClientSafeReviews(
  supabase: SupabaseClient,
  orgId: string,
  campaignId: string,
  externalSystem: string,
  externalEngagementId: string
): Promise<ClientSafeReviewV1[]> {
  const authorized = await assertEngagementAccess(
    supabase,
    orgId,
    campaignId,
    externalSystem,
    externalEngagementId
  );
  if (!authorized) return [];

  const { data } = await supabase
    .from('studio_vp_client_reviews')
    .select('*')
    .eq('org_id', orgId)
    .eq('campaign_id', campaignId)
    .eq('client_visible', true);

  return (data ?? []).map((r) => ({
    reviewId: r.id as string,
    campaignId,
    type: r.review_type as string,
    title: r.title as string,
    clientSafeDescription: r.client_safe_description as string,
    previewAssets: (r.preview_assets as Array<{ url: string; type: string }>) ?? [],
    allowedActions: (r.allowed_actions as ClientSafeReviewV1['allowedActions']) ?? [],
    status: r.status as string,
    createdAt: r.created_at as string,
  }));
}

export async function submitClientReview(
  supabase: SupabaseClient,
  orgId: string,
  campaignId: string,
  externalSystem: string,
  externalEngagementId: string,
  reviewId: string,
  action: string,
  notes?: string
): Promise<boolean> {
  const authorized = await assertEngagementAccess(
    supabase,
    orgId,
    campaignId,
    externalSystem,
    externalEngagementId
  );
  if (!authorized) return false;

  const { error } = await supabase
    .from('studio_vp_client_reviews')
    .update({
      decision: action,
      decision_notes: notes,
      status: action === 'approve' ? 'approved' : 'revision_requested',
      submitted_by_system: externalSystem,
      updated_at: now(),
    })
    .eq('id', reviewId)
    .eq('campaign_id', campaignId)
    .eq('client_visible', true);

  return !error;
}

export async function listClientSafeDeliverables(
  supabase: SupabaseClient,
  orgId: string,
  campaignId: string,
  externalSystem: string,
  externalEngagementId: string
): Promise<ClientSafeDeliverableV1[]> {
  const authorized = await assertEngagementAccess(
    supabase,
    orgId,
    campaignId,
    externalSystem,
    externalEngagementId
  );
  if (!authorized) return [];

  const { data } = await supabase
    .from('studio_vp_deliverables')
    .select('*')
    .eq('org_id', orgId)
    .eq('campaign_id', campaignId)
    .eq('client_visible', true)
    .eq('approval_state', 'approved');

  return (data ?? []).map((d) => ({
    deliverableId: d.id as string,
    campaignId,
    title: d.deliverable_key as string,
    type: 'video',
    format: d.platform as string,
    aspectRatio: d.aspect_ratio as string | undefined,
    version: d.export_version as string | undefined,
    preview: d.poster_url as string | undefined,
    deliveryAsset: undefined,
    status: d.delivery_state as string,
  }));
}

export async function listClientSafeActivity(
  supabase: SupabaseClient,
  orgId: string,
  campaignId: string,
  externalSystem: string,
  externalEngagementId: string
): Promise<ClientSafeActivityV1[]> {
  const authorized = await assertEngagementAccess(
    supabase,
    orgId,
    campaignId,
    externalSystem,
    externalEngagementId
  );
  if (!authorized) return [];

  const { data } = await supabase
    .from('studio_vp_client_activity')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(20);

  return (data ?? []).map((a) => ({
    activityType: a.activity_type as string,
    message: a.client_safe_message as string,
    createdAt: a.created_at as string,
  }));
}

async function assertEngagementAccess(
  supabase: SupabaseClient,
  orgId: string,
  campaignId: string,
  externalSystem: string,
  externalEngagementId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('studio_vp_external_engagements')
    .select('id')
    .eq('org_id', orgId)
    .eq('external_system', externalSystem)
    .eq('external_engagement_id', externalEngagementId)
    .eq('campaign_id', campaignId)
    .maybeSingle();
  return Boolean(data);
}
