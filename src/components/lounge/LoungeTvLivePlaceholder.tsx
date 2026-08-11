import type { LoungeTvSidebarItem } from './loungeTvContent';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_TYPE } from './loungeTvTypography';
import { LOUNGE_TV_FONT_MEDIUM } from './loungeTvTheme';
import { LoungeTvEmptyState } from './LoungeTvEmptyState';

const LIVE_EMPTY_COPY: Record<string, string> = {
  'upcoming-classes': 'NOTHING SCHEDULED YET. CHECK BACK FOR THE NEXT CLASS.',
  'psa-live-qa': 'NOTHING SCHEDULED YET. CHECK BACK FOR THE NEXT Q&A.',
  'product-premieres': 'NOTHING SCHEDULED YET. PREMIERES WILL APPEAR HERE.',
  'founder-sessions': 'NOTHING SCHEDULED YET. FOUNDER SESSIONS POST HERE.',
  'holiday-events': 'NOTHING SCHEDULED YET. SEASONAL EVENTS WILL APPEAR HERE.',
  'launch-events': 'NOTHING SCHEDULED YET. LAUNCH NIGHTS WILL APPEAR HERE.',
  'member-workshops': 'NOTHING SCHEDULED YET. WORKSHOPS WILL APPEAR HERE.',
  'live-shopping': 'NOTHING SCHEDULED YET. LIVE SHOPPING EVENTS POST HERE.',
  'early-access': 'NOTHING SCHEDULED YET. EARLY ACCESS EVENTS WILL APPEAR HERE.',
  'lounge-events': 'NOTHING SCHEDULED YET. LOUNGE EVENTS WILL APPEAR HERE.',
};

type LoungeTvLivePlaceholderProps = {
  section: LoungeTvSidebarItem;
};

export function LoungeTvLivePlaceholder({ section }: LoungeTvLivePlaceholderProps) {
  const copy = LIVE_EMPTY_COPY[section.id] ?? 'NOTHING SCHEDULED YET. CHECK BACK SOON.';

  return (
    <section
      data-lounge-tv-rail={`live-empty-${section.id}`}
      style={{
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
          fontSize: LOUNGE_TV_TYPE.l2,
          color: '#ffffff',
        }}
      >
        {section.label}
      </h2>
      <LoungeTvEmptyState message={copy} />
    </section>
  );
}
