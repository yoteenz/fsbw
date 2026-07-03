import { useMemo } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { getContentPackById, LOUNGE_TV_CONTENT_PACKS } from './loungeTvContentPack';
import { contentPackToTile } from './loungeTvContent';
import { LoungeTvContentRow } from './LoungeTvContentRow';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import {
  getCompletedPackIds,
  getSavedPackIds,
  getWatchProgressMap,
} from '../../utils/loungeTvLibrary';
import {
  findLoungeContentUnlock,
  loungeTvContentIsAccessible,
  resolveLoungeTvTicketCost,
} from './loungeTvTicketAccess';

type LoungeTvLibrarySectionsProps = {
  sectionId: string;
  onSelect: (pack: LoungeContentPack) => void;
  onToggleSave?: (pack: LoungeContentPack) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
};

function packsFromIds(ids: string[]): LoungeContentPack[] {
  return ids.map((id) => getContentPackById(id)).filter((p): p is LoungeContentPack => Boolean(p));
}

export function LoungeTvLibrarySections({
  sectionId,
  onSelect,
  onToggleSave,
  isUnlocked,
  unlocks,
}: LoungeTvLibrarySectionsProps) {
  const packs = useMemo(() => {
    switch (sectionId) {
      case 'continue': {
        const progress = getWatchProgressMap();
        return Object.values(progress)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((row) => getContentPackById(row.packId))
          .filter((p): p is LoungeContentPack => Boolean(p));
      }
      case 'saved':
        return packsFromIds(getSavedPackIds());
      case 'unlocked':
        return LOUNGE_TV_CONTENT_PACKS.filter((pack) => {
          const tile = contentPackToTile(pack);
          return loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
        });
      case 'purchased':
        return LOUNGE_TV_CONTENT_PACKS.filter((pack) => {
          const tile = contentPackToTile(pack);
          const cost = resolveLoungeTvTicketCost(tile);
          if (cost === 0) return false;
          return Boolean(findLoungeContentUnlock(pack.id, unlocks));
        });
      case 'completed':
        return packsFromIds(getCompletedPackIds());
      case 'history': {
        const progress = getWatchProgressMap();
        return Object.values(progress)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((row) => getContentPackById(row.packId))
          .filter((p): p is LoungeContentPack => Boolean(p));
      }
      default:
        return [];
    }
  }, [sectionId, isUnlocked, unlocks]);

  const titles: Record<string, string> = {
    continue: 'CONTINUE WATCHING',
    saved: 'SAVED',
    unlocked: 'UNLOCKED',
    purchased: 'PURCHASED',
    completed: 'COMPLETED',
    history: 'HISTORY',
  };

  return (
    <LoungeTvContentRow
      title={titles[sectionId] ?? sectionId.toUpperCase()}
      packs={packs}
      onSelect={onSelect}
      onToggleSave={onToggleSave}
      isUnlocked={isUnlocked}
      unlocks={unlocks}
      emptyLabel="NOTHING HERE YET."
    />
  );
}
