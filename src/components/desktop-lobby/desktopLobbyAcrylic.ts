import type { CSSProperties } from 'react';

export const DESKTOP_BRAND_RED = '#EB1C24';

export const desktopAcrylicPanelStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(28px) saturate(1.65)',
  WebkitBackdropFilter: 'blur(28px) saturate(1.65)',
  border: '1px solid rgba(255,255,255,0.85)',
  borderTop: `2px solid ${DESKTOP_BRAND_RED}`,
  boxShadow: [
    'inset 0 1px 0 rgba(255,255,255,0.95)',
    '0 20px 48px rgba(0,0,0,0.14)',
    '0 4px 16px rgba(0,0,0,0.08)',
  ].join(', '),
};

/** Fixed top nav — bright white frost (not gray) over dark room heroes. */
export const desktopNavBarStyle: CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.82) 100%)',
  backdropFilter: 'blur(20px) saturate(1.85)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.85)',
  borderBottom: '1px solid rgba(255,255,255,0.95)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,1)',
};
