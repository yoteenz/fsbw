import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'lounge_tv_admin';

function sendJson(res: VercelResponse, status: number, body: Record<string, unknown>): void {
  try {
    const json = JSON.stringify(body);
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(json);
  } catch (e) {
    console.error('[lounge-tv-config] sendJson failed:', e);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('JSON serialization failed');
  }
}

/**
 * GET /api/lounge-tv-config — public read of lounge TV content JSON (lobby TV, no auth).
 * Returns { config: object | null }.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.error('[lounge-tv-config] Missing SUPABASE_URL or SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY');
      sendJson(res, 503, { config: null, error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY' });
      return;
    }

    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('app_config').select('value').eq('key', CONFIG_KEY).maybeSingle();

    if (error) {
      console.error('[lounge-tv-config] Supabase error:', error.message, error);
      sendJson(res, 500, { config: null, error: error.message });
      return;
    }

    const value = data?.value as unknown;
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      sendJson(res, 200, { config: value as Record<string, unknown> });
      return;
    }
    sendJson(res, 200, { config: null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    console.error('[lounge-tv-config] Uncaught:', e);
    if (/SUPABASE|Missing/i.test(msg)) {
      sendJson(res, 503, { config: null, error: msg });
      return;
    }
    sendJson(res, 500, { config: null, error: msg });
  }
}
