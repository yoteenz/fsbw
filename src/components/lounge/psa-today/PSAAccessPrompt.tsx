import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';

type PSAAccessPromptProps = {
  ticketCost: number;
  onRedeem: () => void;
  onViewClassKit?: () => void;
  busy?: boolean;
};

export function PSAAccessPrompt({
  ticketCost,
  onRedeem,
  onViewClassKit,
  busy = false,
}: PSAAccessPromptProps) {
  const ticketLabel = ticketCost === 1 ? '1 SLAY TICKET' : `${ticketCost} SLAY TICKETS`;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: loungeTvGlassCqw(0.8, 2, 4),
        padding: loungeTvGlassCqw(2, 5, 10),
        background: 'rgba(0,0,0,0.78)',
        textTransform: 'uppercase',
        zIndex: 20,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
          letterSpacing: '0.08em',
          color: LOUNGE_TV_TEXT_WHITE,
          textAlign: 'center',
        }}
      >
        CONTINUE TO THE FULL LESSON
      </p>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
          color: LOUNGE_TV_BRAND_RED,
        }}
      >
        {ticketLabel}
      </span>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: loungeTvGlassCqw(0.35, 0.8, 1.6),
          maxWidth: '28em',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
            color: LOUNGE_TV_TEXT_GRAY,
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          INCLUDES: 3 WATCHES · 1 YEAR OF ACCESS
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
            color: LOUNGE_TV_TEXT_GRAY,
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          A WATCH IS USED AFTER YOU VIEW AT LEAST ONE-THIRD OF THE LESSON.
        </p>
      </div>
      <button
        type="button"
        data-lounge-tv-focusable
        disabled={busy}
        onClick={onRedeem}
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
          letterSpacing: '0.07em',
          padding: `${loungeTvGlassCqw(0.8, 2, 4)} ${loungeTvGlassCqw(1.4, 3.5, 7)}`,
          background: 'rgba(235, 28, 36, 0.2)',
          border: `1px solid ${LOUNGE_TV_BRAND_RED}`,
          color: LOUNGE_TV_TEXT_WHITE,
          cursor: busy ? 'wait' : 'pointer',
          marginTop: loungeTvGlassCqw(0.4, 1, 2),
        }}
      >
        USE {ticketLabel}
      </button>
      {onViewClassKit ? (
        <button
          type="button"
          data-lounge-tv-focusable
          onClick={onViewClassKit}
          style={{
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
            letterSpacing: '0.06em',
            padding: `${loungeTvGlassCqw(0.6, 1.5, 3)} ${loungeTvGlassCqw(1, 2.5, 5)}`,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.35)',
            color: LOUNGE_TV_TEXT_WHITE,
            cursor: 'pointer',
          }}
        >
          VIEW CLASS KIT
        </button>
      ) : null}
    </div>
  );
}
