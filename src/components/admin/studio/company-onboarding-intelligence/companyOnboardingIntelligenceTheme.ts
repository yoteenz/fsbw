import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export const COI = {
  teal: '#0D9488',
  emerald: '#059669',
  stone: '#78716C',
  amber: '#D97706',
  gray: ADMIN_STUDIO_THEME.textSecondary,
  panelBg: ADMIN_STUDIO_THEME.panelBg,
  panelBorder: ADMIN_STUDIO_THEME.panelBorder,
  missionBg: 'rgba(13,148,136,0.04)',
  accent: '#0D9488',
} as const;

export const coiPanel = {
  background: COI.panelBg,
  border: `1px solid ${COI.panelBorder}`,
} as const;

export const coiDarkHeader = {
  background: COI.accent,
  border: `1px solid ${COI.accent}`,
  color: 'white',
} as const;

export const coiSectionTitle = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '7px',
  fontWeight: 515 as const,
  letterSpacing: '0.08em',
  color: COI.teal,
  marginBottom: 8,
} as const;

export const coiLabel = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '7px',
  color: COI.gray,
  margin: 0,
} as const;

export const coiValue = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '10px',
  fontWeight: 515 as const,
  color: COI.teal,
  margin: 0,
} as const;

export const coiLiveDot = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: COI.emerald,
  marginRight: 6,
} as const;

export function scoreColor(score: number): string {
  if (score >= 85) return COI.emerald;
  if (score >= 70) return COI.teal;
  return COI.amber;
}

export function statusColor(status: string): string {
  if (status === 'answered' || status === 'generated' || status === 'foundational' || status === 'complete') return COI.emerald;
  if (status === 'pending' || status === 'evolving' || status === 'recommended') return COI.amber;
  return COI.gray;
}

export const COMPANY_ONBOARDING_INTELLIGENCE_STYLES = `
  .company-onboarding-intelligence-root { font-family: "Futura PT Book", sans-serif; }
`;
