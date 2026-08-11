import type { EducationMastery } from '../../../content/education/types';
import { getSeasonsForMastery } from '../../../content/education/hierarchy/catalog';
import { LoungeTvBackButton, LoungeTvSectionTitle } from '../LoungeTvUiPrimitives';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_NESTED_TYPE } from '../loungeTvTypography';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LoungeTvSeasonCard } from './LoungeTvSeasonCard';

type EducationMasteryViewProps = {
  mastery: EducationMastery;
  onBack: () => void;
  onSelectSeason: (seasonId: string) => void;
  onSelectEpisode?: (episodeId: string) => void;
};

export function EducationMasteryView({
  mastery,
  onBack,
  onSelectSeason,
  onSelectEpisode,
}: EducationMasteryViewProps) {
  const seasons = getSeasonsForMastery(mastery.id);
  const singleSeason = seasons.length === 1;

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(2, 5, 10),
        textTransform: 'uppercase',
      }}
    >
      <LoungeTvBackButton onClick={onBack} label="< Back" />
      <header>
        <h1
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_NESTED_TYPE.pageTitle,
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.08,
            letterSpacing: '0.04em',
          }}
        >
          {mastery.title}
        </h1>
        {mastery.description ? (
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
            {mastery.description.toUpperCase()}
          </p>
        ) : null}
      </header>

      <LoungeTvSectionTitle title="SEASONS" />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: loungeTvGlassCqw(1.4, 3.5, 7),
          width: '100%',
        }}
      >
        {seasons.map((season) => (
          <LoungeTvSeasonCard
            key={season.id}
            season={season}
            featured={singleSeason}
            onSelect={() => onSelectSeason(season.id)}
            onSelectEpisode={onSelectEpisode}
          />
        ))}
      </div>
    </div>
  );
}
