import type { ReactNode } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { LoungeTvContentPackCard } from './LoungeTvContentPackCard';
import { LoungeTvSectionTitle } from './LoungeTvUiPrimitives';
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
}: LoungeTvContentRowProps) {
  if (!packs.length && emptyLabel) {
    return (
      <section style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}>
        <LoungeTvSectionTitle title={title} action={action} />
        <p
          style={{
            margin: 0,
            fontFamily: '"Futura PT Book", Futura, sans-serif',
            fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
            color: '#808080',
            textTransform: 'uppercase',
          }}
        >
          {emptyLabel}
        </p>
      </section>
    );
  }

  if (!packs.length) return null;

  return (
    <section style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}>
      <LoungeTvSectionTitle title={title} action={action} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: loungeTvGlassCqw(1.2, 3, 6),
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity',
          paddingBottom: loungeTvGlassCqw(0.5, 1, 2),
          marginRight: `-${loungeTvGlassCqw(0.5, 1, 2)}`,
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
