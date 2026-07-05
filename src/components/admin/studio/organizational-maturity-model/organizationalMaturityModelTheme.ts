import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export const OMM = {
  amber: '#D97706',
  stone: '#78716C',
  slate: '#475569',
  green: '#059669',
  red: '#DC2626',
  gray: ADMIN_STUDIO_THEME.textSecondary,
  panelBg: ADMIN_STUDIO_THEME.panelBg,
  panelBorder: ADMIN_STUDIO_THEME.panelBorder,
  missionBg: 'rgba(217,119,6,0.04)',
  accent: '#D97706',
} as const;

export const ommPanel = {
  background: OMM.panelBg,
  border: `1px solid ${OMM.panelBorder}`,
} as const;

export const ommDarkHeader = {
  background: OMM.accent,
  border: `1px solid ${OMM.accent}`,
  color: 'white',
} as const;

export const ommSectionTitle = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '7px',
  fontWeight: 515 as const,
  letterSpacing: '0.08em',
  color: OMM.accent,
  marginBottom: 8,
} as const;

export const ommLabel = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '7px',
  color: OMM.gray,
  margin: 0,
} as const;

export const ommValue = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '10px',
  fontWeight: 515 as const,
  color: OMM.amber,
  margin: 0,
} as const;

export const ommLiveDot = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: OMM.green,
  marginRight: 6,
} as const;

export function scoreColor(score: number): string {
  if (score >= 80) return OMM.green;
  if (score >= 65) return OMM.amber;
  return OMM.red;
}

export function readinessColor(level: string): string {
  if (level === 'advanced' || level === 'ready') return OMM.green;
  if (level === 'developing') return OMM.amber;
  return OMM.stone;
}

export function statusColor(status: string): string {
  if (status === 'active' || status === 'earned') return OMM.green;
  if (status === 'recommended' || status === 'future') return OMM.amber;
  if (status === 'not-ready' || status === 'blocked') return OMM.red;
  return OMM.gray;
}

export function actionColor(action: string): string {
  if (action === 'accelerate') return OMM.green;
  if (action === 'slow-down' || action === 'strengthen') return OMM.amber;
  return OMM.slate;
}

export const ORGANIZATIONAL_MATURITY_MODEL_STYLES = `
  .organizational-maturity-model-root { font-family: "Futura PT Book", sans-serif; }
`;
