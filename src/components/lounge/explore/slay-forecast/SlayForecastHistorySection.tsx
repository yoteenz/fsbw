import {
  FORECAST_HISTORY_GROUPS,
  formatForecastEditionStatusLabel,
  getForecastEditionById,
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

type SlayForecastHistorySectionProps = {
  activeEditionId: string;
  onSelectEdition: (editionId: string) => void;
  onViewAllHistory?: () => void;
  compact?: boolean;
};

export function SlayForecastHistorySection({
  activeEditionId,
  onSelectEdition,
  onViewAllHistory,
  compact = false,
}: SlayForecastHistorySectionProps) {
  return (
    <section className="lounge-tv-slay-forecast-history" aria-label="Forecast history">
      <div className="lounge-tv-slay-forecast-history__head">
        <h3
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: LOUNGE_TV_TYPE.l2,
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.06em',
            margin: 0,
          }}
        >
          {compact ? 'PREVIOUS EDITIONS' : 'FORECAST HISTORY'}
        </h3>
        {onViewAllHistory ? (
          <button
            type="button"
            className="lounge-tv-slay-forecast-history__view-all"
            data-lounge-tv-focusable
            data-lounge-tv-focus-id="forecast-history-view-all"
            onClick={onViewAllHistory}
            onFocusCapture={loungeTvFocusGlowIn}
            onBlurCapture={loungeTvFocusGlowOut}
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.06em',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            VIEW FORECAST HISTORY →
          </button>
        ) : null}
      </div>

      {FORECAST_HISTORY_GROUPS.map((group) => (
        <div key={group.id} className="lounge-tv-slay-forecast-history__group">
          <p
            className="lounge-tv-slay-forecast-history__group-label"
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.08em',
              margin: '0 0 0.5em',
            }}
          >
            {group.label}
          </p>
          <div className="lounge-tv-slay-forecast-history__editions">
            {group.editionIds.map((editionId) => {
              const edition = getForecastEditionById(editionId);
              if (!edition) return null;
              if (compact && edition.id === activeEditionId) return null;
              return (
                <HistoryEditionChip
                  key={edition.id}
                  edition={edition}
                  active={edition.id === activeEditionId}
                  onSelect={() => onSelectEdition(edition.id)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function HistoryEditionChip({
  edition,
  active,
  onSelect,
}: {
  edition: ForecastEdition;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        'lounge-tv-slay-forecast-history__chip',
        active ? 'lounge-tv-slay-forecast-history__chip--active' : '',
        edition.status === 'current' || edition.isCurrent
          ? 'lounge-tv-slay-forecast-history__chip--current'
          : 'lounge-tv-slay-forecast-history__chip--archival',
      ]
        .filter(Boolean)
        .join(' ')}
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={`forecast-history-${edition.id}`}
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
        {edition.displayPeriod}
      </span>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.06em',
          display: 'block',
          marginTop: '0.15em',
        }}
      >
        {edition.headline}
      </span>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.08em',
          display: 'block',
          marginTop: '0.2em',
        }}
      >
        {edition.finalStatusLabel ?? formatForecastEditionStatusLabel(edition)}
      </span>
    </button>
  );
}
