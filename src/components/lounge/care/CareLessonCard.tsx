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

type CareLessonCardProps = {
  lesson: CareLesson;
  onSelect: (lesson: CareLesson) => void;
  unlocked: boolean;
  progressPercent?: number;
};

export function CareLessonCard({ lesson, onSelect, unlocked, progressPercent }: CareLessonCardProps) {
  const poster = lesson.thumbnailUrl ?? lesson.posterUrl;

  return (
    <button
      type="button"
      data-lounge-tv-focusable
      onClick={() => onSelect(lesson)}
      aria-label={lesson.title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: `0 0 ${loungeTvGlassCqw(24, 56, 92)}`,
        width: loungeTvGlassCqw(24, 56, 92),
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        scrollSnapAlign: 'start',
        textTransform: 'uppercase',
        opacity: unlocked ? 1 : 0.88,
      }}
    >
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          aspectRatio: '16 / 9',
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
        <span
          style={{
            position: 'absolute',
            top: loungeTvGlassCqw(0.45, 1, 2),
            left: loungeTvGlassCqw(0.45, 1, 2),
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
            letterSpacing: '0.07em',
            color: LOUNGE_TV_TEXT_WHITE,
            background: 'rgba(0,0,0,0.72)',
            padding: `${loungeTvGlassCqw(0.2, 0.5, 1)} ${loungeTvGlassCqw(0.35, 0.85, 1.7)}`,
          }}
        >
          CARE GUIDE
        </span>
        {lesson.comingSoon ? (
          <span
            style={{
              position: 'absolute',
              bottom: loungeTvGlassCqw(0.45, 1, 2),
              right: loungeTvGlassCqw(0.45, 1, 2),
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(0.8, 1.8, 3.6),
              color: LOUNGE_TV_TEXT_GRAY,
              background: 'rgba(0,0,0,0.72)',
              padding: `${loungeTvGlassCqw(0.15, 0.4, 0.8)} ${loungeTvGlassCqw(0.3, 0.7, 1.4)}`,
            }}
          >
            COMING SOON
          </span>
        ) : null}
        {!unlocked ? (
          <span
            style={{
              position: 'absolute',
              bottom: loungeTvGlassCqw(0.45, 1, 2),
              left: loungeTvGlassCqw(0.45, 1, 2),
              right: loungeTvGlassCqw(0.45, 1, 2),
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(0.72, 1.6, 3.2),
              color: LOUNGE_TV_TEXT_GRAY,
              background: 'rgba(0,0,0,0.78)',
              padding: `${loungeTvGlassCqw(0.2, 0.5, 1)} ${loungeTvGlassCqw(0.3, 0.7, 1.4)}`,
              lineHeight: 1.3,
            }}
          >
            {CARE_GUIDE_LOCKED_LABEL}
          </span>
        ) : null}
        {progressPercent != null && progressPercent > 0 && progressPercent < 100 ? (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: loungeTvGlassCqw(0.35, 0.9, 1.8),
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
          paddingTop: loungeTvGlassCqw(0.5, 1.2, 2.4),
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
          lineHeight: 1.25,
          color: LOUNGE_TV_TEXT_WHITE,
        }}
      >
        {lesson.title}
      </span>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
          color: LOUNGE_TV_TEXT_GRAY,
          marginTop: loungeTvGlassCqw(0.25, 0.6, 1.2),
        }}
      >
        {String(lesson.category).toUpperCase()} · {CARE_GUIDE_INCLUDED_BADGE}
      </span>
    </button>
  );
}
