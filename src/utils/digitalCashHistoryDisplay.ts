import { isAdminEmail } from './adminAuth';

export type DigitalCashHistoryRow = {
  date: string;
  transaction: string;
  amount: number;
  sortAt?: number;
};

const ADMIN_MOCK_DIGITAL_CASH_DEPOSIT_AMOUNT = 50;
const ADMIN_MOCK_DIGITAL_CASH_TRANSACTION = 'GIFT CARD BARCODE';

function todayMdy(): string {
  const d = new Date();
  return `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
}

export function adminMockDigitalCashDepositSortAt(userEmail: string | undefined): number {
  const email = String(userEmail || 'admin').trim().toLowerCase() || 'admin';
  const key = `adminMockDigitalCashDepositSortAt_${email}`;
  try {
    if (typeof window === 'undefined') return Date.now();
    const existing = Number(localStorage.getItem(key) || '');
    if (Number.isFinite(existing) && existing > 0) return existing;
    const now = Date.now();
    localStorage.setItem(key, String(now));
    return now;
  } catch {
    return Date.now();
  }
}

export function parseDigitalCashHistoryDateMs(dateStr: string): number {
  const t = (dateStr || '').trim();
  if (!t) return 0;
  const dash = t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dash) {
    const ms = new Date(Number(dash[3]), Number(dash[1]) - 1, Number(dash[2])).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  const slash = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const ms = new Date(Number(slash[3]), Number(slash[1]) - 1, Number(slash[2])).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }
  const d = Date.parse(t);
  return Number.isNaN(d) ? 0 : d;
}

export function digitalCashHistorySortTimestampMs(row: DigitalCashHistoryRow): number {
  if (typeof row.sortAt === 'number' && !Number.isNaN(row.sortAt)) return row.sortAt;
  return parseDigitalCashHistoryDateMs(row.date);
}

export function withAdminMockDigitalCashHistoryRow(
  history: DigitalCashHistoryRow[],
  user: Record<string, unknown> | null | undefined
): DigitalCashHistoryRow[] {
  if (!isAdminEmail(String(user?.email || ''))) return history;
  const today = todayMdy();
  const email = String(user?.email || '').trim().toLowerCase();
  const hasTodayMockAmount = history.some(
    (row) =>
      row.date === today &&
      Math.round(Number(row.amount || 0) * 100) === ADMIN_MOCK_DIGITAL_CASH_DEPOSIT_AMOUNT * 100
  );
  if (hasTodayMockAmount) return history;
  return [
    {
      date: today,
      transaction: ADMIN_MOCK_DIGITAL_CASH_TRANSACTION,
      amount: ADMIN_MOCK_DIGITAL_CASH_DEPOSIT_AMOUNT,
      sortAt: adminMockDigitalCashDepositSortAt(email),
    },
    ...history,
  ];
}
