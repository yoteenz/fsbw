import {
  formatForecastEditionStatusLabel,
  getAllForecastEditions,
  isEditionNavigable,
  type ForecastEdition,
} from '../../../../content/slay-forecast';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../../loungeTvFocusHandlers';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';

type SlayForecastWeekSelectorRailProps = {
  activeEditionId: string;
  onSelectEdition: (editionId: string) => void;
  focusIdPrefix?: string;
};

/** Horizontal forecast edition rail — current week vs archival readings. */
export function SlayForecastWeekSelectorRail({
  activeEditionId,
  onSelectEdition,
  focusIdPrefix = 'slay-forecast-week-rail',
}: SlayForecastWeekSelectorRailProps) {
  const editions = getAllForecastEditions()
    .filter((edition) => isEditionNavigable(edition) || edition.status === 'developing')
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart));

  return (
    <nav className="lounge-tv-slay-forecast-week-rail" aria-label="Weekly forecast editions">
      <div className="lounge-tv-slay-forecast-week-rail__track">
        {editions.map((edition) => (
          <WeekRailChip
            key={edition.id}
            edition={edition}
            active={edition.id === activeEditionId}
            onSelect={() => onSelectEdition(edition.id)}
            focusId={`${focusIdPrefix}-${edition.id}`}
          />
        ))}
      </div>
    </nav>
  );
}

function WeekRailChip({
  edition,
  active,
  onSelect,
  focusId,
}: {
  edition: ForecastEdition;
  active: boolean;
  onSelect: () => void;
  focusId: string;
}) {
  const isCurrent = edition.status === 'current' || edition.isCurrent;
  const isDeveloping = edition.status === 'developing' || edition.status === 'upcoming';
  const navigable = isEditionNavigable(edition);

  return (
    <button
      type="button"
      className={[
        'lounge-tv-slay-forecast-week-rail__chip',
        active ? 'lounge-tv-slay-forecast-week-rail__chip--active' : '',
        isCurrent ? 'lounge-tv-slay-forecast-week-rail__chip--current' : '',
        !isCurrent && navigable ? 'lounge-tv-slay-forecast-week-rail__chip--archival' : '',
        isDeveloping ? 'lounge-tv-slay-forecast-week-rail__chip--upcoming' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-lounge-tv-focusable={navigable ? true : undefined}
      data-lounge-tv-focus-id={navigable ? focusId : undefined}
      aria-pressed={active}
      aria-disabled={!navigable}
      disabled={!navigable}
      onClick={navigable ? onSelect : undefined}
      onFocusCapture={navigable ? loungeTvFocusGlowIn : undefined}
      onBlurCapture={navigable ? loungeTvFocusGlowOut : undefined}
    >
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_DEMI,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.05em',
        }}
      >
        {edition.displayPeriod}
      </span>
      {isCurrent ? (
        <span
          className="lounge-tv-slay-forecast-week-rail__live"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_BRAND_RED,
            letterSpacing: '0.1em',
          }}
        >
          CURRENT
        </span>
      ) : (
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.08em',
          }}
        >
          {edition.finalStatusLabel ?? formatForecastEditionStatusLabel(edition)}
        </span>
      )}
      {active ? (
        <span
          className="lounge-tv-slay-forecast-week-rail__headline"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: 'rgba(255,255,255,0.72)',
            letterSpacing: '0.03em',
            display: 'block',
            marginTop: '0.12em',
          }}
        >
          {edition.headline}
        </span>
      ) : null}
    </button>
  );
}
