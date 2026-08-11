import type { EducationCertification, EducationSeason } from '../../../content/education/types';
import { getEducationMasteryById } from '../../../content/education/hierarchy/catalog';
import { getCollectibleForSeason } from '../../../content/education/collectibles/definitions';
import { resolveSeasonCertificationTitle } from '../../../content/education/hierarchy/certificationResolver';
import { CertificationCollectibleAsset } from '../../account/collectibles/CertificationCollectibleAsset';
import { loungeTvCertificationTitleLines } from '../loungeTvDisplayText';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_NESTED_TYPE } from '../loungeTvTypography';

type SeasonCertificationPanelProps = {
  season: EducationSeason;
  certification: EducationCertification | null;
  progress: { completed: number; total: number; percent: number; isComplete: boolean };
  onViewCertification?: () => void;
};

const moduleShellStyle = {
  padding: loungeTvGlassCqw(1.4, 3.2, 6.4),
  borderRadius: '1px',
  background: 'linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.55) 100%)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 0,
} as const;

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      aria-hidden
      style={{
        marginTop: loungeTvGlassCqw(0.75, 1.7, 3.4),
        height: loungeTvGlassCqw(0.45, 1, 2),
        background: 'rgba(255,255,255,0.12)',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          display: 'block',
          height: '100%',
          width: `${Math.min(100, Math.max(0, percent))}%`,
          background: LOUNGE_TV_BRAND_RED,
          transition: 'width 0.35s ease',
        }}
      />
    </div>
  );
}

function RewardCollectible({
  season,
  definition,
  earned,
}: {
  season: EducationSeason;
  definition: ReturnType<typeof getCollectibleForSeason>;
  earned: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: loungeTvGlassCqw(0.8, 1.8, 3.6),
        marginTop: loungeTvGlassCqw(1.2, 2.8, 5.6),
        padding: loungeTvGlassCqw(1.2, 2.8, 5.6),
        background: earned
          ? 'radial-gradient(ellipse at center, rgba(235,28,36,0.12) 0%, rgba(0,0,0,0.35) 70%)'
          : 'radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.3) 70%)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <CertificationCollectibleAsset
        definition={definition}
        earned={earned}
        title={season.title}
        size={earned ? 72 : 60}
      />
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: LOUNGE_TV_NESTED_TYPE.meta,
          color: earned ? LOUNGE_TV_BRAND_RED : LOUNGE_TV_TEXT_GRAY,
          lineHeight: 1.35,
          letterSpacing: '0.05em',
          textAlign: 'center',
        }}
      >
        {earned ? 'CRYSTAL PLAQUE COLLECTIBLE · DISPLAY IN REWARDS ROOM' : 'CRYSTAL PLAQUE COLLECTIBLE'}
      </p>
    </div>
  );
}

export function SeasonCertificationPanel({
  season,
  certification,
  progress,
  onViewCertification,
}: SeasonCertificationPanelProps) {
  const mastery = getEducationMasteryById(season.masteryId);
  const definition = getCollectibleForSeason(season.id);
  const certTitle = resolveSeasonCertificationTitle(season, mastery?.title);
  const certTitleLines = loungeTvCertificationTitleLines(certTitle);

  if (certification) {
    const earnedTitleLines = loungeTvCertificationTitleLines(certification.title);
    return (
      <section
        aria-label="Certification earned"
        style={{
          ...moduleShellStyle,
          border: '1px solid rgba(235,28,36,0.35)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_NESTED_TYPE.sectionTitle,
            color: LOUNGE_TV_BRAND_RED,
            letterSpacing: '0.06em',
            lineHeight: 1.2,
          }}
        >
          CERTIFICATION EARNED
        </p>
        <div style={{ marginTop: loungeTvGlassCqw(0.7, 1.6, 3.2) }}>
          {earnedTitleLines.map((line) => (
            <p
              key={line}
              style={{
                margin: 0,
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_NESTED_TYPE.rewardTitle,
                color: LOUNGE_TV_TEXT_WHITE,
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
            fontSize: LOUNGE_TV_NESTED_TYPE.meta,
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.35,
          }}
        >
          {mastery?.title} · SEASON {season.seasonNumber} · {certification.certificationCode}
        </p>
        <RewardCollectible season={season} definition={definition} earned />
        {onViewCertification ? (
          <button
            type="button"
            data-lounge-tv-focusable
            onClick={onViewCertification}
            style={{
              marginTop: loungeTvGlassCqw(1, 2.5, 5),
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_NESTED_TYPE.cta,
              letterSpacing: '0.06em',
              color: LOUNGE_TV_BRAND_RED,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.22)',
              padding: `${loungeTvGlassCqw(0.6, 1.4, 2.8)} ${loungeTvGlassCqw(1, 2.5, 5)}`,
              cursor: 'pointer',
              textTransform: 'uppercase',
              alignSelf: 'flex-start',
            }}
          >
            {'VIEW CERTIFICATION >'}
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section
      aria-label="Certification progress"
      data-lounge-tv-card-unit
      style={{
        ...moduleShellStyle,
        border: '1px solid rgba(255,255,255,0.14)',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_NESTED_TYPE.sectionTitle,
          color: LOUNGE_TV_TEXT_WHITE,
          letterSpacing: '0.06em',
          lineHeight: 1.2,
        }}
      >
        CERTIFICATION PROGRESS
      </p>
      <p
        style={{
          margin: `${loungeTvGlassCqw(0.65, 1.5, 3)} 0 0`,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_NESTED_TYPE.certificationStatus,
          color: LOUNGE_TV_TEXT_WHITE,
          lineHeight: 1.3,
        }}
      >
        {progress.completed} / {progress.total} CLASSES
      </p>
      <ProgressBar percent={progress.percent} />
      <p
        style={{
          margin: `${loungeTvGlassCqw(1, 2.4, 4.8)} 0 0`,
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: LOUNGE_TV_NESTED_TYPE.body,
          color: LOUNGE_TV_TEXT_GRAY,
          lineHeight: 1.4,
        }}
      >
        COMPLETE ALL REQUIRED CLASSES TO EARN:
      </p>
      <div style={{ marginTop: loungeTvGlassCqw(0.45, 1.1, 2.2) }}>
        {certTitleLines.map((line) => (
          <p
            key={line}
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_NESTED_TYPE.certificationTitle,
              color: LOUNGE_TV_TEXT_WHITE,
              lineHeight: 1.25,
            }}
          >
            {line}
          </p>
        ))}
      </div>
      <RewardCollectible season={season} definition={definition} earned={false} />
    </section>
  );
}
