import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';

type PSAReadyToStartProps = {
  requiredCount: number;
  onReviewKit: () => void;
  onStartLesson: () => void;
  rewatchReminder?: {
    watchesUsed: number;
    watchesRemaining: number;
    totalWatches: number;
  };
};

export function PSAReadyToStart({
  requiredCount,
  onReviewKit,
  onStartLesson,
  rewatchReminder,
}: PSAReadyToStartProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: loungeTvGlassCqw(1, 2.5, 5),
        padding: loungeTvGlassCqw(1.5, 4, 8),
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.12)',
        textTransform: 'uppercase',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
          color: LOUNGE_TV_TEXT_WHITE,
        }}
      >
        READY TO START?
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
          color: LOUNGE_TV_TEXT_GRAY,
        }}
      >
        YOU&apos;LL NEED {requiredCount} REQUIRED ITEM{requiredCount === 1 ? '' : 'S'}.
      </p>
      {rewatchReminder ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: loungeTvGlassCqw(0.35, 0.8, 1.6),
            padding: loungeTvGlassCqw(0.8, 2, 4),
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
              color: LOUNGE_TV_TEXT_WHITE,
            }}
          >
            {rewatchReminder.watchesUsed} OF {rewatchReminder.totalWatches} WATCHES USED ·{' '}
            {rewatchReminder.watchesRemaining} WATCHES REMAINING
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
              color: LOUNGE_TV_TEXT_GRAY,
              lineHeight: 1.4,
            }}
          >
            THIS VIEW WILL COUNT ONCE YOU WATCH ONE-THIRD OF THE LESSON.
          </p>
        </div>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: loungeTvGlassCqw(0.6, 1.5, 3) }}>
        <button type="button" data-lounge-tv-focusable onClick={onReviewKit} style={ctaStyle(false)}>
          REVIEW CLASS KIT
        </button>
        <button type="button" data-lounge-tv-focusable onClick={onStartLesson} style={ctaStyle(true)}>
          START LESSON
        </button>
      </div>
    </div>
  );
}

function ctaStyle(accent: boolean): React.CSSProperties {
  return {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
    letterSpacing: '0.06em',
    padding: `${loungeTvGlassCqw(0.7, 1.8, 3.6)} ${loungeTvGlassCqw(1.2, 3, 6)}`,
    background: accent ? 'rgba(235, 28, 36, 0.18)' : 'rgba(255,255,255,0.1)',
    border: accent ? `1px solid ${LOUNGE_TV_BRAND_RED}` : '1px solid rgba(255,255,255,0.28)',
    color: LOUNGE_TV_TEXT_WHITE,
    cursor: 'pointer',
  };
}
