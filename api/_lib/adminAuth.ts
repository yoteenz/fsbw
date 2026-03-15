/**
 * Admin-only API guard. Verifies the request has a valid Supabase session and the user's email is in the admin list.
 */
import type { VercelRequest } from '@vercel/node';
import { getAuthUser } from './auth';

const DEFAULT_ADMIN_EMAILS = [
  'admin@frontalslayer.com',
  'kateena.armstrong@frontalslayer.com',
  'ayoteenz@yahoo.com',
];

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || '';
  if (raw.trim()) {
    return raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return DEFAULT_ADMIN_EMAILS;
}

/** Returns the authenticated user if they are an admin, otherwise null. */
export async function requireAdmin(
  req: VercelRequest
): Promise<{ id: string; email: string; accessToken: string } | null> {
  const user = await getAuthUser(req);
  if (!user) return null;
  const adminEmails = getAdminEmails();
  const emailLower = (user.email || '').trim().toLowerCase();
  if (!adminEmails.includes(emailLower)) return null;
  return user;
}
