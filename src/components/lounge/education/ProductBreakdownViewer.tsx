import { useMemo } from 'react';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import { getContentPackById } from '../loungeTvContentPack';
import { resolveProductBreakdownEditorial } from '../../../content/education/product-breakdown';
import type { ProductBreakdownPresentationEntry } from './productBreakdownPresentation';
import {
  ProductBreakdownArticleRenderer,
  ProductBreakdownCtaRow,
  ProductBreakdownMasthead,
  ProductBreakdownRelatedFooter,
  useProductBreakdownExternalRoutes,
} from './ProductBreakdownEditorialArticle';
import { ProductBreakdownEngagementHost } from './ProductBreakdownEngagementHost';
import { productBreakdownReadTimeLabel } from './productBreakdownEditorialResolve';
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
  const readTime = productBreakdownReadTimeLabel(entry, content);
  const requireSignIn = onEngagementRequireSignIn ?? (() => {});
  const { onBuildYours, onShopUnit } = useProductBreakdownExternalRoutes(content);

  if (!pack) return null;

  return (
    <div className="lounge-tv-product-breakdown-viewer">
      <div className="lounge-tv-product-breakdown-viewer__scroll lounge-tv-product-breakdown-editorial">
        <LoungeTvBackButton onClick={onBack} />

        <ProductBreakdownMasthead
          entry={entry}
          content={content}
          unlocks={unlocks}
          isUnlocked={isUnlocked}
        />

        <ProductBreakdownArticleRenderer content={content} />

        <div className="lounge-tv-product-breakdown-editorial__end-marker" aria-hidden />

        <ProductBreakdownRelatedFooter
          content={content}
          onViewRelatedPsa={onViewRelatedPsa}
          onViewRelatedAnswer={onViewRelatedAnswer}
          onViewRelatedSlayTip={onViewRelatedSlayTip}
          onViewDeeperSeason={onViewDeeperSeason}
          onViewDeeperMastery={onViewDeeperMastery}
        />

        <ProductBreakdownCtaRow content={content} onBuildYours={onBuildYours} onShopUnit={onShopUnit} />

        <ProductBreakdownEngagementHost
          pack={pack}
          contentTitle={`${entry.displayName} PRODUCT BREAKDOWN`}
          readTimeLabel={readTime}
          onRequireSignIn={requireSignIn}
          isSignedIn={isSignedInForEngagement}
          userEmail={engagementUserEmail}
          engagementToast={engagementToast}
        />
      </div>
    </div>
  );
}
