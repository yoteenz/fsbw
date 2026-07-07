/**
 * Full-height mobile menu drawer (shop product pages, e.g. `/straight/noir`).
 * **Canonical height is `.menu-toggle-card` in `index.css`** (`calc(100dvh - 100px)`; large screens `- 50px`).
 * This constant matches many account pages; prefer `menu-toggle-card` class for admin/studio shells.
 */
export const MENU_TOGGLE_PANEL_HEIGHT = 'calc(100dvh - 80px)';

/** Class name for viewport-filling main cards — height rules live in `index.css` with !important. */
export const MENU_TOGGLE_MAIN_CARD_CLASS = 'menu-toggle-card';

/** Account / admin main column when the flyout menu is closed (below header + padding). */
export const ACCOUNT_MAIN_COLUMN_MIN_HEIGHT = 'calc(100dvh - 160px)';
