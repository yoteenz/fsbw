import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export const EAF = {
  violet: '#7C3AED',
  purple: '#6D28D9',
  emerald: '#059669',
  amber: '#D97706',
  slate: '#475569',
  gray: ADMIN_STUDIO_THEME.textSecondary,
  panelBg: ADMIN_STUDIO_THEME.panelBg,
  panelBorder: ADMIN_STUDIO_THEME.panelBorder,
  missionBg: 'rgba(124,58,237,0.04)',
  accent: '#7C3AED',
} as const;

export const eafPanel = {
  background: EAF.panelBg,
  border: `1px solid ${EAF.panelBorder}`,
} as const;

export const eafDarkHeader = {
  background: EAF.accent,
  border: `1px solid ${EAF.accent}`,
  color: 'white',
} as const;

export const eafSectionTitle = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '7px',
  fontWeight: 515 as const,
  letterSpacing: '0.08em',
  color: EAF.violet,
  marginBottom: 8,
} as const;

export const eafLabel = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '7px',
  color: EAF.gray,
  margin: 0,
} as const;

export const eafValue = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '10px',
  fontWeight: 515 as const,
  color: EAF.violet,
  margin: 0,
} as const;

export const eafLiveDot = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: EAF.emerald,
  marginRight: 6,
} as const;

export function alignmentColor(score: number): string {
  if (score >= 95) return EAF.emerald;
  if (score >= 85) return EAF.violet;
  return EAF.amber;
}

export function trustLevelColor(level: string): string {
  if (level === 'trusted-approval' || level === 'organizational-stewardship') return EAF.emerald;
  if (level === 'soft-approval' || level === 'co-review') return EAF.violet;
  return EAF.amber;
}

export function actionColor(action: string): string {
  if (action === 'approve') return EAF.emerald;
  if (action === 'maintain') return EAF.violet;
  if (action === 'reduce') return EAF.amber;
  return EAF.slate;
}

export const EXECUTIVE_APPRENTICESHIP_STYLES = `
  .executive-apprenticeship-root { font-family: "Futura PT Book", sans-serif; }
`;
