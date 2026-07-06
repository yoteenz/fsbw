import type { ReactNode } from 'react';
import { EIA, eiaSectionTitle } from './executiveIaTheme';

type ExecutiveSecondaryGridProps = {
  title?: string;
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
};

/** Supporting cards below the hero — grouped, never six equal panels competing. */
export function ExecutiveSecondaryGrid({ title, children, columns = 2 }: ExecutiveSecondaryGridProps) {
  const colClass =
    columns === 1 ? 'grid-cols-1'
    : columns === 3 ? 'grid-cols-1 sm:grid-cols-3'
    : columns === 4 ? 'grid-cols-2 sm:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2';

  return (
    <section style={{ paddingTop: 4 }}>
      {title ? <p style={eiaSectionTitle}>{title}</p> : null}
      <div className={`grid gap-3 ${colClass}`}>{children}</div>
    </section>
  );
}

type ExecutiveSecondaryCardProps = {
  title: string;
  children: ReactNode;
  accent?: string;
  onClick?: () => void;
};

export function ExecutiveSecondaryCard({ title, children, accent, onClick }: ExecutiveSecondaryCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="text-left w-full"
      style={{
        padding: 12,
        background: 'rgba(255,255,255,0.65)',
        borderLeft: accent ? `3px solid ${accent}` : `1px solid rgba(0,0,0,0.08)`,
        borderTop: accent ? undefined : `1px solid rgba(0,0,0,0.08)`,
        borderRight: accent ? undefined : `1px solid rgba(0,0,0,0.08)`,
        borderBottom: accent ? undefined : `1px solid rgba(0,0,0,0.08)`,
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <p
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '9px',
          color: EIA.black,
          letterSpacing: '0.04em',
          marginBottom: 8,
        }}
      >
        {title}
      </p>
      {children}
    </Tag>
  );
}
