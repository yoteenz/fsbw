import type { SupabaseClient } from '@supabase/supabase-js';

export type SlayTicketTransactionType = 'earned' | 'used' | 'purchased' | 'adjusted' | 'expired';

export type SlayTicketLineItem = {
  name?: string;
  productName?: string;
  type?: string;
  quantity?: number;
  slayTicketPackCount?: number;
  slayTicketProduct?: boolean;
};

const WIG_UNIT_NAMES = new Set([
  'NOIR',
  'BLANCO',
  'SOFT WAVE',
  'BEACH WAVE',
  'SOFT CURL',
  'OCEAN CURL',
]);

function normalizeProductName(line: SlayTicketLineItem): string {
  const raw = String(line.productName || line.name || '').trim().toUpperCase();
  return raw;
}

export function isSlayTicketPackLine(line: SlayTicketLineItem | null | undefined): boolean {
  if (!line) return false;
  if (line.slayTicketProduct === true) return true;
  if (typeof line.slayTicketPackCount === 'number' && line.slayTicketPackCount > 0) return true;
  return /\bSLAY\s+TICKETS?\b/i.test(String(line.name || ''));
}

export function isPhysicalHairProductLine(line: SlayTicketLineItem | null | undefined): boolean {
  if (!line) return false;
  const type = String(line.type || '');
  const name = normalizeProductName(line);
  if (!name) return false;
  if (type === 'gift-card' || name === 'GIFT CARD') return false;
  if (type === 'digital' || type === 'hairstyle-analysis') return false;
  if (isSlayTicketPackLine(line)) return false;
  if (type === 'booking-appointment' || type === 'booking-consult') return false;
  if (/\b(3|6|12)\s*MONTHS\b/i.test(name) && type === 'digital') return false;
  if (type === 'shop-texture-category') return true;
  return WIG_UNIT_NAMES.has(name);
}

export function slayTicketsEarnedForLineItems(lines: SlayTicketLineItem[] | null | undefined): number {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce((sum, line) => {
    if (!isPhysicalHairProductLine(line)) return sum;
    const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
    return sum + 2 * qty;
  }, 0);
}

export function slayTicketsPurchasedForLineItems(lines: SlayTicketLineItem[] | null | undefined): number {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce((sum, line) => {
    if (!isSlayTicketPackLine(line)) return sum;
    const pack = Math.max(0, Math.floor(Number(line.slayTicketPackCount) || 0));
    if (pack > 0) {
      const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
      return sum + pack * qty;
    }
    const match = String(line.name || '').match(/(\d+)\s*SLAY\s+TICKETS?/i);
    if (match) {
      const qty = Math.max(1, Math.floor(Number(line.quantity) || 1));
      return sum + Number(match[1]) * qty;
    }
    return sum;
  }, 0);
}

export type SlayTicketTransactionRow = {
  id: string;
  type: SlayTicketTransactionType;
  amount: number;
  source: string | null;
  description: string;
  related_order_id: string | null;
  related_content_id: string | null;
  created_at: string;
};

export type LoungeContentUnlockRow = {
  id: string;
  content_id: string;
  ticket_cost: number;
  unlocked_at: string;
  access_type: string;
  expires_at: string | null;
};

async function readBalance(supabase: SupabaseClient, userId: string): Promise<number> {
  const { data } = await supabase
    .from('profiles')
    .select('slay_ticket_balance')
    .eq('id', userId)
    .maybeSingle();
  return Math.max(0, Math.floor(Number((data as { slay_ticket_balance?: number } | null)?.slay_ticket_balance) || 0));
}

async function writeBalance(supabase: SupabaseClient, userId: string, balance: number): Promise<void> {
  await supabase
    .from('profiles')
    .update({ slay_ticket_balance: Math.max(0, balance), updated_at: new Date().toISOString() })
    .eq('id', userId);
}

async function insertTransaction(
  supabase: SupabaseClient,
  row: {
    userId: string;
    type: SlayTicketTransactionType;
    amount: number;
    source?: string;
    description: string;
    relatedOrderId?: string;
    relatedContentId?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('slay_ticket_transactions').insert({
    user_id: row.userId,
    type: row.type,
    amount: row.amount,
    source: row.source ?? null,
    description: row.description,
    related_order_id: row.relatedOrderId ?? null,
    related_content_id: row.relatedContentId ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function creditSlayTicketsForOrder(
  supabase: SupabaseClient,
  userId: string,
  params: { orderId: string; lineItems: SlayTicketLineItem[] }
): Promise<{ ok: boolean; credited: number; balance: number; error?: string }> {
  const earned = slayTicketsEarnedForLineItems(params.lineItems);
  const purchased = slayTicketsPurchasedForLineItems(params.lineItems);
  const totalCredit = earned + purchased;
  if (totalCredit <= 0) {
    const balance = await readBalance(supabase, userId);
    return { ok: true, credited: 0, balance };
  }

  if (earned > 0) {
    const { data: existingEarn } = await supabase
      .from('slay_ticket_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('related_order_id', params.orderId)
      .eq('type', 'earned')
      .maybeSingle();
    if (!existingEarn) {
      const balance = await readBalance(supabase, userId);
      const next = balance + earned;
      await writeBalance(supabase, userId, next);
      const result = await insertTransaction(supabase, {
        userId,
        type: 'earned',
        amount: earned,
        source: 'order',
        description: `EARNED FROM PHYSICAL HAIR PURCHASE (+${earned})`,
        relatedOrderId: params.orderId,
      });
      if (!result.ok) return { ok: false, credited: 0, balance, error: result.error };
    }
  }

  if (purchased > 0) {
    const { data: existingPurchase } = await supabase
      .from('slay_ticket_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('related_order_id', params.orderId)
      .eq('type', 'purchased')
      .maybeSingle();
    if (!existingPurchase) {
      const balance = await readBalance(supabase, userId);
      const next = balance + purchased;
      await writeBalance(supabase, userId, next);
      const result = await insertTransaction(supabase, {
        userId,
        type: 'purchased',
        amount: purchased,
        source: 'purchase',
        description: `SLAY TICKET PACK PURCHASE (+${purchased})`,
        relatedOrderId: params.orderId,
      });
      if (!result.ok) return { ok: false, credited: 0, balance, error: result.error };
    }
  }

  const balance = await readBalance(supabase, userId);
  return { ok: true, credited: totalCredit, balance };
}

export async function unlockLoungeContentWithTickets(
  supabase: SupabaseClient,
  userId: string,
  params: {
    contentId: string;
    ticketCost: number;
    accessType?: 'permanent' | 'rental';
    expiresAt?: string | null;
    contentTitle?: string;
  }
): Promise<{ ok: boolean; balance: number; error?: string; alreadyUnlocked?: boolean }> {
  const cost = Math.max(0, Math.floor(params.ticketCost));
  const contentId = params.contentId.trim();
  if (!contentId) return { ok: false, balance: 0, error: 'Missing content id' };

  const { data: existingUnlock } = await supabase
    .from('lounge_content_unlocks')
    .select('id, expires_at')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .maybeSingle();

  if (existingUnlock) {
    const exp = (existingUnlock as { expires_at?: string | null }).expires_at;
    if (!exp || new Date(exp).getTime() > Date.now()) {
      const balance = await readBalance(supabase, userId);
      return { ok: true, balance, alreadyUnlocked: true };
    }
  }

  if (cost === 0) {
    await supabase.from('lounge_content_unlocks').upsert(
      {
        user_id: userId,
        content_id: contentId,
        ticket_cost: 0,
        access_type: params.accessType || 'permanent',
        expires_at: params.expiresAt ?? null,
        unlocked_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,content_id' }
    );
    const balance = await readBalance(supabase, userId);
    return { ok: true, balance };
  }

  const balance = await readBalance(supabase, userId);
  if (balance < cost) {
    return { ok: false, balance, error: 'Insufficient Slay Tickets' };
  }

  const nextBalance = balance - cost;
  await writeBalance(supabase, userId, nextBalance);

  const title = (params.contentTitle || contentId).toUpperCase();
  const tx = await insertTransaction(supabase, {
    userId,
    type: 'used',
    amount: -cost,
    source: 'lounge_tv',
    description: `UNLOCKED ${title} (-${cost})`,
    relatedContentId: contentId,
  });
  if (!tx.ok) {
    await writeBalance(supabase, userId, balance);
    return { ok: false, balance, error: tx.error };
  }

  await supabase.from('lounge_content_unlocks').upsert(
    {
      user_id: userId,
      content_id: contentId,
      ticket_cost: cost,
      access_type: params.accessType || 'permanent',
      expires_at: params.expiresAt ?? null,
      unlocked_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,content_id' }
  );

  return { ok: true, balance: nextBalance };
}

export async function fetchSlayTicketState(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  balance: number;
  history: SlayTicketTransactionRow[];
  unlocks: LoungeContentUnlockRow[];
}> {
  const balance = await readBalance(supabase, userId);
  const { data: history } = await supabase
    .from('slay_ticket_transactions')
    .select('id, type, amount, source, description, related_order_id, related_content_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  const { data: unlocks } = await supabase
    .from('lounge_content_unlocks')
    .select('id, content_id, ticket_cost, unlocked_at, access_type, expires_at')
    .eq('user_id', userId);

  return {
    balance,
    history: (history as SlayTicketTransactionRow[]) || [],
    unlocks: (unlocks as LoungeContentUnlockRow[]) || [],
  };
}
