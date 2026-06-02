import type { LoungeTvVideoTile } from './loungeTvContent';
import { loungeTvTileShowsAsNew } from '../../utils/loungeTvViewedTiles';

const BODY_FONT = '"Futura PT Medium", Futura, sans-serif';
const BOOK_FONT = '"Futura PT Book", Futura, sans-serif';
const BRAND_RED = '#EB1C24';
const BODY_GRAY = '#808080';
const DIVIDER = '1px solid rgba(255,255,255,0.12)';

function blogBodyText(tile: LoungeTvVideoTile): string {
  return (tile.body ?? tile.description ?? '').trim();
}

function excerpt(text: string, maxLen = 72): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

type LoungeTvBlogPostListProps = {
  tiles: LoungeTvVideoTile[];
  onSelect: (tileId: string) => void;
};

/** Slay Tips index — vertical blog cards (not the Watch + Learn video grid). */
export function LoungeTvBlogPostList({ tiles, onSelect }: LoungeTvBlogPostListProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
      }}
    >
      {tiles.map((tile) => {
        const showNew = loungeTvTileShowsAsNew(tile);
        const body = blogBodyText(tile);
        return (
          <button
            key={tile.id}
            type="button"
            onClick={() => onSelect(tile.id)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '8px',
              width: '100%',
              margin: 0,
              padding: '8px',
              border: DIVIDER,
              background: 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              textAlign: 'left',
              boxSizing: 'border-box',
            }}
            aria-label={tile.title}
          >
            {tile.thumbSrc ? (
              <img
                src={tile.thumbSrc}
                alt=""
                draggable={false}
                style={{
                  width: '44px',
                  height: '44px',
                  objectFit: 'cover',
                  flexShrink: 0,
                  display: 'block',
                  filter: showNew ? 'blur(3px)' : 'none',
                }}
              />
            ) : (
              <span
                aria-hidden
                style={{
                  width: '44px',
                  height: '44px',
                  flexShrink: 0,
                  background: '#1a1a1a',
                  border: DIVIDER,
                }}
              />
            )}
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span
                style={{
                  fontFamily: BODY_FONT,
                  fontSize: '9px',
                  letterSpacing: '0.04em',
                  color: showNew ? BRAND_RED : '#ffffff',
                  textTransform: 'uppercase',
                  lineHeight: 1.25,
                }}
              >
                {showNew ? '*NEW* ' : ''}
                {tile.title}
              </span>
              {body ? (
                <span
                  style={{
                    fontFamily: BOOK_FONT,
                    fontSize: '7px',
                    lineHeight: 1.35,
                    color: BODY_GRAY,
                    textTransform: 'uppercase',
                  }}
                >
                  {excerpt(body)}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type LoungeTvBlogPostDetailProps = {
  tile: LoungeTvVideoTile;
  onBack: () => void;
};

/** Slay Tips article — header, body, attachments, comments (not Watch + Learn video chrome). */
export function LoungeTvBlogPostDetail({ tile, onBack }: LoungeTvBlogPostDetailProps) {
  const body = blogBodyText(tile);
  const paragraphs = body ? body.split(/\n+/).map((p) => p.trim()).filter(Boolean) : [];

  return (
    <article
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minHeight: 0,
        textTransform: 'uppercase',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          margin: 0,
          padding: 0,
          border: 'none',
          background: 'none',
          fontFamily: BODY_FONT,
          fontSize: '8px',
          letterSpacing: '0.06em',
          color: BRAND_RED,
          cursor: 'pointer',
          textTransform: 'uppercase',
        }}
      >
        ← BACK
      </button>

      <header style={{ borderBottom: DIVIDER, paddingBottom: '8px' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: BODY_FONT,
            fontSize: '11px',
            letterSpacing: '0.04em',
            color: '#ffffff',
            lineHeight: 1.25,
          }}
        >
          {tile.title}
        </h1>
      </header>

      <section aria-label="Post body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {paragraphs.length > 0 ? (
          paragraphs.map((para, idx) => (
            <p
              key={idx}
              style={{
                margin: 0,
                fontFamily: BOOK_FONT,
                fontSize: '8px',
                lineHeight: 1.45,
                color: '#d0d0d0',
                textTransform: 'uppercase',
              }}
            >
              {para}
            </p>
          ))
        ) : (
          <p
            style={{
              margin: 0,
              fontFamily: BOOK_FONT,
              fontSize: '8px',
              lineHeight: 1.45,
              color: BODY_GRAY,
            }}
          >
            NO BODY COPY YET.
          </p>
        )}
      </section>

      {tile.attachmentSrc ? (
        <section aria-label="Attachments" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h2
            style={{
              margin: 0,
              fontFamily: BODY_FONT,
              fontSize: '8px',
              letterSpacing: '0.06em',
              color: BODY_GRAY,
            }}
          >
            ATTACHMENTS
          </h2>
          {tile.attachmentType === 'video' ? (
            <video
              src={tile.attachmentSrc}
              controls
              playsInline
              preload="metadata"
              style={{
                width: '100%',
                maxHeight: '140px',
                display: 'block',
                background: '#0a0a0a',
              }}
            />
          ) : (
            <img
              src={tile.attachmentSrc}
              alt=""
              draggable={false}
              style={{
                width: '100%',
                maxHeight: '160px',
                objectFit: 'cover',
                display: 'block',
                border: DIVIDER,
              }}
            />
          )}
        </section>
      ) : null}

      <section
        aria-label="Comments"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          borderTop: DIVIDER,
          paddingTop: '8px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: BODY_FONT,
            fontSize: '8px',
            letterSpacing: '0.06em',
            color: BODY_GRAY,
          }}
        >
          COMMENTS
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: BOOK_FONT,
            fontSize: '7px',
            lineHeight: 1.35,
            color: BODY_GRAY,
          }}
        >
          NO COMMENTS YET. CHECK BACK SOON.
        </p>
      </section>
    </article>
  );
}
