import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export const LM = {
  indigo: '#4F46E5',
  violet: '#7C3AED',
  stone: '#78716C',
  green: '#059669',
  amber: '#D97706',
  gray: ADMIN_STUDIO_THEME.textSecondary,
  panelBg: ADMIN_STUDIO_THEME.panelBg,
  panelBorder: ADMIN_STUDIO_THEME.panelBorder,
  missionBg: 'rgba(79,70,229,0.04)',
  accent: '#4F46E5',
} as const;

export const lmPanel = {
  background: LM.panelBg,
  border: `1px solid ${LM.panelBorder}`,
} as const;

export const lmDarkHeader = {
  background: LM.accent,
  border: `1px solid ${LM.accent}`,
  color: 'white',
} as const;

export const lmSectionTitle = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '7px',
  fontWeight: 515 as const,
  letterSpacing: '0.08em',
  color: LM.indigo,
  marginBottom: 8,
} as const;

export const lmLabel = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '7px',
  color: LM.gray,
  margin: 0,
} as const;

export const lmValue = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '10px',
  fontWeight: 515 as const,
  color: LM.indigo,
  margin: 0,
} as const;

export const lmLiveDot = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: LM.green,
  marginRight: 6,
} as const;

export function modeColor(mode: string): string {
  if (mode === 'founder') return LM.indigo;
  if (mode === 'executive') return LM.stone;
  if (mode === 'creator') return LM.violet;
  if (mode === 'operator') return LM.amber;
  return LM.gray;
}

export function confidenceColor(score: number): string {
  if (score >= 85) return LM.green;
  if (score >= 70) return LM.indigo;
  return LM.amber;
}

export const LEADERSHIP_MODES_STYLES = `
  .leadership-modes-root { font-family: "Futura PT Book", sans-serif; }
`;
