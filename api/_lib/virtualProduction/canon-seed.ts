/**
 * Frontal Slayer canon + Campaign 001 pilot — database seed.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  FS_BEHAVIOR_PROFILE,
  FS_BRAND_CANON,
  FS_CAMERA_PROFILE,
  FS_CHARACTER_NIA,
  FS_ENVIRONMENT_SET001,
  FS_ORG_ID,
  FS_PROPS_NIA,
  FS_PRODUCTS,
  FS_WARDROBE_NIA_LOCKED,
  buildNiaReferencePackV1SlotStates,
} from '../../../src/studio-os-core/virtual-production/canon/frontal-slayer-canon';
import {
  CAMPAIGN_001_META,
  CAMPAIGN_001_SCENE,
  CAMPAIGN_001_SHOTS,
} from '../../../src/studio-os-core/virtual-production/pilot/campaign-001';
import { exportDirectorPackage } from './service.js';
import { logVirtualProductionEvent } from '../../../src/studio-os-core/virtual-production/observability';
import { buildIdentityInvariantsDocument } from '../../../src/studio-os-core/virtual-production/identity/identity-invariants';
import {
  defaultNiaProviderMappings,
  OPENART_CHARACTER_AUDIT,
} from '../../../src/studio-os-core/virtual-production/identity/openart-character-audit';
import { IDENTITY_FOUNDATION_BLOCKER } from '../../../src/studio-os-core/virtual-production/identity/identity-gate';

function now(): string {
  return new Date().toISOString();
}

export type CanonSeedResult = {
  brandId: string;
  campaignId: string;
  characterId: string;
  referencePackId: string;
  shotIds: string[];
};

export async function seedFrontalSlayerCanonAndCampaign001(
  supabase: SupabaseClient,
  orgId = FS_ORG_ID
): Promise<CanonSeedResult> {
  // Brand
  const { data: brandRow } = await supabase
    .from('studio_vp_brands')
    .upsert(
      {
        org_id: orgId,
        brand_key: FS_BRAND_CANON.brandKey,
        display_name: FS_BRAND_CANON.displayName,
        description: FS_BRAND_CANON.description,
        visual_rules: FS_BRAND_CANON.visualRules,
        forbidden_deviations: FS_BRAND_CANON.forbiddenDeviations,
        status: FS_BRAND_CANON.status,
        updated_at: now(),
      },
      { onConflict: 'org_id,brand_key' }
    )
    .select('id')
    .single();

  let brandId = brandRow?.id as string;
  if (!brandId) {
    const { data: existing } = await supabase
      .from('studio_vp_brands')
      .select('id')
      .eq('org_id', orgId)
      .eq('brand_key', FS_BRAND_CANON.brandKey)
      .single();
    brandId = existing!.id as string;
  }

  // Character Nia
  const { data: charRow } = await supabase
    .from('studio_vp_characters')
    .upsert(
      {
        org_id: orgId,
        brand_id: brandId,
        character_key: FS_CHARACTER_NIA.characterKey,
        canonical_name: FS_CHARACTER_NIA.canonicalName,
        role: FS_CHARACTER_NIA.role,
        description: FS_CHARACTER_NIA.description,
        reference_urls: FS_CHARACTER_NIA.referenceUrls,
        body_notes: FS_CHARACTER_NIA.bodyNotes,
        visual_invariants: FS_CHARACTER_NIA.visualInvariants,
        forbidden_deviations: FS_CHARACTER_NIA.forbiddenDeviations,
        provider_metadata: FS_CHARACTER_NIA.providerMetadata,
        status: FS_CHARACTER_NIA.status,
        canon_locked: FS_CHARACTER_NIA.canonLocked,
        updated_at: now(),
      },
      { onConflict: 'org_id,brand_id,character_key' }
    )
    .select('id')
    .single();

  let characterId = charRow?.id as string;
  if (!characterId) {
    const { data: existing } = await supabase
      .from('studio_vp_characters')
      .select('id')
      .eq('org_id', orgId)
      .eq('character_key', FS_CHARACTER_NIA.characterKey)
      .single();
    characterId = existing!.id as string;
  }

  // Reference Pack V1
  const slotStates = buildNiaReferencePackV1SlotStates();
  const { data: packRow } = await supabase
    .from('studio_vp_character_reference_packs')
    .upsert(
      {
        org_id: orgId,
        character_id: characterId,
        pack_key: 'reference-pack-v1',
        label: 'PRIMARY CHARACTER — REFERENCE PACK V1',
        frames: {},
        slot_states: slotStates,
        version: 1,
        status: 'draft',
        identity_invariants: buildIdentityInvariantsDocument(),
        openart_character_status: OPENART_CHARACTER_AUDIT.status,
        provider_mappings: defaultNiaProviderMappings(),
        metadata: {
          allSlotsMissing: true,
          auditSummary: 'No approved Nia imagery in repo — SETUP REQUIRED',
        },
        updated_at: now(),
      },
      { onConflict: 'org_id,character_id,pack_key,version' }
    )
    .select('id')
    .single();

  const referencePackId = packRow?.id as string;

  // Products
  for (const p of FS_PRODUCTS) {
    await supabase.from('studio_vp_products').upsert(
      {
        org_id: orgId,
        brand_id: brandId,
        product_key: p.productKey,
        name: p.name,
        description: p.description,
        canonical_images: p.canonicalImages,
        packaging_rules: p.packagingRules,
        label_rules: p.labelRules,
        forbidden_deviations: p.forbiddenDeviations,
        status: p.status,
        canon_locked: p.canonLocked,
        updated_at: now(),
      },
      { onConflict: 'org_id,brand_id,product_key' }
    );
  }

  // Environment
  await supabase.from('studio_vp_environments').upsert(
    {
      org_id: orgId,
      brand_id: brandId,
      environment_key: FS_ENVIRONMENT_SET001.environmentKey,
      name: FS_ENVIRONMENT_SET001.name,
      description: FS_ENVIRONMENT_SET001.description,
      canonical_images: FS_ENVIRONMENT_SET001.canonicalImages,
      spatial_notes: FS_ENVIRONMENT_SET001.spatialNotes,
      lighting_conditions: FS_ENVIRONMENT_SET001.lightingConditions,
      permitted_modifications: FS_ENVIRONMENT_SET001.permittedModifications,
      forbidden_modifications: FS_ENVIRONMENT_SET001.forbiddenModifications,
      status: FS_ENVIRONMENT_SET001.status,
      canon_locked: FS_ENVIRONMENT_SET001.canonLocked,
      updated_at: now(),
    },
    { onConflict: 'org_id,brand_id,environment_key' }
  );

  // Wardrobe + props
  await supabase.from('studio_vp_wardrobe').upsert(
    {
      org_id: orgId,
      brand_id: brandId,
      wardrobe_key: FS_WARDROBE_NIA_LOCKED.wardrobeKey,
      label: FS_WARDROBE_NIA_LOCKED.label,
      garment_type: FS_WARDROBE_NIA_LOCKED.garmentType,
      reference_urls: FS_WARDROBE_NIA_LOCKED.referenceUrls,
      associations: FS_WARDROBE_NIA_LOCKED.associations,
      status: FS_WARDROBE_NIA_LOCKED.status,
      canon_locked: FS_WARDROBE_NIA_LOCKED.canonLocked,
      updated_at: now(),
    },
    { onConflict: 'org_id,brand_id,wardrobe_key' }
  );

  for (const prop of FS_PROPS_NIA) {
    await supabase.from('studio_vp_props').upsert(
      {
        org_id: orgId,
        brand_id: brandId,
        prop_key: prop.propKey,
        label: prop.label,
        prop_type: prop.propType,
        status: 'approved',
        updated_at: now(),
      },
      { onConflict: 'org_id,brand_id,prop_key' }
    );
  }

  // Camera + behavior profiles
  await supabase.from('studio_vp_camera_profiles').upsert(
    {
      org_id: orgId,
      brand_id: brandId,
      profile_key: FS_CAMERA_PROFILE.profileKey,
      label: FS_CAMERA_PROFILE.label,
      shot_types: FS_CAMERA_PROFILE.shotTypes,
      framing: FS_CAMERA_PROFILE.framing,
      movement: FS_CAMERA_PROFILE.movement,
      forbidden_behavior: FS_CAMERA_PROFILE.forbiddenBehavior,
      canon_locked: true,
      updated_at: now(),
    },
    { onConflict: 'org_id,brand_id,profile_key' }
  );

  await supabase.from('studio_vp_behavior_profiles').upsert(
    {
      org_id: orgId,
      brand_id: brandId,
      profile_key: FS_BEHAVIOR_PROFILE.profileKey,
      label: FS_BEHAVIOR_PROFILE.label,
      behavior_notes: FS_BEHAVIOR_PROFILE.behaviorNotes,
      character_associations: FS_BEHAVIOR_PROFILE.characterAssociations,
      canon_locked: true,
      updated_at: now(),
    },
    { onConflict: 'org_id,brand_id,profile_key' }
  );

  // Campaign 001
  const { data: campaignRow } = await supabase
    .from('studio_vp_campaigns')
    .upsert(
      {
        org_id: orgId,
        brand_id: brandId,
        campaign_key: CAMPAIGN_001_META.campaignKey,
        name: CAMPAIGN_001_META.name,
        objective: CAMPAIGN_001_META.objective,
        platform: CAMPAIGN_001_META.platform,
        creative_brief: CAMPAIGN_001_META.creativeBrief,
        narrative_concept: CAMPAIGN_001_META.narrativeConcept,
        treatment: CAMPAIGN_001_META.treatment,
        production_mode: CAMPAIGN_001_META.productionMode,
        format: CAMPAIGN_001_META.format,
        lifecycle_status: CAMPAIGN_001_META.lifecycleStatus,
        current_phase: CAMPAIGN_001_META.currentPhase,
        audio_plan: CAMPAIGN_001_META.audioPlan,
        director_external_status: 'ready_for_director',
        reference_pack_version: { nia: 'reference-pack-v1', version: 1 },
        identity_gate_status: 'blocked',
        identity_source_pack_id: referencePackId ?? null,
        identity_blocker_reason: IDENTITY_FOUNDATION_BLOCKER,
        canon_snapshot: {
          character: 'nia',
          environment: 'set-001-flagship',
          camera: FS_CAMERA_PROFILE.profileKey,
          behavior: FS_BEHAVIOR_PROFILE.profileKey,
          referencePack: 'reference-pack-v1',
        },
        deliverables: [CAMPAIGN_001_META.deliverable],
        approval_state: 'draft',
        metadata: { pilot: true, realCampaign: true },
        updated_at: now(),
      },
      { onConflict: 'org_id,brand_id,campaign_key' }
    )
    .select('id')
    .single();

  let campaignId = campaignRow?.id as string;
  if (!campaignId) {
    const { data: existing } = await supabase
      .from('studio_vp_campaigns')
      .select('id')
      .eq('org_id', orgId)
      .eq('campaign_key', CAMPAIGN_001_META.campaignKey)
      .single();
    campaignId = existing!.id as string;
  }

  // Scene
  const { data: sceneRow } = await supabase
    .from('studio_vp_scenes')
    .upsert(
      {
        org_id: orgId,
        campaign_id: campaignId,
        scene_key: CAMPAIGN_001_SCENE.sceneKey,
        title: CAMPAIGN_001_SCENE.title,
        description: CAMPAIGN_001_SCENE.description,
        sort_order: CAMPAIGN_001_SCENE.sortOrder,
        updated_at: now(),
      },
      { onConflict: 'org_id,campaign_id,scene_key' }
    )
    .select('id')
    .single();

  const sceneId = sceneRow!.id as string;

  // Remove old placeholder shots if re-seeding
  await supabase.from('studio_vp_shots').delete().eq('campaign_id', campaignId).eq('org_id', orgId);

  const shotIds: string[] = [];
  let prevShotId: string | null = null;

  for (const shot of CAMPAIGN_001_SHOTS) {
    const { data: shotRow } = await supabase
      .from('studio_vp_shots')
      .insert({
        org_id: orgId,
        campaign_id: campaignId,
        scene_id: sceneId,
        shot_key: shot.shotKey,
        sort_order: shot.sortOrder,
        purpose: shot.purpose,
        shot_type: shot.shotType,
        description: shot.title,
        duration_seconds: shot.durationSeconds,
        production_mode: shot.productionMode,
        provider_id: shot.providerId,
        capability_required: shot.capabilityRequired,
        identity_criticality: shot.identityCriticality,
        product_criticality: shot.productCriticality,
        environment_criticality: shot.environmentCriticality,
        transition_type: shot.transitionType,
        editorial_note: shot.editorialNote,
        action_direction: shot.actionDirection,
        emotional_direction: shot.emotionalDirection,
        canon_refs: {
          characters: shot.characterKeys,
          environment: shot.environmentKey,
          product: shot.productKey,
          wardrobe: shot.wardrobeKeys,
          props: shot.propKeys,
        },
        approval_state: shot.hybridRepairCandidate ? 'repair_required' : 'draft',
        qc_summary: { overall: 'not_reviewed' },
        metadata: { hybridRepairCandidate: shot.hybridRepairCandidate ?? false },
        updated_at: now(),
      })
      .select('id')
      .single();

    const shotId = shotRow!.id as string;
    shotIds.push(shotId);

    await supabase.from('studio_vp_shot_continuity').upsert(
      {
        org_id: orgId,
        shot_id: shotId,
        inherits_from_shot_id: prevShotId,
        start_state: shot.startState,
        end_state: shot.endState,
        updated_at: now(),
      },
      { onConflict: 'org_id,shot_id' }
    );

    await supabase.from('studio_vp_storyboard_frames').upsert(
      {
        org_id: orgId,
        campaign_id: campaignId,
        scene_id: sceneId,
        shot_id: shotId,
        frame_key: `${shot.shotKey}-keyframe`,
        frame_kind: shot.storyboardFrameKind,
        label: shot.title,
        production_status: 'draft',
        sort_order: shot.sortOrder,
        updated_at: now(),
      },
      { onConflict: 'org_id,campaign_id,frame_key' }
    );

    prevShotId = shotId;
  }

  // Director package
  await exportDirectorPackage(supabase, orgId, campaignId);
  await supabase
    .from('studio_vp_director_packages')
    .update({ external_status: 'ready_for_director', updated_at: now() })
    .eq('org_id', orgId)
    .eq('campaign_id', campaignId);

  // Precision jobs for shot-01 and shot-05
  for (const key of ['shot-01', 'shot-05']) {
    const shotId = shotIds[CAMPAIGN_001_SHOTS.findIndex((s) => s.shotKey === key)];
    await supabase.from('studio_vp_production_jobs').upsert(
      {
        org_id: orgId,
        campaign_id: campaignId,
        shot_id: shotId,
        job_key: `precision-${key}-${campaignId.slice(0, 8)}`,
        provider_id: 'fal',
        capability: key === 'shot-05' ? 'multi_reference' : 'character_reference',
        production_mode: 'precision',
        status: 'queued',
        request_payload: { pilot: true, shotKey: key },
        updated_at: now(),
      },
      { onConflict: 'org_id,job_key' }
    );
  }

  // Hybrid repair on shot-08
  const hybridShotId = shotIds[CAMPAIGN_001_SHOTS.findIndex((s) => s.shotKey === 'shot-08')];
  const { data: origAsset } = await supabase
    .from('studio_vp_generation_assets')
    .insert({
      org_id: orgId,
      campaign_id: campaignId,
      shot_id: hybridShotId,
      asset_key: `director-take-a-${hybridShotId.slice(0, 8)}`,
      media_type: 'video',
      provider_id: 'openart-director',
      approval_state: 'repair_required',
      settings: { source: 'external_manual_placeholder' },
      source_references: [],
      canon_versions: { referencePack: 'reference-pack-v1' },
      repair_ancestry: [],
      metadata: { pilot: true, label: 'TAKE A — Director candidate' },
      updated_at: now(),
    })
    .select('id')
    .single();

  await supabase.from('studio_vp_takes').insert({
    org_id: orgId,
    shot_id: hybridShotId,
    generation_asset_id: origAsset!.id,
    take_key: 'take-a',
    label: 'TAKE A — Director',
    sort_order: 1,
    provider_id: 'openart-director',
    approval_state: 'repair_required',
    qc_summary: { overall: 'fail', identity: 'fail' },
    metadata: { pilot: true },
    updated_at: now(),
  });

  const { data: repairJob } = await supabase
    .from('studio_vp_production_jobs')
    .insert({
      org_id: orgId,
      campaign_id: campaignId,
      shot_id: hybridShotId,
      job_key: `hybrid-repair-shot-08-${campaignId.slice(0, 8)}`,
      provider_id: 'fal',
      capability: 'character_reference',
      production_mode: 'precision',
      status: 'queued',
      request_payload: { repair: true, reason: 'identity_qc_fail' },
      updated_at: now(),
    })
    .select('id')
    .single();

  await supabase.from('studio_vp_repairs').insert({
    org_id: orgId,
    campaign_id: campaignId,
    shot_id: hybridShotId,
    original_asset_id: origAsset!.id,
    repair_job_id: repairJob!.id,
    status: 'open',
    reason: 'Identity QC fail on Director take — Precision replacement',
    metadata: { pilot: true },
    updated_at: now(),
  });

  // Assembly V1
  await supabase.from('studio_vp_assemblies').upsert(
    {
      org_id: orgId,
      campaign_id: campaignId,
      assembly_key: 'assembly-v1',
      label: 'Campaign 001 Assembly V1',
      timeline: CAMPAIGN_001_SHOTS.map((s, i) => ({
        shotKey: s.shotKey,
        shotId: shotIds[i],
        durationSeconds: s.durationSeconds,
        transition: s.transitionType,
      })),
      audio_assets: CAMPAIGN_001_META.audioPlan,
      status: 'draft',
      metadata: { renderReady: false, note: 'Timeline architecture only — no final render' },
      updated_at: now(),
    },
    { onConflict: 'org_id,campaign_id,assembly_key' }
  );

  // Deliverable — incomplete
  await supabase.from('studio_vp_deliverables').upsert(
    {
      org_id: orgId,
      campaign_id: campaignId,
      deliverable_key: CAMPAIGN_001_META.deliverable.deliverableKey,
      platform: CAMPAIGN_001_META.deliverable.platform,
      aspect_ratio: CAMPAIGN_001_META.deliverable.aspectRatio,
      caption_placeholder: '[CAPTION — SETUP REQUIRED]',
      approval_state: 'draft',
      delivery_state: 'pending',
      client_visible: false,
      production_notes: 'Social master — awaiting approved assembly and QC pass',
      metadata: { incomplete: true },
      updated_at: now(),
    },
    { onConflict: 'org_id,campaign_id,deliverable_key' }
  );

  // Client review placeholder
  await supabase.from('studio_vp_client_reviews').upsert(
    {
      org_id: orgId,
      campaign_id: campaignId,
      review_key: 'direction-review-001',
      review_type: 'direction',
      title: 'Campaign 001 Direction Review',
      client_safe_description: 'Review the creative direction and shot plan for your social campaign pilot.',
      preview_assets: [],
      allowed_actions: ['approve', 'request_revision'],
      status: 'pending',
      client_visible: true,
      updated_at: now(),
    },
    { onConflict: 'org_id,campaign_id,review_key' }
  );

  await supabase.from('studio_vp_client_activity').upsert(
    {
      org_id: orgId,
      campaign_id: campaignId,
      activity_key: 'init-001',
      activity_type: 'campaign_initialized',
      client_safe_message: 'Campaign initialized — direction in progress',
      updated_at: now(),
    },
    { onConflict: 'org_id,campaign_id,activity_key' }
  );

  await supabase.from('studio_vp_production_events').insert({
    org_id: orgId,
    campaign_id: campaignId,
    event_type: 'campaign_initialized',
    payload: { pilot: 'campaign-001' },
    delivery_status: 'recorded',
  });

  logVirtualProductionEvent('campaign_created', { orgId, campaignId, shotId: shotIds[0] });

  return { brandId, campaignId, characterId, referencePackId, shotIds };
}
