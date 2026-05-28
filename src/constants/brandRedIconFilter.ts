/** Brand red, matches Futura header / link text (`#EB1C24`). */
export const BRAND_RED = '#EB1C24';

/**
 * CSS `filter` for black/neutral SVG assets (close ×, NOIR icons, etc.)
 * so icon color matches section header text.
 */
export const BRAND_RED_ICON_CSS_FILTER =
  'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)';

/** Section header row icons, same red with light drop-shadow for stroke weight. */
export const BRAND_RED_SECTION_HEADER_ICON_CSS_FILTER =
  `${BRAND_RED_ICON_CSS_FILTER} drop-shadow(0 0 0.15px ${BRAND_RED}) drop-shadow(0 0 0.15px ${BRAND_RED}) drop-shadow(0 0 0.1px ${BRAND_RED}) drop-shadow(0 0 0.2px ${BRAND_RED})`;
