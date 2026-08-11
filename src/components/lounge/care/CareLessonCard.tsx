import type { CSSProperties } from 'react';
import type { CareLesson } from '../../../content/education/types';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { CARE_GUIDE_LOCKED_LABEL, CARE_GUIDE_INCLUDED_BADGE } from './careAccess';
import {
  LOUNGE_TV_CARE_RAIL_CARD_WIDTH,
  LOUNGE_TV_FEATURE_CARD_WIDTH,
  LOUNGE_TV_PAIR_CARD_WIDTH,
  type LoungeTvRailLayoutMode,
} from '../loungeTvAdaptiveRail';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';

type CareLessonCardProps = {
  lesson: CareLesson;
  onSelect: (lesson: CareLesson) => void;
  unlocked: boolean;
  progressPercent?: number;
  cardSize?: LoungeTvRailLayoutMode;
};

function cardWidthForSize(size: LoungeTvRailLayoutMode): string {
  if (size === 'feature') return LOUNGE_TV_FEATURE_CARD_WIDTH;
  if (size === 'pair') return LOUNGE_TV_PAIR_CARD_WIDTH;
  return LOUNGE_TV_CARE_RAIL_CARD_WIDTH;
}

function statusLine(unlocked: boolean, comingSoon?: boolean): string {
  if (comingSoon) return 'COMING SOON';
  return unlocked ? CARE_GUIDE_INCLUDED_BADGE : CARE_GUIDE_LOCKED_LABEL;
}

export function CareLessonCard({
  lesson,
  onSelect,
  unlocked,
  progressPercent,
  cardSize = 'rail',
}: CareLessonCardProps) {
  const poster = lesson.thumbnailUrl ?? lesson.posterUrl;
  const isFeature = cardSize === 'feature';
  const cardWidth = cardWidthForSize(cardSize);

  const titleStyle: CSSProperties = {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: isFeature ? LOUNGE_TV_TYPE.l1 : LOUNGE_TV_TYPE.l2,
    lineHeight: 1.2,
    color: LOUNGE_TV_TEXT_WHITE,
    textTransform: 'uppercase',
  };

  const statusStyle: CSSProperties = {
    fontFamily: LOUNGE_TV_FONT_BOOK,
    fontSize: LOUNGE_TV_TYPE.l3,
    color: unlocked ? LOUNGE_TV_TEXT_GRAY : LOUNGE_TV_TEXT_GRAY,
    marginTop: loungeTvGlassCqw(0.35, 0.8, 1.6),
    lineHeight: 1.35,
  };

  return (
    <button
      type="button"
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={lesson.id}
      onClick={() => onSelect(lesson)}
      aria-label={lesson.title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: isFeature ? '1 1 100%' : `0 0 ${cardWidth}`,
        width: isFeature ? '100%' : cardWidth,
        minWidth: isFeature ? 0 : cardWidth,
        maxWidth: isFeature ? '100%' : cardWidth,
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        scrollSnapAlign: 'start',
        textTransform: 'uppercase',
        opacity: unlocked ? 1 : 0.9,
        transition: 'box-shadow 0.28s ease',
      }}
      onFocusCapture={loungeTvFocusGlowIn}
      onBlurCapture={loungeTvFocusGlowOut}
    >
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          aspectRatio: isFeature ? '21 / 9' : '16 / 9',
          overflow: 'hidden',
          background: '#121212',
          border: unlocked ? '1px solid rgba(235, 28, 36, 0.35)' : '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: unlocked ? undefined : 'grayscale(0.35) brightness(0.75)',
            }}
          />
        ) : null}
        {progressPercent != null && progressPercent > 0 && progressPercent < 100 ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: loungeTvGlassCqw(0.4, 1, 2),
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            <span
              style={{
                display: 'block',
                height: '100%',
                width: `${progressPercent}%`,
                background: LOUNGE_TV_BRAND_RED,
              }}
            />
          </span>
        ) : null}
      </span>
      <span
        style={{
          display: 'block',
          paddingTop: loungeTvGlassCqw(0.7, 1.6, 3.2),
          ...titleStyle,
        }}
      >
        {lesson.title}
      </span>
      <span style={statusStyle}>{statusLine(unlocked, lesson.comingSoon)}</span>
    </button>
  );
}
