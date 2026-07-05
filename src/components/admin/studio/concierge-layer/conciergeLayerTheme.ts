import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export const CL = {
  champagne: '#92704A',
  gold: '#B8860B',
  cream: '#FDF8F0',
  slate: '#475569',
  emerald: '#059669',
  gray: ADMIN_STUDIO_THEME.textSecondary,
  panelBg: ADMIN_STUDIO_THEME.panelBg,
  panelBorder: ADMIN_STUDIO_THEME.panelBorder,
  missionBg: 'rgba(146,112,74,0.05)',
  accent: '#92704A',
} as const;

export const clPanel = {
  background: CL.panelBg,
  border: `1px solid ${CL.panelBorder}`,
} as const;

export const clDarkHeader = {
  background: CL.accent,
  border: `1px solid ${CL.accent}`,
  color: 'white',
} as const;

export const clSectionTitle = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '7px',
  fontWeight: 515 as const,
  letterSpacing: '0.08em',
  color: CL.champagne,
  marginBottom: 8,
} as const;

export const clLabel = {
  fontFamily: '"Futura PT Book", sans-serif',
  fontSize: '7px',
  color: CL.gray,
  margin: 0,
} as const;

export const clValue = {
  fontFamily: '"Futura PT Medium", sans-serif',
  fontSize: '10px',
  fontWeight: 515 as const,
  color: CL.champagne,
  margin: 0,
} as const;

export const clLiveDot = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: CL.emerald,
  marginRight: 6,
} as const;

export const CONCIERGE_LAYER_STYLES = `
  .concierge-layer-root { font-family: "Futura PT Book", sans-serif; }
`;
