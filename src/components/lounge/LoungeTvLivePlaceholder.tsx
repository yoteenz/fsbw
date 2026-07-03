import type { LoungeTvSidebarItem } from './loungeTvContent';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY } from './loungeTvTheme';
import { loungeTvGlassPanelStyle } from './LoungeTvUiPrimitives';

const LIVE_PLACEHOLDER_COPY: Record<string, string> = {
  'upcoming-classes': 'MEMBERS-ONLY CLASSES WILL APPEAR HERE. CHECK BACK FOR LIVE DATES AND TOPICS.',
  'lounge-events': 'EXCLUSIVE LOUNGE EVENTS — EARLY ACCESS DROPS, Q&A, AND MEMBER MIXERS.',
  'product-premieres': 'BE FIRST TO SEE NEW TEXTURES, COLORS, AND LIMITED UNITS.',
  'live-shopping': 'LIVE SHOPPING SESSIONS WITH FOUNDER PICKS AND MEMBER-ONLY DEALS.',
  'founder-sessions': 'FOUNDER SESSIONS — STRATEGY, TECHNIQUE, AND BRAND STORY.',
};

type LoungeTvLivePlaceholderProps = {
  section: LoungeTvSidebarItem;
};

export function LoungeTvLivePlaceholder({ section }: LoungeTvLivePlaceholderProps) {
  const copy = LIVE_PLACEHOLDER_COPY[section.id] ?? 'COMING SOON TO LOUNGE TV LIVE.';

  return (
    <div
      style={{
        ...loungeTvGlassPanelStyle,
        padding: loungeTvGlassCqw(2, 5, 10),
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1, 2.5, 5),
        textTransform: 'uppercase',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.7, 4, 8),
          color: '#ffffff',
        }}
      >
        {section.label}
      </h2>
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1.35, 3.2, 6.5),
          lineHeight: 1.4,
          color: LOUNGE_TV_TEXT_GRAY,
        }}
      >
        {copy}
      </p>
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.3, 3, 6),
          color: '#EB1C24',
        }}
      >
        COMING SOON
      </span>
    </div>
  );
}
