import type { ReactNode } from 'react';
import './PenthouseSuiteDashboard.css';

type PanelShellProps = {
  ariaLabel: string;
  onActivate: () => void;
  debug?: boolean;
  variant?: 'hero' | 'stat';
  children: ReactNode;
};

export function PenthouseSuiteGlassPanel({
  ariaLabel,
  onActivate,
  debug = false,
  variant = 'stat',
  children,
}: PanelShellProps) {
  return (
    <button
      type="button"
      className={[
        'penthouse-suite-glass',
        variant === 'hero' ? 'penthouse-suite-glass--hero' : '',
        debug ? 'penthouse-suite-glass--debug' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      onClick={onActivate}
    >
      <div className="penthouse-suite-glass__inner">{children}</div>
    </button>
  );
}

export type EtchedStatPanelProps = {
  label: string;
  value: string;
  cta?: string;
  iconSrc?: string;
  ariaLabel: string;
  onActivate: () => void;
  debug?: boolean;
};

/** Minimal etched stat — label, divider, one value, optional tiny CTA. */
export function PenthouseSuiteEtchedPanel({
  label,
  value,
  cta,
  iconSrc,
  ariaLabel,
  onActivate,
  debug,
}: EtchedStatPanelProps) {
  return (
    <PenthouseSuiteGlassPanel ariaLabel={ariaLabel} onActivate={onActivate} debug={debug} variant="stat">
      {iconSrc ? (
        <img src={iconSrc} alt="" className="penthouse-suite-glass__micro-icon" draggable={false} />
      ) : null}
      <p className="penthouse-suite-glass__label">{label}</p>
      <div className="penthouse-suite-glass__rule" aria-hidden />
      <p className="penthouse-suite-glass__value">{value}</p>
      {cta ? <p className="penthouse-suite-glass__cta">{cta}</p> : null}
    </PenthouseSuiteGlassPanel>
  );
}
