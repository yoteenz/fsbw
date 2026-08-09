import { useEffect } from 'react';
import type { EducationCertification, EducationSeason } from '../../../content/education/types';
import { getEducationMasteryById } from '../../../content/education/hierarchy/catalog';
import { getCollectibleForSeason } from '../../../content/education/collectibles/definitions';
import { CertificationCollectibleAsset } from '../../account/collectibles/CertificationCollectibleAsset';
import { markCertificationRevealSeen } from './certificationApi';
import { trackEducationHierarchyEvent } from './educationHierarchyAnalytics';

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
            fontFamily: '"Futura PT Medium"',
            color: '#EB1C24',
            letterSpacing: '0.14em',
            fontSize: 11,
          }}
        >
          SEASON COMPLETE
        </p>
        <div
          style={{
            margin: '24px auto',
            animation: 'certRevealGlow 2.4s ease-in-out infinite alternate',
          }}
        >
          <CertificationCollectibleAsset definition={definition} earned title={season.title} size={140} />
        </div>
        <p style={{ margin: '0 0 6px', fontFamily: '"Futura PT Medium"', color: '#fff', fontSize: 16 }}>
          {season.title}
        </p>
        <p style={{ margin: '0 0 20px', fontFamily: '"Futura PT Book"', color: '#aaa', fontSize: 11, lineHeight: 1.5 }}>
          FRONTAL SLAYER CERTIFICATION EARNED
          <br />
          {mastery?.title} · SEASON {season.seasonNumber}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button type="button" onClick={() => { void handleClose(); onViewCertification(); }}>
            VIEW CERTIFICATION
          </button>
          {onGoToRewardsRoom ? (
            <button
              type="button"
              onClick={() => {
                trackEducationHierarchyEvent('education_certification_rewards_room_clicked', {
                  certificationId: certification.id,
                  seasonId: season.id,
                });
                void handleClose();
                onGoToRewardsRoom();
              }}
            >
              GO TO REWARDS ROOM
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
