import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../_lib/auth.js';
import {
  fetchCertificationsForUser,
  fetchUserCollectiblesForUser,
} from '../_lib/educationCertifications.js';
import {
  EDUCATION_COLLECTIBLE_DEFINITIONS,
  getCollectibleDefinitionById,
} from '../../src/content/education/collectibles/definitions.js';

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

/** GET /api/collectibles — user collection with definitions + stats */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
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
    const [collectibles, certifications] = await Promise.all([
      fetchUserCollectiblesForUser(supabase, user.id),
      fetchCertificationsForUser(supabase, user.id),
    ]);

    const items = collectibles.map((uc) => {
      const definition =
        getCollectibleDefinitionById(uc.collectibleId) ??
        EDUCATION_COLLECTIBLE_DEFINITIONS.find((d) => d.id === uc.collectibleId);
      const certification = certifications.find(
        (c) => c.id === uc.sourceId || c.collectibleId === uc.collectibleId,
      );
      return { ...uc, definition, certification };
    });

    const stats = {
      totalCollectibles: items.length,
      certificationsEarned: certifications.filter((c) => c.status === 'active').length,
      seasonsCompleted: certifications.filter((c) => c.status === 'active').length,
    };

    sendJson(res, 200, { items, certifications, stats, definitions: EDUCATION_COLLECTIBLE_DEFINITIONS });
  } catch (e) {
    sendJson(res, 500, { error: e instanceof Error ? e.message : 'Internal error' });
  }
}
