import type { ReactNode } from 'react';

type SlayForecastWidgetShellProps = {
  children: ReactNode;
  className?: string;
  /** Optional data attribute for focus / analytics hooks. */
  dataWidget?: string;
};

/** Smoked acrylic panel — shared forecast dashboard surface. */
export function SlayForecastWidgetShell({
  children,
  className = '',
  dataWidget,
}: SlayForecastWidgetShellProps) {
  return (
    <div
      className={['lounge-tv-slay-forecast-widget', className].filter(Boolean).join(' ')}
      data-slay-forecast-widget={dataWidget}
    >
      <div className="lounge-tv-slay-forecast-widget__sheen" aria-hidden />
      <div className="lounge-tv-slay-forecast-widget__rim" aria-hidden />
      {children}
    </div>
  );
}
