import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminServiceRole, hasSupabaseServiceRole } from '../_lib/supabase';

const SOCIAL_PLATFORMS = new Set(['instagram', 'twitter', 'facebook', 'tiktok']);
const SOCIAL_SOURCES = new Set(['menu', 'more_ways_to_earn']);

function parseBody(req: VercelRequest): Record<string, unknown> {
  if (typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)) {
    return req.body as Record<string, unknown>;
  }
  const raw = typeof req.body === 'string' ? req.body : '';
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** POST /api/analytics/event — public ingest for anonymous + signed-in marketing events (service role insert). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!hasSupabaseServiceRole()) {
    return res.status(503).json({ error: 'Analytics storage not configured' });
  }

  const body = parseBody(req);
  const visitorId = String(body.visitorId ?? body.visitor_id ?? '').trim();
  if (visitorId.length < 8 || visitorId.length > 128) {
    return res.status(400).json({ error: 'visitorId required (8–128 chars)' });
  }

  const eventType = String(body.eventType ?? body.event_type ?? 'social_click').trim() || 'social_click';
  if (eventType !== 'social_click') {
    return res.status(400).json({ error: 'Unsupported eventType' });
  }

  const platform = String(body.platform ?? '').trim().toLowerCase();
  const source = String(body.source ?? '').trim().toLowerCase();
  if (!SOCIAL_PLATFORMS.has(platform) || !SOCIAL_SOURCES.has(source)) {
    return res.status(400).json({ error: 'Invalid platform or source' });
  }

  const pathRaw = body.path != null ? String(body.path).slice(0, 512) : null;
  const userEmailRaw = body.userEmail ?? body.user_email;
  const userEmail =
    userEmailRaw != null && String(userEmailRaw).includes('@')
      ? String(userEmailRaw).trim().slice(0, 320)
      : null;

  try {
    const supabase = getSupabaseAdminServiceRole();
    const { error } = await supabase.from('site_analytics_events').insert({
      visitor_id: visitorId,
      user_email: userEmail,
      event_type: eventType,
      platform,
      source,
      path: pathRaw || null,
      meta: {},
    });
    if (error) {
      console.error('[analytics/event]', error.message);
      return res.status(500).json({ error: 'Insert failed' });
    }
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error('[analytics/event]', e);
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
