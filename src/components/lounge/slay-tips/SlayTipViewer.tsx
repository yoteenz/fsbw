import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import type { SlayTip } from '../../../content/education/types';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { slayTipAccessGranted, slayTipUnlockContentId, slayTipUnlockCost } from './slayTipAccess';
import { slayTipPreviewImageUrl } from './slayTipDetailMeta';
import { slayTipPublicTitle } from './slayTipContent';
import { getSlayTipProgress, markSlayTipCompleted, setSlayTipPageIndex } from './slayTipProgress';
import { trackSlayTipEvent } from './slayTipAnalytics';
import {
  SlayTipContentNav,
  SlayTipContentPage,
  SlayTipDetailHeader,
  SlayTipDetailSectionRule,
  SlayTipPreview,
  SlayTipRelatedContent,
  SlayTipReveal,
  SlayTipUnlock,
} from './SlayTipDetailSections';
import { getPsaTodayEpisodeById } from '../psa-today/psaTodayCatalog';
import { unlockLoungeTvContent } from '../../../utils/api';
import type { PSATodayEpisode } from '../psa-today/types';
import { SlayTipEngagementHost } from './SlayTipEngagementHost';

type SlayTipViewerProps = {
  tip: SlayTip;
  onBack: () => void;
  onViewRelatedPsa: (episode: PSATodayEpisode) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  onTicketsRefresh?: () => void;
  onEngagementRequireSignIn?: () => void;
  isSignedInForEngagement?: boolean;
  engagementUserEmail?: string | null;
  engagementToast?: (message: string) => void;
};

function sortedPages(tip: SlayTip) {
  return [...(tip.pages ?? [])].sort((a, b) => a.order - b.order);
}

export function SlayTipViewer({
  tip,
  onBack,
  onViewRelatedPsa,
  unlocks,
  isUnlocked,
  onTicketsRefresh,
  onEngagementRequireSignIn,
  isSignedInForEngagement = false,
  engagementUserEmail = null,
  engagementToast,
}: SlayTipViewerProps) {
  const pages = useMemo(() => sortedPages(tip), [tip]);
  const accessGranted = slayTipAccessGranted(tip, unlocks, isUnlocked);
  const ticketCost = slayTipUnlockCost(tip, unlocks);
  const saved = getSlayTipProgress(tip.id);
  const [pageIndex, setPageIndex] = useState(saved?.pageIndex ?? 0);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [showUnlock, setShowUnlock] = useState(!accessGranted);

  const relatedEpisode = tip.relatedPSAEpisodeId
    ? getPsaTodayEpisodeById(tip.relatedPSAEpisodeId)
    : undefined;
  const previewImage = slayTipPreviewImageUrl(tip);
  const locked = showUnlock && !accessGranted;
  const ticketLabel = ticketCost === 1 ? '1 SLAY TICKET' : `${ticketCost} SLAY TICKETS`;

  useEffect(() => {
    trackSlayTipEvent('slay_tip_opened', { tipId: tip.id, relatedPsaEpisodeId: tip.relatedPSAEpisodeId });
  }, [tip.id, tip.relatedPSAEpisodeId]);

  useEffect(() => {
    if (accessGranted) setShowUnlock(false);
  }, [accessGranted]);

  const currentPage = pages[pageIndex];

  useEffect(() => {
    if (!accessGranted || !currentPage) return;
    setSlayTipPageIndex(tip.id, pageIndex, pages.length);
    trackSlayTipEvent('slay_tip_page_viewed', {
      tipId: tip.id,
      pageId: currentPage.id,
      pageIndex,
    });
  }, [accessGranted, tip.id, pageIndex, currentPage, pages.length]);

  const handleRedeem = useCallback(async () => {
    if (redeemBusy) return;
    trackSlayTipEvent('slay_tip_unlock_prompt_viewed', { tipId: tip.id });
    setRedeemBusy(true);
    try {
      const result = await unlockLoungeTvContent({
        contentId: slayTipUnlockContentId(tip),
        ticketCost,
        accessType: 'rental',
        contentTitle: slayTipPublicTitle(tip),
      });
      if ('error' in result) return;
      trackSlayTipEvent('slay_tip_redeemed', { tipId: tip.id });
      onTicketsRefresh?.();
      window.dispatchEvent(new Event('slayTicketsUpdated'));
      setShowUnlock(false);
    } finally {
      setRedeemBusy(false);
    }
  }, [redeemBusy, tip, ticketCost, onTicketsRefresh]);

  const goPrev = useCallback(() => {
    setPageIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    if (pageIndex >= pages.length - 1) {
      markSlayTipCompleted(tip.id, pages.length);
      trackSlayTipEvent('slay_tip_completed', { tipId: tip.id });
      return;
    }
    setPageIndex((i) => Math.min(pages.length - 1, i + 1));
  }, [pageIndex, pages.length, tip.id]);

  const requireSignIn = onEngagementRequireSignIn ?? (() => {});

  return (
    <div className="lounge-tv-slay-tip-viewer">
      <div
        className="lounge-tv-slay-tip-viewer__scroll"
        style={{
          gap: loungeTvGlassCqw(1.6, 3.8, 7.5),
          textTransform: 'uppercase',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <LoungeTvBackButton onClick={onBack} />

        <SlayTipDetailHeader tip={tip} showTeaser={locked} />

        {locked ? <SlayTipPreview src={previewImage} alt={tip.publicTitle ?? tip.title} /> : null}

        {locked ? (
          <SlayTipDetailSectionRule>
            <SlayTipUnlock
              ticketLabel={ticketLabel}
              busy={redeemBusy}
              onRedeem={() => void handleRedeem()}
            />
          </SlayTipDetailSectionRule>
        ) : (
          <>
            <SlayTipReveal tip={tip} />
            {currentPage ? (
              <SlayTipContentPage page={currentPage} coverFallback={tip.coverImageUrl} />
            ) : null}
            <SlayTipContentNav
              pageIndex={pageIndex}
              pageCount={pages.length}
              onPrev={goPrev}
              onNext={goNext}
            />
          </>
        )}

        <SlayTipEngagementHost
          tip={tip}
          trackViews
          onRequireSignIn={requireSignIn}
          isSignedIn={isSignedInForEngagement}
          userEmail={engagementUserEmail}
          engagementToast={engagementToast}
        />

        {relatedEpisode ? (
          <SlayTipDetailSectionRule>
            <SlayTipRelatedContent
              episode={relatedEpisode}
              onViewClass={(ep) => {
                trackSlayTipEvent('slay_tip_related_psa_clicked', {
                  tipId: tip.id,
                  relatedPsaEpisodeId: ep.id,
                });
                onViewRelatedPsa(ep);
              }}
            />
          </SlayTipDetailSectionRule>
        ) : null}
      </div>
    </div>
  );
}
