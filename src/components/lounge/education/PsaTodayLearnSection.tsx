import { useCallback, useId, useMemo, useState } from 'react';
import {
  listMasteryTrackPresentations,
  PSA_TODAY_LEARN_UMBRELLA,
} from '../../../content/education/hierarchy/masteryTracks';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import {
  LearnMasterySelector,
  MASTERY_PANEL_BORDER_COLOR,
  MASTERY_PANEL_TYPE_META_PLUS_1,
  MASTERY_PANEL_TYPE_TITLE_MINUS_1,
} from './LearnMasterySelector';

type PsaTodayLearnSectionProps = {
  onSelectMastery: (masteryId: string) => void;
};

function formatPsaTodaySeriesMeta(seriesCount: number, episodeCount: number): string {
  const seriesLabel = `${seriesCount} SERIES`;
  const episodeLabel = `${episodeCount} EPISODE${episodeCount === 1 ? '' : 'S'}`;
  return `${seriesLabel} · ${episodeLabel}`;
}

export function PsaTodayLearnSection({ onSelectMastery }: PsaTodayLearnSectionProps) {
  const seriesRegionId = useId();
  const tracks = useMemo(() => listMasteryTrackPresentations(), []);
  const totalEpisodes = useMemo(
    () => tracks.reduce((sum, track) => sum + track.episodeCount, 0),
    [tracks],
  );
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <section
      data-lounge-tv-rail="learn-masteries"
      className="lounge-tv-psa-today-series"
      style={{ width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
    >
      <header data-lounge-tv-rail="learn-psa-today-umbrella">
        <h2
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: `calc(${LOUNGE_TV_TYPE.l2} + 2px)`,
            color: LOUNGE_TV_BRAND_RED,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 400,
          }}
        >
          {PSA_TODAY_LEARN_UMBRELLA.title}
        </h2>
        <p
          className="lounge-tv-psa-today-tagline"
          style={{
            margin: `${loungeTvGlassCqw(0.45, 1.05, 2.1)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: MASTERY_PANEL_TYPE_META_PLUS_1,
            lineHeight: 1.25,
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.04em',
            maxWidth: '42em',
          }}
        >
          {PSA_TODAY_LEARN_UMBRELLA.tagline}
        </p>
      </header>

      <div
        className="lounge-tv-psa-today-series-nav"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: loungeTvGlassCqw(1, 2.4, 4.8),
          marginTop: loungeTvGlassCqw(0.85, 2, 4),
          marginBottom: `calc(${loungeTvGlassCqw(0.55, 1.35, 2.7)} - 6px)`,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: MASTERY_PANEL_TYPE_META_PLUS_1,
            color: MASTERY_PANEL_BORDER_COLOR,
            letterSpacing: '0.04em',
            flexShrink: 0,
          }}
        >
          {formatPsaTodaySeriesMeta(tracks.length, totalEpisodes)}
        </span>
        <button
          type="button"
          className="lounge-tv-psa-today-series-toggle"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id="learn-psa-today-series-toggle"
          aria-expanded={expanded}
          aria-controls={seriesRegionId}
          onClick={toggleExpanded}
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: MASTERY_PANEL_TYPE_TITLE_MINUS_1,
            color: LOUNGE_TV_BRAND_RED,
            letterSpacing: '0.05em',
            textDecoration: 'none',
          }}
        >
          {expanded ? 'COLLAPSE ALL SERIES' : 'VIEW ALL SERIES >'}
        </button>
      </div>

      <div
        id={seriesRegionId}
        className={`lounge-tv-psa-today-series-stage${expanded ? ' lounge-tv-psa-today-series-stage--expanded' : ' lounge-tv-psa-today-series-stage--collapsed'}`}
        data-lounge-tv-psa-today-expanded={expanded ? 'true' : 'false'}
      >
        <LearnMasterySelector
          key={expanded ? 'compact' : 'poster'}
          onSelectMastery={onSelectMastery}
          viewMode={expanded ? 'compact' : 'poster'}
        />
      </div>
    </section>
  );
}
