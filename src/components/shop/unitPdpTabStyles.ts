/** Shared typography for wig unit PDP tabs (NOIR / BCF pattern). */

export const UNIT_PDP_TAB_BODY_STYLE = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: '#000000',
  fontWeight: 400,
  margin: 0,
  lineHeight: 1.45,
  textTransform: 'uppercase' as const,
};

/** Match `/brand/terms` bullet rows (`BrandTermsBody`). */
export const UNIT_PDP_TAB_BULLET_STYLE = {
  ...UNIT_PDP_TAB_BODY_STYLE,
  paddingLeft: '12px',
};

export const UNIT_PDP_TAB_BULLET_MARK_STYLE = { color: '#EB1C24' };

export const UNIT_PDP_TAB_SECTION_TITLE_STYLE = {
  fontFamily: '"Bohemy", cursive',
  fontSize: '20px',
  color: '#808080',
  fontWeight: 400,
  margin: '12px 0 8px 0',
  textTransform: 'lowercase' as const,
};
