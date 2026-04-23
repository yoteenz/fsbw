import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';
import { getSupabaseUser } from './_lib/supabase.js';

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
      .from('cart')
      .select('items, version')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    const row = data as { items?: unknown; version?: unknown } | null;
    const items = row?.items ?? [];
    const versionRaw = row?.version;
    const version =
      typeof versionRaw === 'number' && Number.isFinite(versionRaw) && versionRaw >= 1
        ? Math.floor(versionRaw)
        : 1;
    return res.status(200).json({ items: Array.isArray(items) ? items : [], version });
  }

  if (req.method === 'PUT') {
    const body =
      req.body && typeof req.body === 'object' && !Array.isArray(req.body)
        ? (req.body as Record<string, unknown>)
        : {};
    const items = Array.isArray((body as { items?: unknown }).items)
      ? (body as { items: unknown[] }).items
      : [];
    const baseVersionRaw = (body as { baseVersion?: unknown }).baseVersion;
    let baseVersion: number | null =
      baseVersionRaw === null || baseVersionRaw === undefined
        ? null
        : typeof baseVersionRaw === 'number' && Number.isFinite(baseVersionRaw)
          ? Math.floor(baseVersionRaw)
          : typeof baseVersionRaw === 'string' && baseVersionRaw.trim()
            ? parseInt(baseVersionRaw, 10)
            : null;
    if (baseVersion != null && (!Number.isFinite(baseVersion) || baseVersion < 1)) baseVersion = null;
    const now = new Date().toISOString();

    const { data: existingRow, error: selErr } = await supabase
      .from('cart')
      .select('id, version')
      .eq('user_id', user.id)
      .maybeSingle();
    if (selErr) return res.status(500).json({ error: selErr.message });

    const existing = existingRow as { id?: string; version?: unknown } | null;
    const currentVersion =
      existing &&
      typeof existing.version === 'number' &&
      Number.isFinite(existing.version) &&
      existing.version >= 1
        ? Math.floor(existing.version)
        : existing
          ? 1
          : null;

    if (existing?.id && baseVersion != null && currentVersion != null && baseVersion !== currentVersion) {
      return res.status(409).json({
        error: 'cart_version_conflict',
        serverVersion: currentVersion,
      });
    }

    const nextVersion = currentVersion != null ? currentVersion + 1 : 1;

    if (existing?.id) {
      const { data, error } = await supabase
        .from('cart')
        .update({ items, updated_at: now, version: nextVersion })
        .eq('user_id', user.id)
        .select('items, version')
        .single();
      if (error) return res.status(500).json({ error: error.message });
      const row = data as { items: unknown; version?: unknown };
      const v =
        typeof row.version === 'number' && Number.isFinite(row.version) ? Math.floor(row.version) : nextVersion;
      return res.status(200).json({ items: Array.isArray(row.items) ? row.items : [], version: v });
    }

    const { data, error } = await supabase
      .from('cart')
      .insert({ user_id: user.id, items, version: 1, updated_at: now })
      .select('items, version')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    const row = data as { items: unknown; version?: unknown };
    const v = typeof row.version === 'number' && Number.isFinite(row.version) ? Math.floor(row.version) : 1;
    return res.status(200).json({ items: Array.isArray(row.items) ? row.items : [], version: v });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
