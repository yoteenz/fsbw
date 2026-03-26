import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const COOKIE_NAME = 'baw_session_rt';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type RefreshCookiePayload = {
  rt: string;
  uid: string;
  iat: number;
};

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const i = part.indexOf('=');
    if (i <= 0) return acc;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

function signPayload(encodedPayload: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(encodedPayload).digest();
}

function verifyAndReadToken(token: string, secret: string): RefreshCookiePayload | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const encodedPayload = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  if (!encodedPayload || !sigB64) return null;

  let givenSig: Buffer;
  try {
    givenSig = Buffer.from(sigB64, 'base64url');
  } catch {
    return null;
  }
  const expectedSig = signPayload(encodedPayload, secret);
  if (givenSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(givenSig, expectedSig)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Partial<RefreshCookiePayload>;
    if (!parsed || typeof parsed.rt !== 'string' || typeof parsed.uid !== 'string') return null;
    return {
      rt: parsed.rt,
      uid: parsed.uid,
      iat: typeof parsed.iat === 'number' ? parsed.iat : Date.now(),
    };
  } catch {
    return null;
  }
}

function setRefreshCookie(res: VercelResponse, token: string): void {
  const secure = process.env.VERCEL_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'SameSite=Lax',
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearRefreshCookie(res: VercelResponse): void {
  const secure = process.env.VERCEL_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    'SameSite=Lax',
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function buildSignedToken(payload: RefreshCookiePayload, secret: string): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${sig}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.SESSION_COOKIE_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_ANON_KEY;
  if (!secret || !supabaseUrl || !supabaseAnon) {
    return res.status(503).json({ error: 'Missing server env for session restore' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[COOKIE_NAME];
  if (!rawToken) return res.status(401).json({ error: 'No session cookie' });

  const payload = verifyAndReadToken(rawToken, secret);
  if (!payload?.rt) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Invalid session cookie' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnon);
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: payload.rt });
  if (error || !data.session || !data.user) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Session restore failed' });
  }

  if (data.user.id !== payload.uid) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Session user mismatch' });
  }

  // Rotate cookie to latest refresh token so Safari restore stays valid.
  const rotated = buildSignedToken(
    { rt: data.session.refresh_token, uid: data.user.id, iat: Date.now() },
    secret
  );
  setRefreshCookie(res, rotated);

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      user_metadata: data.user.user_metadata ?? {},
    },
  });
}

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
  // Must be a concrete origin when using credentials (Safari/browsers reject '*' with credentials)
  const origin = req.headers.origin ?? (req.headers.referer ? new URL(req.headers.referer).origin : null) ?? (req.headers.host ? `https://${req.headers.host}` : null);
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
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
