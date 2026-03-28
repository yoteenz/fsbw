/**
 * POST /api/admin/sync-profile
 * Admin-only: return profile, orders, cart, wishlist.
 * Auth: (1) Authorization: Bearer <Supabase access_token> — preferred, no password; or (2) Body { email, password }.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '../_lib/auth.js';
import { getSupabaseAdmin } from '../_lib/supabase.js';
import { fromProfileRow } from '../_lib/profileMapping.js';
const ADMIN_SYNC_EMAILS = [
  'admin@frontalslayer.com',
  'kateena.armstrong@frontalslayer.com',
  'kateenaarmstrong@gmail.com',
];

function isAllowedSyncEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS || '';
  const list = raw.trim()
    ? raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : ADMIN_SYNC_EMAILS.map((e) => e.toLowerCase());
  return list.includes((email || '').trim().toLowerCase());
}

async function fetchSyncPayload(
  userId: string,
  userEmail: string,
  admin: ReturnType<typeof getSupabaseAdmin>
): Promise<{ profile: Record<string, unknown>; activeOrders: unknown[]; pastOrders: unknown[]; cartItems: unknown[]; wishlistItems: unknown[] }> {
  const [profileRes, ordersRes, cartRes, wishlistRes] = await Promise.all([
    admin.from('profiles').select('*').eq('id', userId).maybeSingle(),
    admin.from('orders').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('cart').select('items').eq('user_id', userId).maybeSingle(),
    admin.from('wishlist').select('items').eq('user_id', userId).maybeSingle(),
  ]);

  const profileRow = profileRes.data as Record<string, unknown> | null;
  let profile: Record<string, unknown>;
  try {
    profile = profileRow
      ? fromProfileRow(profileRow)
      : { id: userId, email: userEmail };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Profile mapping failed';
    console.error('Admin sync-profile fromProfileRow:', msg);
    throw new Error(msg);
  }

  const ordersRow = ordersRes.data as { active_orders?: unknown; past_orders?: unknown } | null;
  const activeOrders = Array.isArray(ordersRow?.active_orders) ? ordersRow.active_orders : [];
  const pastOrders = Array.isArray(ordersRow?.past_orders) ? ordersRow.past_orders : [];
  const cartItems = Array.isArray((cartRes.data as { items?: unknown } | null)?.items)
    ? (cartRes.data as { items: unknown[] }).items
    : [];
  const wishlistItems = Array.isArray((wishlistRes.data as { items?: unknown } | null)?.items)
    ? (wishlistRes.data as { items: unknown[] }).items
    : [];

  return { profile, activeOrders, pastOrders, cartItems, wishlistItems };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return res.status(503).json({ error: 'Server not configured (missing SUPABASE_URL or SUPABASE_ANON_KEY)' });
  }

  let admin: ReturnType<typeof getSupabaseAdmin>;
  try {
    admin = getSupabaseAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Missing Supabase env';
    console.error('Admin sync-profile getSupabaseAdmin:', msg);
    return res.status(503).json({ error: msg });
  }

  // (1) Prefer Bearer token (same session as sign-in — no password needed)
  const authUser = await getAuthUser(req);
  if (authUser && isAllowedSyncEmail(authUser.email)) {
    try {
      const { profile, activeOrders, pastOrders, cartItems, wishlistItems } = await fetchSyncPayload(
        authUser.id,
        authUser.email,
        admin
      );
      return res.status(200).json({
        profile,
        activeOrders,
        pastOrders,
        cart: { items: cartItems },
        wishlist: { items: wishlistItems },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sync failed';
      console.error('Admin sync-profile (token) error:', e);
      return res.status(500).json({ error: msg });
    }
  }

  // (2) Fallback: email + password in body
  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }

  if (!isAllowedSyncEmail(email)) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  try {
    const supabase = createClient(url, anonKey);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (signInError || !signInData?.user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userId = signInData.user.id;
    const userEmail = signInData.user.email ?? email;

    const { profile, activeOrders, pastOrders, cartItems, wishlistItems } = await fetchSyncPayload(
      userId,
      userEmail,
      admin
    );

    return res.status(200).json({
      profile,
      activeOrders,
      pastOrders,
      cart: { items: cartItems },
      wishlist: { items: wishlistItems },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Sync failed';
    console.error('Admin sync-profile error:', e);
    return res.status(500).json({ error: msg });
  }
}
