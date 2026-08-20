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
import { PRODUCTION_PROVIDERS } from '../../src/studio-os-core/virtual-production/providers.js';

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
        const result = await createRepairJob(supabase, {
          orgId,
          campaignId,
          shotId,
          originalAssetId,
          reason,
          providerId: str(body.provider_id) || undefined,
          modelId: str(body.model_id) || undefined,
          actorId: auth.ok ? auth.user.email : undefined,
        });
        return res.status(201).json({ ok: true, ...result });
      }

      if (action === 'export_director_package') {
        const campaignId = str(body.campaign_id);
        if (!campaignId) return res.status(400).json({ error: 'campaign_id required' });
        const exported = await exportDirectorPackage(supabase, orgId, campaignId);
        return res.status(200).json({ ok: true, ...exported });
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
