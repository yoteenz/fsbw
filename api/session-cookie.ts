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
