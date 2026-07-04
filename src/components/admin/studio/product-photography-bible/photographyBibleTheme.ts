import type { CSSProperties } from 'react';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export const PP_VISUAL = {
  red: ADMIN_STUDIO_THEME.accent,
  black: ADMIN_STUDIO_THEME.textPrimary,
  muted: ADMIN_STUDIO_THEME.textSecondary,
  panelBorder: ADMIN_STUDIO_THEME.panelBorder,
  panelBg: ADMIN_STUDIO_THEME.panelBg,
};

export const ppPanelStyle: CSSProperties = {
  background: PP_VISUAL.panelBg,
  border: `1px solid ${PP_VISUAL.panelBorder}`,
};

export const ppCaption: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '8px',
  fontWeight: 515,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: PP_VISUAL.muted,
  lineHeight: 1.5,
};

export const ppSectionTitle: CSSProperties = {
  ...ppCaption,
  fontFamily: '"Futura PT Medium"',
  color: PP_VISUAL.black,
  fontSize: '9px',
  marginBottom: 8,
};

export const ppActionBtn: CSSProperties = {
  ...ppCaption,
  fontSize: '7px',
  padding: '8px 10px',
  border: `1px solid ${PP_VISUAL.panelBorder}`,
  background: 'rgba(255,255,255,0.85)',
  cursor: 'pointer',
  textTransform: 'uppercase',
};

export function statusColor(status: string): string {
  if (status === 'approved' || status === 'complete') return '#16a34a';
  if (status === 'pending-review' || status === 'partial') return '#ca8a04';
  return PP_VISUAL.muted;
}
