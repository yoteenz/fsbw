import type { EducationCertification, EducationSeason } from '../../../content/education/types';
import { getEducationMasteryById } from '../../../content/education/hierarchy/catalog';
import { getCollectibleForSeason } from '../../../content/education/collectibles/definitions';
import { CertificationCollectibleAsset } from '../../account/collectibles/CertificationCollectibleAsset';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import { loungeTvCertificationTitleLines } from '../loungeTvDisplayText';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_NESTED_TYPE } from '../loungeTvTypography';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
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
  const titleLines = loungeTvCertificationTitleLines(certification.title);
  const issuedDate = new Date(certification.issuedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      style={{
        width: '100%',
        textTransform: 'uppercase',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.2, 3, 6),
      }}
    >
      <LoungeTvBackButton onClick={onBack} />

      <header
        style={{
          textAlign: 'center',
          padding: loungeTvGlassCqw(1, 2.5, 5),
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(0,0,0,0.35)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            color: LOUNGE_TV_BRAND_RED,
            fontSize: LOUNGE_TV_NESTED_TYPE.meta,
            letterSpacing: '0.1em',
          }}
        >
          FRONTAL SLAYER
        </p>
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.4, 1, 2)} 0 ${loungeTvGlassCqw(0.8, 2, 4)}`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            color: LOUNGE_TV_TEXT_GRAY,
            fontSize: LOUNGE_TV_NESTED_TYPE.meta,
          }}
        >
          CERTIFICATE OF MASTERY
        </p>
        <CertificationCollectibleAsset definition={definition} earned title={season.title} size={120} />
        <div style={{ marginTop: loungeTvGlassCqw(0.8, 2, 4) }}>
          {titleLines.map((line) => (
            <p
              key={line}
              style={{
                margin: 0,
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                color: LOUNGE_TV_TEXT_WHITE,
                fontSize: LOUNGE_TV_NESTED_TYPE.rewardTitle,
                lineHeight: 1.25,
              }}
            >
              {line}
            </p>
          ))}
        </div>
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            color: LOUNGE_TV_TEXT_GRAY,
            fontSize: LOUNGE_TV_NESTED_TYPE.meta,
          }}
        >
          {mastery?.title} · SEASON {season.seasonNumber}
        </p>
      </header>

      <dl
        style={{
          margin: 0,
          padding: loungeTvGlassCqw(1, 2.5, 5),
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(0,0,0,0.35)',
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: LOUNGE_TV_NESTED_TYPE.body,
          color: LOUNGE_TV_TEXT_GRAY,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: loungeTvGlassCqw(0.6, 1.4, 2.8) }}>
          <dt>ISSUED</dt>
          <dd style={{ margin: 0, color: LOUNGE_TV_TEXT_WHITE }}>{issuedDate}</dd>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: loungeTvGlassCqw(0.6, 1.4, 2.8) }}>
          <dt>CERTIFICATION</dt>
          <dd style={{ margin: 0, color: LOUNGE_TV_TEXT_WHITE }}>{certification.certificationCode}</dd>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <dt>CLASSES COMPLETED</dt>
          <dd style={{ margin: 0, color: LOUNGE_TV_TEXT_WHITE }}>{certification.completedEpisodeIds.length}</dd>
        </div>
      </dl>

      {onGoToRewardsRoom ? (
        <button
          type="button"
          data-lounge-tv-focusable
          onClick={() => {
            trackEducationHierarchyEvent('education_certification_rewards_room_clicked', {
              certificationId: certification.id,
              seasonId: season.id,
            });
            onGoToRewardsRoom();
          }}
          style={{
            width: '100%',
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
        >
          {'VIEW IN REWARDS ROOM >'}
        </button>
      ) : null}
    </div>
  );
}
