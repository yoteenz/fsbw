import { useEffect } from 'react';
import type { EducationCertification, EducationSeason } from '../../../content/education/types';
import { getEducationMasteryById } from '../../../content/education/hierarchy/catalog';
import { getCollectibleForSeason } from '../../../content/education/collectibles/definitions';
import { CertificationCollectibleAsset } from '../../account/collectibles/CertificationCollectibleAsset';
import { markCertificationRevealSeen } from './certificationApi';
import { trackEducationHierarchyEvent } from './educationHierarchyAnalytics';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_NESTED_TYPE } from '../loungeTvTypography';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';

type CertificationRevealModalProps = {
  open: boolean;
  season: EducationSeason;
  certification: EducationCertification;
  onClose: () => void;
  onViewCertification: () => void;
  onGoToRewardsRoom?: () => void;
};

export function CertificationRevealModal({
  open,
  season,
  certification,
  onClose,
  onViewCertification,
  onGoToRewardsRoom,
}: CertificationRevealModalProps) {
  const mastery = getEducationMasteryById(season.masteryId);
  const definition = getCollectibleForSeason(season.id);

  useEffect(() => {
    if (!open) return;
    trackEducationHierarchyEvent('education_certification_reveal_viewed', {
      masteryId: season.masteryId,
      seasonId: season.id,
      certificationId: certification.id,
    });
  }, [certification.id, open, season.id, season.masteryId]);

  if (!open) return null;

  const handleClose = async () => {
    await markCertificationRevealSeen(certification.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-reveal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        padding: 24,
      }}
      onClick={() => void handleClose()}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          padding: '32px 28px',
          background:
            'linear-gradient(160deg, rgba(18,18,18,0.96), rgba(8,8,8,0.98)), radial-gradient(circle at 50% 0%, rgba(235,28,36,0.12), transparent 55%)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          id="cert-reveal-title"
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            color: LOUNGE_TV_BRAND_RED,
            letterSpacing: '0.12em',
            fontSize: LOUNGE_TV_NESTED_TYPE.meta,
          }}
        >
          SEASON COMPLETE
        </p>
        <div
          style={{
            margin: `${loungeTvGlassCqw(1.2, 3, 6)} auto`,
            animation: 'certRevealGlow 2.4s ease-in-out infinite alternate',
          }}
        >
          <CertificationCollectibleAsset definition={definition} earned title={season.title} size={120} />
        </div>
        <p
          style={{
            margin: '0 0 6px',
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            color: LOUNGE_TV_TEXT_WHITE,
            fontSize: LOUNGE_TV_NESTED_TYPE.cardTitle,
            lineHeight: 1.25,
          }}
        >
          {season.title}
        </p>
        <p
          style={{
            margin: `0 0 ${loungeTvGlassCqw(1, 2.5, 5)}`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            color: LOUNGE_TV_TEXT_GRAY,
            fontSize: LOUNGE_TV_NESTED_TYPE.body,
            lineHeight: 1.45,
          }}
        >
          FRONTAL SLAYER CERTIFICATION EARNED
          <br />
          {mastery?.title} · SEASON {season.seasonNumber}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(0.6, 1.4, 2.8) }}>
          <button
            type="button"
            data-lounge-tv-focusable
            onClick={() => {
              void handleClose();
              onViewCertification();
            }}
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_NESTED_TYPE.cta,
              color: LOUNGE_TV_BRAND_RED,
              background: LOUNGE_TV_TEXT_WHITE,
              border: 'none',
              padding: `${loungeTvGlassCqw(0.7, 1.6, 3.2)} ${loungeTvGlassCqw(1, 2.5, 5)}`,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {'VIEW CERTIFICATION >'}
          </button>
          {onGoToRewardsRoom ? (
            <button
              type="button"
              data-lounge-tv-focusable
              onClick={() => {
                trackEducationHierarchyEvent('education_certification_rewards_room_clicked', {
                  certificationId: certification.id,
                  seasonId: season.id,
                });
                void handleClose();
                onGoToRewardsRoom();
              }}
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_NESTED_TYPE.cta,
                color: LOUNGE_TV_TEXT_WHITE,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.22)',
                padding: `${loungeTvGlassCqw(0.7, 1.6, 3.2)} ${loungeTvGlassCqw(1, 2.5, 5)}`,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {'GO TO REWARDS ROOM >'}
            </button>
          ) : null}
        </div>
        <style>{`
          @keyframes certRevealGlow {
            from { filter: drop-shadow(0 0 8px rgba(255,255,255,0.2)); }
            to { filter: drop-shadow(0 0 18px rgba(235,28,36,0.35)); }
          }
        `}</style>
      </div>
    </div>
  );
}
