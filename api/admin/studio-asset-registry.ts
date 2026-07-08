import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import {
  addRegistryRelationship,
  archiveRegistryAsset,
  createRegistryAsset,
  getRegistryAsset,
  getRegistryRelationships,
  getRegistryUsage,
  getRegistryVersions,
  recordRegistryUsage,
  searchRegistryAssets,
  searchRegistryByTags,
  updateRegistryAsset,
} from '../_lib/assetRegistry/service.js';
import { findSimilarAssets } from '../_lib/assetRegistry/similarity.js';
import { getReuseRecommendations } from '../_lib/assetRegistry/recommendations.js';
import type {
  AssetSearchFilters,
  CreateRegistryAssetInput,
  CreateRelationshipInput,
  SimilarityQuery,
  UpdateRegistryAssetInput,
} from '../_lib/assetRegistry/types.js';

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

function strParam(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((t) => String(t).trim()).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

const DEFAULT_ORG_ID = 'frontal-slayer';

/**
 * Studio Asset Registry™ API
 *
 * GET  ?action=get|search|tags|related|versions|usage|similar|recommend
 * POST — create asset or action dispatch (record_usage, add_relationship)
 * PUT  — update asset
 * DELETE — archive asset
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

    const orgId =
      strParam(query.org_id) ||
      strParam(body.org_id) ||
      DEFAULT_ORG_ID;

    if (req.method === 'GET') {
      const action = strParam(query.action) || 'get';

      if (action === 'get') {
        const assetId = strParam(query.id) || strParam(query.asset_id);
        if (!assetId) return res.status(400).json({ error: 'id required' });
        const asset = await getRegistryAsset(supabase, orgId, assetId);
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        return res.status(200).json({ ok: true, asset });
      }

      if (action === 'search') {
        const filters: AssetSearchFilters = {
          org_id: orgId,
          q: strParam(query.q) || undefined,
          category: strParam(query.category) || undefined,
          department_id: strParam(query.department_id) || undefined,
          workspace_scene_id: strParam(query.workspace_scene_id) || undefined,
          scene_id: strParam(query.scene_id) || undefined,
          generation_pack_id: strParam(query.generation_pack_id) || undefined,
          tags: parseTags(query.tags),
          include_archived: query.include_archived === 'true',
          limit: Number(query.limit) || 50,
          offset: Number(query.offset) || 0,
        };
        const result = await searchRegistryAssets(supabase, filters);
        return res.status(200).json({ ok: true, ...result });
      }

      if (action === 'tags') {
        const tags = parseTags(query.tags);
        if (!tags.length) return res.status(400).json({ error: 'tags required' });
        const assets = await searchRegistryByTags(supabase, orgId, tags, Number(query.limit) || 50);
        return res.status(200).json({ ok: true, assets });
      }

      if (action === 'related') {
        const assetId = strParam(query.asset_id) || strParam(query.id);
        if (!assetId) return res.status(400).json({ error: 'asset_id required' });
        const related = await getRegistryRelationships(supabase, orgId, assetId);
        return res.status(200).json({ ok: true, ...related });
      }

      if (action === 'versions') {
        const assetId = strParam(query.asset_id) || strParam(query.id);
        if (!assetId) return res.status(400).json({ error: 'asset_id required' });
        const versions = await getRegistryVersions(supabase, orgId, assetId);
        return res.status(200).json({ ok: true, versions });
      }

      if (action === 'usage') {
        const assetId = strParam(query.asset_id) || strParam(query.id);
        if (!assetId) return res.status(400).json({ error: 'asset_id required' });
        const events = await getRegistryUsage(supabase, orgId, assetId, Number(query.limit) || 50);
        return res.status(200).json({ ok: true, events });
      }

      if (action === 'similar') {
        const simQuery: SimilarityQuery = {
          org_id: orgId,
          asset_id: strParam(query.asset_id) || undefined,
          category: strParam(query.category) || undefined,
          reuse_category: strParam(query.reuse_category) || undefined,
          materials: parseTags(query.materials),
          tags: parseTags(query.tags),
          lighting_profile: strParam(query.lighting_profile) || undefined,
          limit: Number(query.limit) || 20,
        };
        const results = await findSimilarAssets(supabase, simQuery);
        return res.status(200).json({ ok: true, results });
      }

      if (action === 'recommend') {
        const simQuery: SimilarityQuery & { estimated_regen_cost?: number } = {
          org_id: orgId,
          asset_id: strParam(query.asset_id) || undefined,
          category: strParam(query.category) || undefined,
          reuse_category: strParam(query.reuse_category) || undefined,
          materials: parseTags(query.materials),
          tags: parseTags(query.tags),
          lighting_profile: strParam(query.lighting_profile) || undefined,
          limit: Number(query.limit) || 20,
          estimated_regen_cost: query.estimated_regen_cost
            ? Number(query.estimated_regen_cost)
            : undefined,
        };
        const recommendations = await getReuseRecommendations(supabase, simQuery);
        return res.status(200).json({ ok: true, recommendations });
      }

      return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    if (req.method === 'POST') {
      const action = strParam(body.action);

      if (action === 'record_usage') {
        const assetId = strParam(body.asset_id);
        if (!assetId) return res.status(400).json({ error: 'asset_id required' });
        const eventType = strParam(body.event_type) || 'reuse';
        const context =
          typeof body.context === 'object' && body.context !== null && !Array.isArray(body.context)
            ? (body.context as Record<string, unknown>)
            : {};
        const result = await recordRegistryUsage(supabase, orgId, assetId, eventType, context);
        return res.status(200).json({ ok: true, ...result });
      }

      if (action === 'add_relationship') {
        const assetId = strParam(body.asset_id);
        if (!assetId) return res.status(400).json({ error: 'asset_id required' });
        const rel = body.relationship as CreateRelationshipInput | undefined;
        if (!rel?.relation_type || !rel?.target_kind) {
          return res.status(400).json({ error: 'relationship with relation_type and target_kind required' });
        }
        const relationship = await addRegistryRelationship(supabase, orgId, assetId, rel);
        return res.status(200).json({ ok: true, relationship });
      }

      if (action === 'search') {
        const filters: AssetSearchFilters = {
          org_id: orgId,
          q: strParam(body.q) || undefined,
          category: strParam(body.category) || undefined,
          department_id: strParam(body.department_id) || undefined,
          workspace_scene_id: strParam(body.workspace_scene_id) || undefined,
          scene_id: strParam(body.scene_id) || undefined,
          generation_pack_id: strParam(body.generation_pack_id) || undefined,
          tags: parseTags(body.tags),
          include_archived: body.include_archived === true,
          limit: Number(body.limit) || 50,
          offset: Number(body.offset) || 0,
        };
        const result = await searchRegistryAssets(supabase, filters);
        return res.status(200).json({ ok: true, ...result });
      }

      if (action === 'similar') {
        const simQuery: SimilarityQuery = {
          org_id: orgId,
          asset_id: strParam(body.asset_id) || undefined,
          category: strParam(body.category) || undefined,
          reuse_category: strParam(body.reuse_category) || undefined,
          materials: parseTags(body.materials),
          tags: parseTags(body.tags),
          lighting_profile: strParam(body.lighting_profile) || undefined,
          limit: Number(body.limit) || 20,
        };
        const results = await findSimilarAssets(supabase, simQuery);
        return res.status(200).json({ ok: true, results });
      }

      if (action === 'recommend') {
        const simQuery: SimilarityQuery & { estimated_regen_cost?: number } = {
          org_id: orgId,
          asset_id: strParam(body.asset_id) || undefined,
          category: strParam(body.category) || undefined,
          reuse_category: strParam(body.reuse_category) || undefined,
          materials: parseTags(body.materials),
          tags: parseTags(body.tags),
          lighting_profile: strParam(body.lighting_profile) || undefined,
          limit: Number(body.limit) || 20,
          estimated_regen_cost:
            typeof body.estimated_regen_cost === 'number' ? body.estimated_regen_cost : undefined,
        };
        const recommendations = await getReuseRecommendations(supabase, simQuery);
        return res.status(200).json({ ok: true, recommendations });
      }

      const input = body as unknown as CreateRegistryAssetInput;
      if (!input.name || !input.category) {
        return res.status(400).json({ error: 'name and category required' });
      }
      input.org_id = orgId;
      const asset = await createRegistryAsset(supabase, input);
      return res.status(201).json({ ok: true, asset });
    }

    if (req.method === 'PUT') {
      const assetId = strParam(body.id) || strParam(body.asset_id) || strParam(query.id);
      if (!assetId) return res.status(400).json({ error: 'id required' });
      const patch = body as unknown as UpdateRegistryAssetInput;
      const asset = await updateRegistryAsset(supabase, orgId, assetId, patch);
      return res.status(200).json({ ok: true, asset });
    }

    if (req.method === 'DELETE') {
      const assetId = strParam(query.id) || strParam(query.asset_id) || strParam(body.id);
      if (!assetId) return res.status(400).json({ error: 'id required' });
      const asset = await archiveRegistryAsset(supabase, orgId, assetId);
      return res.status(200).json({ ok: true, asset });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error';
    if (message === 'Asset not found') return res.status(404).json({ error: message });
    return res.status(500).json({ error: message });
  }
}
