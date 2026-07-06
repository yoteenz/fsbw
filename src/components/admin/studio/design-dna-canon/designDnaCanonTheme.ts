import { EIA } from '../executive-ia/executiveIaTheme';

export const dnaTheme = {
  accent: EIA.red,
  marble: 'rgba(255,255,255,0.72)',
  glass: 'rgba(255,255,255,0.55)',
  protected: '#059669',
  refinement: EIA.red,
  caption: {
    fontFamily: '"Futura PT Book"',
    fontSize: '8px',
    color: EIA.gray,
    letterSpacing: '0.04em',
  } as const,
  label: {
    fontFamily: '"Futura PT Medium"',
    fontSize: '9px',
    letterSpacing: '0.06em',
  } as const,
  grace: {
    fontFamily: '"Covered By Your Grace"',
    color: EIA.red,
  } as const,
};

export function confidenceColor(score: number): string {
  if (score >= 90) return dnaTheme.protected;
  if (score >= 85) return '#92704A';
  return dnaTheme.refinement;
}

export function statusLabel(status: string): string {
  return status.replace(/-/g, ' ').toUpperCase();
}
