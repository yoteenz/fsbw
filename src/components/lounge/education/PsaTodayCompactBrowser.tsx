import { useCallback, useMemo, useState } from 'react';
import type { MasteryTrackId } from '../../../content/education/hierarchy/masteryTracks';
import {
  listMasteryTrackPresentations,
} from '../../../content/education/hierarchy/masteryTracks';
import {
  getEducationSeasonById,
  getSeasonsForMastery,
  resolveSlotPsaEpisode,
  formatEpisodeReleaseLabel,
  isEpisodeFullLessonReleased,
} from '../../../content/education/hierarchy/catalog';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { LearnMasterySelector, MASTERY_PANEL_TYPE_META_PLUS_1 } from './LearnMasterySelector';

type CompactPsaView =
  | { level: 'masteries' }
  | { level: 'seasons'; trackId: MasteryTrackId; masteryId: string; trackTitle: string }
  | { level: 'episodes'; trackId: MasteryTrackId; masteryId: string; seasonId: string; trackTitle: string; seasonTitle: string };

type PsaTodayCompactBrowserProps = {
  onSelectEpisode?: (episodeId: string) => void;
};

export function PsaTodayCompactBrowser({ onSelectEpisode }: PsaTodayCompactBrowserProps) {
  const [view, setView] = useState<CompactPsaView>({ level: 'masteries' });
  const tracks = useMemo(() => listMasteryTrackPresentations(), []);

  const handleSelectMastery = useCallback(
    (masteryId: string) => {
      const track = tracks.find((t) => t.mastery?.id === masteryId);
      if (!track) return;
      const seasons = getSeasonsForMastery(masteryId);
      if (track.status === 'coming-soon' || seasons.length === 0) return;
      setView({
        level: 'seasons',
        trackId: track.id,
        masteryId,
        trackTitle: track.title.replace(/\s+MASTERY$/i, ''),
      });
    },
    [tracks],
  );

  const seasons = useMemo(() => {
    if (view.level !== 'seasons' && view.level !== 'episodes') return [];
    return getSeasonsForMastery(view.masteryId);
  }, [view]);

  const activeSeason = view.level === 'episodes' ? getEducationSeasonById(view.seasonId) : undefined;

  const backToMasteries = useCallback(() => setView({ level: 'masteries' }), []);
  const backToSeasons = useCallback(() => {
    if (view.level !== 'episodes') return;
    setView({
      level: 'seasons',
      trackId: view.trackId,
      masteryId: view.masteryId,
      trackTitle: view.trackTitle,
    });
  }, [view]);

  return (
    <div
      className="lounge-tv-psa-today-compact"
      data-lounge-tv-psa-compact-level={view.level}
      style={{ width: '100%', minWidth: 0 }}
    >
      {view.level !== 'masteries' ? (
        <div
          className="lounge-tv-psa-today-compact__crumb"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: loungeTvGlassCqw(0.35, 0.8, 1.6),
            marginBottom: loungeTvGlassCqw(0.65, 1.4, 2.8),
            minWidth: 0,
          }}
        >
          <button
            type="button"
            className="lounge-tv-psa-today-compact__back"
            data-lounge-tv-focusable
            data-lounge-tv-focus-id={
              view.level === 'seasons' ? 'psa-compact-back-masteries' : 'psa-compact-back-seasons'
            }
            onClick={view.level === 'seasons' ? backToMasteries : backToSeasons}
            onFocusCapture={loungeTvFocusGlowIn}
            onBlurCapture={loungeTvFocusGlowOut}
            style={{
              alignSelf: 'flex-start',
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: MASTERY_PANEL_TYPE_META_PLUS_1,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.06em',
              background: 'transparent',
              border: 'none',
              padding: `${loungeTvGlassCqw(0.35, 0.75, 1.5)} 0`,
              cursor: 'pointer',
            }}
          >
            {view.level === 'seasons' ? '← MASTERIES' : '← SEASONS'}
          </button>
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {view.level === 'seasons'
              ? `${view.trackTitle} MASTERY`
              : `${view.trackTitle} MASTERY · ${view.seasonTitle}`}
          </p>
        </div>
      ) : null}

      {view.level === 'masteries' ? (
        <LearnMasterySelector onSelectMastery={handleSelectMastery} viewMode="poster" />
      ) : null}

      {view.level === 'seasons' ? (
        <div className="lounge-tv-psa-today-compact__seasons" data-lounge-tv-rail-scroll>
          {seasons.map((season) => {
            const releasedCount = season.episodeSlots.filter((slot) => {
              const ep = resolveSlotPsaEpisode(slot);
              return ep && isEpisodeFullLessonReleased(ep);
            }).length;
            const comingSoon = releasedCount === 0;
            return (
              <button
                key={season.id}
                type="button"
                data-lounge-tv-focusable
                data-lounge-tv-focus-id={`psa-compact-season-${season.id}`}
                disabled={comingSoon && season.episodeSlots.length === 0}
                className={[
                  'lounge-tv-psa-today-compact-season',
                  comingSoon ? 'lounge-tv-psa-today-compact-season--soon' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  if (season.episodeSlots.length === 0) return;
                  setView({
                    level: 'episodes',
                    trackId: view.trackId,
                    masteryId: view.masteryId,
                    seasonId: season.id,
                    trackTitle: view.trackTitle,
                    seasonTitle: season.title,
                  });
                }}
                onFocusCapture={loungeTvFocusGlowIn}
                onBlurCapture={loungeTvFocusGlowOut}
              >
                <span className="lounge-tv-psa-today-compact-season__num">
                  {String(season.seasonNumber).padStart(2, '0')}
                </span>
                <span className="lounge-tv-psa-today-compact-season__copy">
                  <span className="lounge-tv-psa-today-compact-season__title">{season.title}</span>
                  <span className="lounge-tv-psa-today-compact-season__meta">
                    {releasedCount > 0
                      ? `${releasedCount} EPISODE${releasedCount === 1 ? '' : 'S'}`
                      : 'COMING SOON'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {view.level === 'episodes' && activeSeason ? (
        <div className="lounge-tv-psa-today-compact__episodes" data-lounge-tv-rail-scroll>
          {activeSeason.episodeSlots.map((slot) => {
            const episode = resolveSlotPsaEpisode(slot);
            const released = episode ? isEpisodeFullLessonReleased(episode) : false;
            const title = episode?.title ?? slot.curriculumBibleId.replace(/-/g, ' ').toUpperCase();
            const statusLabel = released
              ? 'WATCH'
              : episode
                ? formatEpisodeReleaseLabel(episode.releaseAt)
                : 'COMING SOON';

            return (
              <button
                key={slot.slotId}
                type="button"
                data-lounge-tv-focusable
                data-lounge-tv-focus-id={`psa-compact-ep-${slot.slotId}`}
                disabled={!released || !episode}
                className={[
                  'lounge-tv-psa-today-compact-episode',
                  released ? '' : 'lounge-tv-psa-today-compact-episode--soon',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  if (released && episode) onSelectEpisode?.(episode.id);
                }}
                onFocusCapture={released ? loungeTvFocusGlowIn : undefined}
                onBlurCapture={released ? loungeTvFocusGlowOut : undefined}
              >
                <span className="lounge-tv-psa-today-compact-episode__num">
                  EP {String(slot.seasonEpisodeNumber).padStart(2, '0')}
                </span>
                <span className="lounge-tv-psa-today-compact-episode__title">{title}</span>
                <span className="lounge-tv-psa-today-compact-episode__status">{statusLabel}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
