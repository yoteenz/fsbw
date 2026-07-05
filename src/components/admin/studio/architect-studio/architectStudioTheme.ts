import type { CSSProperties } from 'react';

export const AS = {
  accent: '#0F172A',
  gold: '#CA8A04',
  champagne: '#FEF3C7',
  red: '#EB1C24',
  green: '#16A34A',
  slate: '#334155',
  gray: '#808080',
  panelBg: 'rgba(255,255,255,0.94)',
  panelBorder: 'rgba(0,0,0,0.10)',
  campusBg: 'linear-gradient(180deg, #FAFAF9 0%, #F5F5F4 100%)',
} as const;

export const asPanel: CSSProperties = {
  background: AS.panelBg,
  border: `1px solid ${AS.panelBorder}`,
  backdropFilter: 'blur(10px)',
};

export const asDarkHeader: CSSProperties = {
  background: AS.accent,
  border: `1px solid ${AS.accent}`,
  color: '#F8FAFC',
};

export const asSectionTitle: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '9px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: AS.accent,
  margin: '0 0 8px 0',
};

export const asLabel: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  color: AS.gray,
  lineHeight: 1.45,
};

export const asValue: CSSProperties = {
  fontFamily: '"Covered By Your Grace", sans-serif',
  fontSize: '14px',
  color: AS.gold,
};

export const asLiveDot: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: AS.gold,
  display: 'inline-block',
  marginRight: 6,
  animation: 'as-pulse 2.5s ease-in-out infinite',
};

export function scoreColor(pct: number): string {
  if (pct >= 85) return AS.green;
  if (pct >= 70) return AS.gold;
  if (pct >= 55) return AS.slate;
  return AS.red;
}

export function priorityColor(priority: string): string {
  if (priority === 'critical') return AS.red;
  if (priority === 'high') return AS.gold;
  if (priority === 'medium') return AS.slate;
  return AS.gray;
}

export function availabilityColor(state: string): string {
  if (state === 'available') return AS.green;
  if (state === 'has-recommendations') return AS.gold;
  if (state === 'awaiting-approval') return AS.red;
  if (state === 'collaborating') return '#6366F1';
  return AS.slate;
}

export const ARCHITECT_STUDIO_STYLES = `
  .architect-studio-root { font-family: "Futura PT Book", sans-serif; }
  @keyframes as-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.55; transform: scale(1.15); }
  }
  .as-campus-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    grid-template-rows: auto auto auto;
    gap: 8px;
    align-items: stretch;
  }
  .as-forum-center {
    grid-column: 2;
    grid-row: 2;
    border-radius: 50%;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border: 2px solid #CA8A04;
    background: rgba(254,243,199,0.35);
  }
  @keyframes as-ambient {
    0%, 100% { opacity: 0.85; }
    50% { opacity: 1; }
  }
  .as-lobby-panel {
    background: linear-gradient(135deg, rgba(254,243,199,0.35) 0%, rgba(255,255,255,0.94) 60%);
    border-left: 3px solid #CA8A04;
  }
  .as-ambient-line {
    animation: as-ambient 3s ease-in-out infinite;
  }
`;
