/**
 * Nia Identity Lock — server-side reference pack operations.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  REFERENCE_PACK_V1_SLOTS,
  type ReferencePackSlot,
} from '../../../src/studio-os-core/virtual-production/canon/frontal-slayer-canon';
import {
  approveReferenceSlot,
  assignCandidateToSlot,
  designatePrimaryAnchor,
  isPackLocked,
  lockReferencePackV1,
  rejectReferenceSlot,
  ReferencePackImmutableError,
  submitSlotForQc,
} from '../../../src/studio-os-core/virtual-production/identity/reference-pack-lifecycle';
import {
  REFERENCE_PACK_V1_SLOT_LABELS,
  normalizeSlotStates,
} from '../../../src/studio-os-core/virtual-production/identity/reference-pack-v1';
import { buildIdentityInvariantsDocument } from '../../../src/studio-os-core/virtual-production/identity/identity-invariants';
import {
  evaluateCampaignIdentityGate,
  IDENTITY_FOUNDATION_BLOCKER,
} from '../../../src/studio-os-core/virtual-production/identity/identity-gate';
import {
  defaultNiaProviderMappings,
  OPENART_CHARACTER_AUDIT,
} from '../../../src/studio-os-core/virtual-production/identity/openart-character-audit';
import { NIA_IDENTITY_REPO_AUDIT } from '../../../src/studio-os-core/virtual-production/identity/identity-audit';
import type { IdentityQcEntry } from '../../../src/studio-os-core/virtual-production/identity/types';
import { logVirtualProductionEvent } from '../../../src/studio-os-core/virtual-production/observability';

function now(): string {
  return new Date().toISOString();
}

export async function getNiaReferencePackBoard(
  supabase: SupabaseClient,
  orgId: string,
  characterKey = 'nia',
  packKey = 'reference-pack-v1'
) {
  const { data: character } = await supabase
    .from('studio_vp_characters')
    .select('id, character_key, canonical_name, status, visual_invariants, body_notes')
    .eq('org_id', orgId)
    .eq('character_key', characterKey)
    .maybeSingle();

  if (!character?.id) {
    return {
      character: null,
      pack: null,
      candidates: [],
      identityGate: null,
      audit: NIA_IDENTITY_REPO_AUDIT,
      openArtStatus: OPENART_CHARACTER_AUDIT,
    };
  }

  const { data: pack } = await supabase
    .from('studio_vp_character_reference_packs')
    .select('*')
    .eq('org_id', orgId)
    .eq('character_id', character.id)
    .eq('pack_key', packKey)
    .eq('version', 1)
    .maybeSingle();

  const slotStates = normalizeSlotStates(pack?.slot_states);

  let primaryAnchor = null;
  if (pack?.primary_anchor_asset_id) {
    const { data: anchorAsset } = await supabase
      .from('studio_vp_generation_assets')
      .select('id, media_url, provider_id, model_id, source_references, metadata')
      .eq('id', pack.primary_anchor_asset_id)
      .maybeSingle();
    primaryAnchor = {
      assetId: pack.primary_anchor_asset_id,
      mediaUrl: anchorAsset?.media_url,
      source: String(anchorAsset?.metadata?.source ?? 'canon'),
      providerId: anchorAsset?.provider_id ?? 'upload',
      modelId: anchorAsset?.model_id ?? undefined,
      referenceLineage: anchorAsset?.source_references ?? [],
      approvalStatus: pack.locked_at ? 'locked' : 'approved',
    };
  }

  const { data: candidates } = pack?.id
    ? await supabase
        .from('studio_vp_reference_pack_candidates')
        .select('*')
        .eq('reference_pack_id', pack.id)
        .order('created_at', { ascending: false })
    : { data: [] };

  const { data: campaign } = await supabase
    .from('studio_vp_campaigns')
    .select('id, campaign_key, identity_gate_status, identity_blocker_reason, identity_source_pack_id')
    .eq('org_id', orgId)
    .eq('campaign_key', 'campaign-001')
    .maybeSingle();

  const identityGate = evaluateCampaignIdentityGate({
    packVersion: pack?.version ?? null,
    packLockedAt: pack?.locked_at ?? null,
    hasPrimaryAnchor: Boolean(pack?.primary_anchor_asset_id),
    slotStates,
  });

  const slots = REFERENCE_PACK_V1_SLOTS.map((slot) => ({
    slot,
    label: REFERENCE_PACK_V1_SLOT_LABELS[slot],
    record: slotStates[slot],
  }));

  return {
    character,
    pack: pack
      ? {
          ...pack,
          slotStates,
          slotLabels: REFERENCE_PACK_V1_SLOT_LABELS,
          identityInvariants: pack.identity_invariants?.sections
            ? pack.identity_invariants
            : buildIdentityInvariantsDocument(),
          providerMappings: pack.provider_mappings ?? defaultNiaProviderMappings(),
          locked: Boolean(pack.locked_at),
        }
      : null,
    slots,
    primaryAnchor,
    candidates: candidates ?? [],
    rejectedCount: (candidates ?? []).filter((c) => c.status === 'rejected').length,
    campaignIdentityGate: campaign
      ? {
          campaignId: campaign.id,
          status: campaign.identity_gate_status,
          blockerReason: campaign.identity_blocker_reason,
          evaluated: identityGate,
        }
      : { evaluated: identityGate },
    audit: NIA_IDENTITY_REPO_AUDIT,
    openArtStatus: OPENART_CHARACTER_AUDIT,
  };
}

export async function assignReferencePackCandidate(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    packId: string;
    slot: ReferencePackSlot;
    mediaUrl: string;
    providerId?: string;
    modelId?: string;
    referenceLineage?: unknown[];
    operator?: string;
    billingOwnerOrgId?: string;
    estimatedCostUsd?: number;
  }
) {
  const { data: pack, error: packErr } = await supabase
    .from('studio_vp_character_reference_packs')
    .select('*')
    .eq('id', input.packId)
    .eq('org_id', input.orgId)
    .single();
  if (packErr || !pack) throw packErr ?? new Error('Reference pack not found');

  const slotStates = normalizeSlotStates(pack.slot_states);
  if (isPackLocked(slotStates)) throw new ReferencePackImmutableError('Pack is locked');

  const assetKey = `ref-pack-v1-${input.slot}-${Date.now()}`;
  const { data: asset, error: assetErr } = await supabase
    .from('studio_vp_generation_assets')
    .insert({
      org_id: input.orgId,
      asset_key: assetKey,
      media_url: input.mediaUrl,
      media_type: 'image',
      provider_id: input.providerId ?? 'upload',
      model_id: input.modelId ?? null,
      source_references: input.referenceLineage ?? [],
      reference_pack_id: input.packId,
      reference_pack_slot: input.slot,
      approval_state: 'ready_for_review',
      metadata: {
        purpose: 'reference_pack_v1_candidate',
        slot: input.slot,
        operator: input.operator,
      },
      updated_at: now(),
    })
    .select('id')
    .single();
  if (assetErr) throw assetErr;

  const { data: candidate, error: candErr } = await supabase
    .from('studio_vp_reference_pack_candidates')
    .insert({
      org_id: input.orgId,
      reference_pack_id: input.packId,
      slot_key: input.slot,
      asset_id: asset.id,
      media_url: input.mediaUrl,
      provider_id: input.providerId ?? 'upload',
      model_id: input.modelId ?? null,
      reference_lineage: input.referenceLineage ?? [],
      status: 'candidate',
      operator: input.operator,
      billing_owner_org_id: input.billingOwnerOrgId ?? input.orgId,
      estimated_cost_usd: input.estimatedCostUsd ?? null,
      updated_at: now(),
    })
    .select('*')
    .single();
  if (candErr) throw candErr;

  const nextStates = assignCandidateToSlot(slotStates, input.slot, {
    assetId: asset.id as string,
    mediaUrl: input.mediaUrl,
    operator: input.operator,
  });

  await supabase
    .from('studio_vp_character_reference_packs')
    .update({ slot_states: nextStates, updated_at: now() })
    .eq('id', input.packId);

  logVirtualProductionEvent('reference_pack_candidate_assigned', {
    orgId: input.orgId,
    packId: input.packId,
    slot: input.slot,
  });

  return { asset, candidate, slotStates: nextStates };
}

export async function approveReferencePackSlot(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    packId: string;
    slot: ReferencePackSlot;
    assetId: string;
    mediaUrl?: string;
    qc: IdentityQcEntry[];
    operator?: string;
  }
) {
  const { data: pack } = await supabase
    .from('studio_vp_character_reference_packs')
    .select('*')
    .eq('id', input.packId)
    .eq('org_id', input.orgId)
    .single();
  if (!pack) throw new Error('Reference pack not found');

  const slotStates = normalizeSlotStates(pack.slot_states);
  if (isPackLocked(slotStates)) throw new ReferencePackImmutableError('Pack is locked');

  const nextStates = approveReferenceSlot(slotStates, input.slot, {
    assetId: input.assetId,
    mediaUrl: input.mediaUrl,
    qc: input.qc,
    operator: input.operator,
  });

  await supabase
    .from('studio_vp_character_reference_packs')
    .update({ slot_states: nextStates, updated_at: now() })
    .eq('id', input.packId);

  await supabase
    .from('studio_vp_reference_pack_candidates')
    .update({ status: 'approved', qc: input.qc, updated_at: now() })
    .eq('reference_pack_id', input.packId)
    .eq('slot_key', input.slot)
    .eq('asset_id', input.assetId);

  await supabase
    .from('studio_vp_generation_assets')
    .update({
      approval_state: 'approved',
      promoted_to_canon: true,
      updated_at: now(),
    })
    .eq('id', input.assetId);

  return { slotStates: nextStates };
}

export async function rejectReferencePackSlot(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    packId: string;
    slot: ReferencePackSlot;
    candidateAssetId: string;
    reason: string;
    qc: IdentityQcEntry[];
    operator?: string;
  }
) {
  const { data: pack } = await supabase
    .from('studio_vp_character_reference_packs')
    .select('*')
    .eq('id', input.packId)
    .eq('org_id', input.orgId)
    .single();
  if (!pack) throw new Error('Reference pack not found');

  const slotStates = normalizeSlotStates(pack.slot_states);
  if (isPackLocked(slotStates)) throw new ReferencePackImmutableError('Pack is locked');

  const nextStates = rejectReferenceSlot(slotStates, input.slot, {
    candidateAssetId: input.candidateAssetId,
    reason: input.reason,
    qc: input.qc,
    operator: input.operator,
  });

  await supabase
    .from('studio_vp_character_reference_packs')
    .update({ slot_states: nextStates, updated_at: now() })
    .eq('id', input.packId);

  await supabase
    .from('studio_vp_reference_pack_candidates')
    .update({
      status: 'rejected',
      rejection_reason: input.reason,
      qc: input.qc,
      updated_at: now(),
    })
    .eq('reference_pack_id', input.packId)
    .eq('asset_id', input.candidateAssetId);

  return { slotStates: nextStates };
}

export async function setPrimaryIdentityAnchor(
  supabase: SupabaseClient,
  input: {
    orgId: string;
    packId: string;
    assetId: string;
    mediaUrl?: string;
    source?: string;
    providerId?: string;
    modelId?: string;
    referenceLineage?: unknown[];
    operator?: string;
  }
) {
  const { data: pack } = await supabase
    .from('studio_vp_character_reference_packs')
    .select('*')
    .eq('id', input.packId)
    .eq('org_id', input.orgId)
    .single();
  if (!pack) throw new Error('Reference pack not found');

  const slotStates = normalizeSlotStates(pack.slot_states);
  if (isPackLocked(slotStates)) throw new ReferencePackImmutableError('Pack is locked');

  const anchor = designatePrimaryAnchor({
    assetId: input.assetId,
    mediaUrl: input.mediaUrl,
    source: input.source ?? 'operator_designated',
    providerId: input.providerId ?? 'upload',
    modelId: input.modelId,
    referenceLineage: input.referenceLineage,
    operator: input.operator,
  });

  await supabase
    .from('studio_vp_character_reference_packs')
    .update({
      primary_anchor_asset_id: input.assetId,
      metadata: {
        ...(pack.metadata as object),
        primaryAnchor: anchor,
      },
      updated_at: now(),
    })
    .eq('id', input.packId);

  return { anchor };
}

export async function lockNiaReferencePackV1(
  supabase: SupabaseClient,
  input: { orgId: string; packId: string; operator: string }
) {
  const { data: pack } = await supabase
    .from('studio_vp_character_reference_packs')
    .select('*')
    .eq('id', input.packId)
    .eq('org_id', input.orgId)
    .single();
  if (!pack) throw new Error('Reference pack not found');

  const slotStates = normalizeSlotStates(pack.slot_states);
  const { lockedStates, lockRecord } = lockReferencePackV1({
    packKey: pack.pack_key,
    version: pack.version,
    slotStates,
    primaryAnchorAssetId: pack.primary_anchor_asset_id as string,
    operator: input.operator,
  });

  await supabase
    .from('studio_vp_character_reference_packs')
    .update({
      slot_states: lockedStates,
      status: 'approved',
      locked_at: lockRecord.lockedAt,
      locked_by: input.operator,
      metadata: {
        ...(pack.metadata as object),
        lockRecord,
      },
      updated_at: now(),
    })
    .eq('id', input.packId);

  // Campaign 001 identity gate PASS
  await supabase
    .from('studio_vp_campaigns')
    .update({
      identity_gate_status: 'pass',
      identity_source_pack_id: input.packId,
      identity_blocker_reason: null,
      reference_pack_version: { nia: 'reference-pack-v1', version: 1, lockedAt: lockRecord.lockedAt },
      updated_at: now(),
    })
    .eq('org_id', input.orgId)
    .eq('campaign_key', 'campaign-001');

  logVirtualProductionEvent('reference_pack_v1_locked', {
    orgId: input.orgId,
    packId: input.packId,
    operator: input.operator,
  });

  return { lockRecord, slotStates: lockedStates };
}

export async function createReferencePackV2Draft(
  supabase: SupabaseClient,
  input: { orgId: string; characterId: string; operator: string; fromPackId: string }
) {
  const { data: v1 } = await supabase
    .from('studio_vp_character_reference_packs')
    .select('*')
    .eq('id', input.fromPackId)
    .single();
  if (!v1?.locked_at) throw new Error('V2 requires locked V1');

  const emptyStates = Object.fromEntries(
    REFERENCE_PACK_V1_SLOTS.map((s) => [s, { state: 'missing' }])
  );

  const { data: v2, error } = await supabase
    .from('studio_vp_character_reference_packs')
    .insert({
      org_id: input.orgId,
      character_id: input.characterId,
      pack_key: 'reference-pack-v2',
      label: 'PRIMARY CHARACTER — REFERENCE PACK V2',
      frames: {},
      slot_states: emptyStates,
      version: 2,
      status: 'draft',
      identity_invariants: v1.identity_invariants ?? buildIdentityInvariantsDocument(),
      openart_character_status: v1.openart_character_status,
      provider_mappings: v1.provider_mappings,
      metadata: {
        seededFromV1: input.fromPackId,
        seededBy: input.operator,
        seededAt: now(),
      },
      updated_at: now(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return v2;
}

export async function syncCampaignIdentityGateBlocked(
  supabase: SupabaseClient,
  orgId: string
) {
  await supabase
    .from('studio_vp_campaigns')
    .update({
      identity_gate_status: 'blocked',
      identity_blocker_reason: IDENTITY_FOUNDATION_BLOCKER,
      updated_at: now(),
    })
    .eq('org_id', orgId)
    .eq('campaign_key', 'campaign-001')
    .is('identity_gate_status', null);
}

export async function assertCampaignPrecisionAllowed(
  supabase: SupabaseClient,
  orgId: string,
  campaignId: string
) {
  const { data: campaign } = await supabase
    .from('studio_vp_campaigns')
    .select('identity_gate_status, identity_blocker_reason, campaign_key')
    .eq('id', campaignId)
    .eq('org_id', orgId)
    .single();

  if (campaign?.identity_gate_status !== 'pass') {
    throw new Error(campaign?.identity_blocker_reason ?? IDENTITY_FOUNDATION_BLOCKER);
  }
}

/** Initialize identity invariants on pack seed */
export async function ensureReferencePackIdentityMetadata(
  supabase: SupabaseClient,
  packId: string
) {
  const invariants = buildIdentityInvariantsDocument();
  await supabase
    .from('studio_vp_character_reference_packs')
    .update({
      identity_invariants: invariants,
      openart_character_status: OPENART_CHARACTER_AUDIT.status,
      provider_mappings: defaultNiaProviderMappings(),
      updated_at: now(),
    })
    .eq('id', packId);
}

export { submitSlotForQc };
