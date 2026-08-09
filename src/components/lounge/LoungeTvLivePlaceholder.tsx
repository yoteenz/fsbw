import type { LoungeTvSidebarItem } from './loungeTvContent';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY } from './loungeTvTheme';
import { loungeTvGlassPanelStyle } from './LoungeTvUiPrimitives';

const LIVE_PLACEHOLDER_COPY: Record<string, string> = {
  'upcoming-classes': 'MEMBERS-ONLY MASTERCLASSES WITH PSA AND GUEST EDUCATORS — DATES AND TOPICS POSTED HERE.',
  'psa-live-qa': 'LIVE Q&A WITH PSA — SUBMIT QUESTIONS ON LACE, INSTALL, AND MEMBER PERKS.',
  'product-premieres': 'BE FIRST TO SEE NEW TEXTURES, COLORS, AND LIMITED UNITS ON FRONTAL SLAYER TV.',
  'founder-sessions': 'FOUNDER SESSIONS — STRATEGY, TECHNIQUE, AND BRAND STORY STRAIGHT FROM THE SOURCE.',
  'holiday-events': 'SEASONAL COLLECTIONS AND HOLIDAY SLAY EVENTS — MEMBER EARLY ACCESS.',
  'launch-events': 'OFFICIAL LAUNCH NIGHTS FOR NEW ORIGINALS AND LIMITED DROPS.',
  'member-workshops': 'SMALL-GROUP WORKSHOPS FOR HANDS-ON TECHNIQUE WITH PSA.',
  'live-shopping': 'LIVE SHOPPING WITH FOUNDER PICKS AND MEMBER-ONLY OFFERS.',
  'early-access': 'EARLY ACCESS EVENTS — WATCH PREMIERES BEFORE THE PUBLIC RELEASE.',
  'lounge-events': 'EXCLUSIVE LOUNGE EVENTS — EARLY ACCESS DROPS, Q&A, AND MEMBER MIXERS.',
};

type LoungeTvLivePlaceholderProps = {
  section: LoungeTvSidebarItem;
  compact?: boolean;
};

export function LoungeTvLivePlaceholder({ section, compact = false }: LoungeTvLivePlaceholderProps) {
  const copy = LIVE_PLACEHOLDER_COPY[section.id] ?? 'PROGRAMMING COMING TO LOUNGE TV LIVE.';

  return (
    <div
      style={{
        ...loungeTvGlassPanelStyle,
        padding: compact ? loungeTvGlassCqw(1.2, 3, 6) : loungeTvGlassCqw(2, 5, 10),
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(0.8, 2, 4),
        textTransform: 'uppercase',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(compact ? 1.4 : 1.7, compact ? 3.2 : 4, compact ? 6.5 : 8),
          color: '#ffffff',
        }}
      >
        {section.label}
      </h2>
      {!compact ? (
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
      ) : null}
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
          color: '#EB1C24',
        }}
      >
        ON THE SCHEDULE
      </span>
    </div>
  );
}
