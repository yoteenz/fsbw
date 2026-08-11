import { useCallback, useEffect, useMemo, useState, type FocusEvent } from 'react';
import type { MasteryTrackId, MasteryTrackPresentation } from '../../../content/education/hierarchy/masteryTracks';
import { listMasteryTrackPresentations } from '../../../content/education/hierarchy/masteryTracks';
import { computeSeasonProgress } from './seasonProgress';
import { getSeasonsForMastery } from '../../../content/education/hierarchy/catalog';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { AcrylicSaveBookmarkControl } from '../AcrylicSaveBookmarkControl';
import { MasteryPosterMedia } from './MasteryPosterMedia';
import {
  isPackSaved,
  LOUNGE_TV_LIBRARY_UPDATED_EVENT,
  togglePackSaved,
} from '../../../utils/loungeTvLibrary';

/** Learn-tab save targets for mastery tracks with shipped content. */
const MASTERY_TRACK_SAVE_PACK_IDS: Partial<Record<MasteryTrackId, string>> = {
  lace: 'cutting-lace',
  care: 'psa-care-ep-01-intro-to-your-unit',
};

function resolveMasteryTrackSavePackId(track: MasteryTrackPresentation): string | null {
  if (track.status !== 'available' || !track.mastery || track.episodeCount <= 0) return null;
  return MASTERY_TRACK_SAVE_PACK_IDS[track.id] ?? null;
}

/** Active masteries with shipped seasons + save bookmark — copy anchors to the top. */
function masteryPanelMetaAtTop(track: MasteryTrackPresentation): boolean {
  return track.seasonCount > 0 && resolveMasteryTrackSavePackId(track) !== null;
}

const MASTERY_BOOKMARK_GLYPH = `calc(${loungeTvGlassCqw(3.48, 7.68, 15.6)} * 0.6)`;
const MASTERY_BOOKMARK_HIT = `calc(${loungeTvGlassCqw(3.5, 8, 16)} * 0.6)`;
const MASTERY_BOOKMARK_MIN_TOUCH = Math.round(19 * 0.6);
const MASTERY_POSTER_INSET = loungeTvGlassCqw(0.75, 1.8, 3.6);
const MASTERY_BOOKMARK_TOP_OFFSET = '6px';
/** Net downward from inset anchor — poster panels only. */
const MASTERY_BOOKMARK_POSTER_TOP_DOWN_NUDGE = '7px';
const MASTERY_BOOKMARK_COMPACT_TOP_DOWN_NUDGE = '7px';
/** Grid layout — inline in LearnMasterySelector so bundled CSS cannot re-inset the row. */
const MASTERY_GRID_COLUMN_GAP = loungeTvGlassCqw(1.5, 6, 10);
const MASTERY_GRID_ROW_GAP = loungeTvGlassCqw(2.5, 5, 10);
const MASTERY_GRID_MARGIN_TOP = `calc(${loungeTvGlassCqw(0.55, 1.5, 3)} - 3px)`;
const MASTERY_GRID_MARGIN_BOTTOM = loungeTvGlassCqw(2, 4.5, 9);
/** Overlay title on mastery posters — LOUNGE_TV_TYPE.l3 + 2px, then +2px header bump. */
export const MASTERY_PANEL_TYPE_TITLE = `calc(${loungeTvGlassCqw(1.55, 5.6, 9)} + 2px)`;
/** VIEW ALL SERIES toggle — one step below poster title scale. */
export const MASTERY_PANEL_TYPE_TITLE_MINUS_1 = `calc(${MASTERY_PANEL_TYPE_TITLE} - 1px)`;
export const MASTERY_PANEL_TYPE_META = loungeTvGlassCqw(1.25, 4.8, 7.5);
export const MASTERY_PANEL_TYPE_META_PLUS_1 = `calc(${MASTERY_PANEL_TYPE_META} + 1px)`;
/** Matches mastery poster card border (`1px solid rgba(255,255,255,0.2)`). */
export const MASTERY_PANEL_BORDER_COLOR = 'rgba(255,255,255,0.2)';

function masteryBookmarkSizes(): {
  glyph: string;
  hit: string;
  minTouch: number;
} {
  return {
    glyph: MASTERY_BOOKMARK_GLYPH,
    hit: MASTERY_BOOKMARK_HIT,
    minTouch: MASTERY_BOOKMARK_MIN_TOUCH,
  };
}

type LearnMasterySelectorProps = {
  onSelectMastery: (masteryId: string) => void;
  /** Poster grid (default) or compact expanded browse tiles. */
  viewMode?: 'poster' | 'compact';
};

function aggregateMasteryProgress(masteryId: string): number | null {
  const seasons = getSeasonsForMastery(masteryId);
  if (!seasons.length) return null;
  let completed = 0;
  let total = 0;
  for (const season of seasons) {
    const p = computeSeasonProgress(season);
    completed += p.completed;
    total += p.total;
  }
  if (total <= 0) return null;
  return Math.round((completed / total) * 100);
}

/** Split "LACE MASTERY" → ["LACE", "MASTERY"] for stacked title treatment. */
function splitMasteryTitle(title: string): [string, string] {
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 1) return [title, ''];
  const last = parts[parts.length - 1];
  if (last === 'MASTERY') {
    return [parts.slice(0, -1).join(' '), last];
  }
  return [title, ''];
}

function isMasteryBookmarkTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('.lounge-tv-mastery-poster-bookmark'))
  );
}

function masteryPanelDescriptionStyle(compact = false) {
  return {
    margin: `${compact ? loungeTvGlassCqw(0.12, 0.28, 0.55) : loungeTvGlassCqw(0.2, 0.45, 0.9)} 0 0`,
    fontFamily: LOUNGE_TV_FONT_BOOK,
    fontSize: MASTERY_PANEL_TYPE_META,
    lineHeight: 1.25,
    color: 'rgba(255,255,255,0.72)',
    whiteSpace: 'normal' as const,
    wordBreak: 'break-word' as const,
  };
}

function MasteryTrackSaveBookmark({
  packId,
  glyphSize,
  hitSize,
  minTouch,
  inset = MASTERY_POSTER_INSET,
  topDownNudge = MASTERY_BOOKMARK_POSTER_TOP_DOWN_NUDGE,
}: {
  packId: string;
  glyphSize: string;
  hitSize: string;
  minTouch: number;
  inset?: string;
  topDownNudge?: string;
}) {
  const [, setRevision] = useState(0);

  useEffect(() => {
    const onLibraryUpdated = () => setRevision((n) => n + 1);
    window.addEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
    return () => window.removeEventListener(LOUNGE_TV_LIBRARY_UPDATED_EVENT, onLibraryUpdated);
  }, []);

  return (
    <AcrylicSaveBookmarkControl
      saved={isPackSaved(packId)}
      glyphSize={glyphSize}
      hitSize={hitSize}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        togglePackSaved(packId);
      }}
      data-lounge-tv-focusable
      className="lounge-tv-mastery-poster-bookmark"
      style={{
        position: 'absolute',
        right: `calc(${inset} - (${hitSize} - ${glyphSize}) / 2)`,
        top: `calc(${inset} - (${hitSize} - ${glyphSize}) / 2 - ${MASTERY_BOOKMARK_TOP_OFFSET} + ${topDownNudge})`,
        zIndex: 5,
        pointerEvents: 'auto',
        minWidth: `${minTouch}px`,
        minHeight: `${minTouch}px`,
      }}
    />
  );
}

export function LearnMasterySelector({
  onSelectMastery,
  viewMode = 'poster',
}: LearnMasterySelectorProps) {
  const tracks = useMemo(() => listMasteryTrackPresentations(), []);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const isCompact = viewMode === 'compact';
  const CardComponent = isCompact ? MasterySeriesCompactTile : MasteryTrackCard;

  useEffect(() => {
    const syncFocusedTrack = () => {
      const active = document.activeElement;
      if (!(active instanceof HTMLElement)) {
        setFocusedId(null);
        return;
      }
      const focusId = active.dataset.loungeTvFocusId;
      if (focusId?.startsWith('learn-mastery-')) {
        setFocusedId(focusId.slice('learn-mastery-'.length));
        return;
      }
      setFocusedId(null);
    };

    syncFocusedTrack();
    document.addEventListener('focusin', syncFocusedTrack);
    return () => document.removeEventListener('focusin', syncFocusedTrack);
  }, []);

  const handleSelect = useCallback(
    (track: MasteryTrackPresentation) => {
      if (track.status !== 'available' || !track.mastery) return;
      onSelectMastery(track.mastery.id);
    },
    [onSelectMastery],
  );

  return (
    <div
      className={
        isCompact
          ? 'lounge-tv-mastery-grid lounge-tv-mastery-grid--compact'
          : 'lounge-tv-mastery-grid'
      }
      data-lounge-tv-rail="learn-mastery-selector"
      style={{
        display: 'grid',
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
        gridTemplateColumns: isCompact ? undefined : 'repeat(3, minmax(0, 1fr))',
        gridAutoFlow: 'row',
        alignItems: 'start',
        padding: 0,
        margin: `${MASTERY_GRID_MARGIN_TOP} 0 ${MASTERY_GRID_MARGIN_BOTTOM} 0`,
        columnGap: MASTERY_GRID_COLUMN_GAP,
        rowGap: MASTERY_GRID_ROW_GAP,
      }}
    >
      {tracks.map((track) => (
        <CardComponent
          key={track.id}
          track={track}
          progressPercent={track.mastery ? aggregateMasteryProgress(track.mastery.id) : null}
          motionActive={focusedId === track.id}
          metaAtTop={masteryPanelMetaAtTop(track)}
          onFocus={() => setFocusedId(track.id)}
          onBlur={() => setFocusedId((prev) => (prev === track.id ? null : prev))}
          onSelect={() => handleSelect(track)}
        />
      ))}
    </div>
  );
}

function MasteryTrackCard({
  track,
  progressPercent,
  motionActive,
  metaAtTop,
  onFocus,
  onBlur,
  onSelect,
}: {
  track: MasteryTrackPresentation;
  progressPercent: number | null;
  motionActive: boolean;
  metaAtTop: boolean;
  onFocus: (e: FocusEvent<HTMLDivElement>) => void;
  onBlur: () => void;
  onSelect: () => void;
}) {
  const available = track.status === 'available' && Boolean(track.mastery);
  const hasProgress = progressPercent != null && progressPercent > 0 && progressPercent < 100;
  const [titlePrimary, titleSecondary] = splitMasteryTitle(track.title);
  const hasHeroArt = Boolean(track.heroImageUrl?.trim() || track.heroVideoUrl?.trim());
  const savePackId = resolveMasteryTrackSavePackId(track);
  const showBookmark = Boolean(savePackId);
  const bookmarkSizes = masteryBookmarkSizes();

  const progressBarHeight = loungeTvGlassCqw(0.35, 0.85, 1.6);
  const metaBottomPadding = hasProgress
    ? `calc(${MASTERY_POSTER_INSET} + ${progressBarHeight})`
    : MASTERY_POSTER_INSET;

  return (
    <div
      className="lounge-tv-mastery-poster-card-wrap"
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        minWidth: 0,
        maxWidth: '100%',
        width: '100%',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={`learn-mastery-${track.id}`}
        aria-disabled={!available}
        aria-label={track.title}
        className="lounge-tv-mastery-poster-card"
        onClick={(e) => {
          if (isMasteryBookmarkTarget(e.target)) return;
          if (available) onSelect();
        }}
        onKeyDown={(e) => {
          if (!available) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
          if (document.activeElement === e.currentTarget) return;
          e.currentTarget.focus({ preventScroll: true });
        }}
        style={{
          position: 'relative',
          border: available
            ? '1px solid rgba(255,255,255,0.2)'
            : '1px solid rgba(255,255,255,0.14)',
          boxShadow: 'none',
          cursor: available ? 'pointer' : 'default',
          opacity: available || hasHeroArt ? 1 : 0.72,
          boxSizing: 'border-box',
          minWidth: 0,
          maxWidth: '100%',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* In-flow 9:16 spacer — media/meta are absolute; this sets portrait tile height from column width. */}
        <span aria-hidden className="lounge-tv-mastery-poster-aspect" />

        <MasteryPosterMedia
          track={track}
          motionActive={motionActive}
          metaAtTop={metaAtTop}
        />

        <div
        className={
          metaAtTop
            ? 'lounge-tv-mastery-poster-meta lounge-tv-mastery-poster-meta--top'
            : 'lounge-tv-mastery-poster-meta'
        }
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: metaAtTop ? 'flex-start' : 'flex-end',
          padding: MASTERY_POSTER_INSET,
          paddingBottom: metaAtTop ? MASTERY_POSTER_INSET : metaBottomPadding,
          paddingRight: showBookmark
            ? `calc(${MASTERY_POSTER_INSET} + ${bookmarkSizes.glyph})`
            : MASTERY_POSTER_INSET,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: loungeTvGlassCqw(0.08, 0.18, 0.35),
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: MASTERY_PANEL_TYPE_TITLE,
              lineHeight: 1.05,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.05em',
            }}
          >
            {titlePrimary}
          </span>
          {titleSecondary ? (
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: MASTERY_PANEL_TYPE_TITLE,
                lineHeight: 1.08,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.06em',
              }}
            >
              {titleSecondary}
            </span>
          ) : null}
        </span>

        <p style={masteryPanelDescriptionStyle()}>{track.description}</p>

        {!available ? (
          <span
            style={{
              display: 'block',
              marginTop: loungeTvGlassCqw(0.25, 0.55, 1.1),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: MASTERY_PANEL_TYPE_META,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.05em',
              textAlign: 'left',
              alignSelf: 'flex-start',
            }}
          >
            COMING SOON
          </span>
        ) : track.seasonCount > 0 ? (
          <span
            style={{
              display: 'block',
              marginTop: loungeTvGlassCqw(0.25, 0.55, 1.1),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: MASTERY_PANEL_TYPE_META,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.04em',
            }}
          >
            {track.seasonCount} SEASON{track.seasonCount === 1 ? '' : 'S'}
          </span>
        ) : null}
      </div>

        {hasProgress ? (
          <span
            aria-hidden
            className="lounge-tv-mastery-poster-progress"
            style={{ height: progressBarHeight }}
          >
            <span style={{ width: `${progressPercent}%` }} />
          </span>
        ) : null}
      </div>

      {showBookmark && savePackId ? (
        <MasteryTrackSaveBookmark
          packId={savePackId}
          glyphSize={bookmarkSizes.glyph}
          hitSize={bookmarkSizes.hit}
          minTouch={bookmarkSizes.minTouch}
        />
      ) : null}
    </div>
  );
}

const MASTERY_COMPACT_INSET = loungeTvGlassCqw(0.55, 1.35, 2.7);

/** Compact browse tile — expanded VIEW ALL SERIES grid only. */
function MasterySeriesCompactTile({
  track,
  progressPercent,
  motionActive,
  metaAtTop,
  onFocus,
  onBlur,
  onSelect,
}: {
  track: MasteryTrackPresentation;
  progressPercent: number | null;
  motionActive: boolean;
  metaAtTop: boolean;
  onFocus: (e: FocusEvent<HTMLDivElement>) => void;
  onBlur: () => void;
  onSelect: () => void;
}) {
  const available = track.status === 'available' && Boolean(track.mastery);
  const hasProgress = progressPercent != null && progressPercent > 0 && progressPercent < 100;
  const [titlePrimary, titleSecondary] = splitMasteryTitle(track.title);
  const hasHeroArt = Boolean(track.heroImageUrl?.trim() || track.heroVideoUrl?.trim());
  const savePackId = resolveMasteryTrackSavePackId(track);
  const showBookmark = Boolean(savePackId);
  const bookmarkSizes = masteryBookmarkSizes();
  const progressBarHeight = loungeTvGlassCqw(0.28, 0.65, 1.2);
  const metaBottomPadding = hasProgress
    ? `calc(${MASTERY_COMPACT_INSET} + ${progressBarHeight})`
    : MASTERY_COMPACT_INSET;

  return (
    <div
      className="lounge-tv-mastery-compact-tile-wrap"
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        minWidth: 0,
        maxWidth: '100%',
        width: '100%',
      }}
    >
      <div
        role={available ? 'button' : undefined}
        tabIndex={available ? 0 : -1}
        data-lounge-tv-focusable={available ? true : undefined}
        data-lounge-tv-focus-id={`learn-mastery-${track.id}`}
        aria-disabled={!available}
        aria-label={track.title}
        className="lounge-tv-mastery-compact-tile"
        onClick={(e) => {
          if (isMasteryBookmarkTarget(e.target)) return;
          if (available) onSelect();
        }}
        onKeyDown={(e) => {
          if (!available) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        onPointerEnter={(e) => {
          if (!available) return;
          if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
          if (document.activeElement === e.currentTarget) return;
          e.currentTarget.focus({ preventScroll: true });
        }}
        style={{
          position: 'relative',
          border: available
            ? '1px solid rgba(255,255,255,0.2)'
            : '1px solid rgba(255,255,255,0.14)',
          boxShadow: 'none',
          cursor: available ? 'pointer' : 'default',
          opacity: available || hasHeroArt ? 1 : 0.72,
          boxSizing: 'border-box',
          minWidth: 0,
          maxWidth: '100%',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <span aria-hidden className="lounge-tv-mastery-compact-aspect" />

        <MasteryPosterMedia
          track={track}
          motionActive={motionActive}
          metaAtTop={metaAtTop}
        />

        <div
        className={
          metaAtTop
            ? 'lounge-tv-mastery-poster-meta lounge-tv-mastery-poster-meta--top lounge-tv-mastery-compact-meta'
            : 'lounge-tv-mastery-poster-meta lounge-tv-mastery-compact-meta'
        }
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: metaAtTop ? 'flex-start' : 'flex-end',
          padding: MASTERY_COMPACT_INSET,
          paddingLeft: `calc(${MASTERY_COMPACT_INSET} + 1px)`,
          paddingTop: metaAtTop ? `calc(${MASTERY_COMPACT_INSET} + 1px)` : MASTERY_COMPACT_INSET,
          paddingBottom: metaAtTop ? MASTERY_COMPACT_INSET : metaBottomPadding,
          paddingRight: showBookmark
            ? `calc(${MASTERY_COMPACT_INSET} + ${bookmarkSizes.glyph})`
            : MASTERY_COMPACT_INSET,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: loungeTvGlassCqw(0.05, 0.12, 0.24),
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: MASTERY_PANEL_TYPE_TITLE,
              lineHeight: 1.06,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.05em',
            }}
          >
            {titlePrimary}
          </span>
          {titleSecondary ? (
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: MASTERY_PANEL_TYPE_TITLE,
                lineHeight: 1.06,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.05em',
              }}
            >
              {titleSecondary}
            </span>
          ) : null}
        </span>

        <p style={masteryPanelDescriptionStyle(true)}>{track.description}</p>

        {!available ? (
          <span
            style={{
              display: 'block',
              marginTop: loungeTvGlassCqw(0.18, 0.4, 0.85),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: MASTERY_PANEL_TYPE_META,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.05em',
            }}
          >
            COMING SOON
          </span>
        ) : track.seasonCount > 0 ? (
          <span
            style={{
              display: 'block',
              marginTop: loungeTvGlassCqw(0.18, 0.4, 0.85),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: MASTERY_PANEL_TYPE_META,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.04em',
            }}
          >
            {track.seasonCount} SEASON{track.seasonCount === 1 ? '' : 'S'}
          </span>
        ) : null}
      </div>

        {hasProgress ? (
          <span
            aria-hidden
            className="lounge-tv-mastery-poster-progress"
            style={{ height: progressBarHeight }}
          >
            <span style={{ width: `${progressPercent}%` }} />
          </span>
        ) : null}
      </div>

      {showBookmark && savePackId ? (
        <MasteryTrackSaveBookmark
          packId={savePackId}
          glyphSize={bookmarkSizes.glyph}
          hitSize={bookmarkSizes.hit}
          minTouch={bookmarkSizes.minTouch}
          inset={MASTERY_COMPACT_INSET}
          topDownNudge={MASTERY_BOOKMARK_COMPACT_TOP_DOWN_NUDGE}
        />
      ) : null}
    </div>
  );
}
