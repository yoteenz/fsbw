import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { getSupabaseAdminServiceRole } from '../_lib/supabase.js';
import { fromProfileRow } from '../_lib/profileMapping.js';

/** Build a minimal app-shape client from auth user (no profile row yet). */
function authUserToMinimalClient(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }): Record<string, unknown> {
  const meta = user.user_metadata || {};
  const s = (k: string, k2?: string) => {
    const a = meta[k];
    const b = k2 ? meta[k2] : undefined;
    const v = (typeof a === 'string' && a.trim() ? a : typeof b === 'string' && b.trim() ? b : '') as string;
    return v || null;
  };
  return {
    id: user.id,
    email: (user.email || '').trim().toLowerCase() || (meta.email as string) || '',
    firstName: (meta.first_name as string) || (meta.firstName as string) || '',
    lastName: (meta.last_name as string) || (meta.lastName as string) || '',
    phoneNumber: s('phone_number', 'phoneNumber'),
    birthday: s('birthday'),
    facebook: s('facebook'),
    instagram: s('instagram'),
    youtube: s('youtube'),
    tiktok: s('tiktok'),
    twitter: s('twitter'),
    profileImage: null,
    membershipType: 'STANDARD',
    giftCardBalance: 10,
    hasMadeFirstPurchase: false,
    loyaltyPoints: 0,
    unlockedDiscounts: ['signup'],
    referralCode: s('referral_code', 'referralCode'),
    createdAt: user.created_at ?? new Date().toISOString(),
    updatedAt: null,
  };
}

/** GET /api/admin/clients – list ALL clients: every profile row plus every auth user not yet in profiles (admin only). So clients from all browsers/sessions show. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const admin = await requireAdmin(req);
  if (!admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const supabase = getSupabaseAdminServiceRole();

    const { data: profileRows, error: profileError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profileError) return res.status(500).json({ error: profileError.message });
    const rows = Array.isArray(profileRows) ? profileRows : [];
    const profileById = new Map<string, Record<string, unknown>>();
    const clientsFromProfiles: Record<string, unknown>[] = [];
    for (const row of rows) {
      const r = row as Record<string, unknown>;
      const id = r.id as string;
      if (id) profileById.set(id, r);
      clientsFromProfiles.push(fromProfileRow(r));
    }

    let page = 1;
    const perPage = 1000;
    const authOnlyClients: Record<string, unknown>[] = [];
    let hasMore = true;
    while (hasMore) {
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ page, perPage });
      if (listError) break;
      const users = (listData as { users?: Array<{ id?: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }> })?.users ?? [];
      for (const u of users) {
        const id = u?.id;
        if (!id) continue;
        if (!profileById.has(id)) {
          authOnlyClients.push(authUserToMinimalClient({
            id,
            email: u.email ?? undefined,
            user_metadata: u.user_metadata ?? undefined,
            created_at: u.created_at ?? undefined,
          }));
        }
      }
      hasMore = users.length >= perPage && page < 100;
      page += 1;
    }

    const combined = [...clientsFromProfiles, ...authOnlyClients];
    combined.sort((a, b) => {
      const aAt = (a.createdAt as string) || '';
      const bAt = (b.createdAt as string) || '';
      return bAt.localeCompare(aAt);
    });
    return res.status(200).json(combined);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error';
    if (/SUPABASE_SERVICE_ROLE_KEY|service role/i.test(msg)) {
      return res.status(503).json({ error: 'Admin clients list requires SUPABASE_SERVICE_ROLE_KEY to show all clients from Supabase. Set it in your project env.' });
    }
    return res.status(500).json({ error: msg });
  }
}
