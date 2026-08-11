import type { LoungeTvMainTab } from './loungeTvContent';

export type LoungeTvFocusMemory = {
  mainTab: LoungeTvMainTab;
  focusId?: string;
  railId?: string;
};

const KEY = 'loungeTvFocusMemory';

const SILENT_CLEAR_EVENTS = ['keydown', 'pointerdown'] as const;

let silentClearInstalled = false;

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

function scrollCardIntoRail(el: HTMLElement): void {
  const rail = el.closest<HTMLElement>('[data-lounge-tv-rail]');
  const scroller = rail?.querySelector<HTMLElement>('[data-lounge-tv-rail-scroll]');
  if (!scroller || scroller === el) return;
  const style = getComputedStyle(scroller);
  const canScrollX =
    (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
    scroller.scrollWidth > scroller.clientWidth + 1;
  if (!canScrollX) return;
  const er = el.getBoundingClientRect();
  const sr = scroller.getBoundingClientRect();
  if (er.left < sr.left) scroller.scrollLeft -= sr.left - er.left + 16;
  if (er.right > sr.right) scroller.scrollLeft += er.right - sr.right + 16;
}

function clearSilentFocusAttributes(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-lounge-tv-focus-silent]').forEach((el) => {
    el.removeAttribute('data-lounge-tv-focus-silent');
  });
}

function installSilentFocusClear(): void {
  if (silentClearInstalled) return;
  silentClearInstalled = true;

  const onUserIntent = () => {
    clearSilentFocusAttributes(document);
    for (const type of SILENT_CLEAR_EVENTS) {
      document.removeEventListener(type, onUserIntent, true);
    }
    silentClearInstalled = false;
  };

  for (const type of SILENT_CLEAR_EVENTS) {
    document.addEventListener(type, onUserIntent, true);
  }
}

function tryFocusElement(root: ParentNode, focusId: string): HTMLElement | null {
  const el = root.querySelector<HTMLElement>(`[data-lounge-tv-focus-id="${CSS.escape(focusId)}"]`);
  if (!el) return null;

  el.setAttribute('data-lounge-tv-focus-silent', 'true');
  el.focus({ preventScroll: true });
  scrollCardIntoRail(el);
  el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
  installSilentFocusClear();
  return el;
}

/** Restore remote focus without flashing the focus ring (used after back navigation). */
export function restoreLoungeTvFocus(root: ParentNode, focusId?: string): boolean {
  if (!focusId) return false;
  return tryFocusElement(root, focusId) != null;
}

/** Retry restore until the target mounts (browse panel re-render after back). */
export function restoreLoungeTvFocusWithRetry(
  root: ParentNode,
  focusId?: string,
  opts?: { maxAttempts?: number; intervalMs?: number },
): () => void {
  if (!focusId) return () => undefined;

  const maxAttempts = opts?.maxAttempts ?? 12;
  const intervalMs = opts?.intervalMs ?? 50;
  let attempts = 0;
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const attempt = () => {
    if (cancelled) return;
    attempts += 1;
    if (restoreLoungeTvFocus(root, focusId)) return;
    if (attempts < maxAttempts) {
      timer = setTimeout(attempt, intervalMs);
    }
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(attempt);
  });

  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}
