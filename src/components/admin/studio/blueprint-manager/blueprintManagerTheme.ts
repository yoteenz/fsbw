import type { CSSProperties } from 'react';

export const BP_VISUAL = {
  border: '1.3px solid rgba(0,0,0,0.12)',
  borderStrong: '1.3px solid #000000',
  glass: 'rgba(255,255,255,0.82)',
  red: '#EB1C24',
  gray: '#808080',
  black: '#000000',
  pass: '#16A34A',
  warn: '#CA8A04',
  global: '#2563EB',
} as const;

export const bpPanelStyle: CSSProperties = {
  background: BP_VISUAL.glass,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: BP_VISUAL.border,
};

export const bpSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: BP_VISUAL.black,
  letterSpacing: '0.06em',
  margin: '0 0 8px 0',
};

export const bpCaption: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '9px',
  color: BP_VISUAL.gray,
  lineHeight: 1.5,
};

export const bpGrace: CSSProperties = {
  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
  color: BP_VISUAL.black,
};

export const bpActionBtn: CSSProperties = {
  border: BP_VISUAL.borderStrong,
  color: BP_VISUAL.red,
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '8px',
  textTransform: 'uppercase',
  padding: '5px 8px',
  cursor: 'pointer',
};

export function statusColor(status: string): string {
  if (status === 'approved') return BP_VISUAL.pass;
  if (status === 'review') return BP_VISUAL.warn;
  if (status === 'draft') return BP_VISUAL.gray;
  return '#9CA3AF';
}
