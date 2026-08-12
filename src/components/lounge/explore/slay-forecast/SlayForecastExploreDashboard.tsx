import type { ForecastEdition } from '../../../../content/slay-forecast';
import { SlayForecastCurrentCard } from './SlayForecastCurrentCard';
import { SlayForecastPulseUpdateCard } from './SlayForecastPulseUpdateCard';
import { SlayForecastSignalsWidget } from './SlayForecastSignalsWidget';
import { SlayForecastWeeklyPulse } from './SlayForecastWeeklyPulse';

type SlayForecastExploreDashboardProps = {
  edition: ForecastEdition;
};

/** Condensed weather-style forecast dashboard below the broadcast. */
export function SlayForecastExploreDashboard({ edition }: SlayForecastExploreDashboardProps) {
  return (
    <div className="lounge-tv-slay-forecast-dashboard" aria-label="Slay Forecast weekly dashboard">
      <SlayForecastCurrentCard edition={edition} />
      <SlayForecastWeeklyPulse edition={edition} />
      <div className="lounge-tv-slay-forecast-dashboard__support-row">
        <SlayForecastSignalsWidget edition={edition} />
        <SlayForecastPulseUpdateCard edition={edition} />
      </div>
    </div>
  );
}
