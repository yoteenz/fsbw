export type BrandPromoCode = {
  id: string;
  kind: 'gift' | 'discount';
  code: string;
  valueLabel: string;
  maxUses: number | null;
  uses: number;
  expiresAt: string | null;
  createdAt: string;
  active: boolean;
  note?: string;
};

const STORAGE_KEY = 'adminBrandPromoCodes';

export function loadBrandPromoCodes(): BrandPromoCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BrandPromoCode[]) : [];
  } catch {
    return [];
  }
}

export function saveBrandPromoCodes(rows: BrandPromoCode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export function appendBrandPromoCode(row: BrandPromoCode): void {
  const list = loadBrandPromoCodes();
  list.push(row);
  saveBrandPromoCodes(list);
}

export function updateBrandPromoCode(id: string, patch: Partial<BrandPromoCode>): void {
  const list = loadBrandPromoCodes();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return;
  list[idx] = { ...list[idx], ...patch };
  saveBrandPromoCodes(list);
}

export function generateCodePrefix(kind: BrandPromoCode['kind']): string {
  const part = kind === 'gift' ? 'GC' : 'OFF';
  const n = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${part}-${n}`;
}
