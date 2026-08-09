import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../../_lib/auth.js';
import {
  fetchCertificationsForUser,
  fetchUserCollectiblesForUser,
  syncSeasonCertificationForUser,
} from '../../_lib/educationCertifications.js';
import { getCollectibleDefinitionById } from '../../../src/content/education/collectibles/definitions.js';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function serviceSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function parseBody(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      return JSON.parse(b) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (b && typeof b === 'object' && !Array.isArray(b)) return b as Record<string, unknown>;
  return {};
}

/** GET /api/education/certifications — list user certifications + collectibles summary */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const user = await getAuthUser(req);
  if (!user) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return;
  }

  const supabase = serviceSupabase();
  if (!supabase) {
    sendJson(res, 503, { error: 'Supabase not configured' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const [certifications, collectibles] = await Promise.all([
        fetchCertificationsForUser(supabase, user.id),
        fetchUserCollectiblesForUser(supabase, user.id),
      ]);
      sendJson(res, 200, { certifications, collectibles });
      return;
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const seasonId = typeof body.seasonId === 'string' ? body.seasonId.trim() : '';
      const completedEpisodeIds = Array.isArray(body.completedEpisodeIds)
        ? body.completedEpisodeIds.filter((id): id is string => typeof id === 'string')
        : undefined;
      if (!seasonId) {
        sendJson(res, 400, { error: 'seasonId required' });
        return;
      }

      const result = await syncSeasonCertificationForUser(supabase, user.id, {
        seasonId,
        completedEpisodeIds,
      });

      if (!result.ok) {
        sendJson(res, 400, result);
        return;
      }

      const definition = result.certification.collectibleId
        ? getCollectibleDefinitionById(result.certification.collectibleId)
        : undefined;

      sendJson(res, 200, {
        ...result,
        collectibleDefinition: definition,
      });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    sendJson(res, 500, { error: e instanceof Error ? e.message : 'Internal error' });
  }
}
