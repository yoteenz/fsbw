import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth';
import { getSupabaseUser } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabaseUser(user.accessToken);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });

    if (!data) {
      return res.status(200).json({ activeOrders: [], pastOrders: [] });
    }
    const row = data as { active_orders?: unknown; past_orders?: unknown };
    return res.status(200).json({
      activeOrders: row.active_orders ?? [],
      pastOrders: row.past_orders ?? [],
    });
  }

  if (req.method === 'PUT') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const activeOrders = Array.isArray((body as { activeOrders?: unknown }).activeOrders)
      ? (body as { activeOrders: unknown[] }).activeOrders
      : [];
    const pastOrders = Array.isArray((body as { pastOrders?: unknown }).pastOrders)
      ? (body as { pastOrders: unknown[] }).pastOrders
      : [];
    const { data: existing } = await supabase.from('orders').select('id').eq('user_id', user.id).maybeSingle();
    if (existing) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          active_orders: activeOrders,
          past_orders: pastOrders,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select('active_orders, past_orders')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      const row = data as { active_orders?: unknown; past_orders?: unknown };
      return res.status(200).json({
        activeOrders: row.active_orders ?? [],
        pastOrders: row.past_orders ?? [],
      });
    }
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        active_orders: activeOrders,
        past_orders: pastOrders,
      })
      .select('active_orders, past_orders')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    const row = data as { active_orders?: unknown; past_orders?: unknown };
    return res.status(200).json({
      activeOrders: row.active_orders ?? [],
      pastOrders: row.past_orders ?? [],
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
