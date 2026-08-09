import type { EducationMastery } from '../../../content/education/types';
import { getSeasonsForMastery } from '../../../content/education/hierarchy/catalog';
import { LoungeTvBackButton, LoungeTvSectionTitle } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';

type EducationMasteryViewProps = {
  mastery: EducationMastery;
  onBack: () => void;
  onSelectSeason: (seasonId: string) => void;
};

export function EducationMasteryView({ mastery, onBack, onSelectSeason }: EducationMasteryViewProps) {
  const seasons = getSeasonsForMastery(mastery.id);

  return (
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
          {mastery.subtitle ?? 'MASTERY'}
        </p>
        <h1
          style={{
            margin: `${loungeTvGlassCqw(0.4, 1, 2)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
            color: LOUNGE_TV_TEXT_WHITE,
          }}
        >
          {mastery.title}
        </h1>
        {mastery.description ? (
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.5, 1.2, 2.4)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(1.05, 2.4, 4.8),
              color: LOUNGE_TV_TEXT_GRAY,
              lineHeight: 1.35,
            }}
          >
            {mastery.description}
          </p>
        ) : null}
      </header>

      <LoungeTvSectionTitle title="SEASONS" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(0.8, 2, 4) }}>
        {seasons.map((season) => (
          <button
            key={season.id}
            type="button"
            data-lounge-tv-focusable
            onClick={() => onSelectSeason(season.id)}
            style={{
              textAlign: 'left',
              padding: loungeTvGlassCqw(1, 2.5, 5),
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(0,0,0,0.35)',
              cursor: 'pointer',
              color: LOUNGE_TV_TEXT_WHITE,
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: loungeTvGlassCqw(1.1, 2.5, 5),
              }}
            >
              SEASON {season.seasonNumber} · {season.title}
            </span>
            <span
              style={{
                display: 'block',
                marginTop: loungeTvGlassCqw(0.4, 1, 2),
                fontFamily: LOUNGE_TV_FONT_BOOK,
                fontSize: loungeTvGlassCqw(0.95, 2.1, 4.2),
                color: LOUNGE_TV_TEXT_GRAY,
                lineHeight: 1.35,
              }}
            >
              {season.learningObjective}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
