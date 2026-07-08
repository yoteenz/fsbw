import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Accent wash for zone-specific ceiling light */
  lightTone?: string;
  tall?: boolean;
};

/** Shared architectural shell — ceiling · columns · stone floor · ambient life. */
export function CdsZoneShell({ children, lightTone = 'rgba(201, 169, 98, 0.12)', tall = true }: Props) {
  return (
    <>
      <div className={`cds-env__ceiling${tall ? ' cds-env__ceiling--tall' : ''}`} aria-hidden>
        <div className="cds-env__ceiling-coffer" />
        <div className="cds-env__skylight" style={{ '--cds-zone-light': lightTone } as React.CSSProperties} />
      </div>
      <div className="cds-env__column cds-env__column--left" aria-hidden />
      <div className="cds-env__column cds-env__column--right" aria-hidden />
      <div className="cds-env__volumetric" aria-hidden />
      <div className="cds-env__particles" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="cds-env__particle" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>
      <div className="cds-env__floor-stone" aria-hidden>
        <div className="cds-env__floor-reflection" aria-hidden />
      </div>
      <div className="cds-env__zone-horizon" aria-hidden />
      {children}
    </>
  );
}
