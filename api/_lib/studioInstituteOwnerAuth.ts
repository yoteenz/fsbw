import type { VercelRequest } from '@vercel/node';
import { createHash } from 'crypto';
import { getAuthUser } from './auth.js';
import { isAdminEmail } from './adminAuth.js';
import { getSupabaseAdminServiceRole } from './supabase.js';

const OWNER_PASSWORD_CONFIG_KEY = 'studio_institute_owner_password_hash';

async function getStoredOwnerPasswordHash(): Promise<string | null> {
  const admin = getSupabaseAdminServiceRole();
  const { data, error } = await admin.from('app_config').select('value').eq('key', OWNER_PASSWORD_CONFIG_KEY).maybeSingle();
  if (error || !data?.value) return null;
  const value = data.value;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'hash' in value) {
    const hash = (value as { hash?: unknown }).hash;
    return typeof hash === 'string' ? hash : null;
  }
  return null;
}

/** Studio Institute owner gate — invite manager password hash, env key, or admin email. */
export async function isStudioInstituteOwner(req: VercelRequest): Promise<boolean> {
  const key = req.headers['x-studio-institute-owner-key'];
  if (typeof key === 'string' && key.length > 0) {
    const envKey = process.env.STUDIO_INSTITUTE_OWNER_KEY;
    if (envKey && key === envKey) return true;
    const storedHash = await getStoredOwnerPasswordHash();
    if (storedHash && key === storedHash) return true;
  }
  const user = await getAuthUser(req);
  if (user?.email && isAdminEmail(user.email)) return true;
  return false;
}

export function hashStudioInstituteOwnerPassword(password: string): string {
  return createHash('sha256').update(password.trim()).digest('hex');
}
