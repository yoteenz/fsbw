import type { ReactNode } from 'react';
import { EIA, eiaPanel, eiaSectionTitle } from './executiveIaTheme';

type ExecutiveVisualSummaryProps = {
  title: string;
  children: ReactNode;
  /** Lighter container — visual first, not another dashboard card. */
  variant?: 'panel' | 'open';
};

/** One visual component that communicates state before reading text. */
export function ExecutiveVisualSummary({ title, children, variant = 'panel' }: ExecutiveVisualSummaryProps) {
  return (
    <section
      style={
        variant === 'panel'
          ? { ...eiaPanel, padding: EIA.cardPadding }
          : { padding: `${EIA.cardPadding}px 0` }
      }
    >
      <p style={eiaSectionTitle}>{title}</p>
      {children}
    </section>
  );
}
