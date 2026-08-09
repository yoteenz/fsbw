import type { SlayTip } from '../../../content/education/types';
import { SlayTipCard } from './SlayTipCard';
import { LoungeTvSectionTitle } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { slayTipProgressLabel } from './slayTipProgress';
import { slayTipAccessGranted } from './slayTipAccess';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';

type SlayTipRowProps = {
  title: string;
  tips: SlayTip[];
  onSelect: (tip: SlayTip) => void;
  emptyLabel?: string;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
};

export function SlayTipRow({
  title,
  tips,
  onSelect,
  emptyLabel,
  unlocks,
  isUnlocked,
}: SlayTipRowProps) {
  if (!tips.length && emptyLabel) {
    return (
      <section style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}>
        <LoungeTvSectionTitle title={title} />
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

  if (!tips.length) return null;

  return (
    <section style={{ marginBottom: loungeTvGlassCqw(2, 5, 10) }}>
      <LoungeTvSectionTitle title={title} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: loungeTvGlassCqw(1.2, 3, 6),
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x proximity',
        }}
      >
        {tips.map((tip) => (
          <SlayTipCard
            key={tip.id}
            tip={tip}
            onSelect={onSelect}
            progressLabel={slayTipProgressLabel(tip)}
            unlocked={slayTipAccessGranted(tip, unlocks, isUnlocked)}
          />
        ))}
      </div>
    </section>
  );
}
