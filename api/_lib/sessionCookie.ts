/**
 * Server-side HttpOnly session cookie for Safari (and others).
 * Safari may clear cookies set by JS but keep cookies set via Set-Cookie in responses.
 * We store an encrypted refresh_token so we can restore the session on next load.
 */
import { VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const COOKIE_NAME = 'baw_ss';
const MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 days
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;
const KEY_LEN = 32;

function getKey(): Buffer | null {
  const secret = process.env.SESSION_COOKIE_SECRET;
  if (!secret || (typeof secret === 'string' && secret.length < 16)) return null;
  if (Buffer.isBuffer(secret)) return secret.length === KEY_LEN ? secret : crypto.createHash('sha256').update(secret).digest();
  return crypto.createHash('sha256').update(String(secret), 'utf8').digest();
}

export interface SessionPayload {
  refresh_token: string;
}

export function encryptPayload(payload: SessionPayload): string | null {
  const key = getKey();
  if (!key) return null;
  try {
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LEN });
    const enc = Buffer.concat([
      cipher.update(JSON.stringify(payload), 'utf8'),
      cipher.final(),
      cipher.getAuthTag(),
    ]);
    return iv.toString('base64url') + '.' + enc.toString('base64url');
  } catch {
    return null;
  }
}

export function decryptPayload(encoded: string): SessionPayload | null {
  const key = getKey();
  if (!key) return null;
  try {
    const [ivB64, rest] = encoded.split('.');
    if (!ivB64 || !rest) return null;
    const iv = Buffer.from(ivB64, 'base64url');
    const combined = Buffer.from(rest, 'base64url');
    const authTag = combined.subarray(combined.length - AUTH_TAG_LEN);
    const ciphertext = combined.subarray(0, combined.length - AUTH_TAG_LEN);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv, { authTagLength: AUTH_TAG_LEN });
    decipher.setAuthTag(authTag);
    const out = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const parsed = JSON.parse(out.toString('utf8')) as SessionPayload;
    return typeof parsed?.refresh_token === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: VercelResponse, payload: SessionPayload): void {
  const value = encryptPayload(payload);
  if (!value) return;
  const isSecure = process.env.VERCEL_URL?.startsWith('https') ?? true;
  let cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax; HttpOnly`;
  if (isSecure) cookie += '; Secure';
  res.setHeader('Set-Cookie', cookie);
}

export function clearSessionCookie(res: VercelResponse): void {
  const isSecure = process.env.VERCEL_URL?.startsWith('https') ?? true;
  let cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`;
  if (isSecure) cookie += '; Secure';
  res.setHeader('Set-Cookie', cookie);
}

function parseCookieHeader(header: string | undefined): string | null {
  if (!header) return null;
  const match = new RegExp('(?:^|; )' + COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)').exec(header);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getSessionPayloadFromRequest(req: { cookies?: Record<string, string>; headers?: { cookie?: string } }): SessionPayload | null {
  const raw = (req as any).cookies?.[COOKIE_NAME] ?? parseCookieHeader(req.headers?.cookie);
  if (!raw || typeof raw !== 'string') return null;
  try {
    return decryptPayload(raw.startsWith('%') ? decodeURIComponent(raw) : raw);
  } catch {
    return null;
  }
}

export function isSessionCookieConfigured(): boolean {
  return !!getKey();
}
