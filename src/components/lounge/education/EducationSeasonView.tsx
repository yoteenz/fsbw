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
import {
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
          gap: loungeTvGlassCqw(1.2, 3, 6),
          textTransform: 'uppercase',
        }}
      >
        <LoungeTvBackButton onClick={onBack} />
        <header>
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
              color: '#EB1C24',
            }}
          >
            {mastery?.title ?? 'MASTERY'} · SEASON {season.seasonNumber}
          </p>
          <h1
            style={{
              margin: `${loungeTvGlassCqw(0.4, 1, 2)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
              color: LOUNGE_TV_TEXT_WHITE,
            }}
          >
            {season.title}
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
            {season.learningObjective}
          </p>
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.6, 1.5, 3)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1, 2.2, 4.5),
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
            style={{
              padding: loungeTvGlassCqw(1, 2.5, 5),
              border: '1px solid rgba(235,28,36,0.35)',
              background: 'rgba(0,0,0,0.45)',
            }}
          >
            <p style={{ margin: 0, fontFamily: LOUNGE_TV_FONT_MEDIUM, color: LOUNGE_TV_TEXT_WHITE }}>
              {complimentaryIncluded
                ? 'INCLUDED WITH YOUR FRONTAL SLAYER PURCHASE'
                : hasPass
                  ? 'SEASON PASS ACTIVE'
                  : 'GET THE SEASON'}
            </p>
            {season.curriculumStatus === 'curriculum_pending' ? (
              <p style={{ margin: '8px 0 0', fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY }}>
                CURRICULUM PENDING APPROVAL — COMMERCE ENABLED WHEN EPISODES RELEASE
              </p>
            ) : null}
            {!hasPass && season.seasonTicketCost != null ? (
              <p style={{ margin: '8px 0 0', fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY }}>
                {season.seasonTicketCost} SLAY TICKETS · INCLUDES ALL CLASSES AS THEY RELEASE
              </p>
            ) : !hasPass && dualAccessCare ? (
              <p style={{ margin: '8px 0 0', fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY }}>
                SEASON PASS PRICING CONFIGURABLE · CARE GUIDES INCLUDED WITH QUALIFYING HAIR PURCHASE
              </p>
            ) : !hasPass ? (
              <p style={{ margin: '8px 0 0', fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY }}>
                SEASON PASS PRICING CONFIGURABLE PER SEASON
              </p>
            ) : null}
            {!hasPass && !complimentaryIncluded && onRedeemSeasonPass && season.seasonTicketCost != null ? (
              <button
                type="button"
                style={{ marginTop: 12 }}
                onClick={() => onRedeemSeasonPass(season.id, season.seasonTicketCost!)}
                disabled={seasonAccessLoading || seasonAccess?.canPurchaseSeasonPass === false}
              >
                REDEEM SEASON PASS
              </button>
            ) : null}
          </div>
        ) : null}

        {careIncludedLegacy && !dualAccessCare ? (
          <p style={{ margin: 0, fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY }}>
            CARE GUIDES — INCLUDED WITH QUALIFYING HAIR PURCHASE (NOT CARE MASTERY)
          </p>
        ) : null}

        {dualAccessCare && complimentaryIncluded ? (
          <p style={{ margin: 0, fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY }}>
            LEGACY CARE MASTERY SEASON PASS — INCLUDED WITH PRIOR QUALIFYING PURCHASE POLICY
          </p>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(0.8, 2, 4) }}>
          {season.episodeSlots.map((slot) => {
            const bible = getCurriculumBibleEntryById(slot.curriculumBibleId);
            const ep = resolveSlotPsaEpisode(slot);
            const title = ep?.title ?? bible?.title ?? slot.curriculumBibleId;
            const released = ep ? isEpisodeFullLessonReleased(ep) : false;
            const preview = ep ? isEpisodePreviewAvailable(ep) : false;
            const ticketCost = ep ? resolveEpisodeTicketCost(ep) : undefined;

            return (
              <div
                key={slot.slotId}
                style={{
                  padding: loungeTvGlassCqw(1, 2.5, 5),
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    color: LOUNGE_TV_TEXT_WHITE,
                    fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
                  }}
                >
                  EP. {String(slot.seasonEpisodeNumber).padStart(2, '0')} · {title}
                </p>
                <p
                  style={{
                    margin: `${loungeTvGlassCqw(0.35, 0.9, 1.8)} 0 0`,
                    fontFamily: LOUNGE_TV_FONT_BOOK,
                    color: LOUNGE_TV_TEXT_GRAY,
                    fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
                  }}
                >
                  {released
                    ? 'AVAILABLE'
                    : preview
                      ? 'PREVIEW AVAILABLE'
                      : formatEpisodeReleaseLabel(ep?.releaseAt)}
                  {ticketCost != null && season.allowEpisodePurchase && !complimentaryIncluded && !hasPass
                    ? ` · ${ticketCost} SLAY TICKETS`
                    : ''}
                </p>
                {released && ep ? (
                  <button type="button" style={{ marginTop: 10 }} onClick={() => onSelectEpisode(ep.id)}>
                    {hasPass ? 'OPEN CLASS (SEASON PASS)' : 'BUY THIS EPISODE / OPEN'}
                  </button>
                ) : null}
              </div>
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
