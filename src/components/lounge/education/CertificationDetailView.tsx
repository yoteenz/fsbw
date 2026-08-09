import type { EducationCertification, EducationSeason } from '../../../content/education/types';
import { getEducationMasteryById } from '../../../content/education/hierarchy/catalog';
import { getCollectibleForSeason } from '../../../content/education/collectibles/definitions';
import { CertificationCollectibleAsset } from '../../account/collectibles/CertificationCollectibleAsset';
import { trackEducationHierarchyEvent } from './educationHierarchyAnalytics';

type CertificationDetailViewProps = {
  season: EducationSeason;
  certification: EducationCertification;
  onBack: () => void;
  onGoToRewardsRoom?: () => void;
};

export function CertificationDetailView({
  season,
  certification,
  onBack,
  onGoToRewardsRoom,
}: CertificationDetailViewProps) {
  const mastery = getEducationMasteryById(season.masteryId);
  const definition = getCollectibleForSeason(season.id);
  const issuedDate = new Date(certification.issuedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{ width: '100%', textTransform: 'uppercase' }}>
      <button type="button" onClick={onBack} style={{ marginBottom: 16 }}>
        ← BACK
      </button>
      <header style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ margin: 0, fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: 11, letterSpacing: '0.1em' }}>
          FRONTAL SLAYER
        </p>
        <p style={{ margin: '6px 0', fontFamily: '"Futura PT Book"', color: '#888', fontSize: 10 }}>
          CERTIFICATE OF MASTERY
        </p>
        <CertificationCollectibleAsset definition={definition} earned title={season.title} size={160} />
        <h1 style={{ margin: '16px 0 0', fontFamily: '"Futura PT Medium"', color: '#fff', fontSize: 18 }}>
          {certification.title}
        </h1>
        <p style={{ margin: '8px 0 0', fontFamily: '"Futura PT Book"', color: '#aaa', fontSize: 11 }}>
          {mastery?.title} · SEASON {season.seasonNumber}
        </p>
      </header>
      <dl
        style={{
          margin: 0,
          padding: 16,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.35)',
          fontFamily: '"Futura PT Book"',
          fontSize: 11,
          color: '#ccc',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <dt>ISSUED</dt>
          <dd style={{ margin: 0, color: '#fff' }}>{issuedDate}</dd>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <dt>CERTIFICATION</dt>
          <dd style={{ margin: 0, color: '#fff' }}>{certification.certificationCode}</dd>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <dt>CLASSES COMPLETED</dt>
          <dd style={{ margin: 0, color: '#fff' }}>{certification.completedEpisodeIds.length}</dd>
        </div>
      </dl>
      {onGoToRewardsRoom ? (
        <button
          type="button"
          style={{ marginTop: 16, width: '100%' }}
          onClick={() => {
            trackEducationHierarchyEvent('education_certification_rewards_room_clicked', {
              certificationId: certification.id,
              seasonId: season.id,
            });
            onGoToRewardsRoom();
          }}
        >
          VIEW IN REWARDS ROOM
        </button>
      ) : null}
    </div>
  );
}
