import type { ShoppingResolution } from './psaTodayShopping';
import { ShoppingActions } from './PSAClassKit';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';

type PSAFullKitSelectorProps = {
  resolution: ShoppingResolution;
  onClose: () => void;
};

export function PSAFullKitSelector({ resolution, onClose }: PSAFullKitSelectorProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shop the full kit"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        padding: loungeTvGlassCqw(1.5, 4, 8),
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: loungeTvGlassCqw(1.5, 4, 8),
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.15)',
          textTransform: 'uppercase',
        }}
      >
        <h3
          style={{
            margin: `0 0 ${loungeTvGlassCqw(0.8, 2, 4)}`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
            color: LOUNGE_TV_TEXT_WHITE,
          }}
        >
          GET THE FULL KIT
        </h3>
        <p
          style={{
            margin: `0 0 ${loungeTvGlassCqw(1, 2.5, 5)}`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.35,
          }}
        >
          FRONTAL SLAYER — SHOP AVAILABLE FS PRODUCTS DIRECTLY.
          <br />
          AMAZON — SHOP THE FULL PSA TODAY LESSON LIST.
        </p>
        <ShoppingActions resolution={resolution} />
        <button
          type="button"
          data-lounge-tv-focusable
          onClick={onClose}
          style={{
            marginTop: loungeTvGlassCqw(1, 2.5, 5),
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
            background: 'none',
            border: 'none',
            color: LOUNGE_TV_TEXT_GRAY,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
