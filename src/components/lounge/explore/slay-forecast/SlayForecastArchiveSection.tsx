import {
  formatForecastSeasonLabel,
  getAllForecastSeasons,
  type ForecastSeason,
} from '../../../../content/slay-forecast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';

type SlayForecastArchiveSectionProps = {
  activeSeasonId: string;
  onSelectSeason: (seasonId: string) => void;
};

export function SlayForecastArchiveSection({
  activeSeasonId,
  onSelectSeason,
}: SlayForecastArchiveSectionProps) {
  const seasons = getAllForecastSeasons();

  return (
    <section className="lounge-tv-slay-forecast-archive" aria-label="Slay Forecast archive">
      <h3
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l2,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          margin: 0,
        }}
      >
        SLAY FORECAST ARCHIVE
      </h3>
      <div className="lounge-tv-slay-forecast-archive__seasons">
        {seasons.map((season) => (
          <ArchiveSeasonChip
            key={season.id}
            season={season}
            active={season.id === activeSeasonId}
            onSelect={() => onSelectSeason(season.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ArchiveSeasonChip({
  season,
  active,
  onSelect,
}: {
  season: ForecastSeason;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`lounge-tv-slay-forecast-archive__chip ${active ? 'lounge-tv-slay-forecast-archive__chip--active' : ''}`.trim()}
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={`forecast-archive-${season.id}`}
      aria-pressed={active}
      onClick={onSelect}
      onFocusCapture={loungeTvFocusGlowIn}
      onBlurCapture={loungeTvFocusGlowOut}
    >
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l3,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.05em',
        }}
      >
        {formatForecastSeasonLabel(season)}
      </span>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.06em',
        }}
      >
        {season.status === 'current' ? 'CURRENT' : 'ARCHIVE'}
      </span>
    </button>
  );
}
