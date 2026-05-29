import type { CSSProperties } from 'react';

/** Main PDP card (hero through cap chart) — tight bottom padding like NOIR. */
export const UNIT_PDP_MAIN_CARD_STYLE: CSSProperties = {
  paddingBottom: '6px',
};

/** Second card: product shots + details tabs. */
export const UNIT_PDP_DETAILS_CARD_CLASS =
  'border border-black flex flex-col pt-4 pb-4 px-5 mb-1 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out';

export const UNIT_PDP_DETAILS_CARD_STYLE: CSSProperties = {
  borderWidth: '1.3px',
  minWidth: '100%',
  maxWidth: 'none',
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  paddingBottom: '16px',
  marginTop: '24px',
};

export const UNIT_PDP_CAP_SIZE_HEADER_STYLE: CSSProperties = {
  transform: 'translateY(-10px)',
  marginTop: '20px',
};

export const UNIT_PDP_CAP_CHART_ROW_STYLE: CSSProperties = {
  transform: 'translateX(4px)',
  marginTop: 0,
};

export const UNIT_PDP_CAP_CHART_IMG_STYLE: CSSProperties = {
  maxWidth: 'clamp(115.6px, 12.62vw, 153px)',
  maxHeight: 'clamp(90.1px, 10.03vw, 119px)',
  width: '100%',
  cursor: 'pointer',
};

/** Product shots + details tabs share `mt-2 mb-4`; tabs must stay inside that wrapper (NOIR layout). */
export const UNIT_PDP_PRODUCT_SHOTS_SECTION_CLASS = 'mt-2 mb-4';

export const UNIT_PDP_TABS_SECTION_STYLE: CSSProperties = {
  marginTop: '13px',
  paddingTop: '4px',
  paddingBottom: '4px',
};

export const UNIT_PDP_TAB_CONTENT_STYLE: CSSProperties = {
  maxWidth: 'none',
  width: '100%',
  marginBottom: 0,
};
