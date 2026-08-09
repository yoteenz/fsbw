import { getLiveProgramming } from './loungeTvStreamingMedia';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { LoungeTvSectionTitle } from './LoungeTvUiPrimitives';

export function LoungeTvLiveProgramming() {
  const items = getLiveProgramming();

  return (
    <section style={{ marginBottom: loungeTvGlassCqw(2, 5, 10), textTransform: 'uppercase' }}>
      <LoungeTvSectionTitle title="UP NEXT" />
      <p
        style={{
          margin: `0 0 ${loungeTvGlassCqw(1.2, 3, 6)}`,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1.25, 2.8, 5.5),
          lineHeight: 1.4,
          color: LOUNGE_TV_TEXT_GRAY,
        }}
      >
        NOTHING IS LIVE RIGHT NOW — HERE IS WHAT IS COMING TO FRONTAL SLAYER TV.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: loungeTvGlassCqw(1.2, 3, 6),
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity',
          paddingBottom: loungeTvGlassCqw(0.5, 1, 2),
        }}
      >
        {items.map((item) => (
          <article
            key={item.id}
            data-lounge-tv-focusable
            tabIndex={0}
            style={{
              flex: `0 0 ${loungeTvGlassCqw(32, 72, 115)}`,
              scrollSnapAlign: 'start',
              display: 'flex',
              flexDirection: 'column',
              gap: loungeTvGlassCqw(0.6, 1.5, 3),
              outline: 'none',
            }}
          >
            <span
              style={{
                position: 'relative',
                display: 'block',
                width: '100%',
                aspectRatio: '16 / 9',
                overflow: 'hidden',
                background: '#141414',
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
                  top: loungeTvGlassCqw(0.6, 1.4, 2.8),
                  left: loungeTvGlassCqw(0.6, 1.4, 2.8),
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
                  letterSpacing: '0.08em',
                  color: LOUNGE_TV_BRAND_RED,
                  background: 'rgba(0,0,0,0.55)',
                  padding: `${loungeTvGlassCqw(0.3, 0.7, 1.4)} ${loungeTvGlassCqw(0.5, 1.2, 2.4)}`,
                }}
              >
                SCHEDULED
              </span>
            </span>

            <div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: loungeTvGlassCqw(1.25, 2.8, 5.5),
                  lineHeight: 1.25,
                  color: LOUNGE_TV_TEXT_WHITE,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  margin: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} 0 0`,
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
                  color: LOUNGE_TV_TEXT_GRAY,
                }}
              >
                {item.category}
              </p>
              <p
                style={{
                  margin: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} 0 0`,
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
                  color: LOUNGE_TV_BRAND_RED,
                }}
              >
                {item.scheduledAt}
                {item.duration ? ` · ${item.duration}` : ''}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
