import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth';
import { getSupabaseAdmin } from '../_lib/supabase';

type Body = {
  meetingDate?: string;
  meetingTime?: string;
  type?: string;
  durationMinutes?: number;
  notes?: string;
  orderNumber?: string;
  idempotencyKey?: string;
  bookingInstallKind?: string;
  bookingAddonIds?: string[];
  bookingStyle?: string;
  bookingPartDirection?: string;
  bookingUnitName?: string;
  bookingUnitPriceUsd?: number;
  bookingInstallFeeUsd?: number;
  bookingOrderTotalPaidUsd?: number;
  bookingLineTotalPaidUsd?: number;
  bookingBalancePaidUsd?: number;
  bookingFinalDueUsd?: number;
  bookingPaymentMethodLabel?: string;
  bookingBookedAtIso?: string;
  bookingStripeCustomerId?: string;
  bookingStripePaymentMethodId?: string;
  bookingAutopayConsent?: boolean;
  bookingAutopayConsentAt?: string;
};

function sanitizeType(raw: unknown): string {
  const t = String(raw || '').trim().toUpperCase();
  return t || 'APPOINTMENT';
}

function sanitizeDate(raw: unknown): string {
  const d = String(raw || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
}

function sanitizeTime(raw: unknown): string {
  const t = String(raw || '').trim().toUpperCase();
  return t;
}

function sanitizeIdempotencyKey(raw: unknown): string {
  const key = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9._:@-]/g, '-')
    .slice(0, 140);
  return key;
}

function sanitizeStripeId(raw: unknown, maxLen = 120): string {
  return String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, maxLen);
}

/** POST /api/booking/appointment-meeting — create pending meeting row from customer checkout. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Body;
  const meetingDate = sanitizeDate(body.meetingDate);
  const meetingTime = sanitizeTime(body.meetingTime);
  if (!meetingDate || !meetingTime) {
    return res.status(400).json({ error: 'meetingDate and meetingTime are required' });
  }

  const type = sanitizeType(body.type);
  const durationMinutes = Math.max(15, Math.min(480, Number(body.durationMinutes) || 120));
  const orderNumber = String(body.orderNumber || '').trim().toUpperCase();
  const idempotencyKey = sanitizeIdempotencyKey(body.idempotencyKey);
  const installKindRaw = String(body.bookingInstallKind || '')
    .trim()
    .toUpperCase();
  const bookingInstallKind =
    installKindRaw === 'RE_INSTALL' || installKindRaw === 'RE-INSTALL' ? 'RE_INSTALL' : 'NEW_INSTALL';
  const bookingStyle = String(body.bookingStyle || '')
    .trim()
    .toUpperCase();
  const bookingPartDirection = String(body.bookingPartDirection || '')
    .trim()
    .toUpperCase();
  const bookingUnitName = String(body.bookingUnitName || '')
    .trim()
    .toUpperCase();
  const bookingAddonIds = Array.isArray(body.bookingAddonIds)
    ? body.bookingAddonIds
        .filter((x): x is string => typeof x === 'string')
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12)
    : [];
  const bookingUnitPriceUsd = Math.max(0, Math.round(Number(body.bookingUnitPriceUsd) || 0));
  const defaultInstallFeeUsd = bookingInstallKind === 'RE_INSTALL' ? 225 : 275;
  const bookingInstallFeeUsd = Math.max(
    0,
    Math.round(Number(body.bookingInstallFeeUsd) || defaultInstallFeeUsd)
  );
  const bookingOrderTotalPaidUsd = Math.max(
    0,
    Math.round(Number(body.bookingOrderTotalPaidUsd) || 0)
  );
  const bookingLineTotalPaidUsd = Math.max(
    0,
    Math.round(Number(body.bookingLineTotalPaidUsd) || 0)
  );
  const bookingBalancePaidUsd = Math.max(
    0,
    Math.round(
      Number(body.bookingBalancePaidUsd) ||
        (bookingOrderTotalPaidUsd > 0
          ? bookingOrderTotalPaidUsd - bookingInstallFeeUsd
          : bookingLineTotalPaidUsd - bookingInstallFeeUsd)
    )
  );
  const bookingFinalDueUsd = Math.max(
    0,
    Math.round(Number(body.bookingFinalDueUsd) || bookingInstallFeeUsd)
  );
  const bookingPaymentMethodLabel = String(body.bookingPaymentMethodLabel || '')
    .trim()
    .toUpperCase();
  const bookingStripeCustomerId = sanitizeStripeId(body.bookingStripeCustomerId, 120);
  const bookingStripePaymentMethodId = sanitizeStripeId(body.bookingStripePaymentMethodId, 120);
  const bookingAutopayConsent = body.bookingAutopayConsent === true;
  const bookingAutopayConsentAtRaw = String(body.bookingAutopayConsentAt || '').trim();
  const bookingAutopayConsentAtParsed = new Date(bookingAutopayConsentAtRaw);
  const bookingAutopayConsentAt =
    bookingAutopayConsent && Number.isFinite(bookingAutopayConsentAtParsed.getTime())
      ? bookingAutopayConsentAtParsed.toISOString()
      : bookingAutopayConsent
      ? new Date().toISOString()
      : null;
  const bookingBookedAtRaw = String(body.bookingBookedAtIso || '').trim();
  const bookingBookedAtParsed = new Date(bookingBookedAtRaw);
  const bookingBookedAtIso = Number.isFinite(bookingBookedAtParsed.getTime())
    ? bookingBookedAtParsed.toISOString()
    : new Date().toISOString();
  const dueDate = new Date(`${meetingDate}T23:59:59.999`);
  dueDate.setDate(dueDate.getDate() - 2);
  const finalPaymentDueAt = dueDate.toISOString();
  const finalPaymentDueDate = finalPaymentDueAt.slice(0, 10);
  const finalPaymentPolicy = `REMAINING ${bookingFinalDueUsd.toLocaleString(
    'en-US'
  )} USD PAYMENT IS DUE NO MORE THAN 48 HOURS BEFORE APPOINTMENT DATE & IT MUST BE PAID USING THE SAME PAYMENT METHOD OR THE APPOINTMENT WILL BE CANCELLED IF PAYMENT IS UNSUCCESSFUL.`;
  const rawNotes = String(body.notes || '').trim();
  const notes = [
    idempotencyKey ? `IDEMPOTENCY:${idempotencyKey}` : '',
    orderNumber ? `ORDER ${orderNumber}` : '',
    rawNotes
  ]
    .filter(Boolean)
    .join(' · ')
    .slice(0, 800);

  try {
    const supabase = getSupabaseAdmin();
    if (idempotencyKey) {
      const { data: existing, error: existingError } = await supabase
        .from('meetings')
        .select('id, meeting_date, meeting_time, type, status, notes')
        .eq('user_id', user.id)
        .eq('meeting_date', meetingDate)
        .eq('meeting_time', meetingTime)
        .eq('type', type)
        .ilike('notes', `%IDEMPOTENCY:${idempotencyKey}%`)
        .limit(1);
      if (existingError) return res.status(500).json({ error: existingError.message });
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(200).json({ meeting: existing[0], idempotent: true });
      }
    }

    const metadata = {
      orderNumber: orderNumber || null,
      idempotencyKey: idempotencyKey || null,
      source: 'checkout_appointment',
      bookingInstallKind,
      bookingAddonIds,
      ...(bookingStyle ? { bookingStyle } : {}),
      ...(bookingPartDirection ? { bookingPartDirection } : {}),
      ...(bookingUnitName ? { bookingUnitName } : {}),
      ...(bookingUnitPriceUsd > 0 ? { bookingUnitPriceUsd } : {}),
      bookingInstallFeeUsd,
      bookingOrderTotalPaidUsd,
      bookingLineTotalPaidUsd,
      bookingBalancePaidUsd,
      bookingFinalDueUsd,
      bookingPaidTotalUsd: bookingOrderTotalPaidUsd || bookingLineTotalPaidUsd || bookingUnitPriceUsd,
      ...(bookingPaymentMethodLabel ? { bookingPaymentMethodLabel } : {}),
      ...(bookingStripeCustomerId ? { bookingStripeCustomerId } : {}),
      ...(bookingStripePaymentMethodId ? { bookingStripePaymentMethodId } : {}),
      bookingAutopayConsent,
      ...(bookingAutopayConsentAt ? { bookingAutopayConsentAt } : {}),
      bookingAutopayStatus: bookingAutopayConsent ? 'scheduled' : 'not_enabled',
      bookingBookedAtIso,
      finalPaymentDueAt,
      finalPaymentDueDate,
      finalPaymentPolicy,
    };

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        user_id: user.id,
        client_email: user.email || null,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        type,
        duration_minutes: durationMinutes,
        status: 'scheduled',
        notes: notes || null,
        category: 'appointment',
        metadata,
      })
      .select('id, meeting_date, meeting_time, type, status')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ meeting: data });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Internal error' });
  }
}

