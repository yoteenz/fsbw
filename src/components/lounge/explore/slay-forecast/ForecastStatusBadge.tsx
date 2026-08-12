import type { ForecastSignalStatus } from '../../../../content/slay-forecast';
import { forecastStatusDisplay } from './slayForecastPresentation';
import { LOUNGE_TV_FONT_MEDIUM } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';

type ForecastStatusBadgeProps = {
  status: ForecastSignalStatus;
  compact?: boolean;
  className?: string;
};

export function ForecastStatusBadge({ status, compact = false, className = '' }: ForecastStatusBadgeProps) {
  return (
    <span
      className={`lounge-tv-forecast-status ${className}`.trim()}
      data-status={status}
      style={{
        fontFamily: LOUNGE_TV_FONT_MEDIUM,
        fontSize: compact ? LOUNGE_TV_TYPE.l4 : LOUNGE_TV_TYPE.l3,
        letterSpacing: '0.06em',
      }}
    >
      {forecastStatusDisplay(status)}
    </span>
  );
}
