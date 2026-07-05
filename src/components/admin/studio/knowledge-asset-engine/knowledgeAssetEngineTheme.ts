import type { CSSProperties } from 'react';

export const KAE = {
  accent: '#0F172A',
  teal: '#0D9488',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.92)',
  panelBorder: 'rgba(0,0,0,0.12)',
} as const;

export const kaePanel: CSSProperties = {
  background: KAE.panelBg,
  border: `1px solid ${KAE.panelBorder}`,
  backdropFilter: 'blur(8px)',
};

export const kaeDarkHeader: CSSProperties = {
  background: KAE.accent,
  border: `1px solid ${KAE.accent}`,
  color: '#F8FAFC',
};

export const kaeSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: KAE.accent,
  margin: '0 0 8px 0',
};

export const kaeLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: KAE.gray,
  lineHeight: 1.45,
};

export const kaeValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: KAE.teal,
};

export const kaeLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: KAE.teal,
  display: 'inline-block',
  marginRight: 6,
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return KAE.green;
  if (pct >= 70) return KAE.teal;
  if (pct >= 55) return KAE.slate;
  return KAE.red;
}

export const KNOWLEDGE_ASSET_ENGINE_STYLES = `
  .knowledge-asset-engine-root { font-family: "Futura PT Book", sans-serif; }
`;
