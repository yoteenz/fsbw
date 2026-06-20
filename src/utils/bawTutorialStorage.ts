import type { BawTutorialSelections } from '../constants/bawTutorialConfig';

const GUEST_DRAFT_KEY = 'bawTutorialDraft';

export type BawTutorialDraft = BawTutorialSelections & {
  savedAt: string;
  source: 'tutorial';
};

export function saveBawTutorialGuestDraft(selections: BawTutorialSelections): void {
  try {
    const draft: BawTutorialDraft = {
      ...selections,
      savedAt: new Date().toISOString(),
      source: 'tutorial',
    };
    localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

export function readBawTutorialGuestDraft(): BawTutorialDraft | null {
  try {
    const raw = localStorage.getItem(GUEST_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BawTutorialDraft;
    if (!parsed || parsed.source !== 'tutorial') return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Apply tutorial picks to full BAW localStorage keys before navigating to signed-in builder. */
export function applyBawTutorialDraftToBuilderStorage(selections: BawTutorialSelections): void {
  const cap = selections.capSize || 'M';
  localStorage.setItem('selectedCapSize', cap);
  localStorage.setItem('customizeSelectedCapSize', cap);
  localStorage.setItem('selectedLength', selections.length);
  localStorage.setItem('customizeSelectedLength', selections.length);
  localStorage.setItem('selectedDensity', selections.density);
  localStorage.setItem('customizeSelectedDensity', selections.density);
  localStorage.setItem('selectedColor', selections.color);
  localStorage.setItem('customizeSelectedColor', selections.color);
  localStorage.setItem('selectedStyling', selections.styling);
  localStorage.setItem('customizeSelectedStyling', selections.styling);
  localStorage.setItem('selectedHairStyling', selections.styling === 'NONE' ? '' : selections.styling);
  localStorage.setItem('customizeSelectedHairStyling', selections.styling === 'NONE' ? '' : selections.styling);
  saveBawTutorialGuestDraft(selections);
}
