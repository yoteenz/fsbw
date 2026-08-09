import type { ReactNode } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { LoungeTvContentPackCard } from './LoungeTvContentPackCard';
import { LoungeTvSectionTitle } from './LoungeTvUiPrimitives';
import { LoungeTvEmptyState } from './LoungeTvEmptyState';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { loungeTvGlassCqw } from './loungeTvResponsive';

type LoungeTvContentRowProps = {
  title: string;
  packs: LoungeContentPack[];
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
  emptyLabel?: string;
  action?: ReactNode;
  /** @deprecated compact headings removed for 10-foot TV */
  compactHeading?: boolean;
  railId?: string;
};

export function LoungeTvContentRow({
  title,
  packs,
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
  emptyLabel,
  action,
  railId = 'content-row',
}: LoungeTvContentRowProps) {
  if (!packs.length && emptyLabel) {
    return (
      <section
        data-lounge-tv-rail={railId}
        style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}
      >
        {title ? <LoungeTvSectionTitle title={title} action={action} /> : null}
        <LoungeTvEmptyState message={emptyLabel} />
      </section>
    );
  }

  if (!packs.length) return null;

  return (
    <section data-lounge-tv-rail={railId} style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}>
      {title ? <LoungeTvSectionTitle title={title} action={action} /> : null}
      <div
        data-lounge-tv-rail-scroll
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: loungeTvGlassCqw(1.5, 3.5, 7),
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity',
          paddingBottom: loungeTvGlassCqw(0.6, 1.5, 3),
        }}
      >
        {packs.map((pack) => (
          <LoungeTvContentPackCard
            key={pack.id}
            pack={pack}
            onSelect={onSelect}
            onToggleSave={onToggleSave}
            isUnlocked={isUnlocked}
            unlocks={unlocks}
          />
        ))}
      </div>
    </section>
  );
}
