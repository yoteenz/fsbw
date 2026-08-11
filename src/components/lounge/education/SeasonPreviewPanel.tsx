import type { EducationSeason } from '../../../content/education/types';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_NESTED_TYPE } from '../loungeTvTypography';
import {
  loungeTvFocusBorderIn,
  loungeTvFocusBorderOut,
  loungeTvFocusGlowIn,
  loungeTvFocusGlowOut,
} from '../loungeTvFocusHandlers';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
} from '../loungeTvTheme';
import { useSeasonPassAccess } from '../../../hooks/useSeasonPassAccess';
import { usePsaSeasonAccess } from '../../../hooks/usePsaSeasonAccess';
import { seasonUsesPurchaseIncludedAccess } from '../../../content/education/hierarchy/catalog';
import { computeSeasonProgress } from './seasonProgress';
import {
  buildSeasonEpisodePreviewItems,
  countCompletedReleasedEpisodesForSeason,
  countReleasedEpisodesForSeason,
  countTotalEpisodesForSeason,
  seasonPreviewReleasedLabel,
  seasonPreviewViewerCompletionLabel,
} from './seasonPreviewMeta';
import { SeasonEpisodeRail } from './SeasonEpisodeRail';

type SeasonPreviewPanelProps = {
  season: EducationSeason;
  onEnterSeason: () => void;
  onSelectEpisode?: (episodeId: string) => void;
  featured?: boolean;
};

function seasonPremiseCopy(season: EducationSeason): string {
  const raw = season.shortPremise ?? season.description ?? season.learningObjective;
  return raw.toUpperCase();
}

export function SeasonPreviewPanel({
  season,
  onEnterSeason,
  onSelectEpisode,
  featured = false,
}: SeasonPreviewPanelProps) {
  const { hasSeasonPass } = useSeasonPassAccess();
  const { access: seasonAccess } = usePsaSeasonAccess(season.id);
  const progress = computeSeasonProgress(season);
  const hasPass = hasSeasonPass(season.id) || Boolean(seasonAccess?.seasonOwned);
  const complimentaryIncluded = Boolean(seasonAccess?.complimentary && seasonAccess.seasonOwned);
  const careIncludedLegacy = seasonUsesPurchaseIncludedAccess(season.id);

  const episodeItems = buildSeasonEpisodePreviewItems({
    season,
    hasSeasonPass: hasPass || careIncludedLegacy,
    complimentaryIncluded,
  });
  const slotTotal = countTotalEpisodesForSeason(season);
  const releasedCount = countReleasedEpisodesForSeason(season);
  const completedReleased = countCompletedReleasedEpisodesForSeason(season);
  const hasViewerProgress = progress.completed > 0 && progress.completed < progress.total;
  const completed = progress.total > 0 && progress.completed >= progress.total;
  const percentComplete =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const viewerCompletionLabel = seasonPreviewViewerCompletionLabel(completedReleased, releasedCount);

  const enterLabel = completed
    ? 'REVIEW SEASON >'
    : hasViewerProgress
      ? 'CONTINUE SEASON >'
      : 'ENTER SEASON >';

  return (
    <article
      className={`lounge-tv-season-preview-panel${featured ? ' lounge-tv-season-preview-panel--featured' : ''}`}
      data-lounge-tv-rail={`mastery-season-${season.id}`}
    >
      <header className="lounge-tv-season-preview-panel__header">
        <span className="lounge-tv-season-preview-panel__season-label">
          SEASON {String(season.seasonNumber).padStart(2, '0')}
        </span>
      </header>

      <div className="lounge-tv-season-preview-panel__identity">
        <h3
          className="lounge-tv-season-preview-panel__title"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: featured ? LOUNGE_TV_NESTED_TYPE.cardTitle : LOUNGE_TV_NESTED_TYPE.sectionTitle,
          }}
        >
          {season.title}
        </h3>
        <p
          className="lounge-tv-season-preview-panel__premise"
          style={{
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: LOUNGE_TV_NESTED_TYPE.body,
          }}
        >
          {seasonPremiseCopy(season)}
        </p>
      </div>

      {episodeItems.length > 0 ? (
        <SeasonEpisodeRail
          seasonId={season.id}
          items={episodeItems}
          onSelectEpisode={onSelectEpisode}
        />
      ) : null}

      <div className="lounge-tv-season-preview-panel__status">
        <span
          className="lounge-tv-season-preview-panel__released"
          style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: LOUNGE_TV_NESTED_TYPE.meta }}
        >
          {seasonPreviewReleasedLabel(releasedCount, slotTotal)}
        </span>
        {viewerCompletionLabel ? (
          <span
            className="lounge-tv-season-preview-panel__viewer-complete"
            style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: LOUNGE_TV_NESTED_TYPE.meta }}
          >
            {viewerCompletionLabel}
          </span>
        ) : null}
        {progress.total > 0 && releasedCount > 0 ? (
          <span className="lounge-tv-season-preview-panel__progress-track" aria-hidden>
            <span
              className="lounge-tv-season-preview-panel__progress-fill"
              style={{
                width: `${percentComplete}%`,
                background: completed ? LOUNGE_TV_BRAND_RED : 'rgba(235, 28, 36, 0.75)',
              }}
            />
          </span>
        ) : null}
      </div>

      <button
        type="button"
        className="lounge-tv-season-preview-panel__enter"
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={`season-${season.id}-enter`}
        onClick={onEnterSeason}
        onFocusCapture={(e) => {
          if (e.currentTarget.hasAttribute('data-lounge-tv-focus-silent')) return;
          e.currentTarget.style.transform = 'translateX(2px)';
          loungeTvFocusGlowIn(e);
          loungeTvFocusBorderIn(e);
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
          loungeTvFocusGlowOut(e);
          loungeTvFocusBorderOut(e, 'transparent');
        }}
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_NESTED_TYPE.cta,
          color: LOUNGE_TV_BRAND_RED,
          marginTop: loungeTvGlassCqw(0.35, 0.85, 1.7),
        }}
      >
        {enterLabel}
      </button>
    </article>
  );
}

/** @deprecated Use SeasonPreviewPanel — thin alias for existing imports. */
export function LoungeTvSeasonCard({
  season,
  onSelect,
  featured,
  onSelectEpisode,
}: {
  season: EducationSeason;
  onSelect: () => void;
  featured?: boolean;
  onSelectEpisode?: (episodeId: string) => void;
}) {
  return (
    <SeasonPreviewPanel
      season={season}
      onEnterSeason={onSelect}
      onSelectEpisode={onSelectEpisode}
      featured={featured}
    />
  );
}
