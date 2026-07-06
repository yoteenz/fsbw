import { EIA } from '../executive-ia/executiveIaTheme';

export const genomeTheme = {
  accent: EIA.red,
  inherit: '#059669',
  evolve: '#92704A',
  create: EIA.gray,
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
};

export function recommendationColor(rec: string): string {
  if (rec === 'inherit') return genomeTheme.inherit;
  if (rec === 'evolve') return genomeTheme.evolve;
  return genomeTheme.create;
}
