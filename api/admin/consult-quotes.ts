import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';
import { getSupabaseAdmin } from '../_lib/supabase';
import { writeAuditLog } from '../_lib/auditLog';
import { randomInt } from 'node:crypto';

function initialsCode(firstName: string, lastName: string): string {
  const a = (firstName || '').trim().charAt(0).toUpperCase() || 'X';
  const b = (lastName || '').trim().charAt(0).toUpperCase() || 'X';
  const n = randomInt(0, 1000);
  return `${a}${b}${String(n).padStart(3, '0')}`;
}

/** POST /api/admin/consult-quotes — create consult offer + client alert (admin only). */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
  const clientEmail = String(body.clientEmail || body.client_email || '')
    .trim()
    .toLowerCase();
  const unitKey = String(body.unitKey || body.unit_key || '').trim() || 'NOIR';
  const selections = body.selections && typeof body.selections === 'object' ? body.selections : {};
  const priceBreakdown = Array.isArray(body.priceBreakdown) ? body.priceBreakdown : [];
  const adminMessage = String(body.adminMessage || body.admin_message || '').trim();
  const rawThumb = String(body.thumbnailSrc || body.thumbnail_src || '').trim();
  /** `data:` URLs are huge; DB `text` + PostgREST payloads break. Snapshot on the order still stores the image for VIEW OFFER. */
  const thumbnailSrc =
    rawThumb && !rawThumb.startsWith('data:') ? (rawThumb.length > 8000 ? rawThumb.slice(0, 8000) : rawThumb) : null;
  const firstName = String(body.clientFirstName || '').trim();
  const lastName = String(body.clientLastName || '').trim();

  if (!clientEmail) return res.status(400).json({ error: 'clientEmail required' });

  const supabase = getSupabaseAdmin();

  try {
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .ilike('email', clientEmail)
      .maybeSingle();

    if (profErr) return res.status(500).json({ error: profErr.message });
    const userId = (prof as { id?: string } | null)?.id;
    if (!userId) {
      return res.status(404).json({ error: 'No profile for this email — client must have an account.' });
    }

    const discountCode = `CONSULT-${initialsCode(firstName || (prof as any).first_name, lastName || (prof as any).last_name)}`;
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

    const { data: quote, error: insErr } = await supabase
      .from('consult_quotes')
      .insert({
        user_id: userId,
        client_email: clientEmail,
        unit_key: unitKey,
        selections,
        price_breakdown: priceBreakdown,
        admin_message: adminMessage || null,
        thumbnail_src: thumbnailSrc,
        discount_code: discountCode,
        discount_amount_usd: 40,
        expires_at: expiresAt,
      })
      .select('id, discount_code, expires_at, unit_key, selections, price_breakdown, admin_message, thumbnail_src, discount_amount_usd')
      .single();

    if (insErr) return res.status(500).json({ error: insErr.message });

    const quoteId = (quote as { id: string }).id;
    const notifText =
      '[YOUR ORDER IS READY! · CONSULT] WE\'VE CUSTOMIZED A UNIT JUST FOR YOU.';
    const newItem = {
      id: crypto.randomUUID(),
      text: notifText,
      read: false,
      createdAt: new Date().toISOString(),
      actionText: 'VIEW QUOTE',
      actionRoute: `/account/consult-offer?id=${encodeURIComponent(quoteId)}`,
      consultQuoteId: quoteId,
    };

    const { data: existing, error: fetchErr } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (fetchErr) return res.status(500).json({ error: fetchErr.message });

    const items = Array.isArray((existing as { items?: unknown[] } | null)?.items)
      ? (existing as { items: unknown[] }).items
      : [];
    const next = [...items, newItem];

    if (existing) {
      const { error: updErr } = await supabase
        .from('notifications')
        .update({ items: next, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (updErr) return res.status(500).json({ error: updErr.message });
    } else {
      const { error: insN } = await supabase.from('notifications').insert({ user_id: userId, items: next });
      if (insN) return res.status(500).json({ error: insN.message });
    }

    await writeAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'consult_quote.create',
      resourceType: 'consult_quotes',
      resourceId: quoteId,
      details: { clientEmail, discountCode },
    });

    return res.status(201).json({
      quote,
      discountCode,
      message: 'Consult quote sent',
    });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}
