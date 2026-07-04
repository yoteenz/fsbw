/**
 * AES-256-GCM encryption for social OAuth tokens — server-side only.
 * Uses SOCIAL_TOKEN_ENCRYPTION_SECRET or SESSION_COOKIE_SECRET.
 */
import crypto from 'crypto';

const IV_LEN = 12;
const AUTH_TAG_LEN = 16;
const KEY_LEN = 32;

export type SocialTokenPayload = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

function getKey(): Buffer | null {
  const secret = process.env.SOCIAL_TOKEN_ENCRYPTION_SECRET || process.env.SESSION_COOKIE_SECRET;
  if (!secret || (typeof secret === 'string' && secret.length < 16)) return null;
  return crypto.createHash('sha256').update(String(secret), 'utf8').digest();
}

export function isSocialTokenEncryptionConfigured(): boolean {
  return !!getKey();
}

export function encryptSocialTokens(payload: SocialTokenPayload): string | null {
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

export function decryptSocialTokens(encoded: string): SocialTokenPayload | null {
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
    const parsed = JSON.parse(out.toString('utf8')) as SocialTokenPayload;
    if (!parsed?.access_token || typeof parsed.access_token !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function signOAuthState(payload: { adminId: string; platform: string; exp: number }): string | null {
  const key = getKey();
  if (!key) return null;
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', key).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyOAuthState(state: string): { adminId: string; platform: string; exp: number } | null {
  const key = getKey();
  if (!key) return null;
  try {
    const [body, sig] = state.split('.');
    if (!body || !sig) return null;
    const expected = crypto.createHmac('sha256', key).update(body).digest('base64url');
    if (sig !== expected) return null;
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      adminId: string;
      platform: string;
      exp: number;
    };
    if (!parsed?.adminId || !parsed?.platform || typeof parsed.exp !== 'number') return null;
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}
