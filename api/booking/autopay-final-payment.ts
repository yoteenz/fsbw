import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '../_lib/supabase';

function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY');
  return new Stripe(key);
}

function dueIsoForMeetingDate(meetingDate: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(meetingDate || ''))) return null;
  const d = new Date(`${meetingDate}T23:59:59.999`);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() - 2);
  return d.toISOString();
}

function statusCodeFromStripeError(err: unknown): string {
  const code = (err as { code?: unknown })?.code;
  return typeof code === 'string' && code.trim() ? code : 'stripe_error';
}

function messageFromStripeError(err: unknown): string {
  const msg = (err as { message?: unknown })?.message;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();
  return 'Auto-charge failed';
}

async function appendClientNotification(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  text: string
): Promise<void> {
  const { data: existing } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  const newItem = {
    id: crypto.randomUUID(),
    text,
    read: false,
    createdAt: new Date().toISOString(),
    actionText: 'VIEW APPOINTMENTS',
    actionRoute: '/account/notifications',
  };
  const items = Array.isArray((existing as { items?: unknown[] } | null)?.items)
    ? ((existing as { items: unknown[] }).items as unknown[])
    : [];
  const next = [...items, newItem];
  if (existing) {
    await supabase
      .from('notifications')
      .update({ items: next, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  } else {
    await supabase.from('notifications').insert({ user_id: userId, items: next });
  }
}

/** POST /api/booking/autopay-final-payment
 * Triggered by Vercel cron (or manual secure call) to auto-charge booking final balances.
 * Auth: Authorization: Bearer <BOOKING_AUTOPAY_CRON_SECRET>
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const cronSecret = String(process.env.BOOKING_AUTOPAY_CRON_SECRET || '').trim();
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!cronSecret || token !== cronSecret) {
    sendJson(res, 401, { error: 'Unauthorized' });
    return;
  }

  const dryRun = String(req.query.dry_run || '').toLowerCase() === 'true';
  const now = new Date();
  const nowIso = now.toISOString();
  const stripe = getStripe();
  const supabase = getSupabaseAdmin();

  const { data: rows, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('category', 'appointment')
    .in('status', ['scheduled', 'confirmed'])
    .order('meeting_date', { ascending: true })
    .limit(250);
  if (error) {
    sendJson(res, 500, { error: error.message });
    return;
  }

  const meetings = Array.isArray(rows) ? rows : [];
  let processed = 0;
  let charged = 0;
  let failed = 0;
  let skipped = 0;
  const details: Array<Record<string, unknown>> = [];

  for (const row of meetings) {
    processed += 1;
    const id = String((row as Record<string, unknown>).id || '');
    const userId = String((row as Record<string, unknown>).user_id || '');
    const meetingDate = String((row as Record<string, unknown>).meeting_date || '').slice(0, 10);
    const metadata =
      (row as Record<string, unknown>).metadata &&
      typeof (row as Record<string, unknown>).metadata === 'object' &&
      !Array.isArray((row as Record<string, unknown>).metadata)
        ? ((row as Record<string, unknown>).metadata as Record<string, unknown>)
        : {};
    if (!id || !userId || !meetingDate) {
      skipped += 1;
      continue;
    }

    const dueIso = String(metadata.finalPaymentDueAt || dueIsoForMeetingDate(meetingDate) || '');
    const dueAt = new Date(dueIso);
    if (!Number.isFinite(dueAt.getTime()) || dueAt.getTime() > now.getTime()) {
      skipped += 1;
      continue;
    }

    const autopayConsent = metadata.bookingAutopayConsent === true;
    const customerId = String(metadata.bookingStripeCustomerId || '').trim();
    const paymentMethodId = String(metadata.bookingStripePaymentMethodId || '').trim();
    const amountUsd = Math.max(0, Math.round(Number(metadata.bookingFinalDueUsd) || 0));
    if (!autopayConsent || !customerId || !paymentMethodId || amountUsd <= 0) {
      skipped += 1;
      if (!dryRun) {
        await supabase
          .from('booking_autopay_attempts')
          .insert({
            meeting_id: id,
            user_id: userId,
            status: 'skipped',
            amount_usd: amountUsd,
            stripe_customer_id: customerId || null,
            stripe_payment_method_id: paymentMethodId || null,
            error_code: 'autopay_not_ready',
            error_message: 'Missing consent, customer, payment method, or amount',
            created_at: nowIso,
            updated_at: nowIso,
          })
          .select('id')
          .maybeSingle();
      }
      continue;
    }

    const { data: previousAttempts } = await supabase
      .from('booking_autopay_attempts')
      .select('*')
      .eq('meeting_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    const attempts = Array.isArray(previousAttempts) ? previousAttempts : [];
    const hasSuccess = attempts.some((a) => String((a as Record<string, unknown>).status || '') === 'succeeded');
    if (hasSuccess) {
      skipped += 1;
      continue;
    }

    const lastFailed = attempts.find((a) => String((a as Record<string, unknown>).status || '') === 'failed');
    const nextRetryAt = String((lastFailed as Record<string, unknown> | undefined)?.next_retry_at || '');
    if (nextRetryAt) {
      const retryAt = new Date(nextRetryAt);
      if (Number.isFinite(retryAt.getTime()) && retryAt.getTime() > now.getTime()) {
        skipped += 1;
        continue;
      }
    }

    const nextAttempt = attempts.length + 1;
    const retryDelayHours = Math.min(72, Math.max(2, 2 ** Math.min(5, nextAttempt)));
    const retryAtIso = new Date(now.getTime() + retryDelayHours * 60 * 60 * 1000).toISOString();

    if (dryRun) {
      details.push({ meetingId: id, action: 'would_charge', amountUsd, customerId, paymentMethodId });
      continue;
    }

    try {
      const pi = await stripe.paymentIntents.create({
        amount: amountUsd * 100,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: `BOOKING FINAL PAYMENT · MEETING ${id}`,
        metadata: {
          purpose: 'booking_final_payment',
          meeting_id: id,
          supabase_user_id: userId,
        },
      });

      charged += 1;
      await supabase.from('booking_autopay_attempts').insert({
        meeting_id: id,
        user_id: userId,
        attempt_number: nextAttempt,
        status: 'succeeded',
        amount_usd: amountUsd,
        stripe_payment_intent_id: pi.id,
        stripe_customer_id: customerId,
        stripe_payment_method_id: paymentMethodId,
        created_at: nowIso,
        updated_at: nowIso,
      });

      const nextMeta = {
        ...metadata,
        bookingAutopayStatus: 'paid',
        bookingAutopayPaidAt: nowIso,
        bookingAutopayLastAttemptAt: nowIso,
        bookingAutopayLastPaymentIntentId: pi.id,
      };
      await supabase
        .from('meetings')
        .update({
          metadata: nextMeta,
          updated_at: nowIso,
        })
        .eq('id', id);

      await appendClientNotification(
        supabase,
        userId,
        `[BOOKING · FINAL PAYMENT RECEIVED] YOUR REMAINING BALANCE PAYMENT WAS PROCESSED SUCCESSFULLY.`
      );
      details.push({ meetingId: id, action: 'charged', amountUsd, paymentIntentId: pi.id });
    } catch (e) {
      failed += 1;
      const errCode = statusCodeFromStripeError(e);
      const errMsg = messageFromStripeError(e);
      await supabase.from('booking_autopay_attempts').insert({
        meeting_id: id,
        user_id: userId,
        attempt_number: nextAttempt,
        status: 'failed',
        amount_usd: amountUsd,
        stripe_customer_id: customerId,
        stripe_payment_method_id: paymentMethodId,
        error_code: errCode,
        error_message: errMsg,
        next_retry_at: retryAtIso,
        created_at: nowIso,
        updated_at: nowIso,
      });
      const nextMeta = {
        ...metadata,
        bookingAutopayStatus: 'failed',
        bookingAutopayLastAttemptAt: nowIso,
        bookingAutopayLastError: errMsg,
        bookingAutopayNextRetryAt: retryAtIso,
      };
      await supabase
        .from('meetings')
        .update({
          metadata: nextMeta,
          updated_at: nowIso,
        })
        .eq('id', id);
      await appendClientNotification(
        supabase,
        userId,
        `[BOOKING · FINAL PAYMENT FAILED] WE COULD NOT PROCESS YOUR REMAINING BALANCE. WE WILL RETRY AUTOMATICALLY. PLEASE UPDATE YOUR PAYMENT METHOD TO AVOID CANCELLATION.`
      );
      details.push({ meetingId: id, action: 'failed', amountUsd, errorCode: errCode, nextRetryAt: retryAtIso });
    }
  }

  sendJson(res, 200, {
    ok: true,
    dryRun,
    processed,
    charged,
    failed,
    skipped,
    details,
  });
}
