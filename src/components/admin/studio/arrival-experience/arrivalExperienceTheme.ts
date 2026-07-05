import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export const AE = {
  sky: '#0369A1',
  blue: '#0284C7',
  slate: '#475569',
  amber: '#D97706',
  emerald: '#059669',
  gray: ADMIN_STUDIO_THEME.textSecondary,
  panelBg: ADMIN_STUDIO_THEME.panelBg,
  panelBorder: ADMIN_STUDIO_THEME.panelBorder,
  missionBg: 'rgba(3,105,161,0.04)',
  accent: '#0369A1',
} as const;

export const aePanel = {
  background: AE.panelBg,
  border: `1px solid ${AE.panelBorder}`,
} as const;

export const aeDarkHeader = {
  background: AE.accent,
  border: `1px solid ${AE.accent}`,
  color: 'white',
} as const;

export const aeSectionTitle = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '7px',
  fontWeight: 515 as const,
  letterSpacing: '0.08em',
  color: AE.sky,
  marginBottom: 8,
} as const;

export const aeLabel = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '7px',
  color: AE.gray,
  margin: 0,
} as const;

export const aeValue = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '10px',
  fontWeight: 515 as const,
  color: AE.sky,
  margin: 0,
} as const;

export const aeLiveDot = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: AE.emerald,
  marginRight: 6,
} as const;

export function timingColor(timing: string): string {
  if (timing === 'early') return AE.emerald;
  if (timing === 'mid') return AE.sky;
  return AE.amber;
}

export const ARRIVAL_EXPERIENCE_STYLES = `
  .arrival-experience-root { font-family: "Futura PT Book", sans-serif; }
`;
