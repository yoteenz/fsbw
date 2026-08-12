import type { ForecastEdition } from '../../../../content/slay-forecast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import {
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { forecastEditionSignalDisplay } from './slayForecastPresentation';

type SlayForecastCompactPreviewProps = {
  edition: ForecastEdition;
  onSelect: () => void;
  focusId?: string;
};

/** Compact Explore preview — poster only, no autoplay broadcast. */
export function SlayForecastCompactPreview({
  edition,
  onSelect,
  focusId = 'explore-slay-forecast-preview',
}: SlayForecastCompactPreviewProps) {
  const previewSignals = edition.signals.slice(0, 3);

  return (
    <button
      type="button"
      className="lounge-tv-slay-forecast-compact-preview"
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={focusId}
      aria-label={`Open Slay Forecast for ${edition.displayPeriod}`}
      onClick={onSelect}
      onFocusCapture={loungeTvFocusGlowIn}
      onBlurCapture={loungeTvFocusGlowOut}
    >
      <span className="lounge-tv-slay-forecast-compact-preview__meta">
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.08em',
          }}
        >
          CURRENT FORECAST · {edition.displayPeriod}
        </span>
      </span>
      <span className="lounge-tv-slay-forecast-compact-preview__stage">
        <img
          src={edition.broadcastPoster}
          alt=""
          className="lounge-tv-slay-forecast-compact-preview__poster"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <span className="lounge-tv-slay-forecast-compact-preview__psa-mark" aria-hidden>
          PSA
        </span>
      </span>
      <span
        className="lounge-tv-slay-forecast-compact-preview__headline"
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l1,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.04em',
          display: 'block',
          marginTop: '0.45em',
        }}
      >
        {edition.headline}
      </span>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.06em',
          display: 'block',
          marginTop: '0.25em',
        }}
      >
        {edition.signals.length} SIGNAL{edition.signals.length === 1 ? '' : 'S'} WE&apos;RE WATCHING
      </span>
      {previewSignals.length > 0 ? (
        <span className="lounge-tv-slay-forecast-compact-preview__teasers">
          {previewSignals.map((signal) => (
            <span key={signal.id} className="lounge-tv-slay-forecast-compact-preview__teaser">
              {signal.categoryLabel.split(' ')[0]} · {forecastEditionSignalDisplay(signal)}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  );
}
