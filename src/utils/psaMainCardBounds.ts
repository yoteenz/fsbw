/** Frosted main content card — shared across shop, BAW, account, bag, etc. */
export const PSA_MAIN_CARD_SELECTOR =
  'div.border.border-black.flex.flex-col.bg-white\\/60.backdrop-blur-sm';

/** Typical page gutter (`px-4`) when no frosted card is on screen (e.g. lobby). */
export const PSA_PAGE_CONTENT_INSET_PX = 16;

export type PsaMainCardBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

function isNavHeaderBar(el: HTMLElement, rect: DOMRect): boolean {
  return (
    el.classList.contains('justify-center') &&
    el.classList.contains('items-center') &&
    !el.classList.contains('pt-6') &&
    !el.classList.contains('p-4') &&
    !el.classList.contains('menu-toggle-card') &&
    rect.height < 120
  );
}

/** Largest visible frosted main card, excluding the PSA widget and short nav header rows. */
export function findPsaMainCardElement(): HTMLElement | null {
  const nodes = document.querySelectorAll(PSA_MAIN_CARD_SELECTOR);
  let best: HTMLElement | null = null;
  let bestArea = 0;

  for (const node of nodes) {
    if (!(node instanceof HTMLElement)) continue;
    if (node.closest('[data-attribute="psa-assistant-widget"]')) continue;

    const rect = node.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 80) continue;
    if (isNavHeaderBar(node, rect)) continue;

    const area = rect.width * rect.height;
    if (area > bestArea) {
      bestArea = area;
      best = node;
    }
  }

  return best;
}

export function readPsaMainCardBounds(): PsaMainCardBounds {
  const card = findPsaMainCardElement();
  if (card) {
    const rect = card.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  }

  const inset = PSA_PAGE_CONTENT_INSET_PX;
  const width = Math.max(0, window.innerWidth - inset * 2);
  return {
    left: inset,
    top: 0,
    right: inset + width,
    bottom: window.innerHeight,
    width,
    height: window.innerHeight,
  };
}

/** Max chat panel height so it stays above the FAB within the card column. */
export function psaChatMaxHeightForCard(bounds: PsaMainCardBounds, fabReservePx = 120): number {
  const fromCard = bounds.bottom - bounds.top - fabReservePx;
  const fromViewport = window.innerHeight - 140;
  return Math.max(180, Math.min(520, fromCard, fromViewport));
}
