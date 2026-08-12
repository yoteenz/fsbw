import { MASTERY_PANEL_TYPE_TITLE_MINUS_1 } from '../../education/LearnMasterySelector';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { LOUNGE_TV_BRAND_RED, LOUNGE_TV_FONT_MEDIUM } from '../../loungeTvTheme';

type SlayForecastExploreNavRowProps = {
  hasPreviousWeek: boolean;
  onViewPreviousWeek: () => void;
  onViewAllForecasts: () => void;
  focusIdPrefix?: string;
};

/** Post-video navigation — backward week (left) · forecast hub (right). */
export function SlayForecastExploreNavRow({
  hasPreviousWeek,
  onViewPreviousWeek,
  onViewAllForecasts,
  focusIdPrefix = 'explore-slay-forecast-nav',
}: SlayForecastExploreNavRowProps) {
  return (
    <nav
      className="lounge-tv-slay-forecast-explore-nav"
      aria-label="Slay Forecast navigation"
    >
      {hasPreviousWeek ? (
        <button
          type="button"
          className="lounge-tv-slay-forecast-explore-nav__prev"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id={`${focusIdPrefix}-prev`}
          onClick={onViewPreviousWeek}
          onFocusCapture={loungeTvFocusGlowIn}
          onBlurCapture={loungeTvFocusGlowOut}
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: MASTERY_PANEL_TYPE_TITLE_MINUS_1,
            letterSpacing: '0.05em',
          }}
        >
          {'< VIEW PREVIOUS WEEK'}
        </button>
      ) : (
        <span
          className="lounge-tv-slay-forecast-explore-nav__prev lounge-tv-slay-forecast-explore-nav__prev--disabled"
          aria-disabled="true"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: MASTERY_PANEL_TYPE_TITLE_MINUS_1,
            letterSpacing: '0.05em',
          }}
        >
          {'< VIEW PREVIOUS WEEK'}
        </span>
      )}

      <button
        type="button"
        className="lounge-tv-slay-forecast-explore-nav__view-all"
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={`${focusIdPrefix}-view-all`}
        onClick={onViewAllForecasts}
        onFocusCapture={loungeTvFocusGlowIn}
        onBlurCapture={loungeTvFocusGlowOut}
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: MASTERY_PANEL_TYPE_TITLE_MINUS_1,
          color: LOUNGE_TV_BRAND_RED,
          letterSpacing: '0.05em',
        }}
      >
        {'VIEW ALL FORECASTS >'}
      </button>
    </nav>
  );
}
