/**
 * Client Slay Journal + Hall of Slay detection for PSA session context.
 */
import { getPerUserKey, getCurrentUserEmailFromStorage } from './perUserStorage';
import { getEffectiveTierName } from './adminAuth';

export type SlayJournalEventType =
  | 'joined_premium'
  | 'completed_consult'
  | 'ordered_unit'
  | 'hair_profile_set'
  | 'black_status'
  | 'one_year_premium'
  | 'purchase_context';

export type SlayJournalEntry = {
  id: string;
  type: SlayJournalEventType;
  title: string;
  monthLabel: string;
  occurredAt: string;
  meta?: Record<string, string>;
};

export type HallOfSlayMilestoneId =
  | 'first_custom_unit'
  | 'first_consult'
  | 'fifth_order'
  | 'one_year_premium'
  | 'black_status'
  | 'first_order';

const JOURNAL_PREFIX = 'psaSlayJournal';
const HALL_CELEBRATED_PREFIX = 'psaHallCelebrated';
const FIRST_UNLOCK_PREFIX = 'psaFirstPremiumUnlockAt';

function journalKey(): string {
  return getPerUserKey(JOURNAL_PREFIX, getCurrentUserEmailFromStorage());
}

function hallCelebratedKey(): string {
  return getPerUserKey(HALL_CELEBRATED_PREFIX, getCurrentUserEmailFromStorage());
}

function firstUnlockKey(): string {
  return getPerUserKey(FIRST_UNLOCK_PREFIX, getCurrentUserEmailFromStorage());
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function monthLabelFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', { month: 'long' }).toUpperCase();
}

function journalId(): string {
  return `sj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readUserOrders(email: string): Record<string, unknown>[] {
  try {
    const raw = localStorage.getItem(`userOrders_${email.trim().toLowerCase()}`);
    if (!raw) return [];
    const data = JSON.parse(raw) as { activeOrders?: unknown[]; pastOrders?: unknown[] };
    const active = Array.isArray(data.activeOrders) ? data.activeOrders : [];
    const past = Array.isArray(data.pastOrders) ? data.pastOrders : [];
    return [...active, ...past].filter((o) => o && typeof o === 'object') as Record<string, unknown>[];
  } catch {
    return [];
  }
}

function isWigUnitOrder(order: Record<string, unknown>): boolean {
  const name = String(order.productName ?? order.name ?? '').toUpperCase();
  const units = ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE', 'SOFT CURL', 'OCEAN CURL'];
  return units.some((u) => name.includes(u));
}

function isConsultOrder(order: Record<string, unknown>): boolean {
  return order.bookingFlowType === 'consult' || String(order.productName ?? '').toUpperCase().includes('CONSULT');
}

function orderPlacedIso(order: Record<string, unknown>): string {
  const placedAt = typeof order.placedAt === 'number' ? order.placedAt : Date.now();
  return new Date(placedAt).toISOString();
}

export function readSlayJournalEntries(): SlayJournalEntry[] {
  return readJson<SlayJournalEntry[]>(journalKey(), []);
}

export function appendSlayJournalEntry(entry: Omit<SlayJournalEntry, 'id'> & { id?: string }): SlayJournalEntry[] {
  const existing = readSlayJournalEntries();
  const dup = existing.some(
    (e) => e.type === entry.type && e.title === entry.title && e.monthLabel === entry.monthLabel
  );
  if (dup) return existing;
  const row: SlayJournalEntry = {
    id: entry.id ?? journalId(),
    type: entry.type,
    title: entry.title,
    monthLabel: entry.monthLabel,
    occurredAt: entry.occurredAt,
    meta: entry.meta,
  };
  const next = [row, ...existing].slice(0, 24);
  writeJson(journalKey(), next);
  return next;
}

function readHallCelebrated(): HallOfSlayMilestoneId[] {
  return readJson<HallOfSlayMilestoneId[]>(hallCelebratedKey(), []);
}

export function markHallMilestoneCelebrated(id: HallOfSlayMilestoneId): void {
  const list = readHallCelebrated();
  if (!list.includes(id)) writeJson(hallCelebratedKey(), [...list, id]);
}

export function detectEarnedHallMilestones(
  orders: Record<string, unknown>[],
  tierName: string | null | undefined
): HallOfSlayMilestoneId[] {
  const earned: HallOfSlayMilestoneId[] = [];
  const totalOrders = orders.length;

  if (totalOrders >= 1) earned.push('first_order');
  if (orders.some(isWigUnitOrder)) earned.push('first_custom_unit');
  if (orders.some(isConsultOrder)) earned.push('first_consult');
  if (totalOrders >= 5) earned.push('fifth_order');
  if ((tierName ?? '').trim().toUpperCase() === 'BLACK') earned.push('black_status');

  const unlockAt = localStorage.getItem(firstUnlockKey());
  if (unlockAt) {
    const ms = Date.parse(unlockAt);
    if (!Number.isNaN(ms) && Date.now() - ms >= 365 * 24 * 60 * 60 * 1000) {
      earned.push('one_year_premium');
    }
  }

  return earned;
}

export function detectPendingHallMilestone(
  orders: Record<string, unknown>[],
  tierName: string | null | undefined
): HallOfSlayMilestoneId | null {
  const earned = detectEarnedHallMilestones(orders, tierName);
  const celebrated = readHallCelebrated();
  const pending = earned.filter((id) => !celebrated.includes(id));
  const priority: HallOfSlayMilestoneId[] = [
    'black_status',
    'one_year_premium',
    'fifth_order',
    'first_consult',
    'first_custom_unit',
    'first_order',
  ];
  for (const id of priority) {
    if (pending.includes(id)) return id;
  }
  return null;
}

export function syncSlayJournalFromOrders(orders: Record<string, unknown>[]): SlayJournalEntry[] {
  let entries = readSlayJournalEntries();

  const wigOrders = orders.filter(isWigUnitOrder);
  if (wigOrders.length) {
    const first = wigOrders[wigOrders.length - 1];
    const name = String(first.productName ?? first.name ?? 'UNIT').toUpperCase();
    const iso = orderPlacedIso(first);
    entries = appendSlayJournalEntry({
      type: 'ordered_unit',
      title: `ORDERED ${name}`,
      monthLabel: monthLabelFromIso(iso),
      occurredAt: iso,
    });
  }

  const consults = orders.filter(isConsultOrder);
  if (consults.length) {
    const first = consults[consults.length - 1];
    const iso = orderPlacedIso(first);
    entries = appendSlayJournalEntry({
      type: 'completed_consult',
      title: 'COMPLETED CONSULT',
      monthLabel: monthLabelFromIso(iso),
      occurredAt: iso,
    });
  }

  return entries;
}

export function touchPremiumUnlockTimestamp(): void {
  const key = firstUnlockKey();
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, new Date().toISOString());
    appendSlayJournalEntry({
      type: 'joined_premium',
      title: 'JOINED PREMIUM',
      monthLabel: monthLabelFromIso(new Date().toISOString()),
      occurredAt: new Date().toISOString(),
    });
  }
}

export type PsaSlayJournalSnapshot = {
  recentEntries: SlayJournalEntry[];
  hallMilestones: HallOfSlayMilestoneId[];
  pendingMilestone: HallOfSlayMilestoneId | null;
};

export function buildPsaSlayJournalSnapshot(): PsaSlayJournalSnapshot {
  const email = getCurrentUserEmailFromStorage();
  let user: Record<string, unknown> | null = null;
  try {
    const raw = localStorage.getItem('currentUser');
    user = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    user = null;
  }

  const tierName = user ? getEffectiveTierName(user as Parameters<typeof getEffectiveTierName>[0]) : null;
  const orders = email ? readUserOrders(email) : [];

  touchPremiumUnlockTimestamp();
  const recentEntries = syncSlayJournalFromOrders(orders);
  const hallMilestones = detectEarnedHallMilestones(orders, tierName);
  const pendingMilestone = detectPendingHallMilestone(orders, tierName);

  if ((tierName ?? '').toUpperCase() === 'BLACK') {
    appendSlayJournalEntry({
      type: 'black_status',
      title: 'BLACK STATUS ACHIEVED',
      monthLabel: monthLabelFromIso(new Date().toISOString()),
      occurredAt: new Date().toISOString(),
    });
  }

  return {
    recentEntries: recentEntries.slice(0, 8),
    hallMilestones,
    pendingMilestone,
  };
}

export function recordHairProfileJournal(profileLabel: string): void {
  appendSlayJournalEntry({
    type: 'hair_profile_set',
    title: `UPGRADED TO ${profileLabel.toUpperCase()}`,
    monthLabel: monthLabelFromIso(new Date().toISOString()),
    occurredAt: new Date().toISOString(),
  });
}
