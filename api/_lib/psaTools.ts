/**
 * PSA v2 action tools — member-scoped reads/writes (orders, cart, booking handoff).
 * See docs/PSA_TOOLS.md
 */
import { getSupabaseUser } from './supabase.js';
import { summarizeOrderForPsa } from './psaOrderTracking.js';
import { PSA_PRODUCTS } from './psaKnowledge.js';
import { resolveQuote, type QuoteLineInput } from './pricing/resolveQuote.js';
import type { PsaPremiumProfile } from './psaPremiumCheck.js';

export type PsaToolContext = {
  userId: string;
  email: string;
  accessToken: string;
  userName?: string;
  premium?: PsaPremiumProfile | null;
};

export type PsaClientAction =
  | { type: 'sync_cart' }
  | { type: 'navigate'; path: string };

export type PsaToolExecutionResult = {
  output: string;
  clientActions?: PsaClientAction[];
};

const UNIT_BASE_USD = 740;

export const PSA_ACTION_TOOL_DEFINITIONS = [
  {
    type: 'function',
    name: 'get_member_orders',
    description:
      'List the signed-in member active (and optionally past) orders with status and tracking stage. Use for "where is my order" before guessing.',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max orders to return (default 5).' },
        includePast: { type: 'boolean', description: 'Include past/delivered orders.' },
      },
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: 'function',
    name: 'get_order_status',
    description:
      'Look up one order by order number (e.g. ORDER #332) or internal id. Returns tracking stage, carrier link, form status.',
    parameters: {
      type: 'object',
      properties: {
        orderNumber: { type: 'string', description: 'Order number or id fragment.' },
      },
      required: ['orderNumber'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_member_cart',
    description: 'Read the member cloud cart (items + version). Use before add_to_cart.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    strict: true,
  },
  {
    type: 'function',
    name: 'add_to_cart',
    description:
      'Add a unit or booking line to the member cart. Consult requires inspo photo URLs. Appointment requires premium + date/time. User must still complete /checkout/bookings.',
    parameters: {
      type: 'object',
      properties: {
        lineType: {
          type: 'string',
          enum: ['unit', 'booking-consult', 'booking-appointment'],
        },
        unitId: { type: 'string', description: 'For lineType unit: noir, blanco, soft-wave, etc.' },
        capSize: { type: 'string' },
        quantity: { type: 'number' },
        bookingTier: { type: 'string', enum: ['standard', 'premium'] },
        bookingHairOption: { type: 'string', enum: ['WIG ONLY', 'WIG + INSTALL'] },
        bookingHeadMeasurements: { type: 'object', additionalProperties: { type: 'string' } },
        bookingInspoPhotoUrls: { type: 'array', items: { type: 'string' } },
        bookingPreferredDate: { type: 'string', description: 'YYYY-MM-DD' },
        bookingPreferredTime: { type: 'string' },
        bookingNotes: { type: 'string' },
        bookingInstallKind: { type: 'string', enum: ['NEW_INSTALL', 'RE_INSTALL'] },
        bookingStyle: { type: 'string' },
        bookingPartDirection: { type: 'string' },
        bookingAddonIds: { type: 'array', items: { type: 'string' } },
      },
      required: ['lineType'],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: 'function',
    name: 'prepare_booking_handoff',
    description:
      'When booking cannot be added to cart yet (missing photos, date, premium, etc.), return missing fields and the booking page path.',
    parameters: {
      type: 'object',
      properties: {
        bookingType: { type: 'string', enum: ['consult', 'appointment'] },
        collected: { type: 'object', additionalProperties: true },
      },
      required: ['bookingType'],
      additionalProperties: false,
    },
    strict: false,
  },
  {
    type: 'function',
    name: 'send_priority_message',
    description:
      'Send a priority message to the Concierge team (6mo+ premium). For human follow-up when PSA cannot resolve.',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        isOrderRelated: { type: 'boolean' },
        relatedOrderId: { type: 'string' },
        isUrgent: { type: 'boolean' },
      },
      required: ['message'],
      additionalProperties: false,
    },
    strict: false,
  },
] as const;

async function fetchOrders(ctx: PsaToolContext): Promise<{ active: unknown[]; past: unknown[] }> {
  const supabase = getSupabaseUser(ctx.accessToken);
  const { data, error } = await supabase.from('orders').select('active_orders, past_orders').eq('user_id', ctx.userId).maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as { active_orders?: unknown; past_orders?: unknown } | null;
  return {
    active: Array.isArray(row?.active_orders) ? row!.active_orders! : [],
    past: Array.isArray(row?.past_orders) ? row!.past_orders! : [],
  };
}

async function fetchCart(ctx: PsaToolContext): Promise<{ items: unknown[]; version: number }> {
  const supabase = getSupabaseUser(ctx.accessToken);
  const { data, error } = await supabase.from('cart').select('items, version').eq('user_id', ctx.userId).maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as { items?: unknown; version?: number } | null;
  const items = Array.isArray(row?.items) ? row!.items! : [];
  const version = typeof row?.version === 'number' && row.version >= 1 ? Math.floor(row.version) : 1;
  return { items, version };
}

async function putCart(ctx: PsaToolContext, items: unknown[], baseVersion: number | null): Promise<{ items: unknown[]; version: number }> {
  const supabase = getSupabaseUser(ctx.accessToken);
  const now = new Date().toISOString();
  const { data: existingRow } = await supabase.from('cart').select('id, version').eq('user_id', ctx.userId).maybeSingle();
  const existing = existingRow as { id?: string; version?: number } | null;
  const currentVersion =
    existing && typeof existing.version === 'number' && existing.version >= 1 ? Math.floor(existing.version) : existing ? 1 : null;

  if (existing?.id && baseVersion != null && currentVersion != null && baseVersion !== currentVersion) {
    throw new Error(`cart_version_conflict:${currentVersion}`);
  }

  const nextVersion = currentVersion != null ? currentVersion + 1 : 1;

  if (existing?.id) {
    const { data, error } = await supabase
      .from('cart')
      .update({ items, updated_at: now, version: nextVersion })
      .eq('user_id', ctx.userId)
      .select('items, version')
      .single();
    if (error) throw new Error(error.message);
    const row = data as { items: unknown; version?: number };
    return {
      items: Array.isArray(row.items) ? row.items : [],
      version: typeof row.version === 'number' ? row.version : nextVersion,
    };
  }

  const { data, error } = await supabase
    .from('cart')
    .insert({ user_id: ctx.userId, items, version: 1, updated_at: now })
    .select('items, version')
    .single();
  if (error) throw new Error(error.message);
  const row = data as { items: unknown; version?: number };
  return { items: Array.isArray(row.items) ? row.items : [], version: row.version ?? 1 };
}

function findOrder(orders: unknown[], query: string): Record<string, unknown> | null {
  const q = query.trim().toUpperCase().replace(/\s+/g, ' ');
  for (const raw of orders) {
    if (!raw || typeof raw !== 'object') continue;
    const o = raw as Record<string, unknown>;
    const num = String(o.orderNumber ?? '').toUpperCase().replace(/\s+/g, ' ');
    const id = String(o.id ?? '');
    if (num.includes(q) || q.includes(num) || id === query.trim()) return o;
  }
  return null;
}

function canSendPriorityMessage(premium: PsaPremiumProfile | null | undefined): boolean {
  if (!premium?.isPremium) return false;
  const tier = (premium.subscriptionTier ?? '').toLowerCase();
  if (tier === '6months' || tier === '12months') return true;
  if ((premium.tierName ?? '').toUpperCase() === 'BLACK') return true;
  return false;
}

function consultMissingFields(args: Record<string, unknown>, premium: PsaPremiumProfile | null | undefined): string[] {
  const missing: string[] = [];
  const measurements = args.bookingHeadMeasurements as Record<string, string> | undefined;
  if (!measurements?.circumference?.trim()) missing.push('bookingHeadMeasurements.circumference');
  if (!measurements?.frontToNape?.trim()) missing.push('bookingHeadMeasurements.frontToNape');
  const photos = args.bookingInspoPhotoUrls;
  if (!Array.isArray(photos) || photos.length === 0) missing.push('bookingInspoPhotoUrls');
  const hairOption = String(args.bookingHairOption ?? 'WIG ONLY');
  if (hairOption === 'WIG + INSTALL') {
    if (!premium?.isPremium) missing.push('premium_membership');
    if (!String(args.bookingPreferredDate ?? '').trim()) missing.push('bookingPreferredDate');
    if (!String(args.bookingPreferredTime ?? '').trim()) missing.push('bookingPreferredTime');
  }
  return missing;
}

function appointmentMissingFields(args: Record<string, unknown>, premium: PsaPremiumProfile | null | undefined): string[] {
  const missing: string[] = [];
  if (!premium?.isPremium) missing.push('premium_membership');
  if (!String(args.bookingInstallKind ?? '').trim()) missing.push('bookingInstallKind');
  if (!String(args.bookingPreferredDate ?? '').trim()) missing.push('bookingPreferredDate');
  if (!String(args.bookingPreferredTime ?? '').trim()) missing.push('bookingPreferredTime');
  return missing;
}

export async function executePsaActionTool(
  name: string,
  args: Record<string, unknown>,
  ctx: PsaToolContext
): Promise<PsaToolExecutionResult> {
  switch (name) {
    case 'get_member_orders': {
      const limit = typeof args.limit === 'number' ? Math.min(10, Math.max(1, Math.floor(args.limit))) : 5;
      const includePast = args.includePast === true;
      const { active, past } = await fetchOrders(ctx);
      const pool = [...active, ...(includePast ? past : [])].slice(0, limit);
      const orders = pool
        .filter((o) => o && typeof o === 'object')
        .map((o) => summarizeOrderForPsa(o as Record<string, unknown>));
      return { output: JSON.stringify({ orders, count: orders.length }) };
    }

    case 'get_order_status': {
      const orderNumber = typeof args.orderNumber === 'string' ? args.orderNumber.trim() : '';
      if (!orderNumber) return { output: JSON.stringify({ error: 'orderNumber required' }) };
      const { active, past } = await fetchOrders(ctx);
      const found = findOrder([...active, ...past], orderNumber);
      if (!found) return { output: JSON.stringify({ error: 'Order not found', orderNumber }) };
      return { output: JSON.stringify({ order: summarizeOrderForPsa(found) }) };
    }

    case 'get_member_cart': {
      const cart = await fetchCart(ctx);
      const summary = (cart.items as Record<string, unknown>[]).map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        price: item.price,
        quantity: item.quantity ?? 1,
      }));
      return { output: JSON.stringify({ items: summary, itemCount: summary.length, version: cart.version }) };
    }

    case 'add_to_cart': {
      const lineType = String(args.lineType ?? '');
      const cart = await fetchCart(ctx);
      const nextItems = [...cart.items];
      const clientActions: PsaClientAction[] = [{ type: 'sync_cart' }];

      if (lineType === 'unit') {
        const unitId = String(args.unitId ?? '').toLowerCase();
        const product = PSA_PRODUCTS.find((p) => p.id === unitId);
        if (!product) {
          return { output: JSON.stringify({ error: 'Unknown unitId', validIds: PSA_PRODUCTS.map((p) => p.id) }) };
        }
        const capSize = typeof args.capSize === 'string' && args.capSize.trim() ? args.capSize.trim() : 'S/M/L';
        const qty = typeof args.quantity === 'number' && args.quantity > 0 ? Math.floor(args.quantity) : 1;
        const line = {
          id: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: product.name,
          price: UNIT_BASE_USD,
          quantity: qty,
          capSize,
          texture: product.texture,
          type: 'unit',
          image: `/assets/${product.id}.png`,
        };
        nextItems.push(line);
        const updated = await putCart(ctx, nextItems, cart.version);
        clientActions.push({ type: 'navigate', path: '/bag' });
        return {
          output: JSON.stringify({
            ok: true,
            added: line.name,
            cartItemCount: updated.items.length,
            note: 'Base unit added at default price — customize length/color in Build-a-Wig or bag.',
            buildAWigPath: product.buildAWigPath,
          }),
          clientActions,
        };
      }

      if (lineType === 'booking-consult') {
        const missing = consultMissingFields(args, ctx.premium);
        if (missing.length > 0) {
          return {
            output: JSON.stringify({
              ok: false,
              missing,
              nextPath: ctx.premium?.isPremium ? '/booking/premium/consultation' : '/booking/consultation',
            }),
          };
        }
        const tier = ctx.premium?.isPremium ? 'premium' : 'standard';
        const line = {
          id: `consult-${Date.now()}`,
          name: 'WIG CONSULT',
          price: 40,
          quantity: 1,
          type: 'booking-consult',
          bookingTier: tier,
          bookingHairOption: args.bookingHairOption ?? 'WIG ONLY',
          bookingHeadMeasurements: args.bookingHeadMeasurements,
          bookingInspoPhotoUrls: args.bookingInspoPhotoUrls,
          bookingInspoFileNames: [],
          bookingNotes: args.bookingNotes ?? '',
          bookingPreferredDate: args.bookingPreferredDate,
          bookingPreferredTime: args.bookingPreferredTime,
        };
        nextItems.push(line);
        await putCart(ctx, nextItems, cart.version);
        clientActions.push({ type: 'navigate', path: '/checkout/bookings' });
        return {
          output: JSON.stringify({ ok: true, checkoutPath: '/checkout/bookings', depositUsd: 40 }),
          clientActions,
        };
      }

      if (lineType === 'booking-appointment') {
        const missing = appointmentMissingFields(args, ctx.premium);
        if (missing.length > 0) {
          return {
            output: JSON.stringify({ ok: false, missing, nextPath: '/booking/premium/appointment' }),
          };
        }
        const quoteLine: QuoteLineInput = {
          name: 'WIG INSTALLATION',
          quantity: 1,
          type: 'booking-appointment',
          bookingInstallKind: String(args.bookingInstallKind),
          bookingStyle: typeof args.bookingStyle === 'string' ? args.bookingStyle : undefined,
          bookingAddonIds: Array.isArray(args.bookingAddonIds) ? (args.bookingAddonIds as string[]) : [],
        };
        const quote = resolveQuote([quoteLine]);
        const priceUsd = quote.totalCents / 100;
        const line = {
          id: `appt-${Date.now()}`,
          name: 'WIG INSTALLATION',
          price: priceUsd,
          quantity: 1,
          type: 'booking-appointment',
          bookingTier: 'premium',
          bookingInstallKind: args.bookingInstallKind,
          bookingStyle: args.bookingStyle ?? 'BONE STRAIGHT',
          bookingPartDirection: args.bookingPartDirection ?? 'MIDDLE',
          bookingAddonIds: args.bookingAddonIds ?? [],
          bookingPreferredDate: args.bookingPreferredDate,
          bookingPreferredTime: args.bookingPreferredTime,
          bookingNotes: args.bookingNotes ?? '',
        };
        nextItems.push(line);
        await putCart(ctx, nextItems, cart.version);
        clientActions.push({ type: 'navigate', path: '/checkout/bookings' });
        return {
          output: JSON.stringify({ ok: true, checkoutPath: '/checkout/bookings', totalUsd: priceUsd }),
          clientActions,
        };
      }

      return { output: JSON.stringify({ error: 'Invalid lineType' }) };
    }

    case 'prepare_booking_handoff': {
      const bookingType = String(args.bookingType ?? 'consult');
      const collected = (args.collected && typeof args.collected === 'object' ? args.collected : {}) as Record<
        string,
        unknown
      >;
      const missing =
        bookingType === 'appointment'
          ? appointmentMissingFields(collected, ctx.premium)
          : consultMissingFields(collected, ctx.premium);
      const nextPath =
        bookingType === 'appointment'
          ? '/booking/premium/appointment'
          : ctx.premium?.isPremium
            ? '/booking/premium/consultation'
            : '/booking/consultation';
      return {
        output: JSON.stringify({
          readyForCart: missing.length === 0,
          missing,
          nextPath,
          collected,
        }),
      };
    }

    case 'send_priority_message': {
      if (!canSendPriorityMessage(ctx.premium)) {
        return {
          output: JSON.stringify({
            error: 'Priority messages require 6-month, 12-month premium, or BLACK tier.',
            nextPath: '/brand/contact',
          }),
        };
      }
      const message = typeof args.message === 'string' ? args.message.trim() : '';
      if (!message) return { output: JSON.stringify({ error: 'message required' }) };

      const supabase = getSupabaseUser(ctx.accessToken);
      const { data, error } = await supabase
        .from('priority_messages')
        .insert({
          user_id: ctx.userId,
          client_email: ctx.email,
          client_name: ctx.userName ?? null,
          message,
          is_order_related: args.isOrderRelated === true,
          is_urgent: args.isUrgent === true,
          related_order_id: typeof args.relatedOrderId === 'string' ? args.relatedOrderId : null,
          source: 'psa',
          status: 'new',
        })
        .select('id, created_at')
        .single();

      if (error) {
        return {
          output: JSON.stringify({
            error: 'Priority message API not ready — run Supabase migration priority_messages or use /account/concierge',
            detail: error.message,
          }),
        };
      }

      return {
        output: JSON.stringify({
          ok: true,
          messageId: (data as { id?: string })?.id,
          note: 'Concierge will respond asynchronously within ~72 business hours.',
        }),
      };
    }

    default:
      return { output: JSON.stringify({ error: `Unknown action tool: ${name}` }) };
  }
}

export function isPsaActionTool(name: string): boolean {
  return PSA_ACTION_TOOL_DEFINITIONS.some((t) => t.name === name);
}
