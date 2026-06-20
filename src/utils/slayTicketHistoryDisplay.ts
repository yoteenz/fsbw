export type SlayTicketTransactionType = 'earned' | 'used' | 'purchased' | 'adjusted' | 'expired';

export type SlayTicketHistoryRow = {
  date: string;
  transaction: string;
  amount: number;
  type?: SlayTicketTransactionType;
  sortAt?: number;
};

export type LoungeContentUnlock = {
  contentId: string;
  ticketCost: number;
  unlockedAt: string;
  accessType: 'permanent' | 'rental';
  expiresAt?: string | null;
};

const UNLOCKS_STORAGE_PREFIX = 'loungeContentUnlocks_';

export function getSlayTicketBalanceFromUser(user: Record<string, unknown> | null | undefined): number {
  const raw = user?.slayTicketBalance;
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
  return 0;
}

export function parseSlayTicketHistoryDateMs(dateStr: string): number {
  const t = (dateStr || '').trim();
  if (!t) return 0;
  const dash = t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dash) {
    const ms = new Date(Number(dash[3]), Number(dash[1]) - 1, Number(dash[2])).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  const d = Date.parse(t);
  return Number.isNaN(d) ? 0 : d;
}

export function slayTicketHistorySortTimestampMs(row: SlayTicketHistoryRow): number {
  if (typeof row.sortAt === 'number' && !Number.isNaN(row.sortAt)) return row.sortAt;
  return parseSlayTicketHistoryDateMs(row.date);
}

export function mapApiHistoryToRows(
  rows: Array<{
    type?: string;
    amount?: number;
    description?: string;
    created_at?: string;
  }>
): SlayTicketHistoryRow[] {
  return rows.map((row) => {
    const created = row.created_at || '';
    const d = created ? new Date(created) : null;
    const date =
      d && !Number.isNaN(d.getTime())
        ? `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`
        : '';
    return {
      date,
      transaction: String(row.description || row.type || '').toUpperCase(),
      amount: Math.floor(Number(row.amount) || 0),
      type: row.type as SlayTicketTransactionType | undefined,
      sortAt: d && !Number.isNaN(d.getTime()) ? d.getTime() : undefined,
    };
  });
}

export function readStoredSlayTicketHistory(
  user: Record<string, unknown> | null | undefined
): SlayTicketHistoryRow[] {
  const raw = user?.slayTicketHistory;
  if (!Array.isArray(raw)) return [];
  return raw.filter((r) => r && typeof r === 'object') as SlayTicketHistoryRow[];
}

export function unlocksStorageKey(email: string): string {
  return `${UNLOCKS_STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

export function readStoredLoungeUnlocks(email: string): LoungeContentUnlock[] {
  try {
    const raw = localStorage.getItem(unlocksStorageKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as LoungeContentUnlock[];
  } catch {
    return [];
  }
}

export function writeStoredLoungeUnlocks(email: string, unlocks: LoungeContentUnlock[]): void {
  try {
    localStorage.setItem(unlocksStorageKey(email), JSON.stringify(unlocks));
  } catch {
    /* ignore */
  }
}

export function isLoungeContentUnlocked(
  contentId: string,
  unlocks: LoungeContentUnlock[]
): boolean {
  const row = unlocks.find((u) => u.contentId === contentId);
  if (!row) return false;
  if (row.expiresAt) {
    const exp = new Date(row.expiresAt).getTime();
    if (!Number.isNaN(exp) && exp <= Date.now()) return false;
  }
  return true;
}

export function applyLocalSlayTicketState(
  userEmail: string,
  patch: {
    slayTicketBalance?: number;
    slayTicketHistory?: SlayTicketHistoryRow[];
    unlocks?: LoungeContentUnlock[];
  }
): void {
  try {
    const currentUserRaw = localStorage.getItem('currentUser');
    if (!currentUserRaw) return;
    const user = JSON.parse(currentUserRaw) as Record<string, unknown>;
    if (String(user.email || '').trim().toLowerCase() !== userEmail.trim().toLowerCase()) return;
    const updated = { ...user, ...patch };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]') as Array<
      Record<string, unknown>
    >;
    const idx = registeredUsers.findIndex(
      (u) => String(u.email || '').trim().toLowerCase() === userEmail.trim().toLowerCase()
    );
    if (idx !== -1) {
      registeredUsers[idx] = { ...registeredUsers[idx], ...patch };
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    }
    if (patch.unlocks) writeStoredLoungeUnlocks(userEmail, patch.unlocks);
    window.dispatchEvent(new CustomEvent('slayTicketsUpdated'));
  } catch {
    /* ignore */
  }
}

export const SLAY_TICKETS_UPDATED_EVENT = 'slayTicketsUpdated';
