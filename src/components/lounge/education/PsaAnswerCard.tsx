import { useCallback, type MouseEvent } from 'react';
import type { LoungeContentPack } from '../loungeTvContentPack';
import { contentPackToTile } from '../loungeTvContent';
import { resolvePackArtwork } from '../loungeTvArtwork';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { AcrylicLikeControl } from '../AcrylicLikeControl';
import {
  loungeTvContentIsAccessible,
  resolveLoungeTvTicketCost,
  resolveLoungeTvUnlockCost,
} from '../loungeTvTicketAccess';
import type { LoungeContentUnlock } from '../../../utils/slayTicketHistoryDisplay';
import { contentPackPrimaryRuntimeForCard } from '../loungeTvContentPack';
import { LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC } from '../../../constants/slayTicketAssets';
import type { PsaAnswerPresentationEntry } from './psaAnswersPresentation';

function isPsaAnswerLikeTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('.lounge-tv-psa-answer-like'))
  );
}

function PsaAnswerAccessBadge({
  pack,
  unlocks,
  isUnlocked,
}: {
  pack: LoungeContentPack;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
}) {
  const tile = contentPackToTile(pack);
  const accessible = loungeTvContentIsAccessible(tile, unlocks ?? isUnlocked);
  const catalogCost = resolveLoungeTvTicketCost(tile);

  if (accessible && catalogCost > 0) {
    return <span className="lounge-tv-psa-answer-access">UNLOCKED</span>;
  }
  if (catalogCost <= 0 || pack.isFreePreview) {
    return <span className="lounge-tv-psa-answer-access">FREE</span>;
  }

  const unlockCost = resolveLoungeTvUnlockCost(tile, unlocks);
  return (
    <span className="lounge-tv-psa-answer-access lounge-tv-psa-answer-access--ticket">
      <img src={LOUNGE_TV_TICKET_LOCK_WATERMARK_SRC} alt="" aria-hidden draggable={false} />
      <span>{unlockCost}</span>
    </span>
  );
}

type PsaAnswerCardProps = {
  entry: PsaAnswerPresentationEntry;
  pack: LoungeContentPack;
  editorialVariant?: number;
  onSelect: (entry: PsaAnswerPresentationEntry) => void;
  unlocks?: LoungeContentUnlock[];
  isUnlocked: (contentId: string) => boolean;
  helpfulActive?: boolean;
  helpfulPending?: boolean;
  onHelpful?: () => void;
};

export function PsaAnswerCard({
  entry,
  pack,
  editorialVariant = 0,
  onSelect,
  unlocks,
  isUnlocked,
  helpfulActive = false,
  helpfulPending = false,
  onHelpful,
}: PsaAnswerCardProps) {
  const poster = resolvePackArtwork(pack, 'card');
  const duration = contentPackPrimaryRuntimeForCard(pack);

  const handleActivate = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isPsaAnswerLikeTarget(e.target)) return;
      onSelect(entry);
    },
    [onSelect, entry],
  );

  return (
    <div className="lounge-tv-psa-answer-card-wrap">
      <div
        role="button"
        tabIndex={0}
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={`psa-answer-${entry.id}`}
        className={`lounge-tv-psa-answer-card lounge-tv-psa-answer-card--v${editorialVariant}`}
        aria-label={`Open ${entry.displayQuestion}`}
        onClick={handleActivate}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(entry);
          }
        }}
        onFocusCapture={loungeTvFocusGlowIn}
        onBlurCapture={loungeTvFocusGlowOut}
      >
        <span className="lounge-tv-psa-answer-card__media" aria-hidden>
          {poster ? (
            <img src={poster} alt="" draggable={false} className="lounge-tv-psa-answer-card__image" />
          ) : null}
          <span className="lounge-tv-psa-answer-card__scrim" />
        </span>

        <span className="lounge-tv-psa-answer-card__body">
          <span
            className="lounge-tv-psa-answer-card__question"
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.1, 2.45, 4.8),
              lineHeight: 1.12,
              color: LOUNGE_TV_TEXT_WHITE,
            }}
          >
            {entry.displayQuestion}
          </span>
          <span
            className="lounge-tv-psa-answer-card__meta"
            style={{
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(0.9, 1.95, 3.8),
              color: LOUNGE_TV_TEXT_GRAY,
            }}
          >
            {entry.category}
            {duration ? ` · ${duration}` : null}
          </span>
          <PsaAnswerAccessBadge pack={pack} unlocks={unlocks} isUnlocked={isUnlocked} />
          <span
            className="lounge-tv-psa-answer-card__teaser"
            style={{
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: 'rgba(255,255,255,0.78)',
              lineHeight: 1.35,
            }}
          >
            {entry.focusTeaser}
          </span>
          <span
            className="lounge-tv-psa-answer-card__cta"
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.05em',
            }}
          >
            WATCH ANSWER {'>'}
          </span>
        </span>
      </div>

      {onHelpful ? (
        <AcrylicLikeControl
          liked={helpfulActive}
          pending={helpfulPending}
          data-lounge-tv-focusable
          className="lounge-tv-psa-answer-like"
          ariaLabel={
            helpfulActive
              ? `Unlike ${entry.displayQuestion}`
              : `Like ${entry.displayQuestion}`
          }
          onClick={() => onHelpful()}
          style={{
            position: 'absolute',
            top: loungeTvGlassCqw(0.65, 1.5, 3),
            right: loungeTvGlassCqw(0.65, 1.5, 3),
            zIndex: 4,
            pointerEvents: 'auto',
          }}
        />
      ) : null}
    </div>
  );
}
