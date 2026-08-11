import { getLiveProgramming } from './loungeTvStreamingMedia';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_TYPE } from './loungeTvTypography';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from './loungeTvFocusHandlers';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { LoungeTvSectionTitle } from './LoungeTvUiPrimitives';
import {
  LOUNGE_TV_RAIL_CARD_WIDTH,
  resolveRailLayoutMode,
} from './loungeTvAdaptiveRail';
import { loungeTvDisplayTitle } from './loungeTvDisplayText';

export function LoungeTvLiveProgramming() {
  const items = getLiveProgramming();
  const layoutMode = resolveRailLayoutMode(items.length);

  return (
    <section style={{ marginBottom: 0, textTransform: 'uppercase' }}>
      <LoungeTvSectionTitle title="UP NEXT" />
      <p
        style={{
          margin: `0 0 ${loungeTvGlassCqw(1.4, 3.5, 7)}`,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: LOUNGE_TV_TYPE.l3,
          lineHeight: 1.4,
          color: LOUNGE_TV_TEXT_GRAY,
        }}
      >
        NOTHING IS LIVE RIGHT NOW — HERE IS WHAT IS COMING TO FRONTAL SLAYER TV.
      </p>

      <div
        data-lounge-tv-rail-scroll
        style={{
          display: 'flex',
          flexDirection: layoutMode === 'feature' ? 'column' : 'row',
          alignItems: 'stretch',
          gap: loungeTvGlassCqw(1.4, 3.5, 7),
          overflowX: layoutMode === 'feature' ? 'visible' : 'auto',
          overflowY: 'visible',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: layoutMode === 'feature' ? undefined : 'x proximity',
          paddingBottom: loungeTvGlassCqw(0.8, 2, 4),
        }}
      >
        {items.map((item) => {
          const cardWidth =
            layoutMode === 'feature'
              ? '100%'
              : layoutMode === 'pair'
                ? loungeTvGlassCqw(46, 92, 140)
                : LOUNGE_TV_RAIL_CARD_WIDTH;

          return (
            <article
              key={item.id}
              data-lounge-tv-card-unit
              data-lounge-tv-focusable
              tabIndex={0}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
              style={{
                flex: layoutMode === 'feature' ? '1 1 100%' : `0 0 ${cardWidth}`,
                width: cardWidth,
                minWidth: 0,
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                display: 'flex',
                flexDirection: 'column',
                gap: loungeTvGlassCqw(0.8, 2, 4),
                outline: 'none',
                transition: 'box-shadow 0.25s ease',
              }}
            >
              <span
                style={{
                  position: 'relative',
                  display: 'block',
                  width: '100%',
                  aspectRatio: layoutMode === 'feature' ? '21 / 9' : '16 / 9',
                  overflow: 'hidden',
                  background: '#141414',
                  flexShrink: 0,
                }}
              >
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt=""
                    draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.85 }}
                  />
                ) : null}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: loungeTvGlassCqw(0.8, 2, 4),
                    left: loungeTvGlassCqw(0.8, 2, 4),
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: LOUNGE_TV_TYPE.l3,
                    letterSpacing: '0.08em',
                    color: LOUNGE_TV_BRAND_RED,
                    background: 'rgba(0,0,0,0.55)',
                    padding: `${loungeTvGlassCqw(0.4, 1, 2)} ${loungeTvGlassCqw(0.7, 1.6, 3.2)}`,
                  }}
                >
                  SCHEDULED
                </span>
              </span>

              <div style={{ flexShrink: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: layoutMode === 'feature' ? LOUNGE_TV_TYPE.l1 : LOUNGE_TV_TYPE.l2,
                    lineHeight: 1.2,
                    color: LOUNGE_TV_TEXT_WHITE,
                  }}
                >
                  {loungeTvDisplayTitle(item.title)}
                </h3>
                <p
                  style={{
                    margin: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0 0`,
                    fontFamily: LOUNGE_TV_FONT_BOOK,
                    fontSize: LOUNGE_TV_TYPE.l3,
                    color: LOUNGE_TV_TEXT_GRAY,
                  }}
                >
                  {item.category}
                </p>
                <p
                  style={{
                    margin: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0 0`,
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: LOUNGE_TV_TYPE.l3,
                    color: LOUNGE_TV_BRAND_RED,
                  }}
                >
                  {item.scheduledAt}
                  {item.duration ? ` · ${item.duration}` : ''}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
