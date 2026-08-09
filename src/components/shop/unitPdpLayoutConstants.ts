import type { CSSProperties } from 'react';

/** Main PDP card (hero through cap chart) — tight bottom padding like NOIR. */
export const UNIT_PDP_MAIN_CARD_STYLE: CSSProperties = {
  paddingBottom: '6px',
};

/** Second card: product shots + details tabs — transparent so tab copy sits on marble. */
export const UNIT_PDP_DETAILS_CARD_CLASS =
  'border border-black flex flex-col pt-4 pb-4 px-5 mb-1 transition-all duration-300 ease-out';

export const UNIT_PDP_DETAILS_CARD_STYLE: CSSProperties = {
  borderWidth: '1.3px',
  minWidth: '100%',
  maxWidth: 'none',
  overflow: 'hidden',
  backgroundColor: 'transparent',
  paddingBottom: '16px',
  marginTop: '24px',
};

export const UNIT_PDP_CAP_SIZE_HEADER_STYLE: CSSProperties = {
  transform: 'translateY(-10px)',
  marginTop: '20px',
};

export const UNIT_PDP_CAP_CHART_ROW_STYLE: CSSProperties = {
  transform: 'translateX(4px)',
  marginTop: '-4px',
};

export const UNIT_PDP_CAP_CHART_IMG_STYLE: CSSProperties = {
  maxWidth: 'clamp(115.6px, 12.62vw, 153px)',
  maxHeight: 'clamp(90.1px, 10.03vw, 119px)',
  width: '100%',
  cursor: 'pointer',
};

/** Enlarged cap size chart shown in the unit PDP modal popup. */
export const UNIT_PDP_CAP_SIZE_CHART_MODAL_IMG_SRC =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20Stock/IMG_2798.png';

/** Product shots + details tabs share `mt-2 mb-4`; tabs must stay inside that wrapper (NOIR layout). */
export const UNIT_PDP_PRODUCT_SHOTS_SECTION_CLASS = 'mt-2 mb-4';

/** BCF / unit PDP tab row — transparent; tab copy sits on page marble. */
export const PDP_TABS_WRAPPER_STYLE: CSSProperties = {
  paddingTop: '4px',
  position: 'relative',
  zIndex: 2,
  isolation: 'isolate',
  overflow: 'hidden',
  backgroundColor: 'transparent',
};

export const UNIT_PDP_TABS_SECTION_STYLE: CSSProperties = {
  marginTop: '13px',
  paddingTop: '4px',
  paddingBottom: '4px',
  ...PDP_TABS_WRAPPER_STYLE,
};

export const UNIT_PDP_TAB_CONTENT_STYLE: CSSProperties = {
  maxWidth: 'none',
  width: '100%',
  marginBottom: 0,
};

/** Tab body shell — clip + isolate so inactive/other layers cannot paint through. */
export const UNIT_PDP_TAB_PANEL_STYLE: CSSProperties = {
  overflow: 'hidden',
  position: 'relative',
  isolation: 'isolate',
  contain: 'paint',
};

export const UNIT_PDP_TAB_ACTIVE_LAYER_STYLE: CSSProperties = {
  position: 'relative',
  width: '100%',
};

/** BCF PDP tab body — Noir-aligned negative margin for card padding. */
export const BCF_PDP_TAB_CONTENT_STYLE: CSSProperties = {
  ...UNIT_PDP_TAB_CONTENT_STYLE,
  marginBottom: '-93px',
};

/** Toggle to show RECENTLY VIEWED on unit PDPs again (strip stays mounted when false). */
export const UNIT_PDP_RECENTLY_VIEWED_VISIBLE = false;

/** Merge `display: none` onto the RECENTLY VIEWED outer wrapper when hidden. */
export function withUnitPdpRecentlyViewedVisibility(style: CSSProperties): CSSProperties {
  if (UNIT_PDP_RECENTLY_VIEWED_VISIBLE) return style;
  return { ...style, display: 'none' };
}
