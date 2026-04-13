/**
 * Admin Meetings → Send offer: remember custom thumbnail **data URLs** per
 * **unit + length + density + color + hairline + styling + parting** (`partSelection`) **+ add-ons**
 * (localStorage only; avoids re-uploading the same image when those match on a later offer).
 */

const LS_KEY = 'bawAdminConsultOfferSavedThumbnails';

/** Fields that **SAVE SELECTION** / auto-load use for matching (only these categories). */
export type AdminConsultOfferThumbnailMatchFields = {
  length: string;
  density: string;
  color: string;
  hairline: string;
  styling: string;
  partSelection: string;
  addOns: string[];
};

/** Deterministic key: same unit + length + density + color + hairline + styling + parting + add-ons → same string. */
export function stableConsultOfferSelectionsKey(unitKey: string, s: AdminConsultOfferThumbnailMatchFields): string {
  const u = String(unitKey || '').trim().toUpperCase();
  const addOns = [...(s.addOns || [])].map((x) => String(x).trim().toUpperCase()).filter(Boolean).sort();
  const payload = {
    unitKey: u,
    length: String(s.length || '').trim(),
    density: String(s.density || '').trim(),
    color: String(s.color || '').trim().toUpperCase(),
    hairline: String(s.hairline || '').trim().toUpperCase(),
    styling: String(s.styling || '').trim().toUpperCase(),
    partSelection: String(s.partSelection || 'MIDDLE').trim().toUpperCase(),
    addOns,
  };
  return JSON.stringify(payload);
}

export function loadAdminConsultOfferSavedThumbnails(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (typeof v === 'string' && v.startsWith('data:')) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function upsertAdminConsultOfferSavedThumbnail(selectionKey: string, dataUrl: string): Record<string, string> {
  const next = { ...loadAdminConsultOfferSavedThumbnails(), [selectionKey]: dataUrl };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
  return next;
}

export function deleteAdminConsultOfferSavedThumbnail(selectionKey: string): Record<string, string> {
  const cur = loadAdminConsultOfferSavedThumbnails();
  if (!(selectionKey in cur)) return cur;
  const next = { ...cur };
  delete next[selectionKey];
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
