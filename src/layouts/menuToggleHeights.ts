/**
 * Full-height mobile menu drawer (shop product pages, e.g. `/straight/noir`).
 * **Canonical height is `.menu-toggle-card` in `index.css`** (`calc(100dvh - 100px)`; large screens `- 50px`).
 * This constant matches many account pages; prefer `menu-toggle-card` class for admin/studio shells.
 */
export const MENU_TOGGLE_PANEL_HEIGHT = 'calc(100dvh - 80px)';

/** Class name for viewport-filling main cards — height rules live in `index.css` with !important. */
export const MENU_TOGGLE_MAIN_CARD_CLASS = 'menu-toggle-card';

/** Studio org/platform card — menu-toggle height + flex column for internal scroll. */
export const ADMIN_STUDIO_MAIN_CARD_CLASS = 'menu-toggle-card admin-studio-main-card';

/** Scroll region inside Studio main cards (nav tabs + workspace content). */
export const ADMIN_STUDIO_SCROLL_BODY_CLASS = 'admin-studio-scroll-body admin-hub-tab-scroll';

/** Account / admin main column when the flyout menu is closed (below header + padding). */
export const ACCOUNT_MAIN_COLUMN_MIN_HEIGHT = 'calc(100dvh - 160px)';
