import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';
import { getAuthUser } from './_lib/auth';

const COOKIE_NAME = 'baw_session_rt';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type RefreshCookiePayload = {
  rt: string;
  uid: string;
  iat: number;
};

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function buildSignedToken(payload: RefreshCookiePayload, secret: string): string {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const sig = signPayload(encodedPayload, secret);
  return `${encodedPayload}.${sig}`;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body as Record<string, unknown> : {};
  if (body.clear === true) {
    clearRefreshCookie(res);
    return res.status(200).json({ ok: true });
  }

  const secret = process.env.SESSION_COOKIE_SECRET;
  if (!secret) return res.status(503).json({ error: 'Missing SESSION_COOKIE_SECRET' });

  const refreshToken = typeof body.refresh_token === 'string' ? body.refresh_token.trim() : '';
  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh_token' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const token = buildSignedToken(
    { rt: refreshToken, uid: user.id, iat: Date.now() },
    secret
  );
  setRefreshCookie(res, token);
  return res.status(200).json({ ok: true });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth';
import { setSessionCookie, clearSessionCookie } from './_lib/sessionCookie';

/**
 * POST /api/session-cookie – set HttpOnly session cookie so Safari can restore session after close.
 * Body: { refresh_token: string }. Requires Authorization: Bearer <access_token>.
 * Call this after sign-in so the server stores the refresh_token in an HttpOnly cookie.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Must be a concrete origin when using credentials (Safari/browsers reject '*' with credentials)
  const origin = req.headers.origin ?? (req.headers.referer ? new URL(req.headers.referer).origin : null) ?? (req.headers.host ? `https://${req.headers.host}` : null);
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  if (body.clear === true) {
    clearSessionCookie(res);
    return res.status(204).end();
  }

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const refreshToken = typeof body.refresh_token === 'string' ? body.refresh_token.trim() : null;
  if (!refreshToken) {
    clearSessionCookie(res);
    return res.status(400).json({ error: 'refresh_token required' });
  }

  setSessionCookie(res, { refresh_token: refreshToken });
  return res.status(204).end();
}
