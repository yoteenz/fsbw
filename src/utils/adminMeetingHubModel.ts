import { parseISODateLocal, startOfMonth, endOfMonth, type AdminMeeting } from './adminMeetingsMock';

export type { AdminMeeting };

export const BOOKING_ADDON_LABEL_BY_ID: Record<string, string> = {
  braids: 'BRAIDS',
  'brow-clean': 'BROW SCULPTING',
  'brow-tint': 'BROW TINT',
  makeup: 'MAKEUP',
  'mink-lashes': 'MINK LASHES',
  'clean-lace': 'CLEAN LACE',
  travel: 'TRAVEL FEE',
};

export const BOOKING_ADDON_LABELS = new Set<string>([
  'BRAIDS',
  'BROW SCULPTING',
  'BROW TINT',
  'MAKEUP',
  'MINK LASHES',
  'CLEAN LACE',
  'TRAVEL FEE',
]);

export const BOOKING_ADDON_ORDER = [
  'CLEAN LACE',
  'BRAIDS',
  'BROW SCULPTING',
  'BROW TINT',
  'MAKEUP',
  'MINK LASHES',
  'TRAVEL FEE',
] as const;

export const BOOKING_ADDON_PRICE_BY_LABEL: Record<(typeof BOOKING_ADDON_ORDER)[number], number> = {
  'CLEAN LACE': 40,
  BRAIDS: 60,
  'BROW SCULPTING': 40,
  'BROW TINT': 60,
  MAKEUP: 250,
  'MINK LASHES': 20,
  'TRAVEL FEE': 1200,
};

export const BOOKING_UNIT_LABELS = ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE', 'SOFT CURL', 'OCEAN CURL'] as const;

export const BOOKING_UNIT_FALLBACK_PRICE_BY_LABEL: Record<(typeof BOOKING_UNIT_LABELS)[number], number> = {
  NOIR: 740,
  BLANCO: 820,
  'SOFT WAVE': 760,
  'BEACH WAVE': 760,
  'SOFT CURL': 780,
  'OCEAN CURL': 780,
};

export const CLIENT_STATE_BY_EMAIL: Record<string, string> = {
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

export function formatHeaderDate(dateStr: string): string {
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

export function monthMatrix(anchorISO: string): { label: string; iso: string; inMonth: boolean }[][] {
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

export function tierPremium(m: AdminMeeting): boolean {
  const meta = m.metadata || {};
  const t = String(meta.tier || '').toLowerCase();
  return t === 'premium' || m.notes.toUpperCase().includes('PREMIUM');
}

export function tierLabelColor(m: AdminMeeting): string {
  return tierPremium(m) ? '#000000' : '#808080';
}

export function normalizeInstallKindLabel(raw: unknown): 'NEW INSTALL' | 'RE-INSTALL' | null {
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

export function normalizeBookingAddonLabel(raw: unknown): string | null {
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

export function orderedUniqueAddons(addons: string[]): string[] {
  const set = new Set(addons);
  const ordered = BOOKING_ADDON_ORDER.filter((label) => set.has(label));
  const extras = [...set].filter((label) => !ordered.includes(label as (typeof BOOKING_ADDON_ORDER)[number]));
  return [...ordered, ...extras];
}

export function normalizeBookingUnitLabel(raw: unknown): (typeof BOOKING_UNIT_LABELS)[number] | null {
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

export function normalizeUsdPrice(raw: unknown): number | null {
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

export function parseUsStateFromAddress(raw: unknown): string | null {
  const value = String(raw || '').trim().toUpperCase();
  if (!value) return null;
  const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    const maybeState = parts[2]?.match(/\b[A-Z]{2}\b/);
    if (maybeState?.[0]) return maybeState[0];
  }
  return null;
}

export function meetingClientEmailKey(m: AdminMeeting): string {
  return String(m.clientEmail || '').trim().toLowerCase();
}

export function normalizeProfileImageCandidate(raw: unknown): string | null {
  const value = String(raw || '').trim();
  if (!value) return null;
  if (value.startsWith('/assets/') || /^https?:\/\//i.test(value) || value.startsWith('data:image/')) return value;
  return null;
}

export function profileImageFromRegisteredUsersByEmail(email: string): string | null {
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

export function meetingClientProfilePhoto(m: AdminMeeting): string {
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

export function meetingClientStateCode(m: AdminMeeting): string | null {
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

export function meetingClientDisplayNameWithState(m: AdminMeeting): string {
  const state = meetingClientStateCode(m);
  return state ? `${m.client} (${state})` : m.client;
}

export function normalizeSearchText(raw: unknown): string {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

export function meetingSearchBlob(m: AdminMeeting): string {
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

export function meetingClientUniqKey(m: AdminMeeting): string {
  const email = String(m.clientEmail || '').trim().toLowerCase();
  if (email) return `email:${email}`;
  return `name:${meetingClientDisplayNameWithState(m).trim().toUpperCase()}`;
}

export function meetingIsCurrentOrActive(m: AdminMeeting): boolean {
  const status = String(m.status || '').trim().toLowerCase();
  if (!status) return false;
  return status === 'scheduled' || status === 'confirmed' || status === 'active' || status === 'in_progress';
}

export function meetingSortTimeMs(m: AdminMeeting): number {
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

export function sortMeetingsByOption(rows: AdminMeeting[], sortOption: string): AdminMeeting[] {
  const filtered = (() => {
    if (sortOption === 'Premium') return rows.filter((m) => tierPremium(m));
    if (sortOption === 'Standard') return rows.filter((m) => !tierPremium(m));
    if (sortOption === 'Re-install') {
      return rows.filter((m) => m.category === 'appointment' && getBookingCardDetails(m).installKind === 'RE-INSTALL');
    }
    if (sortOption === 'New install') {
      return rows.filter((m) => m.category === 'appointment' && getBookingCardDetails(m).installKind === 'NEW INSTALL');
    }
    if (sortOption === 'Wig only') {
      return rows.filter((m) => m.category === 'consultation' && consultTypeLabelForMeeting(m) === 'WIG ONLY');
    }
    if (sortOption === 'Wig + install') {
      return rows.filter((m) => m.category === 'consultation' && consultTypeLabelForMeeting(m) === 'WIG + INSTALL');
    }
    return [...rows];
  })();
  const sorted = [...filtered];
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

export function formatViewAllListMeetingDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dt = new Date(year, month - 1, day);
    const weekday = dt.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
    return `${weekday}, ${month}/${day},${year}`;
  } catch {
    return dateStr;
  }
}

export function viewAllListMeetingLabel(m: AdminMeeting): string {
  if (m.category === 'appointment') return `${getBookingCardDetails(m).installKind}:`;
  return `${consultTypeLabelForMeeting(m)}:`;
}

export function formatViewAllListMeetingDateOnly(m: AdminMeeting): string {
  return formatViewAllListMeetingDate(m.date);
}

export function formatViewAllListMeetingTimeOnly(m: AdminMeeting): string {
  return String(m.time || '').trim().toUpperCase();
}

export function meetingMatchesPageSearch(m: AdminMeeting, searchTokens: string[]): boolean {
  if (searchTokens.length === 0) return true;
  const haystack = meetingSearchBlob(m);
  return searchTokens.every((token) => haystack.includes(token));
}

export function toIsoDateOnly(dateIso: string): string {
  return String(dateIso || '').slice(0, 10);
}

export function addDaysIso(isoDate: string, days: number): string {
  const base = parseISODateLocal(toIsoDateOnly(isoDate));
  base.setDate(base.getDate() + days);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function meetingHasTravelAddon(m: AdminMeeting): boolean {
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;
  const ids = Array.isArray(meta.bookingAddonIds)
    ? meta.bookingAddonIds.filter((id): id is string => typeof id === 'string')
    : [];
  if (ids.some((id) => id.toLowerCase() === 'travel')) return true;
  return formatBookingAddonsLineForCard(m).toUpperCase().includes('TRAVEL FEE');
}

export type BookingCardDetails = {
  installKind: 'NEW INSTALL' | 'RE-INSTALL';
  addons: string[];
  unitLabel: string;
  unitPriceUsd: number;
};

export function getBookingCardDetails(m: AdminMeeting): BookingCardDetails {
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

export function formatBookingInstallLineForCard(m: AdminMeeting): string {
  const details = getBookingCardDetails(m);
  return `${details.installKind}: ${details.unitLabel} $${details.unitPriceUsd.toLocaleString('en-US')} USD`;
}

export function formatBookingAddonsLineForCard(m: AdminMeeting): string {
  const details = getBookingCardDetails(m);
  return details.addons.length > 0 ? `ADD-ONS: ${details.addons.join(', ')}` : 'ADD-ONS: NONE';
}

export function formatBookingAddonsLineForCardDisplay(m: AdminMeeting): string {
  const details = getBookingCardDetails(m);
  const addonsNoBreak = details.addons.map((addon) => addon.replace(/\s+/g, '\u00A0'));
  return details.addons.length > 0 ? `ADD-ONS: ${addonsNoBreak.join(', ')}` : 'ADD-ONS: NONE';
}

export function bookingDisplayTotalUsdFallback(m: AdminMeeting): number {
  const details = getBookingCardDetails(m);
  const addonTotalUsd = details.addons.reduce(
    (sum, addonLabel) => sum + (BOOKING_ADDON_PRICE_BY_LABEL[addonLabel as keyof typeof BOOKING_ADDON_PRICE_BY_LABEL] ?? 0),
    0
  );
  return details.unitPriceUsd + addonTotalUsd + bookingInstallFeeUsdFromMeeting(m);
}

export function formatUsd(amount: number): string {
  return `$${Math.max(0, Math.round(amount)).toLocaleString('en-US')}`;
}

export function normalizeMoneyValue(raw: unknown): number | null {
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

export function bookingInstallFeeUsdFromMeeting(m: AdminMeeting): number {
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
export function bookingPaidInFullSalesUsd(m: AdminMeeting): number | null {
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
    normalizeMoneyValue(
      meta.bookingOrderTotalPaidUsd ??
      meta.bookingLineTotalPaidUsd ??
      meta.bookingPaidTotalUsd ??
      meta.orderTotalUsd ??
      meta.orderTotalUSD ??
      meta.orderTotal
    ) ??
    bookingDisplayTotalUsdFallback(m);

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

export function consultCodeFromOrder(order: Record<string, unknown>): string | null {
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

export function consultTypeLabelForMeeting(m: AdminMeeting): 'WIG ONLY' | 'WIG + INSTALL' {
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

export function formatMinutesAsHoursAndMinutes(rawDuration: string): string {
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

export function toLocalDateEndOfDay(isoDate: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(isoDate || ''))) return null;
  const [y, m, d] = String(isoDate).split('-').map(Number);
  const dt = new Date(y, m - 1, d, 23, 59, 59, 999);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export type BookingPaymentStatus = {
  remainingDueUsd: number;
  paidTotalUsd: number;
  finalPaymentDueDateText: string;
  finalPaymentDueText: string;
  dueProgressPct: number;
  duePassed: boolean;
  dueWithinFinal48Hours: boolean;
  autopayStatus: 'paid' | 'failed' | 'scheduled' | 'not_enabled';
  autopayLastError: string;
};

export function getBookingPaymentStatusForCard(m: AdminMeeting): BookingPaymentStatus {
  const details = getBookingCardDetails(m);
  const installFeeUsd = details.installKind === 'RE-INSTALL' ? 225 : 275;
  const meta = (m.metadata && typeof m.metadata === 'object' ? m.metadata : {}) as Record<string, unknown>;

  const orderTotalCandidates = [
    meta.bookingOrderTotalPaidUsd,
    meta.bookingOrderTotalPaidUSD,
    meta.bookingLineTotalPaidUsd,
    meta.bookingLineTotalPaidUSD,
    meta.bookingPaidTotalUsd,
    meta.bookingPaidTotalUSD,
    meta.orderTotalUsd,
    meta.orderTotalUSD,
    meta.orderTotal,
  ];
  const orderTotalDetected = orderTotalCandidates
    .map((candidate) => normalizeUsdPrice(candidate))
    .find((candidate): candidate is number => candidate != null);

  const paidTotalUsd = orderTotalDetected ?? bookingDisplayTotalUsdFallback(m);
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
  const bookedAtRaw = String(meta.bookingBookedAtIso || meta.bookingAutopayConsentAt || '').trim();
  const bookedAtParsed = bookedAtRaw ? new Date(bookedAtRaw) : null;
  const syntheticBookedAtMs = Math.min(nowMs - 24 * 60 * 60 * 1000, dueMs - 21 * 24 * 60 * 60 * 1000);
  const bookedAtMs = bookedAtParsed && Number.isFinite(bookedAtParsed.getTime()) ? bookedAtParsed.getTime() : syntheticBookedAtMs;
  const totalWindowMs = Math.max(1, dueMs - bookedAtMs);
  const remainingMs = Math.max(0, dueMs - nowMs);
  const elapsedPct = Math.max(
    0,
    Math.min(100, ((totalWindowMs - Math.min(totalWindowMs, remainingMs)) / totalWindowMs) * 100)
  );
  const duePassed = remainingMs <= 0;
  const dueWithinFinal48Hours = remainingMs <= 48 * 60 * 60 * 1000;

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

  return {
    remainingDueUsd,
    paidTotalUsd,
    finalPaymentDueDateText: dueDateText,
    finalPaymentDueText: dueText,
    dueProgressPct: elapsedPct,
    duePassed,
    dueWithinFinal48Hours,
    autopayStatus,
    autopayLastError,
  };
}

export function consultInspo(m: AdminMeeting): string[] {
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
