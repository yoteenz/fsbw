import type { ReactNode } from 'react';
import './PenthouseSuiteDashboard.css';

type GlassPanelProps = {
  ariaLabel: string;
  onActivate: () => void;
  debug?: boolean;
  variant?: 'default' | 'feature' | 'compact' | 'settings' | 'hero';
  children: ReactNode;
};

export function PenthouseSuiteGlassPanel({
  ariaLabel,
  onActivate,
  debug = false,
  variant = 'default',
  children,
}: GlassPanelProps) {
  return (
    <button
      type="button"
      className={[
        'penthouse-suite-glass',
        variant === 'hero' ? 'penthouse-suite-hero' : '',
        variant === 'feature' ? 'penthouse-suite-glass--feature' : '',
        variant === 'compact' ? 'penthouse-suite-glass--compact' : '',
        variant === 'settings' ? 'penthouse-suite-glass--settings' : '',
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

type StatPanelProps = {
  iconSrc: string;
  title: string;
  metric: string;
  subtext?: string | string[];
  progressPct?: number;
  cta: string;
  ariaLabel: string;
  onActivate: () => void;
  debug?: boolean;
};

export function PenthouseSuiteStatPanel({
  iconSrc,
  title,
  metric,
  subtext,
  progressPct,
  cta,
  ariaLabel,
  onActivate,
  debug,
}: StatPanelProps) {
  const subtextLines = Array.isArray(subtext) ? subtext : subtext ? [subtext] : [];

  return (
    <PenthouseSuiteGlassPanel ariaLabel={ariaLabel} onActivate={onActivate} debug={debug} variant="compact">
      <div className="penthouse-suite-glass__head">
        <img src={iconSrc} alt="" className="penthouse-suite-glass__icon" draggable={false} />
        <div className="penthouse-suite-glass__body">
          <p className="penthouse-suite-glass__title">{title}</p>
          <p className="penthouse-suite-glass__metric">{metric}</p>
          {subtextLines.map((line) => (
            <p key={line} className="penthouse-suite-glass__subtext penthouse-suite-glass__subtext--tight">
              {line}
            </p>
          ))}
        </div>
      </div>
      {typeof progressPct === 'number' ? (
        <div className="penthouse-suite-glass__progress">
          <div className="penthouse-suite-glass__progress-track">
            <div
              className="penthouse-suite-glass__progress-fill"
              style={{ width: `${Math.max(4, Math.min(100, progressPct))}%` }}
            />
          </div>
        </div>
      ) : null}
      <div className="penthouse-suite-glass__cta">{cta}</div>
    </PenthouseSuiteGlassPanel>
  );
}
