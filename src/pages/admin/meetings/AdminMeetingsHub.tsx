import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import {
  getAdminMeetings,
  patchAdminMeeting,
  postAdminConsultQuote,
  postAdminMeetingClientAlert,
} from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { isAdminEmail } from '../../../utils/adminAuth';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import ConfirmationModal from '../../../components/ConfirmationModal';
import {
  endOfMonth,
  generateMockMeetingsForRange,
  loadLocalMeetings,
  normalizeApiMeeting,
  parseISODateLocal,
  startOfMonth,
  type AdminMeeting,
} from '../../../utils/adminMeetingsMock';
import { buildRevenueOrdersList } from '../../../utils/adminRevenueStats';

const UNIT_OPTIONS = [
  { id: 'NOIR', label: 'NOIR' },
  { id: 'BLANCO', label: 'BLANCO' },
  { id: 'SOFT WAVE', label: 'SOFT WAVE' },
  { id: 'SOFT CURL', label: 'SOFT CURL' },
  { id: 'BEACH WAVE', label: 'BEACH WAVE' },
  { id: 'OCEAN CURL', label: 'OCEAN CURL' },
] as const;

const SUB_PAGE_OPTIONS = [
  'LENGTH',
  'COLOR',
  'DENSITY',
  'CAP SIZE',
  'HAIRLINE',
  'LACE',
  'TEXTURE',
  'STYLING',
  'ADD-ONS',
] as const;

const EDIT_REASONS = [
  'SCHEDULE CONFLICT',
  'CLIENT REQUEST',
  'STAFF AVAILABILITY',
  'WEATHER / EMERGENCY',
  'OTHER',
] as const;

const MEETING_SORT_OPTIONS = ['Most recent', 'A to Z', 'Z to A'] as const;
type MeetingSortOption = (typeof MEETING_SORT_OPTIONS)[number];
function meetingSortOptionToLabel(opt: MeetingSortOption): string {
  return opt.toUpperCase();
}

function viewAllHeaderTitle(mode: 'bookings' | 'consults' | null, uniqueClientCount: number): string | null {
  if (!mode) return null;
  if (mode === 'bookings') {
    return `${uniqueClientCount} CLIENT ${uniqueClientCount === 1 ? 'BOOKING' : 'BOOKINGS'}`;
  }
  return `${uniqueClientCount} CLIENT ${uniqueClientCount === 1 ? 'CONSULT' : 'CONSULTS'}`;
}

const CALENDAR_LEFT_ARROW_SRC = '/assets/calendar-left-arrow.svg';
const CALENDAR_RIGHT_ARROW_SRC = '/assets/calendar-right-arrow.svg';

const BOOKING_ADDON_LABEL_BY_ID: Record<string, string> = {
  braids: 'BRAIDS',
  'brow-clean': 'BROW SCULPTING',
  'brow-tint': 'BROW TINT',
  makeup: 'MAKEUP',
  'mink-lashes': 'MINK LASHES',
  'clean-lace': 'CLEAN LACE',
  travel: 'TRAVEL FEE',
};

const BOOKING_ADDON_LABELS = new Set<string>([
  'BRAIDS',
  'BROW SCULPTING',
  'BROW TINT',
  'MAKEUP',
  'MINK LASHES',
  'CLEAN LACE',
  'TRAVEL FEE',
]);

const BOOKING_ADDON_ORDER = [
  'CLEAN LACE',
  'BRAIDS',
  'BROW SCULPTING',
  'BROW TINT',
  'MAKEUP',
  'MINK LASHES',
  'TRAVEL FEE',
] as const;

const BOOKING_UNIT_LABELS = ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE', 'SOFT CURL', 'OCEAN CURL'] as const;

const BOOKING_UNIT_FALLBACK_PRICE_BY_LABEL: Record<(typeof BOOKING_UNIT_LABELS)[number], number> = {
  NOIR: 740,
  BLANCO: 820,
  'SOFT WAVE': 760,
  'BEACH WAVE': 760,
  'SOFT CURL': 780,
  'OCEAN CURL': 780,
};

const CLIENT_STATE_BY_EMAIL: Record<string, string> = {
  'mock1@test.com': 'CA',
  'mock2@test.com': 'NY',
  'mock3@test.com': 'TX',
  'mock4@test.com': 'IL',
  'mock5@test.com': 'FL',
  'mock6@test.com': 'WA',
  'mock7@test.com': 'GA',
  'mock8@test.com': 'MA',
  'mock9@test.com': 'CO',
  'mock10@test.com': 'AZ',
  'mock11@test.com': 'MI',
  'mock12@test.com': 'TX',
  'mock13@test.com': 'CA',
  'mock14@test.com': 'PA',
  'mock15@test.com': 'CA',
  'mock16@test.com': 'TX',
  'mock17@test.com': 'NJ',
  'mock18@test.com': 'TN',
  'mock19@test.com': 'NC',
  'mock20@test.com': 'MN',
  'mock21@test.com': 'TC',
  'mock22@test.com': 'JP',
  'mock23@test.com': 'NG',
  'mock24@test.com': 'IE',
  'mock25@test.com': 'BR',
};

function formatHeaderDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt
      .toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      .toUpperCase();
  } catch {
    return dateStr;
  }
}

function monthMatrix(anchorISO: string): { label: string; iso: string; inMonth: boolean }[][] {
  const start = parseISODateLocal(startOfMonth(anchorISO));
  const end = parseISODateLocal(endOfMonth(anchorISO));
  const firstDow = start.getDay();
  const pad = firstDow === 0 ? 6 : firstDow - 1;
  const weeks: { label: string; iso: string; inMonth: boolean }[][] = [];
  let cur = new Date(start);
  cur.setDate(cur.getDate() - pad);
  for (let w = 0; w < 6; w++) {
    const row: { label: string; iso: string; inMonth: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const y = cur.getFullYear();
      const mo = String(cur.getMonth() + 1).padStart(2, '0');
      const da = String(cur.getDate()).padStart(2, '0');
      const iso = `${y}-${mo}-${da}`;
      const inMonth = cur >= start && cur <= end;
      row.push({ label: String(cur.getDate()), iso, inMonth });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
}

function tierPremium(m: AdminMeeting): boolean {
  const meta = m.metadata || {};
  const t = String(meta.tier || '').toLowerCase();
  return t === 'premium' || m.notes.toUpperCase().includes('PREMIUM');
}

function tierLabelColor(m: AdminMeeting): string {
  return tierPremium(m) ? '#000000' : '#808080';
}

function normalizeInstallKindLabel(raw: unknown): 'NEW INSTALL' | 'RE-INSTALL' | null {
  const upper = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
  if (!upper) return null;
  if (upper === 'NEW INSTALL' || upper === 'INSTALLS' || upper === 'INSTALL') return 'NEW INSTALL';
  if (upper === 'RE INSTALL' || upper === 'RE-INSTALL' || upper === 'REINSTALL' || upper === 'RE-INSTALLS') {
    return 'RE-INSTALL';
  }
  return null;
}

function normalizeBookingAddonLabel(raw: unknown): string | null {
  const upper = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
  if (!upper) return null;
  if (BOOKING_ADDON_LABELS.has(upper)) return upper;
  if (upper === 'BROW CLEAN' || upper === 'BROW-CLEAN') return 'BROW SCULPTING';
  if (upper === 'BROW TINTING' || upper === 'BROW-TINT') return 'BROW TINT';
  if (upper === 'MINK LASH' || upper === 'MINK-LASHES' || upper === 'MINK LASHES') return 'MINK LASHES';
  if (upper === 'TRAVEL' || upper === 'TRAVEL-FEE') return 'TRAVEL FEE';
  if (upper === 'CLEAN LACE') return 'CLEAN LACE';
  return null;
}

function orderedUniqueAddons(addons: string[]): string[] {
  const set = new Set(addons);
  const ordered = BOOKING_ADDON_ORDER.filter((label) => set.has(label));
  const extras = [...set].filter((label) => !ordered.includes(label as (typeof BOOKING_ADDON_ORDER)[number]));
  return [...ordered, ...extras];
}

function normalizeBookingUnitLabel(raw: unknown): (typeof BOOKING_UNIT_LABELS)[number] | null {
  const upper = String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
  if (!upper) return null;
  if (upper.includes('SOFT WAVE')) return 'SOFT WAVE';
  if (upper.includes('BEACH WAVE')) return 'BEACH WAVE';
  if (upper.includes('SOFT CURL')) return 'SOFT CURL';
  if (upper.includes('OCEAN CURL')) return 'OCEAN CURL';
  if (upper.includes('BLANCO')) return 'BLANCO';
  if (upper.includes('NOIR')) return 'NOIR';
  return null;
}

function normalizeUsdPrice(raw: unknown): number | null {
  if (raw == null) return null;
  const n =
    typeof raw === 'number'
      ? raw
      : Number(
          String(raw)
            .replace(/,/g, '')
            .replace(/[^\d.]/g, '')
        );
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

function parseUsStateFromAddress(raw: unknown): string | null {
  const value = String(raw || '').trim().toUpperCase();
  if (!value) return null;
  const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const maybeState = parts[2]?.match(/\b[A-Z]{2}\b/);
    if (maybeState?.[0]) return maybeState[0];
  }
  return null;
}

function meetingClientEmailKey(m: AdminMeeting): string {
  return String(m.clientEmail || '').trim().toLowerCase();
}

function normalizeProfileImageCandidate(raw: unknown): string | null {
  const value = String(raw || '').trim();
  if (!value) return null;
  if (value.startsWith('/assets/') || /^https?:\/\//i.test(value) || value.startsWith('data:image/')) return value;
  return null;
}

function profileImageFromRegisteredUsersByEmail(email: string): string | null {
  if (!email || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('registeredUsers');
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return null;
    const found = parsed.find((u: any) => String(u?.email || '').trim().toLowerCase() === email);
    if (!found || typeof found !== 'object') return null;
    return (
      normalizeProfileImageCandidate((found as Record<string, unknown>).profileImage) ||
      normalizeProfileImageCandidate((found as Record<string, unknown>).photo) ||
      normalizeProfileImageCandidate((found as Record<string, unknown>).profilePhoto) ||
      normalizeProfileImageCandidate((found as Record<string, unknown>).avatar)
    );
  } catch {
    return null;
  }
}

function meetingClientProfilePhoto(m: AdminMeeting): string {
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;
  const fromMeta =
    normalizeProfileImageCandidate(meta.clientProfilePhoto) ||
    normalizeProfileImageCandidate(meta.profileImage) ||
    normalizeProfileImageCandidate(meta.photo) ||
    normalizeProfileImageCandidate(meta.profilePhoto) ||
    normalizeProfileImageCandidate(meta.avatar);
  if (fromMeta) return fromMeta;
  const byEmail = profileImageFromRegisteredUsersByEmail(meetingClientEmailKey(m));
  if (byEmail) return byEmail;
  return '/assets/profile-thumb.png';
}

function meetingClientStateCode(m: AdminMeeting): string | null {
  const email = meetingClientEmailKey(m);
  if (email && CLIENT_STATE_BY_EMAIL[email]) return CLIENT_STATE_BY_EMAIL[email];
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;
  const explicit = String(meta.clientState || meta.state || '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(explicit)) return explicit;
  const fromAddress =
    parseUsStateFromAddress(meta.clientAddress) ||
    parseUsStateFromAddress(meta.address) ||
    parseUsStateFromAddress(meta.defaultAddress);
  return fromAddress;
}

function meetingClientDisplayNameWithState(m: AdminMeeting): string {
  const state = meetingClientStateCode(m);
  return state ? `${m.client} (${state})` : m.client;
}

function normalizeSearchText(raw: unknown): string {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

function meetingSearchBlob(m: AdminMeeting): string {
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;
  const baseParts = [
    m.client,
    meetingClientDisplayNameWithState(m),
    m.clientEmail,
    m.date,
    formatHeaderDate(m.date),
    m.time,
    m.type,
    m.notes,
    m.duration,
    formatMinutesAsHoursAndMinutes(m.duration),
    String(m.status || ''),
  ];
  if (m.category === 'consultation') {
    baseParts.push(
      consultTypeLabelForMeeting(m),
      String(meta.hairOption || ''),
      String(meta.consultType || ''),
      String(meta.consultNotes || ''),
      String(meta.bookingHairOption || '')
    );
  } else {
    baseParts.push(
      formatBookingInstallLineForCard(m),
      formatBookingAddonsLineForCard(m),
      formatBookingAddonsLineForCardDisplay(m),
      String(meta.bookingInstallKind || ''),
      String(meta.installKind || ''),
      String(meta.bookingAttachedOrderSummary || '')
    );
  }
  return normalizeSearchText(baseParts.filter(Boolean).join(' · '));
}

function meetingClientUniqKey(m: AdminMeeting): string {
  const email = String(m.clientEmail || '').trim().toLowerCase();
  if (email) return `email:${email}`;
  return `name:${meetingClientDisplayNameWithState(m).trim().toUpperCase()}`;
}

function meetingIsCurrentOrActive(m: AdminMeeting): boolean {
  const status = String(m.status || '').trim().toLowerCase();
  if (!status) return false;
  return status === 'scheduled' || status === 'confirmed' || status === 'active' || status === 'in_progress';
}

function meetingSortTimeMs(m: AdminMeeting): number {
  const base = parseISODateLocal(m.date);
  const timeText = String(m.time || '').trim().toUpperCase();
  const parsed = timeText.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (parsed) {
    let hours = Number(parsed[1]);
    const mins = Number(parsed[2] || '0');
    const ampm = parsed[3];
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    base.setHours(hours, mins, 0, 0);
  }
  return base.getTime();
}

function sortMeetingsByOption(rows: AdminMeeting[], sortOption: MeetingSortOption): AdminMeeting[] {
  const sorted = [...rows];
  if (sortOption === 'A to Z') {
    sorted.sort((a, b) =>
      meetingClientDisplayNameWithState(a).localeCompare(meetingClientDisplayNameWithState(b), undefined, {
        sensitivity: 'base',
      })
    );
    return sorted;
  }
  if (sortOption === 'Z to A') {
    sorted.sort((a, b) =>
      meetingClientDisplayNameWithState(b).localeCompare(meetingClientDisplayNameWithState(a), undefined, {
        sensitivity: 'base',
      })
    );
    return sorted;
  }
  sorted.sort((a, b) => meetingSortTimeMs(b) - meetingSortTimeMs(a));
  return sorted;
}

function formatViewAllListMeetingDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dt = new Date(year, month - 1, day);
    const weekday = dt.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
    return `${weekday}, ${month}/${day},${year}`;
  } catch {
    return dateStr;
  }
}

function viewAllListMeetingLabel(m: AdminMeeting): string {
  if (m.category === 'appointment') return `${getBookingCardDetails(m).installKind}:`;
  return `${consultTypeLabelForMeeting(m)}:`;
}

function formatViewAllListMeetingDateOnly(m: AdminMeeting): string {
  return formatViewAllListMeetingDate(m.date);
}

function formatViewAllListMeetingTimeOnly(m: AdminMeeting): string {
  return String(m.time || '').trim().toUpperCase();
}

function meetingMatchesPageSearch(m: AdminMeeting, searchTokens: string[]): boolean {
  if (searchTokens.length === 0) return true;
  const haystack = meetingSearchBlob(m);
  return searchTokens.every((token) => haystack.includes(token));
}

function toIsoDateOnly(dateIso: string): string {
  return String(dateIso || '').slice(0, 10);
}

function addDaysIso(isoDate: string, days: number): string {
  const base = parseISODateLocal(toIsoDateOnly(isoDate));
  base.setDate(base.getDate() + days);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function meetingHasTravelAddon(m: AdminMeeting): boolean {
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;
  const ids = Array.isArray(meta.bookingAddonIds)
    ? meta.bookingAddonIds.filter((id): id is string => typeof id === 'string')
    : [];
  if (ids.some((id) => id.toLowerCase() === 'travel')) return true;
  return formatBookingAddonsLineForCard(m).toUpperCase().includes('TRAVEL FEE');
}

type BookingCardDetails = {
  installKind: 'NEW INSTALL' | 'RE-INSTALL';
  addons: string[];
  unitLabel: string;
  unitPriceUsd: number;
};

function getBookingCardDetails(m: AdminMeeting): BookingCardDetails {
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;

  const addonLabels: string[] = [];
  const addonIds = Array.isArray(meta.bookingAddonIds)
    ? meta.bookingAddonIds.filter((id): id is string => typeof id === 'string')
    : [];
  addonIds.forEach((id) => {
    const label = BOOKING_ADDON_LABEL_BY_ID[id];
    if (label) addonLabels.push(label);
  });

  const tokenSource = `${String(m.type || '')} · ${String(m.notes || '')}`;
  const tokens = tokenSource
    .split(/[·:+|,]/)
    .map((t) => t.trim())
    .filter(Boolean);

  let installKind = normalizeInstallKindLabel(meta.bookingInstallKind ?? meta.installKind ?? '');
  tokens.forEach((tok) => {
    if (!installKind) {
      const parsedInstall = normalizeInstallKindLabel(tok);
      if (parsedInstall) installKind = parsedInstall;
    }
    const addonLabel = normalizeBookingAddonLabel(tok);
    if (addonLabel) addonLabels.push(addonLabel);
  });

  const uniqueAddons = orderedUniqueAddons(addonLabels);
  const finalInstallKind: 'NEW INSTALL' | 'RE-INSTALL' = installKind || 'NEW INSTALL';

  const unitCandidates = [
    meta.bookingUnitName,
    meta.unitName,
    meta.bookingUnitLabel,
    meta.unitLabel,
    meta.bookingUnitKey,
    meta.unitKey,
    meta.bookingUnitId,
    meta.unitId,
    meta.bookingAttachedOrderSummary,
    m.notes,
    m.type,
  ];
  let unitLabel = unitCandidates
    .map((candidate) => normalizeBookingUnitLabel(candidate))
    .find((candidate): candidate is (typeof BOOKING_UNIT_LABELS)[number] => Boolean(candidate));
  if (!unitLabel) unitLabel = 'NOIR';

  const priceCandidates = [
    meta.bookingUnitPriceUsd,
    meta.bookingUnitPriceUSD,
    meta.unitPriceUsd,
    meta.unitPriceUSD,
    meta.unitPrice,
    meta.bookingUnitPrice,
  ];
  const detectedPrice = priceCandidates
    .map((candidate) => normalizeUsdPrice(candidate))
    .find((candidate): candidate is number => candidate != null);
  const unitPriceUsd = detectedPrice ?? BOOKING_UNIT_FALLBACK_PRICE_BY_LABEL[unitLabel];

  return {
    installKind: finalInstallKind,
    addons: uniqueAddons,
    unitLabel,
    unitPriceUsd,
  };
}

function formatBookingInstallLineForCard(m: AdminMeeting): string {
  const details = getBookingCardDetails(m);
  return `${details.installKind}: ${details.unitLabel} $${details.unitPriceUsd.toLocaleString('en-US')} USD`;
}

function formatBookingAddonsLineForCard(m: AdminMeeting): string {
  const details = getBookingCardDetails(m);
  return details.addons.length > 0 ? `ADD-ONS: ${details.addons.join(', ')}` : 'ADD-ONS: NONE';
}

function formatBookingAddonsLineForCardDisplay(m: AdminMeeting): string {
  const details = getBookingCardDetails(m);
  const addonsNoBreak = details.addons.map((addon) => addon.replace(/\s+/g, '\u00A0'));
  if (details.addons.length === 0) return 'ADD-ONS: NONE';
  if (details.addons.length <= 3) return `ADD-ONS: ${addonsNoBreak.join(', ')}`;
  const firstLine = addonsNoBreak.slice(0, 3).join(', ');
  const wrappedRest = addonsNoBreak.slice(3).join(', ');
  return `ADD-ONS: ${firstLine}\n${wrappedRest}`;
}

function formatUsd(amount: number): string {
  return `$${Math.max(0, Math.round(amount)).toLocaleString('en-US')}`;
}

function normalizeMoneyValue(raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const n =
    typeof raw === 'number'
      ? raw
      : Number(
          String(raw)
            .replace(/,/g, '')
            .replace(/[^\d.-]/g, '')
        );
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function bookingInstallFeeUsdFromMeeting(m: AdminMeeting): number {
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;
  const explicit = normalizeMoneyValue(meta.bookingInstallFeeUsd);
  if (explicit != null && explicit > 0) return explicit;
  const kind = String(meta.bookingInstallKind || meta.installKind || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
  return kind.includes('RE_INSTALL') || kind.includes('RE-INSTALL') || kind.includes('REINSTALL') ? 225 : 275;
}

/**
 * "Booking sales" = completed appointments whose booking balance is fully paid.
 * Uses strongest available indicators from meeting metadata (autopay paid, explicit
 * final due=0, or explicit final payment amount meeting/exceeding final due).
 */
function bookingPaidInFullSalesUsd(m: AdminMeeting): number | null {
  if (String(m.status || '').trim().toLowerCase() !== 'completed') return null;
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;
  const autopayStatus = String(meta.bookingAutopayStatus || meta.autopayStatus || '')
    .trim()
    .toLowerCase();
  const finalDue = normalizeMoneyValue(meta.bookingFinalDueUsd);
  const finalPaid = normalizeMoneyValue(
    meta.bookingFinalPaymentPaidUsd ?? meta.finalPaymentPaidUsd ?? meta.bookingRemainingPaidUsd
  );
  const basePaid =
    normalizeMoneyValue(meta.bookingPaidTotalUsd ?? meta.orderTotalUsd ?? meta.orderTotalUSD ?? meta.orderTotal) ??
    normalizeMoneyValue(meta.bookingUnitPriceUsd) ??
    getBookingCardDetails(m).unitPriceUsd;

  if (autopayStatus === 'paid') {
    const remaining = finalDue != null ? Math.max(0, finalDue) : bookingInstallFeeUsdFromMeeting(m);
    return Math.max(0, basePaid) + remaining;
  }
  if (finalDue != null && finalDue <= 0) return Math.max(0, basePaid);
  if (finalDue != null && finalPaid != null && finalPaid >= finalDue) {
    return Math.max(0, basePaid) + Math.max(0, finalDue);
  }
  return null;
}

function consultCodeFromOrder(order: Record<string, unknown>): string | null {
  const directCandidates = [order.discountCode, order.discount_code, order.discount, order.code];
  for (const candidate of directCandidates) {
    const value = String(candidate || '').trim().toUpperCase();
    if (value.startsWith('CONSULT-')) return value;
  }
  const discounts = Array.isArray(order.discounts) ? order.discounts : [];
  for (const discountRow of discounts) {
    if (!discountRow || typeof discountRow !== 'object') continue;
    const row = discountRow as Record<string, unknown>;
    const label = String(row.label || row.code || row.name || '')
      .trim()
      .toUpperCase();
    if (label.startsWith('CONSULT-')) return label;
  }
  return null;
}

function consultTypeLabelForMeeting(m: AdminMeeting): 'WIG ONLY' | 'WIG + INSTALL' {
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;
  const explicit = String(meta.hairOption || meta.consultType || meta.bookingHairOption || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
  if (explicit.includes('WIG + INSTALL') || explicit.includes('WIG+INSTALL')) return 'WIG + INSTALL';
  if (explicit.includes('WIG ONLY')) return 'WIG ONLY';
  const fallback = `${String(m.type || '')} ${String(m.notes || '')}`
    .toUpperCase()
    .replace(/\s+/g, ' ');
  return fallback.includes('INSTALL') ? 'WIG + INSTALL' : 'WIG ONLY';
}

function formatMinutesAsHoursAndMinutes(rawDuration: string): string {
  const text = String(rawDuration || '').trim().toUpperCase();
  const minsMatch = text.match(/(\d+)\s*MIN/);
  if (!minsMatch) return text;
  const totalMinutes = Number(minsMatch[1]);
  if (!Number.isFinite(totalMinutes) || totalMinutes < 60) return `${totalMinutes} MIN`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes <= 0) return `${hours} HRS`;
  return `${hours} HRS ${minutes} MINS`;
}

function toLocalDateEndOfDay(isoDate: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate || ''))) return null;
  const [y, m, d] = String(isoDate).split('-').map(Number);
  const dt = new Date(y, m - 1, d, 23, 59, 59, 999);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

type BookingPaymentStatus = {
  remainingDueUsd: number;
  paidTotalUsd: number;
  finalPaymentDueDateText: string;
  finalPaymentDueText: string;
  dueProgressPct: number;
  duePassed: boolean;
  autopayStatus: 'paid' | 'failed' | 'scheduled' | 'not_enabled';
  autopayLastError: string;
};

function getBookingPaymentStatusForCard(m: AdminMeeting): BookingPaymentStatus {
  const details = getBookingCardDetails(m);
  const installFeeUsd = details.installKind === 'RE-INSTALL' ? 225 : 275;
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;

  const paidCandidates = [
    meta.bookingPaidTotalUsd,
    meta.bookingPaidTotalUSD,
    meta.orderTotalUsd,
    meta.orderTotalUSD,
    meta.orderTotal,
  ];
  const paidDetected = paidCandidates
    .map((candidate) => normalizeUsdPrice(candidate))
    .find((candidate): candidate is number => candidate != null);
  const paidTotalUsd = paidDetected ?? details.unitPriceUsd;
  const remainingDueDetected = normalizeUsdPrice(meta.bookingFinalDueUsd);
  const remainingDueUsd = remainingDueDetected ?? installFeeUsd;

  const dueIsoRaw = String(meta.finalPaymentDueDate || '').trim();
  const dueDateObj = toLocalDateEndOfDay(dueIsoRaw) || toLocalDateEndOfDay(addDaysIso(m.date, -2));
  const fallbackDateObj = toLocalDateEndOfDay(addDaysIso(m.date, -2));
  const safeDueObj = dueDateObj || fallbackDateObj || new Date();
  const dueIso = `${safeDueObj.getFullYear()}-${String(safeDueObj.getMonth() + 1).padStart(2, '0')}-${String(
    safeDueObj.getDate()
  ).padStart(2, '0')}`;

  const dueDateText = formatHeaderDate(dueIso);
  const nowMs = Date.now();
  const dueMs = safeDueObj.getTime();
  const sourceDateObj = toLocalDateEndOfDay(m.date) || safeDueObj;
  const totalWindowMs = Math.max(1, sourceDateObj.getTime() - dueMs);
  const remainingMs = Math.max(0, dueMs - nowMs);
  const elapsedPct = Math.max(
    0,
    Math.min(100, ((totalWindowMs - Math.min(totalWindowMs, remainingMs)) / totalWindowMs) * 100)
  );
  const duePassed = remainingMs <= 0;

  const hoursTotal = Math.floor(remainingMs / (1000 * 60 * 60));
  const days = Math.floor(hoursTotal / 24);
  const hours = hoursTotal % 24;
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  let dueText = 'DUE NOW';
  if (!duePassed) {
    if (days > 0) dueText = `${days}D ${hours}H LEFT`;
    else if (hours > 0) dueText = `${hours}H ${minutes}M LEFT`;
    else dueText = `${minutes}M LEFT`;
  }

  const autopayStatusRaw = String(meta.bookingAutopayStatus || meta.autopayStatus || '').trim().toLowerCase();
  const autopayStatus: 'paid' | 'failed' | 'scheduled' | 'not_enabled' =
    autopayStatusRaw === 'paid' || autopayStatusRaw === 'failed' || autopayStatusRaw === 'scheduled'
      ? (autopayStatusRaw as 'paid' | 'failed' | 'scheduled')
      : 'not_enabled';
  const autopayLastError = String(meta.bookingAutopayLastError || '').trim().toUpperCase();

  // UI test hook: fill tracker for Quinn booking cards so due-bar states can be validated quickly.
  const clientNameUpper = String(m.client || '').trim().toUpperCase();
  const forceFilledForQuinn = clientNameUpper.includes('QUINN CHEN');

  return {
    remainingDueUsd,
    paidTotalUsd,
    finalPaymentDueDateText: dueDateText,
    finalPaymentDueText: dueText,
    dueProgressPct: forceFilledForQuinn ? 100 : elapsedPct,
    duePassed,
    autopayStatus,
    autopayLastError,
  };
}

function consultInspo(m: AdminMeeting): string[] {
  const meta = m.metadata || {};
  const photoUrls = Array.isArray(meta.inspoPhotoUrls) ? meta.inspoPhotoUrls.map(String).filter(Boolean) : [];
  const fileNames = Array.isArray(meta.inspoFileNames) ? meta.inspoFileNames.map(String).filter(Boolean) : [];
  const primarySources = photoUrls.length > 0 ? photoUrls : fileNames;
  const normalized = primarySources
    .map((src) => src.trim())
    .filter(Boolean)
    .map((src) => {
      // Keep absolute URLs and root-relative asset paths intact.
      if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
      // Keep data URLs for real consult uploads synced from booking pages.
      if (src.startsWith('data:image/')) return src;
      // If only a filename is stored, map to shared mock gallery image.
      return '/assets/gallery-mock.png';
    });
  const deduped = Array.from(new Set(normalized));
  const capped = deduped.slice(0, 3);
  return capped.length > 0 ? capped : ['/assets/gallery-mock.png'];
}

/** Match rewards / tier-benefits close control (brand red). */
const CLOSE_ICON_RED_FILTER =
  'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)';

export default function AdminMeetingsHub() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientSearchQuery, setClientSearchQuery] = useState(() => {
    if (typeof window === 'undefined') return '';
    const q = new URLSearchParams(window.location.search).get('q');
    return (q || '').trim();
  });
  const [mainTab, setMainTab] = useState<'overview' | 'bookings' | 'consults'>(() => {
    if (typeof window === 'undefined') return 'bookings';
    const sp = new URLSearchParams(window.location.search);
    const viewAll = sp.get('viewAll');
    if (viewAll === 'bookings' || viewAll === 'consults') return viewAll;
    const tab = sp.get('tab');
    return tab === 'overview' || tab === 'bookings' || tab === 'consults' ? tab : 'bookings';
  });
  const [calendarAnchor, setCalendarAnchor] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [apiMeetings, setApiMeetings] = useState<AdminMeeting[]>([]);
  const [localTick, setLocalTick] = useState(0);
  const [viewAllMode, setViewAllMode] = useState<'bookings' | 'consults' | null>(() => {
    if (typeof window === 'undefined') return null;
    const viewAll = new URLSearchParams(window.location.search).get('viewAll');
    if (viewAll === 'bookings' || viewAll === 'consults') return viewAll;
    try {
      const saved = window.sessionStorage.getItem('adminMeetingsViewAllMode');
      if (saved === 'bookings' || saved === 'consults') return saved;
    } catch {
      /* ignore */
    }
    return null;
  });
  const [quoteMeeting, setQuoteMeeting] = useState<AdminMeeting | null>(null);
  const [editMeeting, setEditMeeting] = useState<AdminMeeting | null>(null);
  const [quoteUnit, setQuoteUnit] = useState<string>(UNIT_OPTIONS[0].id);
  const [quoteSub, setQuoteSub] = useState<string>(SUB_PAGE_OPTIONS[0]);
  const [quoteMessage, setQuoteMessage] = useState(
    'BASED ON YOUR INSPO AND NOTES, THESE SELECTIONS WILL GIVE YOU THE CLOSEST MATCH TO YOUR GOAL LOOK.'
  );
  const [quoteBreakdown, setQuoteBreakdown] = useState('BASE UNIT … $580\nLENGTH 24" … INCLUDED\n');
  const [quoteSending, setQuoteSending] = useState(false);
  const [showSendQuoteConfirm, setShowSendQuoteConfirm] = useState(false);
  const [editReason, setEditReason] = useState<string>(EDIT_REASONS[0]);
  const [editMessage, setEditMessage] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [hubNotice, setHubNotice] = useState<string | null>(null);
  const [consultPhotoPreviewSrc, setConsultPhotoPreviewSrc] = useState<string | null>(null);
  const [meetingSortOption, setMeetingSortOption] = useState<MeetingSortOption>('Most recent');
  const [showMeetingSortDropdown, setShowMeetingSortDropdown] = useState(false);
  const [viewAllDisplayMode, setViewAllDisplayMode] = useState<'list' | 'grid'>('list');

  const refreshLocal = useCallback(() => setLocalTick((t) => t + 1), []);

  useEffect(() => {
    let currentUser: { email?: string } | null = null;
    try {
      const raw = localStorage.getItem('currentUser');
      currentUser = raw ? JSON.parse(raw) : null;
    } catch {
      /* ignore */
    }
    if (isSupabaseConfigured() && currentUser?.email && isAdminEmail(currentUser.email)) {
      getAdminMeetings()
        .then((r) => {
          const rows = Array.isArray(r.meetings) ? r.meetings : [];
          const norm = rows
            .map((row) => normalizeApiMeeting(row as Record<string, unknown>))
            .filter(Boolean) as AdminMeeting[];
          setApiMeetings(norm);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const viewAll = sp.get('viewAll');
    if (viewAll === 'bookings' || viewAll === 'consults') {
      setMainTab(viewAll);
      return;
    }
    const tab = sp.get('tab');
    if (tab === 'overview' || tab === 'bookings' || tab === 'consults') setMainTab(tab);
  }, [location.search]);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    setClientSearchQuery((q || '').trim());
  }, [location.search]);

  useEffect(() => {
    const viewAll = new URLSearchParams(location.search).get('viewAll');
    if (viewAll === 'bookings' || viewAll === 'consults') {
      setViewAllMode(viewAll);
      return;
    }
    try {
      const saved = window.sessionStorage.getItem('adminMeetingsViewAllMode');
      if (saved === 'bookings' || saved === 'consults') {
        setViewAllMode(saved);
        return;
      }
    } catch {
      /* ignore */
    }
    setViewAllMode(null);
  }, [location.search]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (viewAllMode) sp.set('viewAll', viewAllMode);
    else sp.delete('viewAll');
    const nextSearch = sp.toString();
    const currentSearch = location.search.startsWith('?') ? location.search.slice(1) : location.search;
    if (nextSearch === currentSearch) return;
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true });
  }, [viewAllMode, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (viewAllMode) window.sessionStorage.setItem('adminMeetingsViewAllMode', viewAllMode);
      else window.sessionStorage.removeItem('adminMeetingsViewAllMode');
    } catch {
      /* ignore */
    }
  }, [viewAllMode]);

  useEffect(() => {
    setShowMeetingSortDropdown(false);
  }, [mainTab, viewAllMode]);

  const range = useMemo(() => {
    const start = startOfMonth(calendarAnchor);
    const end = endOfMonth(calendarAnchor);
    return { start, end };
  }, [calendarAnchor]);

  const mergedMeetings = useMemo(() => {
    const mock = generateMockMeetingsForRange(range.start, range.end);
    const local = loadLocalMeetings().filter((m) => m.date >= range.start && m.date <= range.end);
    const byId = new Map<string, AdminMeeting>();
    for (const m of mock) byId.set(m.id, m);
    for (const m of apiMeetings) {
      if (m.date >= range.start && m.date <= range.end) byId.set(m.id, m);
    }
    for (const m of local) byId.set(m.id, m);
    return [...byId.values()].sort((a, b) => {
      const dc = a.date.localeCompare(b.date);
      if (dc !== 0) return dc;
      return a.time.localeCompare(b.time);
    });
  }, [range.start, range.end, apiMeetings, localTick]);

  const appointmentMeetings = useMemo(
    () => mergedMeetings.filter((m) => m.category !== 'consultation'),
    [mergedMeetings]
  );

  const consultMeetings = useMemo(() => {
    const list = mergedMeetings.filter((m) => m.category === 'consultation');
    return [...list].sort((a, b) => {
      const pa = tierPremium(a) ? 0 : 1;
      const pb = tierPremium(b) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return b.date.localeCompare(a.date);
    });
  }, [mergedMeetings]);

  const normalizedClientSearchTokens = useMemo(
    () =>
      normalizeSearchText(clientSearchQuery)
        .split(' ')
        .map((token) => token.trim())
        .filter(Boolean),
    [clientSearchQuery]
  );

  const filteredAppointmentMeetings = useMemo(
    () => appointmentMeetings.filter((m) => meetingMatchesPageSearch(m, normalizedClientSearchTokens)),
    [appointmentMeetings, normalizedClientSearchTokens]
  );

  const filteredConsultMeetings = useMemo(
    () => consultMeetings.filter((m) => meetingMatchesPageSearch(m, normalizedClientSearchTokens)),
    [consultMeetings, normalizedClientSearchTokens]
  );

  const completedBookingsCount = useMemo(
    () =>
      appointmentMeetings.filter((m) => {
        const s = String(m.status || '').toLowerCase();
        return s === 'completed' || s === 'confirmed';
      }).length,
    [appointmentMeetings]
  );

  const completedConsultsCount = useMemo(
    () =>
      consultMeetings.filter((m) => {
        const s = String(m.status || '').toLowerCase();
        return s === 'completed' || s === 'confirmed';
      }).length,
    [consultMeetings]
  );

  const apptDates = useMemo(() => {
    const s = new Set<string>();
    for (const m of filteredAppointmentMeetings) s.add(m.date);
    return s;
  }, [filteredAppointmentMeetings]);

  const appointmentsForSelectedDay = useMemo(() => {
    if (!selectedDay) return filteredAppointmentMeetings;
    return filteredAppointmentMeetings.filter((m) => m.date === selectedDay);
  }, [filteredAppointmentMeetings, selectedDay]);

  const sortedAppointmentsList = useMemo(
    () => sortMeetingsByOption(appointmentsForSelectedDay, meetingSortOption),
    [appointmentsForSelectedDay, meetingSortOption]
  );

  const sortedConsultsList = useMemo(
    () => sortMeetingsByOption(filteredConsultMeetings, meetingSortOption),
    [filteredConsultMeetings, meetingSortOption]
  );

  const openClientAccount = (m: AdminMeeting) => {
    const em = (m.clientEmail || '').trim();
    const meetingsTabForReturn = mainTab === 'consults' ? 'consults' : 'bookings';
    if (em) {
      navigate(
        `/admin/clients/overview?email=${encodeURIComponent(em.toLowerCase())}&returnTo=meetings&meetingsTab=${meetingsTabForReturn}`
      );
    }
    else setHubNotice('NO CLIENT EMAIL ON FILE FOR THIS ROW.');
  };

  const handleConfirmSendQuote = async () => {
    if (!quoteMeeting) return;
    const email = (quoteMeeting.clientEmail || '').trim().toLowerCase();
    if (!email) {
      setHubNotice('CLIENT EMAIL REQUIRED TO SEND QUOTE.');
      setShowSendQuoteConfirm(false);
      return;
    }
    setQuoteSending(true);
    try {
      const parts = quoteBreakdown.split('\n').filter(Boolean);
      const breakdown = parts.map((line) => {
        const [label, rest] = line.includes('…') ? line.split('…').map((s) => s.trim()) : [line, ''];
        return { label, value: rest };
      });
      await postAdminConsultQuote({
        clientEmail: email,
        unitKey: quoteUnit,
        selections: { unit: quoteUnit, subPage: quoteSub },
        priceBreakdown: breakdown,
        adminMessage: quoteMessage,
        thumbnailSrc: '/assets/NOIR/noir-thumb.png',
      });
      setQuoteMeeting(null);
      setShowSendQuoteConfirm(false);
      setHubNotice('QUOTE SENT — CLIENT ALERT CREATED.');
    } catch (e) {
      setHubNotice(e instanceof Error ? e.message.toUpperCase() : 'SEND FAILED');
    } finally {
      setQuoteSending(false);
    }
  };

  const submitEditMeeting = async (action: 'reschedule' | 'cancel') => {
    if (!editMeeting) return;
    const uuid = /^[0-9a-f-]{36}$/i.test(editMeeting.id);
    setEditSubmitting(true);
    try {
      if (uuid) {
        await patchAdminMeeting(editMeeting.id, {
          notes: `${editMeeting.notes}\nADMIN: ${editReason} — ${editMessage}`.slice(0, 1200),
          status: 'scheduled',
        });
      }
      const email = editMeeting.clientEmail?.trim().toLowerCase();
      const uid = editMeeting.userId?.trim();
      let doneNotice = 'UPDATE RECORDED.';
      if (isSupabaseConfigured() && (email || uid)) {
        try {
          await postAdminMeetingClientAlert({
            meetingId: editMeeting.id,
            reason: editReason,
            message: editMessage,
            action,
            ...(uid ? { userId: uid } : {}),
            ...(email ? { clientEmail: email } : {}),
          });
          doneNotice = 'UPDATE SENT — CLIENT ALERT ADDED.';
        } catch (alertErr) {
          setHubNotice(
            alertErr instanceof Error
              ? `${alertErr.message.toUpperCase()} (NOTES SAVED)`
              : 'ALERT FAILED (NOTES SAVED)'
          );
          setEditMeeting(null);
          setEditMessage('');
          refreshLocal();
          return;
        }
      } else if (isSupabaseConfigured()) {
        doneNotice = 'NOTES SAVED — ADD CLIENT EMAIL ON MEETING TO SEND ALERTS.';
      }
      setEditMeeting(null);
      setEditMessage('');
      setHubNotice(doneNotice);
      refreshLocal();
    } catch (e) {
      setHubNotice(e instanceof Error ? e.message.toUpperCase() : 'UPDATE FAILED');
    } finally {
      setEditSubmitting(false);
    }
  };

  const monthLabel = useMemo(() => {
    const [y, m] = calendarAnchor.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long' }).toLowerCase();
  }, [calendarAnchor]);

  const calWeeks = useMemo(() => monthMatrix(calendarAnchor), [calendarAnchor]);

  const viewAllBaseRows = useMemo(() => {
    if (!viewAllMode) return [] as AdminMeeting[];
    const base = viewAllMode === 'bookings' ? filteredAppointmentMeetings : filteredConsultMeetings;
    return [...base].sort((a, b) => meetingSortTimeMs(b) - meetingSortTimeMs(a));
  }, [viewAllMode, filteredAppointmentMeetings, filteredConsultMeetings]);

  const viewAllRows = useMemo(
    () => sortMeetingsByOption(viewAllBaseRows, meetingSortOption),
    [viewAllBaseRows, meetingSortOption]
  );

  const viewAllClientCards = useMemo(() => {
    if (!viewAllMode) return [] as Array<{
      key: string;
      displayName: string;
      profilePhoto: string;
      hasActiveMeeting: boolean;
      totalCount: number;
      latestMeeting: AdminMeeting;
    }>;
    const byClient = new Map<
      string,
      { key: string; displayName: string; profilePhoto: string; hasActiveMeeting: boolean; totalCount: number; latestMeeting: AdminMeeting }
    >();
    for (const row of viewAllBaseRows) {
      const key = meetingClientUniqKey(row);
      const existing = byClient.get(key);
      if (!existing) {
        byClient.set(key, {
          key,
          displayName: meetingClientDisplayNameWithState(row),
          profilePhoto: meetingClientProfilePhoto(row),
          hasActiveMeeting: meetingIsCurrentOrActive(row),
          totalCount: 1,
          latestMeeting: row,
        });
        continue;
      }
      existing.totalCount += 1;
      if (meetingIsCurrentOrActive(row)) existing.hasActiveMeeting = true;
      if (meetingSortTimeMs(row) > meetingSortTimeMs(existing.latestMeeting)) {
        existing.latestMeeting = row;
        existing.profilePhoto = meetingClientProfilePhoto(row);
      }
    }
    const cards = [...byClient.values()];
    if (meetingSortOption === 'A to Z') {
      cards.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }));
    } else if (meetingSortOption === 'Z to A') {
      cards.sort((a, b) => b.displayName.localeCompare(a.displayName, undefined, { sensitivity: 'base' }));
    } else {
      cards.sort((a, b) => meetingSortTimeMs(b.latestMeeting) - meetingSortTimeMs(a.latestMeeting));
    }
    return cards;
  }, [viewAllMode, viewAllBaseRows, meetingSortOption]);

  const viewAllListClientPanels = useMemo(() => {
    if (!viewAllMode) return [] as Array<{
      key: string;
      displayName: string;
      profilePhoto: string;
      latestMeeting: AdminMeeting;
      tierIsPremium: boolean;
      meetings: AdminMeeting[];
    }>;

    const byClient = new Map<
      string,
      {
        key: string;
        displayName: string;
        profilePhoto: string;
        latestMeeting: AdminMeeting;
        tierIsPremium: boolean;
        meetings: AdminMeeting[];
      }
    >();

    for (const row of viewAllRows) {
      const key = meetingClientUniqKey(row);
      const existing = byClient.get(key);
      if (!existing) {
        byClient.set(key, {
          key,
          displayName: meetingClientDisplayNameWithState(row),
          profilePhoto: meetingClientProfilePhoto(row),
          latestMeeting: row,
          tierIsPremium: tierPremium(row),
          meetings: [row],
        });
        continue;
      }
      existing.meetings.push(row);
      if (meetingSortTimeMs(row) > meetingSortTimeMs(existing.latestMeeting)) {
        existing.latestMeeting = row;
        existing.profilePhoto = meetingClientProfilePhoto(row);
        existing.tierIsPremium = tierPremium(row);
      }
    }

    return [...byClient.values()].map((group) => {
      const meetings = [...group.meetings].sort((a, b) => meetingSortTimeMs(b) - meetingSortTimeMs(a));
      const latestMeeting = meetings[0] ?? group.latestMeeting;
      return {
        ...group,
        meetings,
        latestMeeting,
        profilePhoto: meetingClientProfilePhoto(latestMeeting),
        tierIsPremium: tierPremium(latestMeeting),
      };
    });
  }, [viewAllMode, viewAllRows]);

  const viewAllUniqueClientCount = useMemo(() => {
    if (!viewAllMode) return 0;
    return viewAllClientCards.length;
  }, [viewAllMode, viewAllClientCards]);

  const overviewBookingSales = useMemo(() => {
    let completedAppointments = 0;
    let paidInFullAppointments = 0;
    let salesUsd = 0;
    for (const appt of appointmentMeetings) {
      if (String(appt.status || '').trim().toLowerCase() !== 'completed') continue;
      completedAppointments += 1;
      const paidSale = bookingPaidInFullSalesUsd(appt);
      if (paidSale == null) continue;
      paidInFullAppointments += 1;
      salesUsd += paidSale;
    }
    return {
      completedAppointments,
      paidInFullAppointments,
      pendingBalanceAppointments: Math.max(0, completedAppointments - paidInFullAppointments),
      salesUsd,
      avgPaidInFullUsd: paidInFullAppointments > 0 ? Math.round(salesUsd / paidInFullAppointments) : 0,
    };
  }, [appointmentMeetings]);

  const overviewConsultSales = useMemo(() => {
    const allOrders = buildRevenueOrdersList() as Array<Record<string, unknown>>;
    const seenOrderKey = new Set<string>();
    let redeemedOrderCount = 0;
    let salesUsd = 0;
    for (const order of allOrders) {
      const consultCode = consultCodeFromOrder(order);
      if (!consultCode) continue;
      const orderKey = String(order.id || order.orderNumber || '').trim() || `${consultCode}-${String(order.date || '')}`;
      if (seenOrderKey.has(orderKey)) continue;
      seenOrderKey.add(orderKey);
      const total = normalizeMoneyValue(order.total ?? order.amount ?? order.subtotal);
      if (total == null || total <= 0) continue;
      redeemedOrderCount += 1;
      salesUsd += total;
    }
    const completedConsults = consultMeetings.filter(
      (m) => String(m.status || '').trim().toLowerCase() === 'completed'
    ).length;
    const wigOnlyConsults = consultMeetings.filter((m) => consultTypeLabelForMeeting(m) === 'WIG ONLY').length;
    const wigInstallConsults = consultMeetings.filter((m) => consultTypeLabelForMeeting(m) === 'WIG + INSTALL').length;
    return {
      salesUsd,
      redeemedOrderCount,
      completedConsults,
      totalConsults: consultMeetings.length,
      wigOnlyConsults,
      wigInstallConsults,
      avgRedeemedOrderUsd: redeemedOrderCount > 0 ? Math.round(salesUsd / redeemedOrderCount) : 0,
    };
  }, [consultMeetings, localTick]);

  const activeMainCardTitle = viewAllHeaderTitle(viewAllMode, viewAllUniqueClientCount)
    ?? (editMeeting
    ? 'EDIT MEETING'
    : quoteMeeting
    ? 'SEND CONSULT QUOTE'
    : null);

  const closeMainCardPanel = () => {
    setViewAllMode(null);
    setQuoteMeeting(null);
    setEditMeeting(null);
    setEditMessage('');
  };

  const renderMeetingsSortDropdown = () => (
    <div className="relative" style={{ marginLeft: '2px' }}>
      <button
        type="button"
        onClick={() => setShowMeetingSortDropdown((open) => !open)}
        className="flex items-center gap-1.5"
        style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000' }}
        aria-label="Sort clients"
      >
        <span>{meetingSortOptionToLabel(meetingSortOption)}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ transform: showMeetingSortDropdown ? 'rotate(180deg)' : 'none', color: '#EB1C24' }}
          aria-hidden
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {showMeetingSortDropdown && (
        <>
          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setShowMeetingSortDropdown(false)} />
          <div
            className="absolute left-0 py-1 bg-white border border-black shadow-lg z-20 min-w-[120px]"
            style={{ borderWidth: '1.3px', marginTop: '7px' }}
          >
            {MEETING_SORT_OPTIONS.filter((opt) => opt !== meetingSortOption).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setMeetingSortOption(opt);
                  setShowMeetingSortDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}
              >
                {meetingSortOptionToLabel(opt)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const travelBlackoutDates = useMemo(() => {
    const blocked = new Set<string>();
    for (const appt of appointmentMeetings) {
      if (!meetingHasTravelAddon(appt)) continue;
      blocked.add(addDaysIso(appt.date, 1));
    }
    return blocked;
  }, [appointmentMeetings]);

  const travelHalfDayDates = useMemo(() => {
    const blocked = new Set<string>();
    for (const appt of appointmentMeetings) {
      if (!meetingHasTravelAddon(appt)) continue;
      blocked.add(addDaysIso(appt.date, -1));
    }
    return blocked;
  }, [appointmentMeetings]);

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title="MEETINGS"
          showBack
          onBack={() => window.history.back()}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
          externalSearchValue={clientSearchQuery}
          onExternalSearchChange={setClientSearchQuery}
          globalSearchTargetPath="/admin/meetings"
          globalSearchPreserveKeys={['tab', 'viewAll']}
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black flex flex-col overflow-hidden min-h-0"
              style={{
                borderWidth: '1.3px',
                minHeight: 'calc(100dvh - 160px)',
              }}
            >
              {activeMainCardTitle ? (
                <div className="flex-shrink-0 px-5 pb-2 -mt-1" style={{ marginTop: '10px' }}>
                  <div className="flex items-center justify-between" style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#000',
                        fontSize: '12px',
                        fontWeight: 500,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        flex: '1 1 auto',
                        maxWidth: 'calc(100% - 24px)',
                        paddingRight: '8px',
                      }}
                    >
                      {activeMainCardTitle}
                    </h2>
                    <button
                      type="button"
                      onClick={closeMainCardPanel}
                      aria-label="Close view all"
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        lineHeight: 0,
                      }}
                    >
                      <img
                        src="/assets/close-icon.svg"
                        alt=""
                        width={16}
                        height={16}
                        style={{ display: 'block', filter: CLOSE_ICON_RED_FILTER }}
                      />
                    </button>
                  </div>
                  <div
                    style={{
                      borderBottom: '1px solid #d1d5db',
                      marginTop: '8px',
                    }}
                  />
                </div>
              ) : (
                <div
                  className="flex-shrink-0 px-5 pb-2"
                  style={{ marginTop: '10px' }}
                >
                  <div className="grid grid-cols-2 gap-4 mb-4" style={{ marginTop: '12px' }}>
                    <div
                      className="text-center py-3"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        borderRadius: '4px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        paddingBottom: '10px',
                      }}
                    >
                      <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', lineHeight: 1, fontSize: '24px' }}>
                        {mainTab === 'overview' ? formatUsd(overviewBookingSales.salesUsd) : completedBookingsCount}
                      </p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                        {mainTab === 'overview' ? 'BOOKING SALES' : 'TOTAL BOOKED'}
                      </p>
                    </div>
                    <div
                      className="text-center py-3"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        borderRadius: '4px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        paddingBottom: '10px',
                      }}
                    >
                      <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', lineHeight: 1, fontSize: '24px' }}>
                        {mainTab === 'overview' ? formatUsd(overviewConsultSales.salesUsd) : completedConsultsCount}
                      </p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                        {mainTab === 'overview' ? 'CONSULT SALES' : 'TOTAL CONSULTED'}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    <div
                      className="flex items-center gap-6"
                      style={{
                        width: 'max-content',
                        minWidth: '100%',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                    <button
                      type="button"
                      onClick={() => setMainTab('overview')}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: mainTab === 'overview' ? '#EB1C24' : '#808080',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'overview' ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      OVERVIEW
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainTab('bookings')}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: mainTab === 'bookings' ? '#EB1C24' : '#808080',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'bookings' ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      BOOKINGS
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainTab('consults')}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: mainTab === 'consults' ? '#EB1C24' : '#808080',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'consults' ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      CONSULTS
                    </button>
                    </div>
                  </div>
                </div>
              )}

              {hubNotice && (
                <div className="px-5 py-2" style={{ background: 'rgba(235,28,36,0.08)' }}>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', margin: 0, color: '#000' }}>{hubNotice}</p>
                  <button type="button" onClick={() => setHubNotice(null)} style={{ fontSize: '9px', marginTop: '4px' }}>
                    DISMISS
                  </button>
                </div>
              )}

              <div
                className="flex-1 min-h-0"
                style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}
              >
                <div
                  className="overflow-y-auto"
                  style={{
                    maxHeight: 'calc(100dvh - 240px)',
                    paddingTop: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                {viewAllMode ? (
                  <>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginTop: '10px', marginBottom: '8px', position: 'relative', zIndex: 3 }}
                    >
                      {renderMeetingsSortDropdown()}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', transform: 'translateX(-2px)' }}>
                        <button
                          type="button"
                          onClick={() => setViewAllDisplayMode('list')}
                          style={{
                            padding: '4px',
                            border: viewAllDisplayMode === 'list' ? '1px solid #EB1C24' : '1px solid #ccc',
                            background: 'none',
                            cursor: 'pointer',
                            borderRadius: 0,
                            color: viewAllDisplayMode === 'list' ? '#EB1C24' : '#000',
                          }}
                          aria-label="List view"
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '12px', gap: '3px' }}>
                            <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
                            <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
                            <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewAllDisplayMode('grid')}
                          style={{
                            padding: '4px',
                            border: viewAllDisplayMode === 'grid' ? '1px solid #EB1C24' : '1px solid #ccc',
                            background: 'none',
                            cursor: 'pointer',
                            borderRadius: 0,
                            color: viewAllDisplayMode === 'grid' ? '#EB1C24' : '#000',
                          }}
                          aria-label="Grid view"
                        >
                          <div style={{ width: '12px', height: '12px', border: '1px solid currentColor', backgroundColor: 'white', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', transform: 'translateY(-50%)', backgroundColor: 'currentColor' }} />
                            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', transform: 'translateX(-50%)', backgroundColor: 'currentColor' }} />
                          </div>
                        </button>
                      </div>
                    </div>
                    {viewAllDisplayMode === 'grid' ? (
                      <div className="grid grid-cols-3 gap-2" style={{ marginTop: '10px' }}>
                        {viewAllClientCards.map((clientCard) => {
                          const latest = clientCard.latestMeeting;
                          return (
                            <button
                              key={clientCard.key}
                              type="button"
                              onClick={() => openClientAccount(latest)}
                              className="w-full"
                              style={{
                                background: '#fff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0',
                                padding: '8px 6px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={clientCard.profilePhoto}
                                alt=""
                                width={53}
                                height={53}
                                style={{
                                  width: '53px',
                                  height: '53px',
                                  objectFit: 'cover',
                                  borderRadius: '9999px',
                                  border: '0.7px solid #000',
                                  boxSizing: 'border-box',
                                  margin: '4px auto 0',
                                  display: 'block',
                                }}
                              />
                              <p
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  fontSize: '8px',
                                  color: clientCard.hasActiveMeeting ? '#EB1C24' : '#000',
                                  margin: '6px 0 0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {clientCard.displayName}
                              </p>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  fontSize: '8px',
                                  color: '#808080',
                                  margin: '1px 0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {clientCard.totalCount}{' '}
                                {viewAllMode === 'bookings'
                                  ? clientCard.totalCount === 1
                                    ? 'BOOKING'
                                    : 'BOOKINGS'
                                  : clientCard.totalCount === 1
                                  ? 'CONSULT'
                                  : 'CONSULTS'}
                              </p>
                              {viewAllMode === 'bookings' ? (
                                <>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '8px',
                                      color: '#EB1C24',
                                      margin: '2px 0 0',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {formatBookingInstallLineForCard(latest)}
                                  </p>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Book"',
                                      fontSize: '8px',
                                      color: '#000',
                                      margin: '4px 0 0',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {formatHeaderDate(latest.date)}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '8px',
                                      color: '#EB1C24',
                                      margin: '2px 0 0',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {consultTypeLabelForMeeting(latest)}
                                  </p>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Book"',
                                      fontSize: '8px',
                                      color: '#000',
                                      margin: '4px 0 0',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {formatHeaderDate(latest.date)}
                                  </p>
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3" style={{ marginTop: '10px' }}>
                        {viewAllListClientPanels.map((clientGroup) => (
                          <div
                            key={clientGroup.key}
                            style={{
                              background: '#fff',
                              border: '1px solid #d1d5db',
                              borderRadius: '0',
                              padding: '10px',
                              height: '82px',
                              boxSizing: 'border-box',
                              overflow: 'hidden',
                            }}
                          >
                            <div className="flex items-start gap-2.5">
                              <button
                                type="button"
                                onClick={() => openClientAccount(clientGroup.latestMeeting)}
                                aria-label="Open client details"
                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, flexShrink: 0 }}
                              >
                                <img
                                  src={clientGroup.profilePhoto}
                                  alt=""
                                  width={62}
                                  height={62}
                                  style={{ width: '62px', height: '62px', objectFit: 'cover', borderRadius: '9999px', border: '0.7px solid #000', flexShrink: 0 }}
                                />
                              </button>
                              <div style={{ minWidth: 0, flex: 1, transform: 'translateX(6px)' }}>
                                <button
                                  type="button"
                                  onClick={() => openClientAccount(clientGroup.latestMeeting)}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    margin: 0,
                                    width: '100%',
                                    textAlign: 'left',
                                  }}
                                >
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '10px',
                                      margin: '0',
                                      color: '#000',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    <span style={{ color: '#000' }}>{clientGroup.displayName}</span>{' '}
                                    <span style={{ color: clientGroup.tierIsPremium ? '#000' : '#808080' }}>
                                      · {clientGroup.tierIsPremium ? 'PREMIUM' : 'STANDARD'}
                                    </span>
                                  </p>
                                </button>
                                <div
                                  style={{
                                    marginTop: '5px',
                                    maxHeight: '44px',
                                    overflowY: clientGroup.meetings.length > 3 ? 'auto' : 'hidden',
                                    paddingRight: clientGroup.meetings.length > 3 ? '4px' : 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                  }}
                                >
                                  {clientGroup.meetings.map((meeting) => (
                                    <div key={meeting.id} style={{ display: 'flex', alignItems: 'baseline', gap: '0px', minWidth: 0, lineHeight: '12px' }}>
                                      <span
                                        style={{
                                          fontFamily: '"Futura PT Medium"',
                                          fontSize: '9px',
                                          color: '#808080',
                                          flexShrink: 0,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {viewAllListMeetingLabel(meeting)}
                                      </span>
                                      <span
                                        style={{
                                          fontFamily: '"Futura PT Medium"',
                                          fontSize: '9px',
                                          color: '#EB1C24',
                                          minWidth: 0,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {formatViewAllListMeetingDateOnly(meeting)} ·{' '}
                                        <span style={{ color: '#000' }}>{formatViewAllListMeetingTimeOnly(meeting)}</span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : editMeeting ? (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#808080', margin: 0 }}>
                      ORDER / ROW: {editMeeting.id}
                    </p>
                    <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
                      REASON
                      <select
                        className="w-full mt-1 p-2 border text-[10px]"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                      >
                        {EDIT_REASONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
                      MESSAGE TO CLIENT
                      <textarea
                        className="w-full mt-1 p-2 border text-[10px]"
                        rows={3}
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                      />
                    </label>
                    <div className="flex flex-col gap-2 mt-3">
                      <button
                        type="button"
                        className="py-2 border border-black text-[10px]"
                        disabled={editSubmitting}
                        onClick={() => void submitEditMeeting('reschedule')}
                      >
                        RESCHEDULE APPOINTMENT (NOTIFY CLIENT)
                      </button>
                      <button
                        type="button"
                        className="py-2 border border-black text-[10px]"
                        disabled={editSubmitting}
                        onClick={() => void submitEditMeeting('cancel')}
                      >
                        CANCEL APPOINTMENT (NOTIFY CLIENT)
                      </button>
                    </div>
                  </div>
                ) : quoteMeeting ? (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', margin: 0 }}>{quoteMeeting.client}</p>
                    <label className="block mt-3" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
                      UNIT
                      <select
                        className="w-full mt-1 p-2 border text-[10px]"
                        value={quoteUnit}
                        onChange={(e) => setQuoteUnit(e.target.value)}
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
                      SUB-PAGE SELECTIONS (FIRST PASS)
                      <select
                        className="w-full mt-1 p-2 border text-[10px]"
                        value={quoteSub}
                        onChange={(e) => setQuoteSub(e.target.value)}
                      >
                        {SUB_PAGE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
                      MESSAGE
                      <textarea
                        className="w-full mt-1 p-2 border text-[10px]"
                        rows={3}
                        value={quoteMessage}
                        onChange={(e) => setQuoteMessage(e.target.value)}
                      />
                    </label>
                    <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
                      PRICE BREAKDOWN (ONE LINE PER ROW, USE … BETWEEN LABEL AND VALUE)
                      <textarea
                        className="w-full mt-1 p-2 border text-[10px] font-mono"
                        rows={5}
                        value={quoteBreakdown}
                        onChange={(e) => setQuoteBreakdown(e.target.value)}
                      />
                    </label>
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', marginTop: '8px' }}>
                      CONSULT CODE (INITIALS + 3 DIGITS) IS GENERATED SERVER-SIDE; $40 OFF; EXPIRES 72H AFTER SEND. APPLY AT
                      CHECKOUT (PIPELINE TBD).
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="w-full py-2 border border-black text-[10px]"
                        style={{ color: '#EB1C24' }}
                        disabled={quoteSending}
                        onClick={() => setShowSendQuoteConfirm(true)}
                      >
                        {quoteSending ? '…' : 'SEND ALERT'}
                      </button>
                    </div>
                  </div>
                ) : mainTab === 'overview' ? (
                  <>
                    <div style={{ marginTop: '12px' }}>
                      <div className="space-y-3">
                        <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '0', padding: '10px' }}>
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000', margin: 0 }}>
                            APPOINTMENT ANALYTICS
                          </p>
                          <div style={{ marginTop: '8px', display: 'grid', rowGap: '5px' }}>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              COMPLETED APPOINTMENTS: {overviewBookingSales.completedAppointments}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              PAID IN FULL APPOINTMENTS: {overviewBookingSales.paidInFullAppointments}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              APPOINTMENTS WITH REMAINING BALANCE: {overviewBookingSales.pendingBalanceAppointments}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '9px', margin: 0, color: '#EB1C24' }}>
                              AVG BOOKING SALE (PAID IN FULL): {formatUsd(overviewBookingSales.avgPaidInFullUsd)}
                            </p>
                          </div>
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '0', padding: '10px' }}>
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000', margin: 0 }}>
                            CONSULT ANALYTICS
                          </p>
                          <div style={{ marginTop: '8px', display: 'grid', rowGap: '5px' }}>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              TOTAL CONSULT MEETINGS: {overviewConsultSales.totalConsults}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              COMPLETED CONSULTS: {overviewConsultSales.completedConsults}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              WIG ONLY CONSULTS: {overviewConsultSales.wigOnlyConsults}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              WIG + INSTALL CONSULTS: {overviewConsultSales.wigInstallConsults}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              REDEEMED CONSULT-OFFER ORDERS: {overviewConsultSales.redeemedOrderCount}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '9px', margin: 0, color: '#EB1C24' }}>
                              AVG CONSULT SALE (REDEEMED OFFERS): {formatUsd(overviewConsultSales.avgRedeemedOrderUsd)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : mainTab === 'bookings' ? (
                  <>
                    <div className="flex items-center justify-between mb-2" style={{ marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const s = parseISODateLocal(startOfMonth(calendarAnchor));
                          s.setMonth(s.getMonth() - 1);
                          const y = s.getFullYear();
                          const mo = String(s.getMonth() + 1).padStart(2, '0');
                          setCalendarAnchor(`${y}-${mo}-01`);
                        }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 6px' }}
                        aria-label="Previous month"
                      >
                        <img src={CALENDAR_LEFT_ARROW_SRC} alt="" width={17} height={17} draggable={false} />
                      </button>
                      <span
                        style={{
                          fontFamily: '"Bohemy", sans-serif',
                          fontSize: '25px',
                          color: '#000',
                          textTransform: 'lowercase',
                          fontWeight: 200,
                        }}
                      >
                        {monthLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const s = parseISODateLocal(startOfMonth(calendarAnchor));
                          s.setMonth(s.getMonth() + 1);
                          const y = s.getFullYear();
                          const mo = String(s.getMonth() + 1).padStart(2, '0');
                          setCalendarAnchor(`${y}-${mo}-01`);
                        }}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 6px' }}
                        aria-label="Next month"
                      >
                        <img src={CALENDAR_RIGHT_ARROW_SRC} alt="" width={18} height={18} draggable={false} />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-1" style={{ fontSize: '8px', color: '#808080' }}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {calWeeks.flat().map((cell) => {
                        const hasAppt = apptDates.has(cell.iso);
                        const hasTravelBlock = travelBlackoutDates.has(cell.iso);
                        const hasTravelHalfDay = travelHalfDayDates.has(cell.iso);
                        const hasWhiteCalendarCell = !hasTravelBlock && hasAppt;
                        const disabled = hasTravelBlock;
                        const title = hasTravelBlock
                          ? 'TRAVEL BLOCK: UNAVAILABLE (FULL DAY)'
                          : hasTravelHalfDay
                          ? 'TRAVEL BLOCK: AFTER 12PM UNAVAILABLE'
                          : undefined;
                        return (
                          <button
                            key={cell.iso}
                            type="button"
                            onClick={() => {
                              if (disabled) return;
                              setSelectedDay(cell.iso);
                            }}
                            disabled={disabled}
                            title={title}
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '10px',
                              padding: '6px 0',
                              border: selectedDay === cell.iso ? '1px solid #EB1C24' : hasWhiteCalendarCell ? '1px solid #e5e7eb' : '1px solid #e5e7eb',
                              borderRadius: '0',
                              background: hasTravelBlock ? '#f3f4f6' : hasAppt ? '#fff' : '#f3f4f6',
                              color: hasTravelBlock ? '#9ca3af' : hasAppt ? '#EB1C24' : '#9ca3af',
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              opacity: disabled ? 0.65 : 1,
                            }}
                          >
                            {cell.label}
                          </button>
                        );
                      })}
                    </div>
                    {sortedAppointmentsList.length === 0 ? (
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '11px',
                          color: '#808080',
                          textAlign: 'center',
                          padding: '16px',
                        }}
                      >
                        {normalizedClientSearchTokens.length > 0
                          ? 'NO BOOKINGS MATCH YOUR SEARCH.'
                          : 'YOU DON\'T HAVE ANY APPOINTMENTS.'}
                      </p>
                    ) : (
                      <div style={{ marginTop: '6px' }}>
                        <div className="flex items-center justify-start" style={{ marginTop: '0', marginBottom: '10px', position: 'relative', zIndex: 3 }}>
                          {renderMeetingsSortDropdown()}
                        </div>
                        {sortedAppointmentsList.map((m) => (
                          <div
                            key={m.id}
                            className="mb-3"
                            style={{
                              background: '#fff',
                              border: '1px solid #d1d5db',
                              borderRadius: '0',
                              padding: '10px',
                            }}
                          >
                          <div className="flex justify-between items-start" style={{ gap: '12px' }}>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => openClientAccount(m)}
                                  aria-label="Open client details"
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, flexShrink: 0, marginTop: '8px', marginLeft: '4px' }}
                                >
                                  <img
                                    src={meetingClientProfilePhoto(m)}
                                    alt=""
                                    width={44}
                                    height={44}
                                    style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '9999px', border: '0.8px solid #000', display: 'block' }}
                                  />
                                </button>
                                <div className="min-w-0 flex-1" style={{ marginLeft: '6px' }}>
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', margin: '7px 0 0' }}>
                                <span style={{ color: '#EB1C24' }}>{meetingClientDisplayNameWithState(m)}</span>{' '}
                                <span style={{ color: tierLabelColor(m) }}>
                                  · {tierPremium(m) ? 'PREMIUM' : 'STANDARD'}
                                </span>
                              </p>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Demi"',
                                  fontSize: '10px',
                                  color: '#808080',
                                  margin: '4px 0 0',
                                }}
                              >
                                {formatBookingInstallLineForCard(m)}
                              </p>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Book"',
                                  fontSize: '9px',
                                  color: '#000000',
                                  margin: '4px 0 0',
                                  whiteSpace: 'pre-line',
                                }}
                              >
                                {formatBookingAddonsLineForCardDisplay(m)}
                              </p>
                              <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', color: '#EB1C24', margin: '4px 0 0' }}>
                                {formatHeaderDate(m.date)} · {m.time} · {formatMinutesAsHoursAndMinutes(m.duration)}
                              </p>
                              {(() => {
                                const payment = getBookingPaymentStatusForCard(m);
                                const isRedDueBar = payment.duePassed || payment.dueProgressPct >= 98;
                                return (
                                  <>
                                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#000', margin: '12px 0 0' }}>
                                      CURRENT BALANCE: {formatUsd(payment.remainingDueUsd)} OF {formatUsd(payment.paidTotalUsd)} USD
                                    </p>
                                    <div style={{ marginTop: '4px' }}>
                                      <div
                                        style={{
                                          width: '100%',
                                          height: '9px',
                                          backgroundColor: isRedDueBar ? '#EB1C24' : '#E0E0E0',
                                          borderRadius: '0',
                                          overflow: 'hidden',
                                          border: isRedDueBar ? '1px solid #000000' : '1px solid #808080',
                                          boxSizing: 'border-box',
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: `${payment.dueProgressPct}%`,
                                            height: '100%',
                                            backgroundColor: isRedDueBar ? '#EB1C24' : '#808080',
                                            transition: 'width 0.3s ease',
                                            borderRadius: '0',
                                          }}
                                        />
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', marginBottom: '7px' }}>
                                        <p
                                          style={{
                                            fontFamily: '"Futura PT Demi"',
                                            fontSize: '9px',
                                            color: '#808080',
                                            margin: 0,
                                          }}
                                        >
                                          PAYMENT DUE: {payment.finalPaymentDueDateText}
                                        </p>
                                        <p
                                          style={{
                                            fontFamily: '"Futura PT Medium"',
                                            fontSize: '9px',
                                            color: '#EB1C24',
                                            margin: 0,
                                            textAlign: 'right',
                                          }}
                                        >
                                          {payment.finalPaymentDueText}
                                        </p>
                                      </div>
                                      {payment.autopayStatus === 'paid' ? (
                                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#808080', margin: '0 0 2px' }}>
                                          AUTOPAY STATUS: FINAL PAYMENT PROCESSED SUCCESSFULLY
                                        </p>
                                      ) : payment.autopayStatus === 'failed' ? (
                                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#EB1C24', margin: '0 0 2px' }}>
                                          AUTOPAY STATUS: FAILED{payment.autopayLastError ? ` · ${payment.autopayLastError}` : ''}
                                        </p>
                                      ) : payment.autopayStatus === 'scheduled' ? (
                                        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: '#808080', margin: '0 0 2px' }}>
                                          AUTOPAY STATUS: SCHEDULED ON CARD ON FILE
                                        </p>
                                      ) : null}
                                    </div>
                                  </>
                                );
                              })()}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditMeeting(m);
                              }}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                flexShrink: 0,
                                position: 'relative',
                                zIndex: 2,
                                marginTop: '4px',
                                marginRight: '3px',
                              }}
                              aria-label="Edit meeting"
                            >
                              <img src="/assets/edit-meeting-icon-booking.svg" alt="" width={11} height={11} />
                            </button>
                          </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-start" style={{ marginTop: '8px', marginBottom: '8px', position: 'relative', zIndex: 3 }}>
                      {renderMeetingsSortDropdown()}
                    </div>
                    {sortedConsultsList.length === 0 ? (
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', textAlign: 'center' }}>
                        {normalizedClientSearchTokens.length > 0
                          ? 'NO CONSULTS MATCH YOUR SEARCH.'
                          : 'NO CONSULT ROWS IN THIS MONTH RANGE. SYNC FROM CHECKOUT OR EXPAND MOCK DATA.'}
                      </p>
                    ) : (
                      <div style={{ marginTop: '6px' }}>
                        {sortedConsultsList.map((m) => {
                          const meta = m.metadata || {};
                          const hair = String(meta.hairOption || m.notes || '—');
                          const notes = String(meta.consultNotes || '').trim() || m.notes;
                          const imgs = consultInspo(m);
                          return (
                            <div
                              key={m.id}
                              className="mb-3"
                              style={{
                                background: '#fff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0',
                                padding: '10px',
                              }}
                            >
                              <div className="flex justify-between items-start" style={{ gap: '12px' }}>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => openClientAccount(m)}
                                      aria-label="Open client details"
                                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, flexShrink: 0, marginTop: '8px', marginLeft: '4px' }}
                                    >
                                      <img
                                        src={meetingClientProfilePhoto(m)}
                                        alt=""
                                        width={44}
                                        height={44}
                                    style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '9999px', border: '0.8px solid #000', display: 'block' }}
                                      />
                                    </button>
                                    <div className="min-w-0 flex-1">
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', margin: 0, color: '#EB1C24', transform: 'translate(6px, 6px)' }}>
                                    {meetingClientDisplayNameWithState(m)}{' '}
                                    <span style={{ color: tierLabelColor(m) }}>
                                      · {tierPremium(m) ? 'PREMIUM' : 'STANDARD'}
                                    </span>
                                  </p>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#808080', margin: '6px 0 0', marginLeft: '6px' }}>{hair}</p>
                                  {imgs.length > 0 && (
                                    <div className="flex flex-wrap mt-2" style={{ marginLeft: '10px', gap: '8px' }}>
                                      {imgs.slice(0, 3).map((src, i) => (
                                        <button
                                          type="button"
                                          key={i}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setConsultPhotoPreviewSrc(src);
                                          }}
                                          aria-label="Enlarge submitted consult photo"
                                          style={{
                                            width: '50px',
                                            height: '50px',
                                            background: '#f3f4f6',
                                            border: '3px solid #FFFFFF',
                                            boxShadow: '0 0 0 1.1px #000000',
                                            boxSizing: 'border-box',
                                            overflow: 'hidden',
                                            padding: 0,
                                            cursor: 'zoom-in',
                                          }}
                                        >
                                          <img
                                            src={src}
                                            alt=""
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                              display: 'block',
                                            }}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#808080', marginTop: '8px', marginLeft: '6px', marginBottom: '3px' }}>
                                    {notes}
                                  </p>
                                  <div style={{ height: '3px' }} />
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuoteMeeting(m);
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    flexShrink: 0,
                                    position: 'relative',
                                    zIndex: 2,
                                    marginTop: '4px',
                                    marginRight: '3px',
                                  }}
                                  aria-label="Send quote"
                                >
                                  <img src="/assets/edit-meeting-icon-booking.svg" alt="" width={11} height={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
                </div>
              </div>
            </div>

            <div className="w-full px-0 md:px-0" style={{ marginTop: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMainTab('bookings');
                    setViewAllMode((m) => (m === 'bookings' ? null : 'bookings'));
                  }}
                  className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  VIEW ALL BOOKINGS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMainTab('consults');
                    setViewAllMode((m) => (m === 'consults' ? null : 'consults'));
                  }}
                  className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  VIEW ALL CONSULTS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showSendQuoteConfirm}
        onClose={() => setShowSendQuoteConfirm(false)}
        onConfirm={() => void handleConfirmSendQuote()}
        title="SEND ALERT?"
        message="CLIENT WILL SEE AN ALERT WITH VIEW QUOTE (CONSULT OFFER)."
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="send-consult-quote-confirm"
      />

      {consultPhotoPreviewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setConsultPhotoPreviewSrc(null)}
          role="presentation"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              border: '1.3px solid #000',
              background: '#fff',
              padding: '10px',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <img
              src={consultPhotoPreviewSrc}
              alt="Consult submitted photo preview"
              style={{
                width: '100%',
                maxHeight: 'calc(90vh - 20px)',
                objectFit: 'contain',
                display: 'block',
                background: '#f3f4f6',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
