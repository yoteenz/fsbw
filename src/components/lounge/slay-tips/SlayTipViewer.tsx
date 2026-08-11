import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import type { SlayTip } from '../../../content/education/types';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import { slayTipAccessGranted, slayTipUnlockContentId, slayTipUnlockCost } from './slayTipAccess';
import { slayTipPublicTitle } from './slayTipContent';
import { markSlayTipArticleCompleted } from './slayTipProgress';
import { trackSlayTipEvent } from './slayTipAnalytics';
import { SlayTipDetailSectionRule, SlayTipUnlock } from './SlayTipDetailSections';
import { unlockLoungeTvContent } from '../../../utils/api';
import type { PSATodayEpisode } from '../psa-today/types';
import { SlayTipEngagementHost } from './SlayTipEngagementHost';
import {
  SlayTipArticleRenderer,
  SlayTipHeroCollage,
  SlayTipMasthead,
  SlayTipRelatedFooter,
} from './SlayTipEditorialArticle';
import {
  resolveSlayTipHeroMedia,
  resolveSlayTipLockedHeroMedia,
  resolveSlayTipModules,
} from './slayTipEditorialResolve';

type SlayTipViewerProps = {
  tip: SlayTip;
  onBack: () => void;
  onViewRelatedPsa: (episode: PSATodayEpisode) => void;
  onViewRelatedSlayTip?: (tip: SlayTip) => void;
  onViewDeeperSeason?: (seasonId: string) => void;
  onViewDeeperMastery?: (masteryId: string) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  onTicketsRefresh?: () => void;
  onEngagementRequireSignIn?: () => void;
  isSignedInForEngagement?: boolean;
  engagementUserEmail?: string | null;
  engagementToast?: (message: string) => void;
};

export function SlayTipViewer({
  tip,
  onBack,
  onViewRelatedPsa,
  onViewRelatedSlayTip,
  onViewDeeperSeason,
  onViewDeeperMastery,
  unlocks,
  isUnlocked,
  onTicketsRefresh,
  onEngagementRequireSignIn,
  isSignedInForEngagement = false,
  engagementUserEmail = null,
  engagementToast,
}: SlayTipViewerProps) {
  const accessGranted = slayTipAccessGranted(tip, unlocks, isUnlocked);
  const ticketCost = slayTipUnlockCost(tip, unlocks);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [showUnlock, setShowUnlock] = useState(!accessGranted);
  const articleEndRef = useRef<HTMLDivElement>(null);
  const completionRecordedRef = useRef(false);

  const heroMedia = useMemo(() => resolveSlayTipHeroMedia(tip), [tip]);
  const lockedHero = useMemo(() => resolveSlayTipLockedHeroMedia(tip), [tip]);
  const modules = useMemo(() => resolveSlayTipModules(tip), [tip]);
  const locked = showUnlock && !accessGranted;
  const ticketLabel = ticketCost === 1 ? '1 SLAY TICKET' : `${ticketCost} SLAY TICKETS`;

  useEffect(() => {
    trackSlayTipEvent('slay_tip_opened', { tipId: tip.id, relatedPsaEpisodeId: tip.relatedPSAEpisodeId });
  }, [tip.id, tip.relatedPSAEpisodeId]);

  useEffect(() => {
    if (accessGranted) setShowUnlock(false);
  }, [accessGranted]);

  useEffect(() => {
    completionRecordedRef.current = false;
  }, [tip.id]);

  useEffect(() => {
    if (!accessGranted || locked) return;
    const node = articleEndRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.35);
        if (!visible || completionRecordedRef.current) return;
        completionRecordedRef.current = true;
        markSlayTipArticleCompleted(tip.id);
        trackSlayTipEvent('slay_tip_completed', { tipId: tip.id });
      },
      { threshold: [0.35, 0.6] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [accessGranted, locked, tip.id]);

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

  const requireSignIn = onEngagementRequireSignIn ?? (() => {});
  const openRelatedTip = onViewRelatedSlayTip ?? (() => {});

  return (
    <div className="lounge-tv-slay-tip-viewer lounge-tv-slay-tip-viewer--editorial">
      <div className="lounge-tv-slay-tip-viewer__scroll lounge-tv-slay-tip-editorial">
        <LoungeTvBackButton onClick={onBack} />

        <SlayTipMasthead tip={tip} accessGranted={accessGranted} showTeaser />

        {locked ? (
          <SlayTipHeroCollage images={lockedHero} locked />
        ) : (
          <SlayTipHeroCollage images={heroMedia} />
        )}

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
            <SlayTipArticleRenderer tip={tip} modules={modules} />
            <div ref={articleEndRef} className="lounge-tv-slay-tip-editorial__end-marker" aria-hidden />
            <SlayTipRelatedFooter
              tip={tip}
              onViewRelatedSlayTip={openRelatedTip}
              onViewRelatedPsa={onViewRelatedPsa}
              onViewDeeperSeason={onViewDeeperSeason}
              onViewDeeperMastery={onViewDeeperMastery}
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
      </div>
    </div>
  );
}
