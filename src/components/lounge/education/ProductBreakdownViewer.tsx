import { useMemo } from 'react';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import { getContentPackById } from '../loungeTvContentPack';
import { resolveProductBreakdownEditorial } from '../../../content/education/product-breakdown';
import type { ProductBreakdownPresentationEntry } from './productBreakdownPresentation';
import { ProductBreakdownShell } from './product-breakdown/ProductBreakdownShell';
import { ProductBreakdownLayoutRenderer } from './product-breakdown/layoutRegistry';
import type { PSATodayEpisode } from '../psa-today/types';
import type { PsaAnswerPresentationEntry } from './psaAnswersPresentation';
import type { SlayTip } from '../../../content/education/types';

type ProductBreakdownViewerProps = {
  entry: ProductBreakdownPresentationEntry;
  onBack: () => void;
  onViewRelatedPsa?: (episode: PSATodayEpisode) => void;
  onViewRelatedAnswer?: (entry: PsaAnswerPresentationEntry) => void;
  onViewRelatedSlayTip?: (tip: SlayTip) => void;
  onViewDeeperSeason?: (seasonId: string) => void;
  onViewDeeperMastery?: (masteryId: string) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  onEngagementRequireSignIn?: () => void;
  isSignedInForEngagement?: boolean;
  engagementUserEmail?: string | null;
  engagementToast?: (message: string) => void;
};

export function ProductBreakdownViewer({
  entry,
  onBack,
  onViewRelatedPsa,
  onViewRelatedAnswer,
  onViewRelatedSlayTip,
  onViewDeeperSeason,
  onViewDeeperMastery,
  unlocks,
  isUnlocked,
  onEngagementRequireSignIn,
  isSignedInForEngagement = false,
  engagementUserEmail = null,
  engagementToast,
}: ProductBreakdownViewerProps) {
  const pack = getContentPackById(entry.packId);
  const content = useMemo(() => resolveProductBreakdownEditorial(entry), [entry]);

  if (!pack) return null;

  return (
    <ProductBreakdownShell
      entry={entry}
      content={content}
      pack={pack}
      onBack={onBack}
      composition={<ProductBreakdownLayoutRenderer content={content} />}
      onViewRelatedPsa={onViewRelatedPsa}
      onViewRelatedAnswer={onViewRelatedAnswer}
      onViewRelatedSlayTip={onViewRelatedSlayTip}
      onViewDeeperSeason={onViewDeeperSeason}
      onViewDeeperMastery={onViewDeeperMastery}
      unlocks={unlocks}
      isUnlocked={isUnlocked}
      onEngagementRequireSignIn={onEngagementRequireSignIn}
      isSignedInForEngagement={isSignedInForEngagement}
      engagementUserEmail={engagementUserEmail}
      engagementToast={engagementToast}
    />
  );
}
