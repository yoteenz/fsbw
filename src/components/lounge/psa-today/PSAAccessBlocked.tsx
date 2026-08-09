import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';

type PSAAccessBlockedProps = {
  variant: 'watches-exhausted' | 'expired';
  ticketCost: number;
  onRedeem: () => void;
  onViewClassKit?: () => void;
  onWatchPreview?: () => void;
  busy?: boolean;
};

export function PSAAccessBlocked({
  variant,
  ticketCost,
  onRedeem,
  onViewClassKit,
  onWatchPreview,
  busy = false,
}: PSAAccessBlockedProps) {
  const ticketLabel = ticketCost === 1 ? '1 SLAY TICKET' : `${ticketCost} SLAY TICKETS`;

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
          fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
          color: LOUNGE_TV_TEXT_WHITE,
        }}
      >
        {variant === 'expired' ? 'ACCESS EXPIRED' : "YOU'VE USED YOUR 3 INCLUDED WATCHES"}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
          color: LOUNGE_TV_TEXT_GRAY,
          lineHeight: 1.4,
          maxWidth: '42em',
        }}
      >
        {variant === 'expired'
          ? 'YOUR PREVIOUS ACCESS PERIOD HAS ENDED. REDEEM THE LESSON AGAIN FOR 3 WATCHES AND 1 YEAR OF ACCESS.'
          : 'REDEEM THIS LESSON AGAIN TO CONTINUE LEARNING.'}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: loungeTvGlassCqw(0.6, 1.5, 3) }}>
        <button
          type="button"
          data-lounge-tv-focusable
          disabled={busy}
          onClick={onRedeem}
          style={ctaStyle(true, busy)}
        >
          USE {ticketLabel}
        </button>
        {onWatchPreview ? (
          <button type="button" data-lounge-tv-focusable onClick={onWatchPreview} style={ctaStyle(false)}>
            WATCH FREE PREVIEW
          </button>
        ) : null}
        {onViewClassKit ? (
          <button type="button" data-lounge-tv-focusable onClick={onViewClassKit} style={ctaStyle(false)}>
            VIEW CLASS KIT
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ctaStyle(accent: boolean, busy = false): React.CSSProperties {
  return {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
    letterSpacing: '0.06em',
    padding: `${loungeTvGlassCqw(0.7, 1.8, 3.6)} ${loungeTvGlassCqw(1.2, 3, 6)}`,
    background: accent ? 'rgba(235, 28, 36, 0.18)' : 'rgba(255,255,255,0.1)',
    border: accent ? `1px solid ${LOUNGE_TV_BRAND_RED}` : '1px solid rgba(255,255,255,0.28)',
    color: LOUNGE_TV_TEXT_WHITE,
    cursor: busy ? 'wait' : 'pointer',
    opacity: busy ? 0.7 : 1,
  };
}
