import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { getSupabaseUser } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabaseUser(user.accessToken);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('wishlist')
      .select('items')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    const items = (data as { items?: unknown } | null)?.items ?? [];
    return res.status(200).json({ items: Array.isArray(items) ? items : [] });
  }

  if (req.method === 'PUT') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const items = Array.isArray(body.items) ? body.items : [];
    const { data: existing } = await supabase.from('wishlist').select('id').eq('user_id', user.id).maybeSingle();
    if (existing) {
      const { data, error } = await supabase
        .from('wishlist')
        .update({ items, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select('items')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ items: (data as { items: unknown }).items ?? [] });
    } else {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, items })
        .select('items')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ items: (data as { items: unknown }).items ?? [] });
    }
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
    const item = body.item;
    const { data: row, error: fetchError } = await supabase
      .from('wishlist')
      .select('items')
      .eq('user_id', user.id)
      .maybeSingle();
    if (fetchError) return res.status(500).json({ error: fetchError.message });
    const items = Array.isArray((row as { items?: unknown } | null)?.items)
      ? (row as { items: unknown[] }).items
      : [];
    const next = [...items, item];
    if (row) {
      const { data, error } = await supabase
        .from('wishlist')
        .update({ items: next, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select('items')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ items: (data as { items: unknown }).items ?? [] });
    } else {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, items: next })
        .select('items')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ items: (data as { items: unknown }).items ?? [] });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
