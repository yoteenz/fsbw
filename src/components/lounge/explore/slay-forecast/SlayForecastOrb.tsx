import type { ForecastSeason } from '../../../../content/slay-forecast';
import { formatForecastSeasonLabel } from '../../../../content/slay-forecast';
import { slayForecastOrbAccessibleLabel } from '../../../../constants/slayForecastOrb';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { SlayForecastOrbMedia } from './SlayForecastOrbMedia';

export type SlayForecastOrbSize = 'compact' | 'hub';

type SlayForecastOrbProps = {
  season: ForecastSeason;
  sizeVariant?: SlayForecastOrbSize;
  interactive?: boolean;
  focused?: boolean;
  onSelect?: () => void;
  focusId?: string;
  motionActive?: boolean;
  className?: string;
};

function OrbContent({
  season,
  sizeVariant,
  motionActive,
}: {
  season: ForecastSeason;
  sizeVariant: SlayForecastOrbSize;
  motionActive: boolean;
}) {
  const seasonType = sizeVariant === 'hub' ? LOUNGE_TV_TYPE.l1 : LOUNGE_TV_TYPE.l2;
  const subtitleType = sizeVariant === 'hub' ? LOUNGE_TV_TYPE.l3 : LOUNGE_TV_TYPE.l3;

  return (
    <>
      <div className="lounge-tv-slay-forecast-orb__stage">
        <SlayForecastOrbMedia season={season} motionActive={motionActive} />
        <span className="lounge-tv-slay-forecast-orb__mark" aria-hidden>
          FS
        </span>
        <span className="lounge-tv-slay-forecast-orb__focus-ring" aria-hidden />
      </div>
      <div className="lounge-tv-slay-forecast-orb__identity">
        <span
          className="lounge-tv-slay-forecast-orb__season"
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: seasonType,
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.06em',
          }}
        >
          {formatForecastSeasonLabel(season)}
        </span>
        <span
          className="lounge-tv-slay-forecast-orb__signal-count"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: subtitleType,
            color: 'rgba(255,255,255,0.78)',
            letterSpacing: '0.06em',
          }}
        >
          {season.subtitle}
        </span>
      </div>
    </>
  );
}

/** Animated Slay Forecast instrument — video ambient loop + live HTML overlay. */
export function SlayForecastOrb({
  season,
  sizeVariant = 'compact',
  interactive = false,
  focused = false,
  onSelect,
  focusId = 'slay-forecast-orb',
  motionActive = true,
  className = '',
}: SlayForecastOrbProps) {
  const rootClass = [
    'lounge-tv-slay-forecast-orb',
    `lounge-tv-slay-forecast-orb--${sizeVariant}`,
    interactive ? 'lounge-tv-slay-forecast-orb--interactive' : '',
    focused ? 'is-focused' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (interactive && onSelect) {
    return (
      <button
        type="button"
        className={rootClass}
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={focusId}
        aria-label={slayForecastOrbAccessibleLabel(season)}
        onClick={onSelect}
        onFocusCapture={loungeTvFocusGlowIn}
        onBlurCapture={loungeTvFocusGlowOut}
      >
        <OrbContent season={season} sizeVariant={sizeVariant} motionActive={motionActive} />
        <span className="lounge-tv-slay-forecast-orb__focus-cue" aria-hidden>
          ENTER FORECAST →
        </span>
      </button>
    );
  }

  return (
    <div className={rootClass} aria-hidden={sizeVariant === 'hub' ? undefined : true}>
      <OrbContent season={season} sizeVariant={sizeVariant} motionActive={motionActive} />
    </div>
  );
}

/** @deprecated Use SlayForecastOrb */
export const ForecastOrb = SlayForecastOrb;
