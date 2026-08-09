import type { EducationCertification, EducationSeason } from '../../../content/education/types';
import { getEducationMasteryById } from '../../../content/education/hierarchy/catalog';
import { getCollectibleForSeason } from '../../../content/education/collectibles/definitions';
import { resolveSeasonCertificationTitle } from '../../../content/education/hierarchy/certificationResolver';
import { CertificationCollectibleAsset } from '../../account/collectibles/CertificationCollectibleAsset';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { loungeTvGlassCqw } from '../loungeTvResponsive';

type SeasonCertificationPanelProps = {
  season: EducationSeason;
  certification: EducationCertification | null;
  progress: { completed: number; total: number; percent: number; isComplete: boolean };
  onViewCertification?: () => void;
};

export function SeasonCertificationPanel({
  season,
  certification,
  progress,
  onViewCertification,
}: SeasonCertificationPanelProps) {
  const mastery = getEducationMasteryById(season.masteryId);
  const definition = getCollectibleForSeason(season.id);
  const certTitle = resolveSeasonCertificationTitle(season, mastery?.title);

  if (certification) {
    return (
      <section
        aria-label="Certification earned"
        style={{
          padding: loungeTvGlassCqw(1.2, 2.8, 5.6),
          border: '1px solid rgba(235,28,36,0.45)',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.55), rgba(20,20,20,0.75))',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            color: '#EB1C24',
            fontSize: loungeTvGlassCqw(1, 2.2, 4.4),
          }}
        >
          CERTIFICATION EARNED
        </p>
        <div style={{ display: 'flex', gap: loungeTvGlassCqw(1, 2.5, 5), alignItems: 'center', marginTop: 12 }}>
          <CertificationCollectibleAsset definition={definition} earned title={season.title} size={72} />
          <div>
            <p style={{ margin: 0, fontFamily: LOUNGE_TV_FONT_MEDIUM, color: LOUNGE_TV_TEXT_WHITE }}>
              {certification.title}
            </p>
            <p style={{ margin: '6px 0 0', fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY, fontSize: '0.85em' }}>
              {mastery?.title} · SEASON {season.seasonNumber}
            </p>
            <p style={{ margin: '4px 0 0', fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY, fontSize: '0.8em' }}>
              {certification.certificationCode}
            </p>
          </div>
        </div>
        {onViewCertification ? (
          <button type="button" style={{ marginTop: 12 }} onClick={onViewCertification}>
            VIEW CERTIFICATION
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section
      aria-label="Certification progress"
      style={{
        padding: loungeTvGlassCqw(1.2, 2.8, 5.6),
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(0,0,0,0.35)',
      }}
    >
      <p style={{ margin: 0, fontFamily: LOUNGE_TV_FONT_MEDIUM, color: LOUNGE_TV_TEXT_WHITE }}>
        CERTIFICATION PROGRESS
      </p>
      <p style={{ margin: '8px 0 0', fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY }}>
        {progress.completed} OF {progress.total} CLASSES COMPLETE
      </p>
      <p style={{ margin: '10px 0 0', fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY, lineHeight: 1.4 }}>
        Complete all required classes to earn:
        <br />
        <span style={{ color: LOUNGE_TV_TEXT_WHITE }}>{certTitle}</span>
      </p>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
        <CertificationCollectibleAsset definition={definition} earned={false} title={season.title} size={56} />
        <p style={{ margin: 0, fontFamily: LOUNGE_TV_FONT_BOOK, color: LOUNGE_TV_TEXT_GRAY, fontSize: '0.8em' }}>
          PREVIEW · CRYSTAL PLAQUE COLLECTIBLE
        </p>
      </div>
    </section>
  );
}
