import type { ReactNode } from 'react';
import type { ProductBreakdownEditorialContent } from '../../../../content/education/product-breakdown/types';
import type { ProductBreakdownPresentationEntry } from '../productBreakdownPresentation';
import type { LoungeContentUnlock } from '../../../../utils/slayTicketHistoryDisplay';
import type { PSATodayEpisode } from '../../psa-today/types';
import type { PsaAnswerPresentationEntry } from '../psaAnswersPresentation';
import type { SlayTip } from '../../../../content/education/types';
import type { LoungeContentPack } from '../../loungeTvContentPack';
import { LoungeTvBackButton } from '../../LoungeTvUiPrimitives';
import {
  ProductBreakdownCtaRow,
  ProductBreakdownMasthead,
  ProductBreakdownRelatedFooter,
  useProductBreakdownExternalRoutes,
} from '../ProductBreakdownEditorialArticle';
import { ProductBreakdownEngagementHost } from '../ProductBreakdownEngagementHost';
import { productBreakdownReadTimeLabel } from '../productBreakdownEditorialResolve';

export type ProductBreakdownShellProps = {
  entry: ProductBreakdownPresentationEntry;
  content: ProductBreakdownEditorialContent;
  pack: LoungeContentPack;
  onBack: () => void;
  composition: ReactNode;
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

/** Universal Product Breakdown shell — scroll, nav, CTAs, engagement. Does not dictate editorial section order. */
export function ProductBreakdownShell({
  entry,
  content,
  pack,
  onBack,
  composition,
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
}: ProductBreakdownShellProps) {
  const readTime = productBreakdownReadTimeLabel(entry, content);
  const requireSignIn = onEngagementRequireSignIn ?? (() => {});
  const { onBuildYours, onShopUnit } = useProductBreakdownExternalRoutes(content);

  return (
    <div className="lounge-tv-product-breakdown-viewer">
      <div className="lounge-tv-product-breakdown-viewer__scroll lounge-tv-product-breakdown-editorial lounge-tv-pbd-editorial">
        <LoungeTvBackButton onClick={onBack} />

        <ProductBreakdownMasthead
          entry={entry}
          content={content}
          unlocks={unlocks}
          isUnlocked={isUnlocked}
        />

        <div className="lounge-tv-pbd-editorial__composition">{composition}</div>

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
