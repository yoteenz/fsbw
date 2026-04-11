/**
 * Deterministic mock meetings + local admin-scheduled meetings for /admin/meetings.
 * Mock rows vary by calendar day (seeded); merged with localStorage drafts.
 */
import { getMockClientsForAyoteenz } from '../pages/admin/clients/page';
import { ADMIN_KATEENA_EMAIL, FOUNDER_PRIVILEGED_ADMIN_EMAIL } from './adminAuth';

export type MeetingCategory = 'consultation' | 'appointment';

export type AdminMeeting = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  client: string;
  clientEmail?: string;
  userId?: string;
  type: string;
  category: MeetingCategory;
  duration: string;
  status: 'Confirmed' | 'Pending' | 'Canceled';
  notes: string;
  services?: string[];
  /** From Supabase `meetings.metadata` (checkout + admin). */
  metadata?: Record<string, unknown>;
};

export const APPOINTMENT_SERVICE_OPTIONS = [
  'INSTALL',
  'RE-INSTALL',
] as const;

export const CONSULTATION_TYPE_LABEL = 'WIG CONSULT';

const LOCAL_STORAGE_KEY = 'adminMeetingsScheduled';

function hash32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type MockClientIdentity = {
  first: string;
  last: string;
  email: string;
  membershipType: 'PREMIUM' | 'STANDARD';
};

const FALLBACK_MOCK_CLIENT_IDENTITIES: MockClientIdentity[] = [
  { first: 'Zara', last: 'Adams', email: 'mock1@test.com', membershipType: 'PREMIUM' },
  { first: 'Amy', last: 'Brooks', email: 'mock2@test.com', membershipType: 'STANDARD' },
  { first: 'Quinn', last: 'Chen', email: 'mock3@test.com', membershipType: 'PREMIUM' },
  { first: 'Diana', last: 'Foster', email: 'mock4@test.com', membershipType: 'STANDARD' },
  { first: 'Elena', last: 'Garcia', email: 'mock5@test.com', membershipType: 'PREMIUM' },
  { first: 'Fiona', last: 'Hayes', email: 'mock6@test.com', membershipType: 'STANDARD' },
  { first: 'Grace', last: 'Ingram', email: 'mock7@test.com', membershipType: 'PREMIUM' },
  { first: 'Hannah', last: 'Jones', email: 'mock8@test.com', membershipType: 'STANDARD' },
  { first: 'Ivy', last: 'Kim', email: 'mock9@test.com', membershipType: 'PREMIUM' },
  { first: 'Julia', last: 'Lee', email: 'mock10@test.com', membershipType: 'STANDARD' },
  { first: 'Keira', last: 'Martinez', email: 'mock11@test.com', membershipType: 'PREMIUM' },
  { first: 'Luna', last: 'Nguyen', email: 'mock12@test.com', membershipType: 'STANDARD' },
  { first: 'Maya', last: 'Owen', email: 'mock13@test.com', membershipType: 'PREMIUM' },
  { first: 'Nina', last: 'Patel', email: 'mock14@test.com', membershipType: 'STANDARD' },
  { first: 'Olivia', last: 'Quinn', email: 'mock15@test.com', membershipType: 'PREMIUM' },
  { first: 'Paula', last: 'Rivera', email: 'mock16@test.com', membershipType: 'STANDARD' },
  { first: 'Reese', last: 'Scott', email: 'mock17@test.com', membershipType: 'PREMIUM' },
  { first: 'Sara', last: 'Torres', email: 'mock18@test.com', membershipType: 'STANDARD' },
  { first: 'Tessa', last: 'Upton', email: 'mock19@test.com', membershipType: 'PREMIUM' },
  { first: 'Uma', last: 'Vance', email: 'mock20@test.com', membershipType: 'STANDARD' },
  { first: 'Invites', last: 'Demo', email: 'mock21@test.com', membershipType: 'PREMIUM' },
  { first: 'Yuki', last: 'Tanaka', email: 'mock22@test.com', membershipType: 'STANDARD' },
  { first: 'Sienna', last: 'Okonkwo', email: 'mock23@test.com', membershipType: 'PREMIUM' },
  { first: 'Liam', last: "O'Brien", email: 'mock24@test.com', membershipType: 'STANDARD' },
  { first: 'Camila', last: 'Silva', email: 'mock25@test.com', membershipType: 'PREMIUM' },
];

let cachedMockClientIdentities: MockClientIdentity[] | null = null;

export const SCHEDULE_TIME_OPTIONS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM',
];

const INSTALL_BASE_MINUTES_BY_KIND: Record<'NEW_INSTALL' | 'RE_INSTALL', number> = {
  NEW_INSTALL: 150,
  RE_INSTALL: 120,
};

// Matches booking/appointment page add-on duration model so meetings mock durations stay realistic.
const BOOKING_ADDON_DURATION_MINUTES_BY_ID: Record<string, number> = {
  braids: 60,
  'brow-clean': 40,
  'brow-tint': 60,
  makeup: 150,
  'mink-lashes': 20,
  'clean-lace': 40,
};

const BOOKING_ADDON_IDS_FOR_MOCK = ['braids', 'brow-clean', 'brow-tint', 'makeup', 'mink-lashes', 'clean-lace', 'travel'] as const;

const CONSULT_INSPO_MOCK_POOL = [
  '/assets/gallery-mock.png',
  '/assets/mock-image.png',
  '/assets/NOIR/noir-thumb.png',
  '/assets/blanco front.png',
  '/assets/soft curl thumbnail.png',
  '/assets/ocean curl thumbnail.png',
] as const;

function formatISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Monday-start week containing dateStr */
export function startOfWeekMonday(dateStr: string): string {
  const d = parseISODateLocal(dateStr);
  const dow = d.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + offset);
  return formatISODate(d);
}

export function addDaysISO(dateStr: string, days: number): string {
  const d = parseISODateLocal(dateStr);
  d.setDate(d.getDate() + days);
  return formatISODate(d);
}

export function startOfMonth(dateStr: string): string {
  const d = parseISODateLocal(dateStr);
  return formatISODate(new Date(d.getFullYear(), d.getMonth(), 1));
}

export function endOfMonth(dateStr: string): string {
  const d = parseISODateLocal(dateStr);
  return formatISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function startOfYear(dateStr: string): string {
  const d = parseISODateLocal(dateStr);
  return formatISODate(new Date(d.getFullYear(), 0, 1));
}

export function endOfYear(dateStr: string): string {
  const d = parseISODateLocal(dateStr);
  return formatISODate(new Date(d.getFullYear(), 11, 31));
}

export function eachDayInclusive(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = start;
  const endT = parseISODateLocal(end).getTime();
  while (parseISODateLocal(cur).getTime() <= endT) {
    out.push(cur);
    cur = addDaysISO(cur, 1);
  }
  return out;
}

function getMockClientIdentities(): MockClientIdentity[] {
  if (cachedMockClientIdentities) return cachedMockClientIdentities;
  try {
    const raw = getMockClientsForAyoteenz();
    const fromOverview = Array.isArray(raw)
      ? raw
          .map((u: any) => {
            const email = String(u?.email || '').trim().toLowerCase();
            const first = String(u?.firstName || '').trim();
            const last = String(u?.lastName || '').trim();
            const membershipType = String(u?.membershipType || 'STANDARD').toUpperCase() === 'PREMIUM' ? 'PREMIUM' : 'STANDARD';
            if (!email || !first || !last) return null;
            return { first, last, email, membershipType } as MockClientIdentity;
          })
          .filter((v): v is MockClientIdentity => Boolean(v))
      : [];
    if (fromOverview.length > 0) {
      cachedMockClientIdentities = fromOverview;
      return cachedMockClientIdentities;
    }
  } catch {
    // Fall back to local static identities when overview mock source is unavailable.
  }
  cachedMockClientIdentities = FALLBACK_MOCK_CLIENT_IDENTITIES;
  return cachedMockClientIdentities;
}

function pickMockClient(rnd: () => number, salt: number): MockClientIdentity {
  const pool = getMockClientIdentities();
  const seededOffset = Math.floor(rnd() * pool.length);
  const idx = (seededOffset + Math.abs(salt)) % pool.length;
  return pool[idx];
}

export type MockDayOptions = { cap?: number; skipProbability?: number };

const CONSULT_MOCK_NOTES = [
  'CLIENT WANTS A GLUELESS FINISH WITH A SOFT HAIRLINE, LIGHT BABY HAIR, AND A NATURAL PART FOR DAILY WEAR.',
  'CLIENT REQUESTED A FULLER DENSITY LOOK FOR CONTENT DAY, PREFERS FACE-FRAMING LAYERS, AND NEEDS LONG-WEAR HOLD.',
  'CLIENT IS MATCHING A REFERENCE STYLE FOR A WEEKEND EVENT; FOCUS ON CLEAN KNOT BLEACH, PRECISE PARTING, AND SHINE FINISH.',
  'CLIENT ASKED FOR A LOW-MAINTENANCE ROUTINE, LIGHT HEAT STYLING, AND A SHAPE THAT HOLDS AFTER WRAP + BRUSH-OUT.',
] as const;

/** Deterministic mock meetings for one calendar day */
export function generateMockMeetingsForDay(dateKey: string, opts?: MockDayOptions): AdminMeeting[] {
  const seed = hash32(`baw-meetings-${dateKey}`);
  const rnd = mulberry32(seed);
  if (opts?.skipProbability != null && rnd() < opts.skipProbability) return [];
  const maxN = Math.min(5, Math.max(1, opts?.cap ?? 5));
  const n = 1 + Math.floor(rnd() * maxN); // 1..maxN
  const usedSlots = new Set<number>();
  const meetings: AdminMeeting[] = [];

  for (let i = 0; i < n; i++) {
    let slotIdx = Math.floor(rnd() * SCHEDULE_TIME_OPTIONS.length);
    let guard = 0;
    while (usedSlots.has(slotIdx) && guard < 50) {
      slotIdx = (slotIdx + 1) % SCHEDULE_TIME_OPTIONS.length;
      guard++;
    }
    usedSlots.add(slotIdx);

    const isConsultation = rnd() > 0.42;
    const pickedClient = pickMockClient(rnd, i + hash32(dateKey + String(i)));
    const { first, last, email, membershipType } = pickedClient;

    if (isConsultation) {
      const statusRoll = rnd();
      const status: AdminMeeting['status'] =
        statusRoll > 0.78 ? 'Pending' : statusRoll > 0.05 ? 'Confirmed' : 'Canceled';
      const consultNotes = CONSULT_MOCK_NOTES[Math.floor(rnd() * CONSULT_MOCK_NOTES.length)];
      const inspoCount = 1 + Math.floor(rnd() * 3); // 1..3, keep max at 3
      const inspoPool = [...CONSULT_INSPO_MOCK_POOL];
      const inspoPhotoUrls: string[] = [];
      for (let p = 0; p < inspoCount; p++) {
        if (inspoPool.length === 0) break;
        const idx = Math.floor(rnd() * inspoPool.length);
        const [picked] = inspoPool.splice(idx, 1);
        if (picked) inspoPhotoUrls.push(picked);
      }
      const inch = (base: number, spread: number) => `${base + Math.floor(rnd() * spread)}"`;
      meetings.push({
        id: `mock-${dateKey}-c-${i}`,
        date: dateKey,
        time: SCHEDULE_TIME_OPTIONS[slotIdx],
        client: `${first} ${last}`.toUpperCase(),
        clientEmail: email,
        type: CONSULTATION_TYPE_LABEL,
        category: 'consultation',
        duration: '60 MIN',
        status,
        notes: consultNotes,
        metadata: {
          tier: membershipType === 'PREMIUM' ? 'premium' : 'standard',
          hairOption: rnd() > 0.5 ? 'WIG ONLY' : 'WIG + INSTALL',
          consultNotes,
          // Mixed 1..3 inspo photos so consult cards don't all look identical.
          inspoPhotoUrls,
          inspoFileNames: inspoPhotoUrls,
          headMeasurements: {
            circumference: inch(19, 4),
            frontToNape: inch(21, 5),
            verticalTempleToTemple: inch(11, 4),
            horizontalTempleToTemple: inch(11, 4),
            earToEar: inch(10, 4),
            napeOfNeck: inch(5, 3),
          },
        },
      });
    } else {
      const bookingInstallKind: 'NEW_INSTALL' | 'RE_INSTALL' = rnd() > 0.5 ? 'NEW_INSTALL' : 'RE_INSTALL';
      const bookingAddonIds = BOOKING_ADDON_IDS_FOR_MOCK.filter(() => rnd() > 0.62).slice(0, 4);
      const services = [
        bookingInstallKind === 'RE_INSTALL' ? 'RE-INSTALL' : 'INSTALL',
        ...bookingAddonIds
          .map((id) => {
            if (id === 'brow-clean') return 'BROW SCULPTING';
            if (id === 'brow-tint') return 'BROW TINT';
            if (id === 'mink-lashes') return 'MINK LASHES';
            if (id === 'clean-lace') return 'CLEAN LACE';
            if (id === 'travel') return 'TRAVEL FEE';
            return id.toUpperCase();
          }),
      ];
      const statusRoll = rnd();
      const status: AdminMeeting['status'] =
        statusRoll > 0.72 ? 'Pending' : statusRoll > 0.04 ? 'Confirmed' : 'Canceled';
      let durationM = INSTALL_BASE_MINUTES_BY_KIND[bookingInstallKind];
      for (const addonId of bookingAddonIds) {
        const extra = BOOKING_ADDON_DURATION_MINUTES_BY_ID[addonId];
        if (extra != null) durationM += extra;
      }
      meetings.push({
        id: `mock-${dateKey}-a-${i}`,
        date: dateKey,
        time: SCHEDULE_TIME_OPTIONS[slotIdx],
        client: `${first} ${last}`.toUpperCase(),
        clientEmail: email,
        type: services.join(' + '),
        category: 'appointment',
        duration: `${durationM} MIN`,
        status,
        notes: `Appointment: ${services.join(', ').toLowerCase()}`,
        services,
        metadata: {
          tier: membershipType === 'PREMIUM' ? 'premium' : 'standard',
          bookingInstallKind,
          bookingUnitName: ['NOIR', 'BLANCO', 'SOFT WAVE', 'SOFT CURL', 'BEACH WAVE', 'OCEAN CURL'][Math.floor(rnd() * 6)],
          bookingUnitPriceUsd: [740, 820, 760, 780, 760, 780][Math.floor(rnd() * 6)],
          bookingAddonIds,
        },
      });
    }
  }

  meetings.sort((a, b) => timeToSortKey(a.time) - timeToSortKey(b.time));
  return meetings;
}

export function generateMockMeetingsForRange(start: string, end: string): AdminMeeting[] {
  const days = eachDayInclusive(start, end);
  const all: AdminMeeting[] = [];
  const span = days.length;
  const yearLike = span > 90;
  const monthLike = span > 35 && !yearLike;
  for (const d of days) {
    if (yearLike) {
      all.push(...generateMockMeetingsForDay(d, { cap: 2, skipProbability: 0.5 }));
    } else if (monthLike) {
      all.push(...generateMockMeetingsForDay(d, { cap: 4, skipProbability: 0.08 }));
    } else {
      all.push(...generateMockMeetingsForDay(d));
    }
  }
  all.sort((a, b) => {
    const dc = a.date.localeCompare(b.date);
    if (dc !== 0) return dc;
    return timeToSortKey(a.time) - timeToSortKey(b.time);
  });
  return all;
}

/**
 * Fixed consult row for **ORDER #331** on the admin Meetings **Consults** tab (founder email).
 * `metadata.orderNumber` is passed through **Send offer** → `markConsultOrderCompleteAfterQuoteSent`.
 */
export function adminFounderDemoConsultMeetingOrder331(anchorDate: string): AdminMeeting {
  const email = FOUNDER_PRIVILEGED_ADMIN_EMAIL.toLowerCase();
  return {
    id: 'demo-consult-order-331',
    date: anchorDate,
    time: '2:00 PM',
    client: 'KATEENA ARMSTRONG',
    clientEmail: email,
    type: CONSULTATION_TYPE_LABEL,
    category: 'consultation',
    duration: '60 MIN',
    status: 'Confirmed',
    notes: 'DEMO: CHECKOUT ORDER #331 — USE SEND OFFER TO TEST CONSULT OFFER FLOW.',
    metadata: {
      tier: 'premium',
      hairOption: 'WIG ONLY',
      orderNumber: 'ORDER #331',
      consultNotes: 'DEMO ROW LINKED TO USER ORDER #331.',
      inspoPhotoUrls: ['/assets/NOIR/noir-thumb.png'],
      inspoFileNames: ['noir-thumb.png'],
      headMeasurements: {
        circumference: '22"',
        frontToNape: '24"',
        verticalTempleToTemple: '13"',
        horizontalTempleToTemple: '13"',
        earToEar: '12"',
        napeOfNeck: '6"',
      },
    },
  };
}

/** Same window as admin meetings hub uses for a month view, expanded so client details see consult + appointment history. */
export const MOCK_MEETINGS_AGGREGATE_MONTHS_BACK = 12;
export const MOCK_MEETINGS_AGGREGATE_MONTHS_FORWARD = 12;

export function defaultAggregatedMeetingsDateRange(): { start: string; end: string } {
  const today = new Date();
  const startD = new Date(today.getFullYear(), today.getMonth() - MOCK_MEETINGS_AGGREGATE_MONTHS_BACK, 1);
  const endD = new Date(today.getFullYear(), today.getMonth() + MOCK_MEETINGS_AGGREGATE_MONTHS_FORWARD + 1, 0);
  return { start: formatISODate(startD), end: formatISODate(endD) };
}

/**
 * Deterministic mock meetings + optional Supabase/API rows + `adminMeetingsScheduled` localStorage for the default range.
 * Matches merge order in `AdminMeetingsHub`: mock base, API overwrites by id, local overwrites by id.
 */
export function listAggregatedAdminMeetingsForClientDetails(apiMeetings: AdminMeeting[] = []): AdminMeeting[] {
  const { start, end } = defaultAggregatedMeetingsDateRange();
  const mock = generateMockMeetingsForRange(start, end);
  const local = loadLocalMeetings().filter((m) => m.date >= start && m.date <= end);
  const byId = new Map<string, AdminMeeting>();
  for (const m of mock) byId.set(m.id, m);
  for (const m of apiMeetings) {
    if (m.date >= start && m.date <= end) byId.set(m.id, m);
  }
  for (const m of local) byId.set(m.id, m);

  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('currentUser');
      const u = raw ? JSON.parse(raw) : null;
      const em = String((u as { email?: string })?.email || '')
        .trim()
        .toLowerCase();
      if (em === FOUNDER_PRIVILEGED_ADMIN_EMAIL.toLowerCase() || em === ADMIN_KATEENA_EMAIL.toLowerCase()) {
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const demo = adminFounderDemoConsultMeetingOrder331(startOfMonth(todayKey));
        if (demo.date >= start && demo.date <= end && !byId.has(demo.id)) {
          byId.set(demo.id, demo);
        }
      }
    }
  } catch {
    /* ignore */
  }

  return [...byId.values()].sort((a, b) => {
    const dc = a.date.localeCompare(b.date);
    if (dc !== 0) return dc;
    return timeToSortKey(a.time) - timeToSortKey(b.time);
  });
}

function timeToSortKey(t: string): number {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

/** Newest meeting first (date desc, then time desc). */
export function compareAdminMeetingsNewestFirst(a: AdminMeeting, b: AdminMeeting): number {
  const dc = b.date.localeCompare(a.date);
  if (dc !== 0) return dc;
  return timeToSortKey(b.time) - timeToSortKey(a.time);
}

/** `YYYY-MM-DD` → `MM-DD-YYYY` for admin client cards (matches order date style). */
export function formatMeetingIsoDateForDisplay(iso: string): string {
  const t = (iso || '').trim();
  const [y, m, d] = t.split('-');
  if (!y || !m || !d) return t || '—';
  return `${m}-${d}-${y}`;
}

export function loadLocalMeetings(): AdminMeeting[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean) as AdminMeeting[];
  } catch {
    return [];
  }
}

export function saveLocalMeetings(list: AdminMeeting[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function appendLocalMeeting(meeting: AdminMeeting): void {
  const list = loadLocalMeetings();
  list.push(meeting);
  saveLocalMeetings(list);
}

/** Replace existing local row by id, or append if not found */
export function upsertLocalMeeting(meeting: AdminMeeting): void {
  const list = loadLocalMeetings();
  const idx = list.findIndex((m) => m.id === meeting.id);
  if (idx >= 0) list[idx] = meeting;
  else list.push(meeting);
  saveLocalMeetings(list);
}

/** Normalize API row to AdminMeeting when possible */
export function normalizeApiMeeting(row: Record<string, unknown>): AdminMeeting | null {
  const id = String(row.id ?? row.meeting_id ?? '');
  const date = String(row.date ?? row.meetingDate ?? row.meeting_date ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const time = String(row.time ?? row.meetingTime ?? row.meeting_time ?? '10:00 AM');
  const client = String(row.client ?? row.clientName ?? row.client_name ?? 'CLIENT').toUpperCase();
  const clientEmail = row.clientEmail != null ? String(row.clientEmail) : row.client_email != null ? String(row.client_email) : undefined;
  const type = String(row.type ?? 'MEETING').toUpperCase();
  const catRaw = String(row.category ?? '').toLowerCase();
  const category: MeetingCategory =
    catRaw === 'consultation' ||
    catRaw === 'consult' ||
    type.includes('CONSULT') ||
    type.includes('WIG CONSULT')
      ? 'consultation'
      : 'appointment';
  const duration = row.duration != null ? String(row.duration) : row.durationMinutes != null ? `${row.durationMinutes} MIN` : '45 MIN';
  const statusRaw = String(row.status ?? 'Pending').toLowerCase();
  const status: AdminMeeting['status'] =
    statusRaw === 'confirmed' ? 'Confirmed' : statusRaw === 'canceled' || statusRaw === 'cancelled' ? 'Canceled' : 'Pending';
  const notes = String(row.notes ?? '');
  const services = Array.isArray(row.services) ? (row.services as string[]).map(String) : undefined;
  const metaRaw = row.metadata;
  const metadata =
    metaRaw && typeof metaRaw === 'object' && !Array.isArray(metaRaw)
      ? (metaRaw as Record<string, unknown>)
      : undefined;
  const userId = row.userId != null ? String(row.userId) : row.user_id != null ? String(row.user_id) : undefined;
  return {
    id: id || `api-${date}-${time}`,
    date,
    time,
    client,
    clientEmail,
    userId,
    type,
    category,
    duration,
    status,
    notes,
    services,
    metadata,
  };
}
