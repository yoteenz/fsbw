import type { LoungeContentPack } from './loungeTvContentPack';
import { getWatchProgressForPack, isPackCompleted } from '../../utils/loungeTvLibrary';
import { resolveContentStatusFlags, statusFlagsToBadgeLabels } from './loungeTvContentStatus';
import type { LoungeTvVideoTile } from './loungeTvContent';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import { featuredPremiereLabel } from './loungeTvStreamingCatalog';

export type LoungeTvCardEnhancements = {
  premiereRibbon?: string;
  progressPercent?: number;
  showCompletionCheck?: boolean;
  chipLabels: string[];
};

export function resolvePackCardEnhancements(
  pack: LoungeContentPack,
  tile: LoungeTvVideoTile,
  unlocks: LoungeContentUnlock[] | undefined,
  isUnlocked: (contentId: string) => boolean
): LoungeTvCardEnhancements {
  const flags = resolveContentStatusFlags(pack, tile, unlocks, isUnlocked);
  const chipLabels = statusFlagsToBadgeLabels(
    flags.filter(
      (f) =>
        f !== 'continue-watching' &&
        f !== 'watched' &&
        f !== 'completed' &&
        f !== 'premiere'
    )
  );

  const progress = getWatchProgressForPack(pack.id);
  const completed = isPackCompleted(pack.id);
  const progressPercent =
    completed ? 100 : progress?.percent != null && progress.percent > 0 ? progress.percent : undefined;

  return {
    premiereRibbon: pack.featuredPremiere
      ? featuredPremiereLabel(pack.featuredPremiere)
      : flags.includes('premiere')
        ? 'PREMIERE'
        : undefined,
    progressPercent,
    showCompletionCheck: completed,
    chipLabels: chipLabels.slice(0, 4),
  };
}
