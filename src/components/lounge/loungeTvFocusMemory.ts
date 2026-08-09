import type { LoungeTvMainTab } from './loungeTvContent';

export type LoungeTvFocusMemory = {
  mainTab: LoungeTvMainTab;
  focusId?: string;
  railId?: string;
};

const KEY = 'loungeTvFocusMemory';

export function saveLoungeTvFocusMemory(memory: LoungeTvFocusMemory): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* ignore */
  }
}

export function readLoungeTvFocusMemory(): LoungeTvFocusMemory | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LoungeTvFocusMemory;
  } catch {
    return null;
  }
}

export function clearLoungeTvFocusMemory(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function restoreLoungeTvFocus(root: ParentNode, focusId?: string): void {
  if (!focusId) return;
  const el = root.querySelector<HTMLElement>(`[data-lounge-tv-focus-id="${CSS.escape(focusId)}"]`);
  if (el) {
    el.focus({ preventScroll: false });
    el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
  }
}
