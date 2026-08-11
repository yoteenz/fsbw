import type { EducationSeason } from '../../../content/education/types';
import {
  formatEpisodeReleaseLabel,
  getEducationMasteryById,
  isEpisodeFullLessonReleased,
  isEpisodePreviewAvailable,
  resolveEpisodeTicketCost,
  resolveSlotPsaEpisode,
  seasonUsesPurchaseIncludedAccess,
  seasonHasDualAccess,
} from '../../../content/education/hierarchy/catalog';
import { isSeasonCertificationEnabled } from '../../../content/education/hierarchy/certificationResolver';
import { getCurriculumBibleEntryById } from '../../../content/education/curriculum/registry';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_NESTED_TYPE, LOUNGE_TV_FOCUS_SCALE } from '../loungeTvTypography';
import {
  loungeTvFocusBorderIn,
  loungeTvFocusBorderOut,
  loungeTvFocusGlowIn,
  loungeTvFocusGlowOut,
  isLoungeTvSilentFocus,
} from '../loungeTvFocusHandlers';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { computeSeasonProgress } from './seasonProgress';
import { useSeasonPassAccess } from '../../../hooks/useSeasonPassAccess';
import { usePsaSeasonAccess } from '../../../hooks/usePsaSeasonAccess';
import { isCareMasterySeasonId } from '../../../content/education/hierarchy/care/seasons';
import { CareMasteryAccessDebugInspector } from './CareMasteryAccessDebugInspector';
import { useSeasonCertification } from './useSeasonCertification';
import { SeasonCertificationPanel } from './SeasonCertificationPanel';
import { CertificationRevealModal } from './CertificationRevealModal';
import { CertificationDetailView } from './CertificationDetailView';
import { trackEducationHierarchyEvent } from './educationHierarchyAnalytics';
import { useEffect, useState } from 'react';
import { getWatchProgressMap } from '../../../utils/loungeTvLibrary';
import { getContentPackById } from '../loungeTvContentPack';
import { resolvePackArtwork } from '../loungeTvArtwork';

type EducationSeasonViewProps = {
  season: EducationSeason;
  onBack: () => void;
  onSelectEpisode: (psaEpisodeId: string) => void;
  onRedeemSeasonPass?: (seasonId: string, ticketCost: number) => void;
  onGoToRewardsRoom?: () => void;
};

export function EducationSeasonView({
  season,
  onBack,
  onSelectEpisode,
  onRedeemSeasonPass,
  onGoToRewardsRoom,
}: EducationSeasonViewProps) {
  const mastery = getEducationMasteryById(season.masteryId);
  const { hasSeasonPass } = useSeasonPassAccess();
  const { access: seasonAccess, loading: seasonAccessLoading } = usePsaSeasonAccess(season.id);
  const progress = computeSeasonProgress(season);
  const dualAccessCare = seasonHasDualAccess(season.id);
  const complimentaryIncluded =
    seasonAccess?.complimentary && seasonAccess.seasonOwned;
  const careIncludedLegacy = seasonUsesPurchaseIncludedAccess(season.id);
  const hasPass = hasSeasonPass(season.id) || Boolean(seasonAccess?.seasonOwned);
  const cert = useSeasonCertification(season);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (isSeasonCertificationEnabled(season)) {
      trackEducationHierarchyEvent('season_certification_progress_viewed', {
        masteryId: season.masteryId,
        seasonId: season.id,
      });
    }
  }, [season]);

  if (showDetail && cert.certification) {
    return (
      <CertificationDetailView
        season={season}
        certification={cert.certification}
        onBack={() => setShowDetail(false)}
        onGoToRewardsRoom={onGoToRewardsRoom}
      />
    );
  }

  const openCertification = () => {
    if (!cert.certification) return;
    trackEducationHierarchyEvent('education_certification_opened', {
      certificationId: cert.certification.id,
      seasonId: season.id,
    });
    setShowDetail(true);
  };

  return (
    <>
      {cert.certification && cert.pendingReveal ? (
        <CertificationRevealModal
          open
          season={season}
          certification={cert.certification}
          onClose={cert.dismissReveal}
          onViewCertification={openCertification}
          onGoToRewardsRoom={onGoToRewardsRoom}
        />
      ) : null}

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: loungeTvGlassCqw(2, 5, 10),
          textTransform: 'uppercase',
        }}
      >
        <LoungeTvBackButton onClick={onBack} label={`< ${mastery?.title ?? 'MASTERY'}`} />
        <header>
          <h1
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_NESTED_TYPE.pageTitle,
              color: LOUNGE_TV_TEXT_WHITE,
              lineHeight: 1.08,
            }}
          >
            SEASON {String(season.seasonNumber).padStart(2, '0')} · {season.title}
          </h1>
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.9, 2.2, 4.5)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_NESTED_TYPE.body,
              color: LOUNGE_TV_TEXT_GRAY,
              lineHeight: 1.45,
              maxWidth: '48em',
            }}
          >
            {(
              season.shortPremise ??
              season.description ??
              season.learningObjective
            ).toUpperCase()}
          </p>
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.7, 1.6, 3.2)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_NESTED_TYPE.certificationStatus,
              color: LOUNGE_TV_TEXT_WHITE,
            }}
          >
            {progress.completed} / {progress.total} CLASSES COMPLETED
          </p>
        </header>

        {cert.enabled ? (
          <SeasonCertificationPanel
            season={season}
            certification={cert.certification}
            progress={cert.progress}
            onViewCertification={cert.certification ? openCertification : undefined}
          />
        ) : null}

        {season.allowSeasonPass && !careIncludedLegacy ? (
          <div
            data-lounge-tv-rail="season-pass-offer"
            style={{
              padding: loungeTvGlassCqw(1.4, 3.2, 6.4),
              border: '1px solid rgba(235,28,36,0.22)',
              borderLeft: `3px solid ${LOUNGE_TV_BRAND_RED}`,
              background: 'linear-gradient(165deg, rgba(235,28,36,0.06) 0%, rgba(0,0,0,0.5) 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: loungeTvGlassCqw(0.55, 1.3, 2.6),
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_NESTED_TYPE.sectionTitle,
                color: LOUNGE_TV_TEXT_WHITE,
                lineHeight: 1.2,
              }}
            >
              {complimentaryIncluded
                ? 'INCLUDED WITH YOUR FRONTAL SLAYER PURCHASE'
                : hasPass
                  ? 'SEASON PASS ACTIVE'
                  : 'GET THE SEASON'}
            </p>
            {!hasPass && !complimentaryIncluded ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: LOUNGE_TV_NESTED_TYPE.body,
                  color: LOUNGE_TV_TEXT_GRAY,
                  lineHeight: 1.4,
                }}
              >
                UNLOCK ALL CLASSES IN THIS SEASON
              </p>
            ) : null}
            {season.curriculumStatus === 'curriculum_pending' ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: LOUNGE_TV_NESTED_TYPE.meta,
                  color: LOUNGE_TV_TEXT_GRAY,
                  lineHeight: 1.4,
                }}
              >
                CLASSES RELEASE ON SCHEDULE
              </p>
            ) : null}
            {!hasPass && season.seasonTicketCost != null ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_NESTED_TYPE.meta,
                  color: LOUNGE_TV_BRAND_RED,
                  lineHeight: 1.4,
                  letterSpacing: '0.04em',
                }}
              >
                {season.seasonTicketCost} SLAY TICKET{season.seasonTicketCost === 1 ? '' : 'S'} · INCLUDES ALL CLASSES AS THEY RELEASE
              </p>
            ) : !hasPass && dualAccessCare ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: LOUNGE_TV_NESTED_TYPE.body,
                  color: LOUNGE_TV_TEXT_GRAY,
                  lineHeight: 1.4,
                }}
              >
                FULL SEASON ACCESS · CARE GUIDES INCLUDED WITH QUALIFYING HAIR PURCHASE
              </p>
            ) : hasPass ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: LOUNGE_TV_NESTED_TYPE.meta,
                  color: LOUNGE_TV_TEXT_GRAY,
                  lineHeight: 1.4,
                }}
              >
                ALL RELEASED CLASSES INCLUDED
              </p>
            ) : null}
            {!hasPass && !complimentaryIncluded && onRedeemSeasonPass && season.seasonTicketCost != null ? (
              <button
                type="button"
                data-lounge-tv-focusable
                style={{
                  marginTop: loungeTvGlassCqw(0.35, 0.85, 1.7),
                  alignSelf: 'flex-start',
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_NESTED_TYPE.cta,
                  letterSpacing: '0.06em',
                  color: LOUNGE_TV_BRAND_RED,
                  background: LOUNGE_TV_TEXT_WHITE,
                  border: 'none',
                  padding: `${loungeTvGlassCqw(0.7, 1.6, 3.2)} ${loungeTvGlassCqw(1.2, 3, 6)}`,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
                onClick={() => onRedeemSeasonPass(season.id, season.seasonTicketCost!)}
                disabled={seasonAccessLoading || seasonAccess?.canPurchaseSeasonPass === false}
              >
                {'GET SEASON >'}
              </button>
            ) : null}
          </div>
        ) : null}

        {careIncludedLegacy && !dualAccessCare ? (
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_NESTED_TYPE.meta,
              color: LOUNGE_TV_TEXT_GRAY,
              lineHeight: 1.4,
            }}
          >
            CARE GUIDES INCLUDED WITH QUALIFYING HAIR PURCHASE
          </p>
        ) : null}

        {dualAccessCare && complimentaryIncluded ? (
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_NESTED_TYPE.meta,
              color: LOUNGE_TV_TEXT_GRAY,
              lineHeight: 1.4,
            }}
          >
            INCLUDED WITH YOUR QUALIFYING PURCHASE
          </p>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(1.2, 3, 6) }}>
          {season.episodeSlots.map((slot) => {
            const bible = getCurriculumBibleEntryById(slot.curriculumBibleId);
            const ep = resolveSlotPsaEpisode(slot);
            const title = ep?.title ?? bible?.title ?? slot.curriculumBibleId;
            const released = ep ? isEpisodeFullLessonReleased(ep) : false;
            const preview = ep ? isEpisodePreviewAvailable(ep) : false;
            const ticketCost = ep ? resolveEpisodeTicketCost(ep) : undefined;
            const packId = ep?.linkedContentPackId;
            const pack = packId ? getContentPackById(packId) : undefined;
            const thumbSrc = pack ? resolvePackArtwork(pack, 'card') : undefined;
            const watchProgress = packId ? getWatchProgressMap()[packId] : undefined;
            const progressPercent = watchProgress?.percent ?? 0;
            const inProgress = progressPercent > 0 && progressPercent < 95;
            const locked =
              !released &&
              !preview &&
              !hasPass &&
              !complimentaryIncluded &&
              ticketCost != null &&
              season.allowEpisodePurchase;

            return (
              <EpisodeRow
                key={slot.slotId}
                slotNumber={slot.seasonEpisodeNumber}
                title={title}
                released={released}
                preview={preview}
                locked={locked}
                ticketCost={ticketCost}
                hasPass={hasPass}
                complimentaryIncluded={Boolean(complimentaryIncluded)}
                releaseLabel={formatEpisodeReleaseLabel(ep?.releaseAt)}
                thumbSrc={thumbSrc}
                progressPercent={inProgress ? Math.round(progressPercent) : undefined}
                onOpen={released && ep ? () => onSelectEpisode(ep.id) : undefined}
              />
            );
          })}
        </div>

        {isCareMasterySeasonId(season.id) ? (
          <CareMasteryAccessDebugInspector
            seasonAccess={seasonAccess}
            loading={seasonAccessLoading}
          />
        ) : null}
      </div>
    </>
  );
}

function EpisodeRow({
  slotNumber,
  title,
  released,
  preview,
  locked,
  ticketCost,
  hasPass,
  complimentaryIncluded,
  releaseLabel,
  thumbSrc,
  progressPercent,
  onOpen,
}: {
  slotNumber: number;
  title: string;
  released: boolean;
  preview: boolean;
  locked: boolean;
  ticketCost?: number;
  hasPass: boolean;
  complimentaryIncluded: boolean;
  releaseLabel: string;
  thumbSrc?: string;
  progressPercent?: number;
  onOpen?: () => void;
}) {
  const isAvailable = Boolean(onOpen);
  const isFuture = !released && !preview && !isAvailable;

  const statusLabel = progressPercent != null
    ? `${progressPercent}% COMPLETE`
    : locked && ticketCost != null
      ? `LOCKED · ${ticketCost} SLAY TICKET${ticketCost === 1 ? '' : 'S'}`
      : released
        ? hasPass || complimentaryIncluded
          ? 'SEASON PASS'
          : 'AVAILABLE'
        : preview
          ? 'PREVIEW AVAILABLE'
          : releaseLabel;

  const actionLabel = onOpen
    ? progressPercent != null
      ? 'RESUME >'
      : complimentaryIncluded || hasPass
        ? 'OPEN CLASS >'
        : 'WATCH >'
    : null;

  const rowStyle = {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: loungeTvGlassCqw(1.2, 3, 6),
    padding: loungeTvGlassCqw(1.1, 2.6, 5.2),
    border: '1px solid rgba(255,255,255,0.14)',
    background: isFuture ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
    textAlign: 'left' as const,
    width: '100%',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease, opacity 0.2s ease',
    textTransform: 'uppercase' as const,
    opacity: isFuture ? 0.72 : 1,
  };

  const body = (
    <>
      <span
        style={{
          flexShrink: 0,
          width: loungeTvGlassCqw(16, 36, 64),
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          background: '#141414',
          display: 'block',
        }}
      >
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt=""
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: isFuture ? 0.55 : 1,
            }}
          />
        ) : null}
      </span>

      <span
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: loungeTvGlassCqw(0.35, 0.85, 1.7),
        }}
      >
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_NESTED_TYPE.meta,
            color: isFuture ? 'rgba(255,255,255,0.45)' : LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.06em',
          }}
        >
          EP {String(slotNumber).padStart(2, '0')}
        </span>
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_NESTED_TYPE.cardTitle,
            color: isFuture ? 'rgba(255,255,255,0.65)' : LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.25,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_NESTED_TYPE.meta,
            color:
              progressPercent != null
                ? LOUNGE_TV_BRAND_RED
                : isAvailable
                  ? LOUNGE_TV_BRAND_RED
                  : isFuture
                    ? 'rgba(255,255,255,0.4)'
                    : LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.04em',
          }}
        >
          {statusLabel}
        </span>
      </span>

      {actionLabel ? (
        <span
          style={{
            flexShrink: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_NESTED_TYPE.cta,
            color: LOUNGE_TV_BRAND_RED,
            alignSelf: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {actionLabel}
        </span>
      ) : null}
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={`episode-${slotNumber}`}
        onClick={onOpen}
        onFocusCapture={(e) => {
          if (isLoungeTvSilentFocus(e.currentTarget)) return;
          e.currentTarget.style.transform = LOUNGE_TV_FOCUS_SCALE;
          loungeTvFocusGlowIn(e);
          loungeTvFocusBorderIn(e);
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          loungeTvFocusGlowOut(e);
          loungeTvFocusBorderOut(e, 'rgba(255,255,255,0.14)');
        }}
        style={{ ...rowStyle, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.14)' }}
      >
        {body}
      </button>
    );
  }

  return <div style={rowStyle}>{body}</div>;
}
