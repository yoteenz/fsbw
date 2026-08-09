import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import type { SlayTip, SlayTipPage } from '../../../content/education/types';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { slayTipAccessGranted, slayTipUnlockContentId, slayTipUnlockCost } from './slayTipAccess';
import { getSlayTipProgress, markSlayTipCompleted, setSlayTipPageIndex } from './slayTipProgress';
import { trackSlayTipEvent } from './slayTipAnalytics';
import { SlayTipRelatedPsa } from './SlayTipRelatedPsa';
import { unlockLoungeTvContent } from '../../../utils/api';
import type { PSATodayEpisode } from '../psa-today/types';

type SlayTipViewerProps = {
  tip: SlayTip;
  onBack: () => void;
  onViewRelatedPsa: (episode: PSATodayEpisode) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  onTicketsRefresh?: () => void;
};

function sortedPages(tip: SlayTip): SlayTipPage[] {
  return [...(tip.pages ?? [])].sort((a, b) => a.order - b.order);
}

export function SlayTipViewer({
  tip,
  onBack,
  onViewRelatedPsa,
  unlocks,
  isUnlocked,
  onTicketsRefresh,
}: SlayTipViewerProps) {
  const pages = useMemo(() => sortedPages(tip), [tip]);
  const accessGranted = slayTipAccessGranted(tip, unlocks, isUnlocked);
  const ticketCost = slayTipUnlockCost(tip, unlocks);
  const saved = getSlayTipProgress(tip.id);
  const [pageIndex, setPageIndex] = useState(saved?.pageIndex ?? 0);
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [showUnlock, setShowUnlock] = useState(!accessGranted);

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
        contentTitle: tip.title,
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

  const ticketLabel = ticketCost === 1 ? '1 SLAY TICKET' : `${ticketCost} SLAY TICKETS`;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.2, 3, 6),
        textTransform: 'uppercase',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <LoungeTvBackButton onClick={onBack} />

      <header>
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
            color: LOUNGE_TV_BRAND_RED,
            letterSpacing: '0.08em',
          }}
        >
          {tip.subtitle ?? 'SLAY TIP'}
        </p>
        <h1
          style={{
            margin: `${loungeTvGlassCqw(0.4, 1, 2)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.15,
          }}
        >
          {tip.title}
        </h1>
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.35,
          }}
        >
          {tip.shortDescription}
        </p>
      </header>

      {showUnlock && !accessGranted ? (
        <UnlockPanel ticketLabel={ticketLabel} busy={redeemBusy} onRedeem={() => void handleRedeem()} />
      ) : (
        <>
          {currentPage ? (
            <ScrapbookPage page={currentPage} coverFallback={tip.coverImageUrl} />
          ) : (
            <EmptyScrapbookPlaceholder cover={tip.coverImageUrl} />
          )}

          {pages.length > 0 ? (
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: loungeTvGlassCqw(0.8, 2, 4),
                flexWrap: 'wrap',
              }}
              aria-label="Scrapbook navigation"
            >
              <button
                type="button"
                data-lounge-tv-focusable
                disabled={pageIndex <= 0}
                onClick={goPrev}
                style={navBtnStyle(pageIndex <= 0)}
              >
                PREVIOUS
              </button>
              <span
                style={{
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
                  color: LOUNGE_TV_TEXT_GRAY,
                }}
              >
                {pageIndex + 1} / {pages.length}
              </span>
              <button type="button" data-lounge-tv-focusable onClick={goNext} style={navBtnStyle(false)}>
                {pageIndex >= pages.length - 1 ? 'FINISH' : 'NEXT'}
              </button>
            </nav>
          ) : null}
        </>
      )}

      {tip.relatedPSAEpisodeId ? (
        <SlayTipRelatedPsa
          episodeId={tip.relatedPSAEpisodeId}
          onViewFullClass={(ep) => {
            trackSlayTipEvent('slay_tip_related_psa_clicked', {
              tipId: tip.id,
              relatedPsaEpisodeId: ep.id,
            });
            onViewRelatedPsa(ep);
          }}
        />
      ) : null}
    </div>
  );
}

function ScrapbookPage({ page, coverFallback }: { page: SlayTipPage; coverFallback?: string }) {
  const image = page.imageUrl ?? coverFallback;
  const isTextFocus = page.layout === 'text-focus' || page.layout === 'warning';

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: isTextFocus ? 'column' : 'column',
        gap: loungeTvGlassCqw(1, 2.5, 5),
        padding: loungeTvGlassCqw(1.2, 3, 6),
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.12)',
        textTransform: 'uppercase',
      }}
    >
      {image && page.layout !== 'text-focus' ? (
        <div
          style={{
            width: '100%',
            aspectRatio: page.layout === 'split' ? '16 / 10' : '4 / 5',
            maxHeight: loungeTvGlassCqw(28, 65, 120),
            overflow: 'hidden',
            background: '#0a0a0a',
          }}
        >
          <img
            src={image}
            alt={page.altText ?? ''}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : null}
      {page.heading ? (
        <h2
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.2,
          }}
        >
          {page.heading}
        </h2>
      ) : null}
      {page.body ? (
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.45,
            textTransform: 'none',
          }}
        >
          {page.body}
        </p>
      ) : null}
      {page.callout ? (
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
            color: page.layout === 'warning' ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.4,
            padding: loungeTvGlassCqw(0.8, 2, 4),
            background: 'rgba(255,255,255,0.05)',
            borderLeft: `3px solid ${LOUNGE_TV_BRAND_RED}`,
          }}
        >
          {page.callout}
        </p>
      ) : null}
    </article>
  );
}

function EmptyScrapbookPlaceholder({ cover }: { cover?: string }) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '3 / 4',
        maxHeight: loungeTvGlassCqw(30, 70, 130),
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px dashed rgba(255,255,255,0.2)',
      }}
    >
      {cover ? (
        <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
      ) : (
        <span style={{ fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY }}>SCRAPBOOK PAGES COMING SOON</span>
      )}
    </div>
  );
}

function UnlockPanel({
  ticketLabel,
  busy,
  onRedeem,
}: {
  ticketLabel: string;
  busy: boolean;
  onRedeem: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: loungeTvGlassCqw(1, 2.5, 5),
        padding: loungeTvGlassCqw(1.5, 4, 8),
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.2, 2.8, 5.5),
          color: LOUNGE_TV_TEXT_WHITE,
        }}
      >
        UNLOCK THIS SLAY TIP
      </p>
      <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, color: LOUNGE_TV_BRAND_RED }}>{ticketLabel}</span>
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
          color: LOUNGE_TV_TEXT_GRAY,
          lineHeight: 1.4,
          maxWidth: '32em',
        }}
      >
        PHOTO + TEXT SCRAPBOOK — ORIGINAL COMPANION EDUCATION, NOT A PSA TODAY EXCERPT.
      </p>
      <button type="button" data-lounge-tv-focusable disabled={busy} onClick={onRedeem} style={navBtnStyle(busy)}>
        USE {ticketLabel}
      </button>
    </div>
  );
}

function navBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    fontFamily: LOUNGE_TV_FONT_MEDIUM,
    fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
    letterSpacing: '0.06em',
    padding: `${loungeTvGlassCqw(0.7, 1.8, 3.6)} ${loungeTvGlassCqw(1.2, 3, 6)}`,
    background: disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.28)',
    color: LOUNGE_TV_TEXT_WHITE,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
  };
}
