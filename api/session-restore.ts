import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getSessionPayloadFromRequest, setSessionCookie, clearSessionCookie, isSessionCookieConfigured } from './_lib/sessionCookie';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

/**
 * GET /api/session-restore – restore session from HttpOnly cookie (for Safari after it cleared storage).
 * Call with credentials: 'include' so the cookie is sent. If the cookie is valid, we exchange the
 * refresh_token for a new Supabase session and return { access_token, refresh_token, expires_at } so
 * the client can rehydrate. If no cookie or invalid, returns 401.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!isSessionCookieConfigured()) {
    return res.status(503).json({ error: 'Session restore not configured (SESSION_COOKIE_SECRET)' });
  }

  const payload = getSessionPayloadFromRequest(req);
  if (!payload?.refresh_token) {
    clearSessionCookie(res);
    return res.status(401).json({ error: 'No valid session cookie' });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }

  const tokenUrl = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`;
  const tokenRes = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ refresh_token: payload.refresh_token }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Session expired or invalid', details: errBody });
  }

  const data = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    expires_at?: number;
  };
  const access_token = data.access_token;
  const refresh_token = data.refresh_token ?? payload.refresh_token;
  const expires_in = data.expires_in ?? 3600;
  const expires_at = data.expires_at ?? Math.floor(Date.now() / 1000) + expires_in;

  if (!access_token || !refresh_token) {
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Invalid token response' });
  }

  let user: unknown = null;
  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const { data: { user: u } } = await supabase.auth.getUser(access_token);
    user = u ?? null;
  } catch (_) {
    /* optional */
  }

  setSessionCookie(res, { refresh_token });

  return res.status(200).json({
    access_token,
    refresh_token,
    expires_at,
    expires_in,
    user,
  });
}
