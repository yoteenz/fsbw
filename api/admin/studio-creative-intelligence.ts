import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import {
  evaluateCreativeDecision,
  getPersistedDecision,
  persistCreativeDecision,
} from '../_lib/creativeIntelligenceEngine/decision-engine.js';
import {
  genomeLearningHint,
  recordLearningSignal,
} from '../_lib/creativeIntelligenceEngine/learning-loop.js';
import type { FounderIntentInput, LearningSignalInput } from '../_lib/creativeIntelligenceEngine/types.js';

const DEFAULT_ORG_ID = 'frontal-slayer';

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

/**
 * Creative Intelligence Engine™ API
 *
 * POST action=evaluate — produce Decision Object (thinks before generation)
 * POST action=learning — record founder learning signal
 * GET  ?decision_id= — retrieve persisted decision
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
    const orgId =
      (typeof body.org_id === 'string' && body.org_id.trim()) ||
      (typeof req.query.org_id === 'string' && req.query.org_id.trim()) ||
      DEFAULT_ORG_ID;

    if (req.method === 'GET') {
      const decisionId =
        typeof req.query.decision_id === 'string' ? req.query.decision_id.trim() : '';
      if (!decisionId) return res.status(400).json({ error: 'decision_id required' });
      const decision = await getPersistedDecision(supabase, orgId, decisionId);
      if (!decision) return res.status(404).json({ error: 'Decision not found' });
      return res.status(200).json({ ok: true, decision });
    }

    if (req.method === 'POST') {
      const action = typeof body.action === 'string' ? body.action.trim() : 'evaluate';

      if (action === 'learning') {
        const signal = body as unknown as LearningSignalInput;
        if (!signal.action) return res.status(400).json({ error: 'action required' });
        signal.org_id = orgId;
        const result = await recordLearningSignal(supabase, signal);
        return res.status(200).json({
          ok: true,
          signal_id: result.id,
          genome_hint: genomeLearningHint(signal.action),
        });
      }

      const intent = body.intent as FounderIntentInput | undefined;
      const merged: FounderIntentInput = {
        org_id: orgId,
        raw_intent: typeof intent?.raw_intent === 'string' ? intent.raw_intent : String(body.raw_intent ?? ''),
        category: intent?.category ?? (typeof body.category === 'string' ? body.category : undefined),
        department_id: intent?.department_id ?? (typeof body.department_id === 'string' ? body.department_id : undefined),
        workspace_id: intent?.workspace_id ?? (typeof body.workspace_id === 'string' ? body.workspace_id : undefined),
        scene_id: intent?.scene_id ?? (typeof body.scene_id === 'string' ? body.scene_id : undefined),
        generation_pack_id:
          intent?.generation_pack_id ??
          (typeof body.generation_pack_id === 'string' ? body.generation_pack_id : undefined),
        quality_intent: intent?.quality_intent,
        asset_type: intent?.asset_type,
        tags: intent?.tags,
        materials: intent?.materials,
        lighting_profile: intent?.lighting_profile,
        reuse_category: intent?.reuse_category,
        prefer_reuse: intent?.prefer_reuse,
        concept_count: intent?.concept_count,
        layered: intent?.layered ?? body.layered === true,
        genome_snapshot: intent?.genome_snapshot,
        metadata: intent?.metadata,
      };

      if (!merged.raw_intent.trim()) {
        return res.status(400).json({ error: 'raw_intent required' });
      }

      const decision = await evaluateCreativeDecision(supabase, merged);
      const persist = body.persist !== false;
      if (persist) {
        await persistCreativeDecision(supabase, decision);
      }

      return res.status(200).json({ ok: true, decision });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
