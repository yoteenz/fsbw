import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import {
  createRepairJob,
  ensureReferenceTenantSeed,
  exportDirectorPackage,
  getCampaignBoard,
} from '../_lib/virtualProduction/service.js';
import { seedFrontalSlayerCanonAndCampaign001 } from '../_lib/virtualProduction/canon-seed.js';
import {
  approveReferencePackSlot,
  assignReferencePackCandidate,
  createReferencePackV2Draft,
  getNiaReferencePackBoard,
  lockNiaReferencePackV1,
  rejectReferencePackSlot,
  setPrimaryIdentityAnchor,
} from '../_lib/virtualProduction/identity-service.js';
import { uploadReferencePackImageDataUrl } from '../_lib/virtualProduction/reference-pack-upload.js';
import { PRODUCTION_PROVIDERS } from '../../src/studio-os-core/virtual-production/providers.js';
import {
  executeGovernedProduction,
  finalizeGovernedProduction,
  releaseGovernedProductionReservation,
} from '../_lib/productionGovernance/executeGovernedProduction.js';
import type { ReferencePackSlot } from '../../src/studio-os-core/virtual-production/canon/frontal-slayer-canon.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      const o = JSON.parse(req.body) as unknown;
      if (o && typeof o === 'object' && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Studio World Virtual Production OS API
 * GET  ?action=board|brands|campaigns
 * POST — seed_reference, create_campaign, create_repair, export_director_package, import_asset
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ error, code });
  }

  try {
    const supabase = getSupabaseAdmin();
    const body = parseBody(req) ?? {};
    const query = req.query ?? {};
    const orgId = str(query.org_id) || str(body.org_id) || 'frontal-slayer';

    if (req.method === 'GET') {
      const action = str(query.action) || 'campaigns';

      if (action === 'campaigns') {
        const { data, error } = await supabase
          .from('studio_vp_campaigns')
          .select('id, campaign_key, name, production_mode, lifecycle_status, approval_state, created_at')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.status(200).json({ ok: true, campaigns: data ?? [] });
      }

      if (action === 'brands') {
        const { data, error } = await supabase
          .from('studio_vp_brands')
          .select('*')
          .eq('org_id', orgId)
          .order('display_name');
        if (error) throw error;
        return res.status(200).json({ ok: true, brands: data ?? [] });
      }

      if (action === 'board') {
        const campaignId = str(query.campaign_id);
        if (!campaignId) return res.status(400).json({ error: 'campaign_id required' });
        const board = await getCampaignBoard(supabase, orgId, campaignId);
        return res.status(200).json({ ok: true, ...board });
      }

      if (action === 'providers') {
        return res.status(200).json({ ok: true, providers: PRODUCTION_PROVIDERS });
      }

      if (action === 'reference_pack_board') {
        const board = await getNiaReferencePackBoard(supabase, orgId);
        return res.status(200).json({ ok: true, ...board });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    if (req.method === 'POST') {
      const action = str(body.action);

      if (action === 'seed_reference') {
        const seed = await ensureReferenceTenantSeed(supabase, orgId);
        return res.status(200).json({ ok: true, ...seed });
      }

      if (action === 'seed_fs_canon_campaign001') {
        const seed = await seedFrontalSlayerCanonAndCampaign001(supabase, orgId);
        return res.status(200).json({ ok: true, ...seed });
      }

      if (action === 'create_campaign') {
        const brandId = str(body.brand_id);
        const name = str(body.name);
        const productionMode = str(body.production_mode) || 'precision';
        if (!brandId || !name) {
          return res.status(400).json({ error: 'brand_id and name required' });
        }

        const campaignKey = str(body.campaign_key) || `campaign-${Date.now()}`;
        const { data, error } = await supabase
          .from('studio_vp_campaigns')
          .insert({
            org_id: orgId,
            brand_id: brandId,
            campaign_key: campaignKey,
            name,
            objective: str(body.objective) || null,
            production_mode: productionMode,
            lifecycle_status: 'idea',
            approval_state: 'draft',
            deliverables: [],
            format: body.format ?? {},
            canon_snapshot: {},
            metadata: body.metadata ?? {},
          })
          .select('*')
          .single();
        if (error) throw error;
        return res.status(201).json({ ok: true, campaign: data });
      }

      if (action === 'create_repair') {
        const campaignId = str(body.campaign_id);
        const shotId = str(body.shot_id);
        const originalAssetId = str(body.original_asset_id);
        const reason = str(body.reason) || 'qc_failure';
        if (!campaignId || !shotId || !originalAssetId) {
          return res.status(400).json({ error: 'campaign_id, shot_id, original_asset_id required' });
        }

        const operatorEmail = auth.user.email ?? '';
        const governance = await executeGovernedProduction(supabase, {
          routeKey: 'studio-virtual-production',
          operatorEmail,
          operatorUserId: auth.user.id,
          organizationSlug: orgId,
          operationType: 'PRECISION_REPAIR',
          provider: str(body.provider_id) || 'fal',
          model: str(body.model_id) || undefined,
          estimatedCost: 4,
          campaignId,
          shotId,
          clientGovernanceEnabled: body.productionGovernance === false,
        });

        if (!governance.ok) {
          return res.status(403).json({ ok: false, error: governance.error, code: governance.code });
        }

        const result = await createRepairJob(supabase, {
          orgId,
          campaignId,
          shotId,
          originalAssetId,
          reason,
          providerId: str(body.provider_id) || undefined,
          modelId: str(body.model_id) || undefined,
          actorId: operatorEmail,
        });

        if (governance.reservationId) {
          try {
            await finalizeGovernedProduction(supabase, {
              reservationId: governance.reservationId,
              operatorUserId: auth.user.id,
              organizationId: governance.governance.billingOwner.billingOwnerId,
              billingOwnerId: governance.governance.billingOwner.billingOwnerId,
              operationType: 'PRECISION_REPAIR',
              provider: str(body.provider_id) || 'fal',
              model: str(body.model_id) || undefined,
              estimatedCost: 4,
              outcome: 'completed',
              campaignId,
              shotId,
              metadata: { repairJobId: result.job.id, reason },
            });
          } catch (finalizeErr) {
            await releaseGovernedProductionReservation(supabase, governance.reservationId);
            throw finalizeErr;
          }
        }

        return res.status(201).json({ ok: true, ...result });
      }

      if (action === 'export_director_package') {
        const campaignId = str(body.campaign_id);
        if (!campaignId) return res.status(400).json({ error: 'campaign_id required' });
        const exported = await exportDirectorPackage(supabase, orgId, campaignId);
        return res.status(200).json({ ok: true, ...exported });
      }

      if (action === 'reference_pack_assign_candidate') {
        const packId = str(body.pack_id);
        const slot = str(body.slot) as ReferencePackSlot;
        const mediaUrl = str(body.media_url);
        if (!packId || !slot || !mediaUrl) {
          return res.status(400).json({ error: 'pack_id, slot, media_url required' });
        }
        const result = await assignReferencePackCandidate(supabase, {
          orgId,
          packId,
          slot,
          mediaUrl,
          providerId: str(body.provider_id) || 'upload',
          modelId: str(body.model_id) || undefined,
          referenceLineage: Array.isArray(body.reference_lineage) ? body.reference_lineage : [],
          operator: auth.ok ? auth.user.email : undefined,
          billingOwnerOrgId: str(body.billing_owner_org_id) || orgId,
          estimatedCostUsd: typeof body.estimated_cost_usd === 'number' ? body.estimated_cost_usd : undefined,
        });
        return res.status(201).json({ ok: true, ...result });
      }

      if (action === 'reference_pack_approve_slot') {
        const packId = str(body.pack_id);
        const slot = str(body.slot) as ReferencePackSlot;
        const assetId = str(body.asset_id);
        if (!packId || !slot || !assetId) {
          return res.status(400).json({ error: 'pack_id, slot, asset_id required' });
        }
        const qc = Array.isArray(body.qc) ? body.qc : [];
        const result = await approveReferencePackSlot(supabase, {
          orgId,
          packId,
          slot,
          assetId,
          mediaUrl: str(body.media_url) || undefined,
          qc,
          operator: auth.ok ? auth.user.email : undefined,
        });
        return res.status(200).json({ ok: true, ...result });
      }

      if (action === 'reference_pack_reject_slot') {
        const packId = str(body.pack_id);
        const slot = str(body.slot) as ReferencePackSlot;
        const candidateAssetId = str(body.candidate_asset_id);
        const reason = str(body.reason) || 'identity_qc_fail';
        if (!packId || !slot || !candidateAssetId) {
          return res.status(400).json({ error: 'pack_id, slot, candidate_asset_id required' });
        }
        const qc = Array.isArray(body.qc) ? body.qc : [];
        const result = await rejectReferencePackSlot(supabase, {
          orgId,
          packId,
          slot,
          candidateAssetId,
          reason,
          qc,
          operator: auth.ok ? auth.user.email : undefined,
        });
        return res.status(200).json({ ok: true, ...result });
      }

      if (action === 'reference_pack_set_anchor') {
        const packId = str(body.pack_id);
        const assetId = str(body.asset_id);
        if (!packId || !assetId) {
          return res.status(400).json({ error: 'pack_id, asset_id required' });
        }
        const result = await setPrimaryIdentityAnchor(supabase, {
          orgId,
          packId,
          assetId,
          mediaUrl: str(body.media_url) || undefined,
          source: str(body.source) || undefined,
          providerId: str(body.provider_id) || undefined,
          modelId: str(body.model_id) || undefined,
          operator: auth.ok ? auth.user.email : undefined,
        });
        return res.status(200).json({ ok: true, ...result });
      }

      if (action === 'reference_pack_lock_v1') {
        const packId = str(body.pack_id);
        if (!packId) return res.status(400).json({ error: 'pack_id required' });
        const result = await lockNiaReferencePackV1(supabase, {
          orgId,
          packId,
          operator: auth.ok ? auth.user.email ?? 'operator' : 'operator',
        });
        return res.status(200).json({ ok: true, ...result });
      }

      if (action === 'reference_pack_create_v2') {
        const characterId = str(body.character_id);
        const fromPackId = str(body.from_pack_id);
        if (!characterId || !fromPackId) {
          return res.status(400).json({ error: 'character_id, from_pack_id required' });
        }
        const v2 = await createReferencePackV2Draft(supabase, {
          orgId,
          characterId,
          fromPackId,
          operator: auth.ok ? auth.user.email ?? 'operator' : 'operator',
        });
        return res.status(201).json({ ok: true, pack: v2 });
      }

      if (action === 'reference_pack_upload_and_assign') {
        const packId = str(body.pack_id);
        const slot = str(body.slot) as ReferencePackSlot;
        const imageDataUrl = str(body.image_data_url);
        const autoApprove = body.auto_approve === true;
        if (!packId || !slot || !imageDataUrl) {
          return res.status(400).json({ error: 'pack_id, slot, image_data_url required' });
        }
        const upload = await uploadReferencePackImageDataUrl({
          orgId,
          packId,
          slot,
          imageDataUrl,
        });
        if (!upload.ok || !upload.publicUrl) {
          return res.status(400).json({ ok: false, error: upload.error ?? 'Upload failed' });
        }
        const assignResult = await assignReferencePackCandidate(supabase, {
          orgId,
          packId,
          slot,
          mediaUrl: upload.publicUrl,
          providerId: 'upload',
          referenceLineage: [{ type: 'storage_upload', storagePath: upload.storagePath }],
          operator: auth.ok ? auth.user.email : undefined,
          billingOwnerOrgId: orgId,
        });
        let approveResult = null;
        if (autoApprove && assignResult.asset?.id) {
          approveResult = await approveReferencePackSlot(supabase, {
            orgId,
            packId,
            slot,
            assetId: assignResult.asset.id as string,
            mediaUrl: upload.publicUrl,
            qc: [
              { category: 'identity', status: 'pass', notes: 'MANUAL IDENTITY QC — operator upload' },
              { category: 'overall', status: 'pass' },
            ],
            operator: auth.ok ? auth.user.email : undefined,
          });
        }
        return res.status(201).json({
          ok: true,
          publicUrl: upload.publicUrl,
          storagePath: upload.storagePath,
          ...assignResult,
          approve: approveResult,
        });
      }

      if (action === 'import_asset') {
        const campaignId = str(body.campaign_id);
        const shotId = str(body.shot_id);
        const providerId = str(body.provider_id) || 'upload';
        const mediaUrl = str(body.media_url);
        if (!campaignId || !mediaUrl) {
          return res.status(400).json({ error: 'campaign_id and media_url required' });
        }
        const assetKey = str(body.asset_key) || `import-${Date.now()}`;
        const { data, error } = await supabase
          .from('studio_vp_generation_assets')
          .insert({
            org_id: orgId,
            campaign_id: campaignId,
            shot_id: shotId || null,
            asset_key: assetKey,
            media_url: mediaUrl,
            media_type: str(body.media_type) || 'video',
            provider_id: providerId,
            model_id: str(body.model_notes) || null,
            approval_state: 'ready_for_review',
            settings: {},
            source_references: [],
            canon_versions: body.canon_versions ?? {},
            repair_ancestry: [],
            metadata: { imported: true, ...(body.metadata as object ?? {}) },
          })
          .select('*')
          .single();
        if (error) throw error;
        return res.status(201).json({ ok: true, asset: data });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    if (message === 'UNAUTHORIZED_TENANT') {
      return res.status(403).json({ error: 'Unauthorized tenant access', code: 'UNAUTHORIZED_TENANT' });
    }
    console.error('[studio-virtual-production]', message);
    return res.status(500).json({ error: 'Virtual production request failed' });
  }
}
