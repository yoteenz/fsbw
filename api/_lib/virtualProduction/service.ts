/**
 * Virtual Production OS — server-side service (Supabase).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  CAMPAIGN_001_SHELL,
  FRONTAL_SLAYER_BRAND_SHELL,
  buildCampaign001PlaceholderScenes,
  buildCampaign001PlaceholderShots,
} from '../../../src/studio-os-core/virtual-production/reference-seed';
import { logVirtualProductionEvent } from '../../../src/studio-os-core/virtual-production/observability';
import { createRepairRecord } from '../../../src/studio-os-core/virtual-production/repair';
import {
  buildDirectorProductionPackage,
  formatDirectorPackageMarkdown,
} from '../../../src/studio-os-core/virtual-production/director-package';

function now(): string {
  return new Date().toISOString();
}

export async function ensureReferenceTenantSeed(
  supabase: SupabaseClient,
  orgId: string
): Promise<{ brandId: string; campaignId: string }> {
  const { data: existingBrand } = await supabase
    .from('studio_vp_brands')
    .select('id')
    .eq('org_id', orgId)
    .eq('brand_key', FRONTAL_SLAYER_BRAND_SHELL.brandKey)
    .maybeSingle();

  let brandId = existingBrand?.id as string | undefined;

  if (!brandId) {
    const { data: brand, error } = await supabase
      .from('studio_vp_brands')
      .insert({
        org_id: orgId,
        brand_key: FRONTAL_SLAYER_BRAND_SHELL.brandKey,
        display_name: FRONTAL_SLAYER_BRAND_SHELL.displayName,
        description: FRONTAL_SLAYER_BRAND_SHELL.description,
        visual_rules: FRONTAL_SLAYER_BRAND_SHELL.visualRules,
        forbidden_deviations: FRONTAL_SLAYER_BRAND_SHELL.forbiddenDeviations,
        status: FRONTAL_SLAYER_BRAND_SHELL.status,
        metadata: FRONTAL_SLAYER_BRAND_SHELL.metadata,
        updated_at: now(),
      })
      .select('id')
      .single();
    if (error) throw error;
    brandId = brand.id;
  }

  const { data: existingCampaign } = await supabase
    .from('studio_vp_campaigns')
    .select('id')
    .eq('org_id', orgId)
    .eq('campaign_key', CAMPAIGN_001_SHELL.campaignKey)
    .maybeSingle();

  if (existingCampaign?.id) {
    return { brandId, campaignId: existingCampaign.id as string };
  }

  const { data: campaign, error: campErr } = await supabase
    .from('studio_vp_campaigns')
    .insert({
      org_id: orgId,
      brand_id: brandId,
      campaign_key: CAMPAIGN_001_SHELL.campaignKey,
      name: CAMPAIGN_001_SHELL.name,
      objective: CAMPAIGN_001_SHELL.objective,
      platform: CAMPAIGN_001_SHELL.platform,
      audience: CAMPAIGN_001_SHELL.audience,
      creative_brief: CAMPAIGN_001_SHELL.creativeBrief,
      narrative_concept: CAMPAIGN_001_SHELL.narrativeConcept,
      treatment: CAMPAIGN_001_SHELL.treatment,
      production_mode: CAMPAIGN_001_SHELL.productionMode,
      deliverables: CAMPAIGN_001_SHELL.deliverables,
      format: CAMPAIGN_001_SHELL.format,
      canon_snapshot: CAMPAIGN_001_SHELL.canonSnapshot,
      lifecycle_status: CAMPAIGN_001_SHELL.lifecycleStatus,
      approval_state: CAMPAIGN_001_SHELL.approvalState,
      metadata: CAMPAIGN_001_SHELL.metadata,
      updated_at: now(),
    })
    .select('id')
    .single();
  if (campErr) throw campErr;

  const campaignId = campaign.id as string;
  const scenes = buildCampaign001PlaceholderScenes(campaignId);

  for (const scene of scenes) {
    const { data: sceneRow, error: sceneErr } = await supabase
      .from('studio_vp_scenes')
      .insert({
        org_id: scene.orgId,
        campaign_id: scene.campaignId,
        scene_key: scene.sceneKey,
        title: scene.title,
        description: scene.description,
        sort_order: scene.sortOrder,
        metadata: scene.metadata,
        updated_at: now(),
      })
      .select('id')
      .single();
    if (sceneErr) throw sceneErr;

    const shots = buildCampaign001PlaceholderShots(campaignId, sceneRow.id as string);
    for (const shot of shots) {
      const { error: shotErr } = await supabase.from('studio_vp_shots').insert({
        org_id: shot.orgId,
        campaign_id: shot.campaignId,
        scene_id: shot.sceneId,
        shot_key: shot.shotKey,
        sort_order: shot.sortOrder,
        purpose: shot.purpose,
        shot_type: shot.shotType,
        description: shot.description,
        duration_seconds: shot.durationSeconds,
        production_mode: shot.productionMode,
        provider_id: shot.providerId,
        model_settings: shot.modelSettings,
        canon_refs: shot.canonRefs,
        approval_state: shot.approvalState,
        qc_summary: shot.qcSummary,
        metadata: shot.metadata,
        updated_at: now(),
      });
      if (shotErr) throw shotErr;
    }
  }

  logVirtualProductionEvent('campaign_created', { orgId, campaignId });

  return { brandId, campaignId };
}

export async function getCampaignBoard(
  supabase: SupabaseClient,
  orgId: string,
  campaignId: string
) {
  const { data: campaign, error: campErr } = await supabase
    .from('studio_vp_campaigns')
    .select('*, studio_vp_brands(display_name, brand_key)')
    .eq('org_id', orgId)
    .eq('id', campaignId)
    .single();
  if (campErr) throw campErr;

  const { data: shots, error: shotErr } = await supabase
    .from('studio_vp_shots')
    .select('*')
    .eq('org_id', orgId)
    .eq('campaign_id', campaignId)
    .order('sort_order');
  if (shotErr) throw shotErr;

  return { campaign, shots: shots ?? [] };
}

export async function createRepairJob(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    campaignId: string;
    shotId: string;
    originalAssetId: string;
    reason: string;
    providerId?: string;
    modelId?: string;
    actorId?: string;
  }
) {
  const repair = createRepairRecord(input);
  const jobKey = `repair-${input.shotId}-${Date.now()}`;

  const { data: job, error: jobErr } = await supabase
    .from('studio_vp_production_jobs')
    .insert({
      org_id: input.orgId,
      campaign_id: input.campaignId,
      shot_id: input.shotId,
      job_key: jobKey,
      provider_id: input.providerId ?? 'fal',
      model_id: input.modelId,
      capability: 'image_generation',
      production_mode: 'precision',
      status: 'queued',
      actor_id: input.actorId,
      request_payload: { repair: true, reason: input.reason },
      updated_at: now(),
    })
    .select('id')
    .single();
  if (jobErr) throw jobErr;

  const { data: repairRow, error: repairErr } = await supabase
    .from('studio_vp_repairs')
    .insert({
      org_id: repair.orgId,
      campaign_id: repair.campaignId,
      shot_id: repair.shotId,
      original_asset_id: repair.originalAssetId,
      repair_job_id: job.id,
      status: repair.status,
      reason: repair.reason,
      metadata: repair.metadata,
      updated_at: now(),
    })
    .select('*')
    .single();
  if (repairErr) throw repairErr;

  await supabase
    .from('studio_vp_shots')
    .update({ approval_state: 'repair_required', updated_at: now() })
    .eq('org_id', input.orgId)
    .eq('id', input.shotId);

  logVirtualProductionEvent('repair_created', {
    orgId: input.orgId,
    campaignId: input.campaignId,
    shotId: input.shotId,
    jobKey,
  });

  return { repair: repairRow, job };
}

export async function exportDirectorPackage(
  supabase: SupabaseClient,
  orgId: string,
  campaignId: string
) {
  const { data: campaign } = await supabase
    .from('studio_vp_campaigns')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', campaignId)
    .single();

  const { data: brand } = await supabase
    .from('studio_vp_brands')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', campaign?.brand_id)
    .single();

  const { data: scenes } = await supabase
    .from('studio_vp_scenes')
    .select('*')
    .eq('org_id', orgId)
    .eq('campaign_id', campaignId)
    .order('sort_order');

  const { data: shots } = await supabase
    .from('studio_vp_shots')
    .select('*')
    .eq('org_id', orgId)
    .eq('campaign_id', campaignId)
    .order('sort_order');

  const { data: characters } = await supabase
    .from('studio_vp_characters')
    .select('*')
    .eq('org_id', orgId)
    .eq('brand_id', campaign?.brand_id);

  const { data: environments } = await supabase
    .from('studio_vp_environments')
    .select('*')
    .eq('org_id', orgId)
    .eq('brand_id', campaign?.brand_id);

  const { data: products } = await supabase
    .from('studio_vp_products')
    .select('*')
    .eq('org_id', orgId)
    .eq('brand_id', campaign?.brand_id);

  const pkg = buildDirectorProductionPackage({
    campaign: {
      id: campaign.id,
      orgId: campaign.org_id,
      brandId: campaign.brand_id,
      campaignKey: campaign.campaign_key,
      name: campaign.name,
      objective: campaign.objective,
      narrativeConcept: campaign.narrative_concept,
      treatment: campaign.treatment,
      productionMode: campaign.production_mode,
      deliverables: campaign.deliverables,
      format: campaign.format,
      canonSnapshot: campaign.canon_snapshot,
      lifecycleStatus: campaign.lifecycle_status,
      approvalState: campaign.approval_state,
      metadata: campaign.metadata,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    },
    brand: {
      id: brand.id,
      orgId: brand.org_id,
      brandKey: brand.brand_key,
      displayName: brand.display_name,
      description: brand.description,
      visualRules: brand.visual_rules,
      forbiddenDeviations: brand.forbidden_deviations,
      status: brand.status,
      metadata: brand.metadata,
      createdAt: brand.created_at,
      updatedAt: brand.updated_at,
    },
    scenes: (scenes ?? []).map((s) => ({
      id: s.id,
      orgId: s.org_id,
      campaignId: s.campaign_id,
      sceneKey: s.scene_key,
      title: s.title,
      description: s.description,
      sortOrder: s.sort_order,
      metadata: s.metadata,
    })),
    shots: (shots ?? []).map((s) => ({
      id: s.id,
      orgId: s.org_id,
      campaignId: s.campaign_id,
      sceneId: s.scene_id,
      shotKey: s.shot_key,
      sortOrder: s.sort_order,
      description: s.description,
      durationSeconds: s.duration_seconds,
      modelSettings: s.model_settings,
      canonRefs: s.canon_refs,
      approvalState: s.approval_state,
      qcSummary: s.qc_summary,
      metadata: s.metadata,
    })),
    characters: (characters ?? []).map((c) => ({
      id: c.id,
      orgId: c.org_id,
      brandId: c.brand_id,
      characterKey: c.character_key,
      canonicalName: c.canonical_name,
      referenceUrls: c.reference_urls,
      bodyNotes: c.body_notes,
      visualInvariants: c.visual_invariants,
      forbiddenDeviations: c.forbidden_deviations,
      providerMetadata: c.provider_metadata,
      version: c.version,
      status: c.status,
      canonLocked: c.canon_locked,
      metadata: c.metadata,
    })),
    environments: (environments ?? []).map((e) => ({
      id: e.id,
      orgId: e.org_id,
      brandId: e.brand_id,
      environmentKey: e.environment_key,
      name: e.name,
      canonicalImages: e.canonical_images,
      spatialNotes: e.spatial_notes,
      lightingConditions: e.lighting_conditions,
      permittedModifications: e.permitted_modifications,
      forbiddenModifications: e.forbidden_modifications,
      providerMetadata: e.provider_metadata,
      version: e.version,
      status: e.status,
      canonLocked: e.canon_locked,
      metadata: e.metadata,
    })),
    products: (products ?? []).map((p) => ({
      id: p.id,
      orgId: p.org_id,
      brandId: p.brand_id,
      productKey: p.product_key,
      name: p.name,
      canonicalImages: p.canonical_images,
      packagingRules: p.packaging_rules,
      labelRules: p.label_rules,
      forbiddenDeviations: p.forbidden_deviations,
      providerMetadata: p.provider_metadata,
      version: p.version,
      status: p.status,
      canonLocked: p.canon_locked,
      metadata: p.metadata,
    })),
    forbiddenDeviations: brand.forbidden_deviations,
  });

  const markdown = formatDirectorPackageMarkdown(pkg);

  await supabase.from('studio_vp_director_packages').upsert(
    {
      org_id: orgId,
      campaign_id: campaignId,
      provider_id: 'openart-director',
      package_payload: pkg,
      export_format: 'markdown',
      external_status: 'ready_for_transfer',
      updated_at: now(),
    },
    { onConflict: 'org_id,campaign_id,provider_id' }
  );

  return { package: pkg, markdown };
}

export async function assertOrgAccess(requestOrgId: string, resourceOrgId: string): Promise<void> {
  if (requestOrgId !== resourceOrgId) {
    throw new Error('UNAUTHORIZED_TENANT');
  }
}
