import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export const SI = {
  bronze: '#854D0E',
  amber: '#D97706',
  emerald: '#059669',
  slate: '#475569',
  gray: ADMIN_STUDIO_THEME.textSecondary,
  panelBg: ADMIN_STUDIO_THEME.panelBg,
  panelBorder: ADMIN_STUDIO_THEME.panelBorder,
  missionBg: 'rgba(133,77,14,0.04)',
  accent: '#854D0E',
} as const;

export const siPanel = {
  background: SI.panelBg,
  border: `1px solid ${SI.panelBorder}`,
} as const;

export const siDarkHeader = {
  background: SI.accent,
  border: `1px solid ${SI.accent}`,
  color: 'white',
} as const;

export const siSectionTitle = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '7px',
  fontWeight: 515 as const,
  letterSpacing: '0.08em',
  color: SI.bronze,
  marginBottom: 8,
} as const;

export const siLabel = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '7px',
  color: SI.gray,
  margin: 0,
} as const;

export const siValue = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '10px',
  fontWeight: 515 as const,
  color: SI.bronze,
  margin: 0,
} as const;

export const siLiveDot = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: SI.emerald,
  marginRight: 6,
} as const;

export function priorityColor(priority: string): string {
  if (priority === 'high') return SI.emerald;
  if (priority === 'medium') return SI.bronze;
  return SI.slate;
}

export function certStatusColor(status: string): string {
  if (status === 'earned') return SI.emerald;
  if (status === 'in-progress') return SI.amber;
  return SI.slate;
}

export const STUDIO_INSTITUTE_STYLES = `
  .studio-institute-root { font-family: "Futura PT Book", sans-serif; }
`;
