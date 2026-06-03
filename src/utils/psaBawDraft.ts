/**
 * PSA Build-a-Wig draft — local persistence + incomplete-session detection.
 */
import { getPerUserKey, getCurrentUserEmailFromStorage } from './perUserStorage';

export type PsaBawDraft = {
  unitId: string;
  unitLabel: string;
  buildPath: string;
  selections: Record<string, string>;
  savedAt: string;
  label?: string;
};

const DRAFT_PREFIX = 'psaBawDraft';
const DISMISS_PREFIX = 'psaBawDraftDismissed';

const UNIT_SLUGS: Record<string, { id: string; label: string; path: string }> = {
  noir: { id: 'noir', label: 'NOIR', path: '/build-a-wig/noir' },
  blanco: { id: 'blanco', label: 'BLANCO', path: '/build-a-wig/blanco' },
  'soft-wave': { id: 'soft-wave', label: 'SOFT WAVE', path: '/build-a-wig/soft-wave' },
  'beach-wave': { id: 'beach-wave', label: 'BEACH WAVE', path: '/build-a-wig/beach-wave' },
  'soft-curl': { id: 'soft-curl', label: 'SOFT CURL', path: '/build-a-wig/soft-curl' },
  'ocean-curl': { id: 'ocean-curl', label: 'OCEAN CURL', path: '/build-a-wig/ocean-curl' },
};

function draftKey(email: string | null): string {
  return getPerUserKey(DRAFT_PREFIX, email);
}

function dismissKey(email: string | null): string {
  return getPerUserKey(DISMISS_PREFIX, email);
}

function readSelectionKeys(): Record<string, string> {
  const keys = [
    'selectedCapSize',
    'selectedLength',
    'selectedDensity',
    'selectedColor',
    'selectedLace',
    'selectedHairline',
    'selectedStyling',
    'selectedTexture',
  ];
  const out: Record<string, string> = {};
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v?.trim()) out[k.replace('selected', '').toLowerCase()] = v.trim();
  }
  const part = localStorage.getItem('selectedPartSelection');
  if (part?.trim()) out.partSelection = part.trim();
  return out;
}

function unitFromPathname(pathname: string): (typeof UNIT_SLUGS)[string] | null {
  const m = pathname.match(/\/build-a-wig\/([a-z-]+)/i);
  if (!m) return null;
  return UNIT_SLUGS[m[1].toLowerCase()] ?? null;
}

export function savePsaBawDraft(input: {
  unitId: string;
  buildPath?: string;
  selections?: Record<string, string>;
  label?: string;
}): PsaBawDraft {
  const unit = UNIT_SLUGS[input.unitId.toLowerCase()] ?? {
    id: input.unitId,
    label: input.unitId.toUpperCase(),
    path: input.buildPath ?? '/build-a-wig',
  };
  const draft: PsaBawDraft = {
    unitId: unit.id,
    unitLabel: unit.label,
    buildPath: input.buildPath ?? unit.path,
    selections: input.selections ?? readSelectionKeys(),
    savedAt: new Date().toISOString(),
    label: input.label?.trim() || undefined,
  };
  const email = getCurrentUserEmailFromStorage();
  localStorage.setItem(draftKey(email), JSON.stringify(draft));
  localStorage.removeItem(dismissKey(email));
  return draft;
}

export function loadPsaBawDraft(): PsaBawDraft | null {
  const email = getCurrentUserEmailFromStorage();
  try {
    const raw = localStorage.getItem(draftKey(email));
    if (!raw) return null;
    return JSON.parse(raw) as PsaBawDraft;
  } catch {
    return null;
  }
}

export function dismissPsaBawDraftNudge(): void {
  const email = getCurrentUserEmailFromStorage();
  localStorage.setItem(dismissKey(email), String(Date.now()));
}

export function isPsaBawDraftNudgeDismissed(): boolean {
  const email = getCurrentUserEmailFromStorage();
  const raw = localStorage.getItem(dismissKey(email));
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
}

/** In-progress BAW session on site (not yet saved as PSA draft). */
export function detectIncompleteBawSession(pathname: string): {
  unitId: string;
  unitLabel: string;
  buildPath: string;
} | null {
  if (localStorage.getItem('editingCartItem')) return null;
  const unit = unitFromPathname(pathname);
  if (!unit) return null;
  const selections = readSelectionKeys();
  const filled = Object.keys(selections).length;
  if (filled < 2) return null;
  return { unitId: unit.id, unitLabel: unit.label, buildPath: unit.path };
}

export function detectPsaBawResumeTarget(
  pathname: string
): { unitId: string; unitLabel: string; buildPath: string; source: 'draft' | 'session' } | null {
  if (isPsaBawDraftNudgeDismissed()) return null;
  const draft = loadPsaBawDraft();
  if (draft) {
    return {
      unitId: draft.unitId,
      unitLabel: draft.unitLabel,
      buildPath: draft.buildPath,
      source: 'draft',
    };
  }
  const session = detectIncompleteBawSession(pathname);
  if (session) return { ...session, source: 'session' };
  return null;
}
