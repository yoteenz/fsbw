/**
 * Server-side PSA member snapshot — cart + active orders + tier (refreshed on thread load).
 */
import { getSupabaseAdminServiceRole, getSupabaseUser } from './supabase.js';
import type { PsaPremiumProfile } from './psaPremiumCheck.js';
import { getPsaEngagementLimits } from './psaEngagementLimits.js';
import { canAccessLiveOrderTracking } from './psaFeatureGates.js';
import { summarizeOrderForPsaWithTrackingGate } from './psaOrderTracking.js';

import type { PsaMemberMemory } from './psaMemberMemories.js';

export type PsaBawDraftSnapshot = {
  unitId: string;
  unitLabel: string;
  buildPath: string;
  label?: string;
  savedAt: string;
};

export type PsaMemberContextSnapshot = {
  tierLabel: string;
  subscriptionTier: string | null;
  cart: {
    itemCount: number;
    unitNames: string[];
  };
  activeOrders: {
    orderNumber: string | null;
    status: string | null;
    productName: string | null;
    needsOrderForm: boolean;
  }[];
  memories?: PsaMemberMemory[];
  hairProfile?: string | null;
  bawDraft?: PsaBawDraftSnapshot | null;
  refreshedAt: string;
};

import { formatPsaMemoriesBlock } from './psaMemberMemories.js';

export function formatPsaMemberContextBlock(snapshot: PsaMemberContextSnapshot | null): string {
  if (!snapshot) return '';
  const lines = [
    '## Member snapshot (server — authoritative for cart/orders on load)',
    `- Plan: ${snapshot.tierLabel}`,
    `- Cart: ${snapshot.cart.itemCount} item(s)${snapshot.cart.unitNames.length ? ` (${snapshot.cart.unitNames.join(', ')})` : ''}`,
  ];
  if (snapshot.activeOrders.length) {
    lines.push('- Active orders:');
    for (const o of snapshot.activeOrders.slice(0, 5)) {
      const formNote = o.needsOrderForm ? ' — unsigned form' : '';
      lines.push(
        `  - ${o.orderNumber ?? 'order'}: ${o.status ?? 'unknown'}${o.productName ? ` (${o.productName})` : ''}${formNote}`
      );
    }
  } else {
    lines.push('- Active orders: none');
  }
  if (snapshot.bawDraft?.buildPath) {
    lines.push(
      `- Saved Build-a-Wig draft: ${snapshot.bawDraft.unitLabel} (${snapshot.bawDraft.buildPath})${snapshot.bawDraft.label ? ` — ${snapshot.bawDraft.label}` : ''}`
    );
  }
  lines.push(`- Snapshot refreshed: ${snapshot.refreshedAt}`);
  return `\n${lines.join('\n')}\n${formatPsaMemoriesBlock(snapshot)}`;
}

async function fetchOrdersForContext(userId: string, accessToken: string): Promise<unknown[]> {
  const supabase = getSupabaseUser(accessToken);
  const { data, error } = await supabase
    .from('orders')
    .select('active_orders')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return [];
  const row = data as { active_orders?: unknown } | null;
  return Array.isArray(row?.active_orders) ? row!.active_orders! : [];
}

async function fetchCartForContext(userId: string, accessToken: string): Promise<unknown[]> {
  const supabase = getSupabaseUser(accessToken);
  const { data, error } = await supabase
    .from('cart')
    .select('items')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return [];
  const row = data as { items?: unknown } | null;
  return Array.isArray(row?.items) ? row!.items! : [];
}

export async function buildPsaMemberContextSnapshot(input: {
  userId: string;
  accessToken: string;
  premium: PsaPremiumProfile;
}): Promise<PsaMemberContextSnapshot> {
  const limits = getPsaEngagementLimits(input.premium);
  const liveTracking = canAccessLiveOrderTracking(input.premium);

  const [cartItems, activeOrders] = await Promise.all([
    fetchCartForContext(input.userId, input.accessToken),
    fetchOrdersForContext(input.userId, input.accessToken),
  ]);

  const unitNames = (cartItems as Record<string, unknown>[])
    .map((i) => String(i.name ?? '').trim())
    .filter(Boolean)
    .slice(0, 8);

  const orders = (activeOrders as Record<string, unknown>[])
    .filter((o) => o && typeof o === 'object')
    .slice(0, 6)
    .map((o) => {
      const s = summarizeOrderForPsaWithTrackingGate(o, liveTracking);
      return {
        orderNumber: typeof s.orderNumber === 'string' ? s.orderNumber : null,
        status: typeof s.status === 'string' ? s.status : null,
        productName: typeof s.productName === 'string' ? s.productName : null,
        needsOrderForm: s.requiresOrderForm === true && s.orderFormSigned !== true,
      };
    });

  return {
    tierLabel: limits.tierLabel,
    subscriptionTier: input.premium.subscriptionTier ?? null,
    cart: { itemCount: cartItems.length, unitNames },
    activeOrders: orders,
    refreshedAt: new Date().toISOString(),
  };
}

export async function refreshPsaMemberContext(input: {
  userId: string;
  accessToken: string;
  premium: PsaPremiumProfile;
}): Promise<PsaMemberContextSnapshot> {
  const existing = await getPsaMemberContext(input.userId);
  const snapshot = await buildPsaMemberContextSnapshot(input);
  const merged: PsaMemberContextSnapshot = {
    ...snapshot,
    memories: existing?.memories ?? [],
    hairProfile: existing?.hairProfile ?? null,
    bawDraft: existing?.bawDraft ?? null,
  };
  try {
    const supabase = getSupabaseAdminServiceRole();
    await supabase.from('psa_member_context').upsert({
      user_id: input.userId,
      context: merged,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[psaMemberContext] upsert failed', err);
  }
  return merged;
}

export async function getPsaMemberContext(userId: string): Promise<PsaMemberContextSnapshot | null> {
  try {
    const supabase = getSupabaseAdminServiceRole();
    const { data, error } = await supabase
      .from('psa_member_context')
      .select('context')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    const ctx = (data as { context?: PsaMemberContextSnapshot }).context;
    return ctx && typeof ctx === 'object' ? ctx : null;
  } catch {
    return null;
  }
}
