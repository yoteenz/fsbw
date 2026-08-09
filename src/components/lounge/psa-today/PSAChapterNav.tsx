import type { PSAEpisodeChapter } from './types';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';

type PSAChapterNavProps = {
  chapters: PSAEpisodeChapter[];
  activeChapterId?: string;
  accessGranted: boolean;
  onSelect: (chapter: PSAEpisodeChapter) => void;
  /** Digestible part list heading — e.g. THIS CLASS */
  sectionTitle?: string;
  chapterProgressPercent?: number;
  currentChapterLabel?: string;
};

export function PSAChapterNav({
  chapters,
  activeChapterId,
  accessGranted,
  onSelect,
  sectionTitle = 'THIS CLASS',
  chapterProgressPercent,
  currentChapterLabel,
}: PSAChapterNavProps) {
  if (!chapters.length) return null;

  const sorted = [...chapters].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <section aria-label="Episode chapters">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: loungeTvGlassCqw(0.8, 2, 4),
          marginBottom: loungeTvGlassCqw(0.5, 1.2, 2.4),
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1, 2.2, 4.4),
            color: LOUNGE_TV_TEXT_WHITE,
            letterSpacing: '0.08em',
          }}
        >
          {sectionTitle}
        </p>
        {typeof chapterProgressPercent === 'number' ? (
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(0.9, 2, 4),
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.06em',
            }}
          >
            {chapterProgressPercent}% COMPLETE
          </p>
        ) : null}
      </div>
      {currentChapterLabel ? (
        <p
          style={{
            margin: `0 0 ${loungeTvGlassCqw(0.5, 1.2, 2.4)}`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(0.9, 2, 4),
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.05em',
          }}
        >
          CURRENT: {currentChapterLabel}
        </p>
      ) : null}
      <nav
        aria-label="Chapter map"
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: loungeTvGlassCqw(0.5, 1.2, 2.4),
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: loungeTvGlassCqw(0.4, 1, 2),
          textTransform: 'uppercase',
        }}
      >
        {sorted.map((ch) => {
          const locked = ch.gated && !accessGranted;
          const active = ch.id === activeChapterId;
          return (
            <button
              key={ch.id}
              type="button"
              data-lounge-tv-focusable
              disabled={locked}
              aria-current={active ? 'step' : undefined}
              aria-label={locked ? `${ch.label} locked` : ch.label}
              onClick={() => {
                if (!locked) onSelect(ch);
              }}
              style={{
                flex: '0 0 auto',
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
                letterSpacing: '0.05em',
                padding: `${loungeTvGlassCqw(0.45, 1, 2)} ${loungeTvGlassCqw(0.7, 1.6, 3.2)}`,
                background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                border: active ? `1px solid ${LOUNGE_TV_BRAND_RED}` : '1px solid rgba(255,255,255,0.18)',
                color: locked ? LOUNGE_TV_TEXT_GRAY : LOUNGE_TV_TEXT_WHITE,
                opacity: locked ? 0.45 : 1,
                cursor: locked ? 'not-allowed' : 'pointer',
              }}
            >
              {ch.label}
            </button>
          );
        })}
      </nav>
    </section>
  );
}
