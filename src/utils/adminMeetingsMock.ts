/**
 * Deterministic mock meetings + local admin-scheduled meetings for /admin/meetings.
 * Mock rows vary by calendar day (seeded); merged with localStorage drafts.
 */

export type MeetingCategory = 'consultation' | 'appointment';

export type AdminMeeting = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  client: string;
  clientEmail?: string;
  type: string;
  category: MeetingCategory;
  duration: string;
  status: 'Confirmed' | 'Pending' | 'Canceled';
  notes: string;
  services?: string[];
};

export const APPOINTMENT_SERVICE_OPTIONS = [
  'INSTALLS',
  'RE-INSTALLS',
  'BROW TINT',
  'BROW SCULPTING',
  'MINK LASHES',
  'TRAVEL FEE',
  'BRAIDS',
  'MAKEUP',
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

const MOCK_FIRST = [
  'Zara', 'Amy', 'Quinn', 'Diana', 'Elena', 'Fiona', 'Grace', 'Hannah', 'Ivy', 'Julia',
  'Keira', 'Luna', 'Maya', 'Nina', 'Olivia', 'Paula', 'Reese', 'Sara', 'Tessa', 'Uma',
];
const MOCK_LAST = [
  'Adams', 'Brooks', 'Chen', 'Foster', 'Garcia', 'Hayes', 'Ingram', 'Jones', 'Kim', 'Lee',
  'Martinez', 'Nguyen', 'Owen', 'Patel', 'Quinn', 'Rivera', 'Scott', 'Torres', 'Upton', 'Vance',
];

export const SCHEDULE_TIME_OPTIONS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM',
];

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

function pickName(rnd: () => number, salt: number): { first: string; last: string; email: string } {
  const fi = Math.floor(rnd() * MOCK_FIRST.length);
  const li = Math.floor(rnd() * MOCK_LAST.length);
  const first = MOCK_FIRST[(fi + salt) % MOCK_FIRST.length];
  const last = MOCK_LAST[(li + salt * 3) % MOCK_LAST.length];
  const email = `mock.client.${salt}.${first.toLowerCase()}@test.com`;
  return { first, last, email };
}

export type MockDayOptions = { cap?: number; skipProbability?: number };

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
    const { first, last, email } = pickName(rnd, i + hash32(dateKey + String(i)));

    if (isConsultation) {
      const statusRoll = rnd();
      const status: AdminMeeting['status'] =
        statusRoll > 0.78 ? 'Pending' : statusRoll > 0.05 ? 'Confirmed' : 'Canceled';
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
        notes: `Wig consult — style goals, cap size, timeline (${dateKey.slice(5)})`,
      });
    } else {
      const numServices = 1 + Math.floor(rnd() * 3);
      const services: string[] = [];
      const pool = [...APPOINTMENT_SERVICE_OPTIONS];
      for (let s = 0; s < numServices; s++) {
        const idx = Math.floor(rnd() * pool.length);
        services.push(pool.splice(idx, 1)[0]);
      }
      const statusRoll = rnd();
      const status: AdminMeeting['status'] =
        statusRoll > 0.72 ? 'Pending' : statusRoll > 0.04 ? 'Confirmed' : 'Canceled';
      const durationM = 30 + Math.floor(rnd() * 4) * 15;
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
    catRaw === 'consultation' || type.includes('CONSULT') ? 'consultation' : 'appointment';
  const duration = row.duration != null ? String(row.duration) : row.durationMinutes != null ? `${row.durationMinutes} MIN` : '45 MIN';
  const statusRaw = String(row.status ?? 'Pending').toLowerCase();
  const status: AdminMeeting['status'] =
    statusRaw === 'confirmed' ? 'Confirmed' : statusRaw === 'canceled' || statusRaw === 'cancelled' ? 'Canceled' : 'Pending';
  const notes = String(row.notes ?? '');
  const services = Array.isArray(row.services) ? (row.services as string[]).map(String) : undefined;
  return {
    id: id || `api-${date}-${time}`,
    date,
    time,
    client,
    clientEmail,
    type,
    category,
    duration,
    status,
    notes,
    services,
  };
}
