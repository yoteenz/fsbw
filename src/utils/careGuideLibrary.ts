const CARE_GUIDE_LIBRARY_KEY = 'loungeTvCareGuideLibrary';
export const CARE_GUIDE_LIBRARY_UPDATED_EVENT = 'loungeCareGuideLibraryUpdated';

export type DepositedCareGuide = {
  guideId: string;
  depositedAt: number;
  source: 'qualifying_product';
};

function readDeposited(): DepositedCareGuide[] {
  try {
    const raw = localStorage.getItem(CARE_GUIDE_LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDeposited(rows: DepositedCareGuide[]): void {
  localStorage.setItem(CARE_GUIDE_LIBRARY_KEY, JSON.stringify(rows));
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CARE_GUIDE_LIBRARY_UPDATED_EVENT));
    window.dispatchEvent(new CustomEvent('loungeTvLibraryUpdated'));
  }
}

/** Idempotent — same guide/order combination does not duplicate library rows. */
export function syncCareGuidesToLibrary(guideIds: string[]): string[] {
  const now = Date.now();
  const existing = readDeposited();
  const byId = new Map(existing.map((r) => [r.guideId, r]));

  for (const guideId of guideIds) {
    if (!byId.has(guideId)) {
      byId.set(guideId, { guideId, depositedAt: now, source: 'qualifying_product' });
    }
  }

  const next = [...byId.values()].sort((a, b) => b.depositedAt - a.depositedAt);
  writeDeposited(next);
  dispatchUpdated();
  return next.map((r) => r.guideId);
}

export function getDepositedCareGuideIds(): string[] {
  return readDeposited().map((r) => r.guideId);
}

export function isCareGuideDeposited(guideId: string): boolean {
  return getDepositedCareGuideIds().includes(guideId);
}

export function clearCareGuideLibrary(): void {
  localStorage.removeItem(CARE_GUIDE_LIBRARY_KEY);
  dispatchUpdated();
}
