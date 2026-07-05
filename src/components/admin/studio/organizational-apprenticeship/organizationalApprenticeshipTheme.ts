import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export const OAP = {
  teal: '#155E75',
  cyan: '#0891B2',
  emerald: '#059669',
  amber: '#D97706',
  slate: '#475569',
  gray: ADMIN_STUDIO_THEME.textSecondary,
  panelBg: ADMIN_STUDIO_THEME.panelBg,
  panelBorder: ADMIN_STUDIO_THEME.panelBorder,
  missionBg: 'rgba(21,94,117,0.04)',
  accent: '#155E75',
} as const;

export const oapPanel = {
  background: OAP.panelBg,
  border: `1px solid ${OAP.panelBorder}`,
} as const;

export const oapDarkHeader = {
  background: OAP.accent,
  border: `1px solid ${OAP.accent}`,
  color: 'white',
} as const;

export const oapSectionTitle = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '7px',
  fontWeight: 515 as const,
  letterSpacing: '0.08em',
  color: OAP.teal,
  marginBottom: 8,
} as const;

export const oapLabel = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '7px',
  color: OAP.gray,
  margin: 0,
} as const;

export const oapValue = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '10px',
  fontWeight: 515 as const,
  color: OAP.teal,
  margin: 0,
} as const;

export const oapLiveDot = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: OAP.emerald,
  marginRight: 6,
} as const;

export function alignmentColor(score: number): string {
  if (score >= 95) return OAP.emerald;
  if (score >= 85) return OAP.teal;
  return OAP.amber;
}

export function stageColor(stage: string): string {
  if (stage === 'organizational-steward' || stage === 'trusted-contributor') return OAP.emerald;
  if (stage === 'co-review' || stage === 'co-create') return OAP.teal;
  return OAP.amber;
}

export function actionColor(action: string): string {
  if (action === 'approve' || action === 'expand') return OAP.emerald;
  if (action === 'delay' || action === 'reduce') return OAP.amber;
  return OAP.slate;
}

export const ORGANIZATIONAL_APPRENTICESHIP_STYLES = `
  .organizational-apprenticeship-root { font-family: "Futura PT Book", sans-serif; }
`;
